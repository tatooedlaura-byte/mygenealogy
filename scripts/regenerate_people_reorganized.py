#!/usr/bin/env python3
"""Regenerate review/people_reorganized.md from data/*.json.

Source of truth: data/people.json, data/evidence.json, data/tasks.json.
This script does not modify those files. It only emits a derived markdown view.

Doctrine (per project rules):
- Do NOT infer relationships, merge individuals, upgrade evidence levels,
  delete data, or change record wording.
- Pull verbatim extracts from evidence.json.
- Include relationships only as already present in the data.
- Include research tasks only when this person's id appears in relatedPeople.
- Include proof arguments only when an existing file in review/proof_arguments
  is registered for this person below.

Usage: python3 scripts/regenerate_people_reorganized.py
"""

import json
from pathlib import Path
from collections import OrderedDict

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
REVIEW = ROOT / "review"
OUT = REVIEW / "people_reorganized.md"

# Existing proof argument files. The script does not generate these — it only
# links to them. If a new proof argument file is added under
# review/proof_arguments/, register it here so the relevant people get a link.
PROOF_ARGUMENTS = {
    "barbara-slinkard-jacob-bess.md": {
        "people": ["barbara-slinkard", "jacob-bess-sr"],
        "claim": "Barbara Slinkard = Barbary Best = wife of Jacob Bess Sr.",
        "conclusion": "PROVEN (By Argument)",
    },
    "jacob-bess-parentage.md": {
        "people": ["jacob-bess-sr", "peter-best"],
        "claim": "Parentage of Jacob Bess Sr. (working hypothesis: son of Peter Best/Bess)",
        "conclusion": "Boston→Peter STRONGLY SUPPORTED; Peter→Jacob SUPPORTED (not proven)",
    },
}


def load_json(path):
    with open(path) as f:
        return json.load(f)


def fmt_date_value(value):
    """Return a string year/date label from a claim's `value` dict, or None."""
    if not isinstance(value, dict):
        return None
    for key in ("date", "year", "yearRange"):
        v = value.get(key)
        if v:
            return v
    return None


def fmt_place(value):
    if not isinstance(value, dict):
        return None
    return value.get("place")


def lookup_person_name(pid, people):
    p = people.get(pid)
    if p:
        return p.get("name", pid)
    return pid


def parent_role_for(parent_id, people):
    """Return 'Father' or 'Mother' if the parent record asserts that role,
    else 'Parent'. This is not inference — it reads the parent's own
    declared `father-of` / `mother-of` claims."""
    p = people.get(parent_id)
    if not p:
        return "Parent"
    has_father = any(c.get("predicate") == "father-of" for c in p.get("claims", []))
    has_mother = any(c.get("predicate") == "mother-of" for c in p.get("claims", []))
    if has_father and not has_mother:
        return "Father"
    if has_mother and not has_father:
        return "Mother"
    return "Parent"


def status_label(claim):
    """Return the claim's status string. The data uses 'PROVEN (By Argument)'
    as a literal status. The legacy `provenBy: argument` flag (kept for
    backward compatibility) is mapped to the same literal."""
    s = claim.get("status", "UNKNOWN")
    if claim.get("provenBy") == "argument" and s == "PROVEN":
        return "PROVEN (By Argument)"
    return s


def claim_extras(claim):
    """Collect optional labelled fields on a claim (justification,
    contradictionsChecked, notes) into a list of '(label, text)' tuples,
    in display order. Empty fields are omitted."""
    pairs = []
    if claim.get("justification"):
        pairs.append(("justification", claim["justification"]))
    if claim.get("contradictionsChecked"):
        pairs.append(("contradictions checked", claim["contradictionsChecked"]))
    if claim.get("notes"):
        pairs.append(("note", claim["notes"]))
    return pairs


def collect_evidence_ids(person):
    ids = []
    seen = set()
    for c in person.get("claims", []):
        for ev in c.get("evidence", []) or []:
            if ev not in seen:
                seen.add(ev)
                ids.append(ev)
    return ids


def render_timeline(person):
    """Emit dated events from claims. Pure pass-through — no inference."""
    rows = []
    claims = person.get("claims", [])
    for c in claims:
        pred = c.get("predicate")
        status = status_label(c)
        val = c.get("value")
        date = fmt_date_value(val)
        place = fmt_place(val)
        # Some claims store the date on the claim itself (marriage*).
        m_date = c.get("marriageDate") or c.get("marriageYear")

        if pred == "born" and date:
            place_str = f", {place}" if place else ""
            rows.append(f"- {date} — born{place_str} ({status})")
        elif pred == "died" and date:
            place_str = f", {place}" if place else ""
            rows.append(f"- {date} — died{place_str} ({status})")
        elif pred == "resided" and place:
            year = (val or {}).get("year")
            if year:
                rows.append(f"- {year} — resided {place} ({status})")
            else:
                rows.append(f"- (undated) — resided {place} ({status})")
        elif pred == "spouse-of" and m_date:
            rows.append(f"- {m_date} — married (spouse claim) ({status})")
        elif pred in ("role", "member-of") and date:
            rows.append(f"- {date} — {val if isinstance(val, str) else date} ({status})")
    return rows


def render_evidence(person, evidence):
    lines = []
    for eid in collect_evidence_ids(person):
        ev = evidence.get(eid)
        if not ev:
            lines.append(f"- `{eid}` — (record not found in evidence.json)")
            continue
        etype = ev.get("type", "record")
        edate = ev.get("date", "")
        eloc = ev.get("location", "")
        extract = ev.get("extract", "")
        citation = ev.get("citation", "")
        head = f"**{etype}**"
        if edate:
            head += f" ({edate}"
            if eloc:
                head += f", {eloc}"
            head += ")"
        elif eloc:
            head += f" ({eloc})"
        # Verbatim extract — never reword.
        lines.append(f"- {head} — \"{extract}\"")
        if citation:
            lines.append(f"  Citation: {citation}")
    return lines


def render_relationships(person, people):
    parents = []  # (role, name, status, pid, extras)
    spouses = []  # (name, status, pid, extras)
    children = []  # (name, status, pid, extras)
    other = []

    for c in person.get("claims", []):
        pred = c.get("predicate")
        status = status_label(c)
        obj = c.get("object")
        val = c.get("value")
        extras = claim_extras(c)
        if pred == "child-of":
            if obj:
                role = parent_role_for(obj, people)
                parents.append((role, lookup_person_name(obj, people), status, obj, extras))
            elif isinstance(val, str):
                parents.append(("Parent", val, status, None, extras))
        elif pred == "spouse-of":
            if obj:
                spouses.append((lookup_person_name(obj, people), status, obj, extras))
            elif isinstance(val, str):
                spouses.append((val, status, None, extras))
        elif pred in ("father-of", "mother-of"):
            if obj:
                children.append((lookup_person_name(obj, people), status, obj, extras))
            elif isinstance(val, str):
                children.append((val, status, None, extras))
        elif pred == "sibling-of":
            if obj:
                other.append(("Sibling", lookup_person_name(obj, people), status))
            elif isinstance(val, str):
                other.append(("Sibling", val, status))

    # Compute consolidated bucket statuses (worst-case = lowest)
    rank = {
        "PROVEN": 5,
        "PROVEN (By Argument)": 5,
        "STRONGLY SUPPORTED": 4,
        "SUPPORTED": 3,
        "UNKNOWN": 2,
        "REJECTED": 1,
        "DISPROVEN": 1,
        "REPLACED": 1,
    }

    def lowest(statuses):
        if not statuses:
            return "UNKNOWN"
        return min(statuses, key=lambda s: rank.get(s, 0))

    def highest(statuses):
        if not statuses:
            return "UNKNOWN"
        return max(statuses, key=lambda s: rank.get(s, 0))

    lines = []

    def render_extras(extras, indent="    "):
        out = []
        for label, text in extras:
            out.append(f"{indent}- _{label}:_ {text}")
        return out

    # Father / Mother summary lines
    father_statuses = [s for role, _, s, _, _ in parents if role == "Father"]
    mother_statuses = [s for role, _, s, _, _ in parents if role == "Mother"]
    generic_parent_statuses = [s for role, _, s, _, _ in parents if role == "Parent"]

    if father_statuses:
        lines.append(f"**Father** — {highest(father_statuses)}")
        for role, name, st, pid, extras in parents:
            if role == "Father":
                pid_str = f" (`{pid}`)" if pid else ""
                lines.append(f"  - {name}{pid_str} — {st}")
                lines.extend(render_extras(extras))
    else:
        lines.append("**Father** — UNKNOWN")

    if mother_statuses:
        lines.append(f"**Mother** — {highest(mother_statuses)}")
        for role, name, st, pid, extras in parents:
            if role == "Mother":
                pid_str = f" (`{pid}`)" if pid else ""
                lines.append(f"  - {name}{pid_str} — {st}")
                lines.extend(render_extras(extras))
    else:
        lines.append("**Mother** — UNKNOWN")

    if generic_parent_statuses:
        lines.append(f"**Parent (sex not stated in data)** — {highest(generic_parent_statuses)}")
        for role, name, st, pid, extras in parents:
            if role == "Parent":
                pid_str = f" (`{pid}`)" if pid else ""
                lines.append(f"  - {name}{pid_str} — {st}")
                lines.extend(render_extras(extras))

    # Spouse(s)
    if spouses:
        lines.append(f"**Spouse(s)** — {highest([s for _, s, _, _ in spouses])}")
        for name, st, pid, extras in spouses:
            pid_str = f" (`{pid}`)" if pid else ""
            lines.append(f"  - {name}{pid_str} — {st}")
            lines.extend(render_extras(extras))
    else:
        lines.append("**Spouse** — UNKNOWN")

    # Children
    if children:
        lines.append(f"**Children** — {highest([s for _, s, _, _ in children])} (highest); {lowest([s for _, s, _, _ in children])} (lowest)")
        for name, st, pid, extras in children:
            pid_str = f" (`{pid}`)" if pid else ""
            lines.append(f"  - {name}{pid_str} — {st}")
            lines.extend(render_extras(extras))
    else:
        lines.append("**Children** — UNKNOWN")

    if other:
        lines.append("**Other**:")
        for kind, name, st in other:
            lines.append(f"  - {kind}: {name} — {st}")

    return lines


def render_analysis(person):
    lines = []
    notes = person.get("notes")
    if isinstance(notes, list):
        for n in notes:
            lines.append(f"- {n}")
    elif isinstance(notes, str):
        lines.append(f"- {notes}")

    summary = person.get("summary")
    if summary:
        lines.append(f"- _Summary (from data):_ {summary}")

    open_questions = person.get("openQuestions")
    if open_questions:
        lines.append("- _Open questions (from data):_")
        for q in open_questions:
            lines.append(f"  - {q}")

    # Surface DO NOT MERGE / POSSIBLY DUPLICATE notes prominently
    # (already in notes — no new content)
    return lines


def render_status(person):
    """Identity status: highest status across all non-superseded claims (any
    claim with PROVEN-status evidence demonstrates the person existed in a
    record). Relationship status: highest among kinship claims. No upgrades —
    the labels come from the data unchanged."""
    rank = {
        "PROVEN": 5,
        "PROVEN (By Argument)": 5,
        "STRONGLY SUPPORTED": 4,
        "SUPPORTED": 3,
        "UNKNOWN": 2,
        "REJECTED": 1,
        "DISPROVEN": 1,
        "REPLACED": 1,
    }
    superseded = {"REJECTED", "DISPROVEN", "REPLACED"}

    rel_preds = {"child-of", "father-of", "mother-of", "spouse-of", "sibling-of"}

    identity_statuses = []
    rel_statuses = []
    for c in person.get("claims", []):
        st = status_label(c)
        if st in superseded:
            continue
        identity_statuses.append(st)
        if c.get("predicate") in rel_preds:
            rel_statuses.append(st)

    def highest(statuses):
        if not statuses:
            return "UNKNOWN"
        return max(statuses, key=lambda s: rank.get(s, 0))

    return [
        f"- **Identity:** {highest(identity_statuses)}",
        f"- **Relationships (overall):** {highest(rel_statuses)}",
    ]


def render_proof_arguments(pid):
    matches = []
    for fname, info in PROOF_ARGUMENTS.items():
        if pid in info["people"]:
            matches.append((fname, info))
    if not matches:
        return []
    lines = []
    for fname, info in matches:
        lines.append(f"- See [`review/proof_arguments/{fname}`](proof_arguments/{fname})")
        lines.append(f"  - **Claim:** {info['claim']}")
        lines.append(f"  - **Conclusion:** {info['conclusion']}")
        lines.append(f"  - **Conflicts checked:** see the proof argument file (verbatim)")
    return lines


def render_tasks(pid, tasks):
    matches = [t for t in tasks if pid in (t.get("relatedPeople") or [])]
    if not matches:
        return []
    lines = []
    for t in matches:
        lines.append(
            f"- [{t['id']}] {t.get('description','')} "
            f"(_priority:_ {t.get('priority','?')}, _status:_ {t.get('status','?')})"
        )
    return lines


def render_person(pid, person, people, evidence, tasks):
    out = []
    name = person.get("name", pid)
    out.append(f"## 👤 {name}")
    aka = person.get("aka")
    meta_bits = []
    if aka:
        meta_bits.append(f"**AKA:** {', '.join(aka)}")
    group = person.get("group")
    if group:
        meta_bits.append(f"**Group:** {group}")
    tags = person.get("tags") or []
    if tags:
        meta_bits.append(f"**Tags:** {', '.join(tags)}")
    meta_bits.append(f"**ID:** `{pid}`")
    out.append(" · ".join(meta_bits))
    out.append("")

    # Timeline
    out.append("### 📅 Timeline")
    timeline = render_timeline(person)
    if timeline:
        out.extend(timeline)
    else:
        out.append("- (no dated events recorded)")
    out.append("")

    # Evidence
    out.append("### 📚 Evidence")
    ev_lines = render_evidence(person, evidence)
    if ev_lines:
        out.extend(ev_lines)
    else:
        out.append("- (no evidence records linked)")
    out.append("")

    # Relationships
    out.append("### 🔗 Relationships")
    out.extend(render_relationships(person, people))
    out.append("")

    # Analysis
    out.append("### 🧠 Analysis")
    a_lines = render_analysis(person)
    if a_lines:
        out.extend(a_lines)
    else:
        out.append("- (no analytical notes recorded)")
    out.append("")

    # Status
    out.append("### 📊 Status")
    out.extend(render_status(person))
    out.append("")

    # Proof argument (only if a registered file exists)
    pa_lines = render_proof_arguments(pid)
    if pa_lines:
        out.append("### 📌 Proof Argument")
        out.extend(pa_lines)
        out.append("")

    # Tasks (only if linked)
    t_lines = render_tasks(pid, tasks)
    if t_lines:
        out.append("### 🔍 Related Research Tasks")
        out.extend(t_lines)
        out.append("")

    out.append("---")
    out.append("")
    return "\n".join(out)


def main():
    people_doc = load_json(DATA / "people.json")
    evidence_doc = load_json(DATA / "evidence.json")
    tasks_doc = load_json(DATA / "tasks.json")

    people = people_doc["people"]
    evidence = evidence_doc["evidence"]
    tasks = tasks_doc["tasks"]
    groups = people_doc.get("groups", {})

    parts = []
    parts.append("# People — Reorganized View")
    parts.append("")
    parts.append(
        "**Generated by `scripts/regenerate_people_reorganized.py` from "
        "`data/people.json`, `data/evidence.json`, `data/tasks.json`.**"
    )
    parts.append("")
    parts.append(
        "JSON files remain the source of truth. This file is a derived snapshot "
        "for browsing. Re-run the script after any change to the data."
    )
    parts.append("")
    parts.append("Doctrine: no inference, no merging, no upgrades, no deletions, "
                 "verbatim record wording.")
    parts.append("")

    # Group people by their `group` field, preserving group order from the JSON
    by_group = OrderedDict()
    for gkey in groups.keys():
        by_group[gkey] = []
    by_group.setdefault("(ungrouped)", [])

    for pid, p in people.items():
        g = p.get("group") or "(ungrouped)"
        by_group.setdefault(g, []).append((pid, p))

    # Table of contents
    parts.append("## Table of contents")
    parts.append("")
    for gkey, members in by_group.items():
        if not members:
            continue
        gname = groups.get(gkey, gkey)
        parts.append(f"- **{gname}** (`{gkey}`)")
        for pid, p in members:
            parts.append(f"  - [{p.get('name', pid)}](#-{pid})")
    parts.append("")
    parts.append("---")
    parts.append("")

    # Sections
    for gkey, members in by_group.items():
        if not members:
            continue
        gname = groups.get(gkey, gkey)
        parts.append(f"# Group: {gname}")
        parts.append(f"_(group key: `{gkey}`)_")
        parts.append("")
        for pid, p in members:
            # Add an HTML anchor for the TOC link
            parts.append(f'<a id="-{pid}"></a>')
            parts.append("")
            parts.append(render_person(pid, p, people, evidence, tasks))

    OUT.write_text("\n".join(parts))
    print(f"Wrote {OUT}")
    print(f"  people: {len(people)}")
    print(f"  evidence: {len(evidence)}")
    print(f"  tasks: {len(tasks)}")


if __name__ == "__main__":
    main()
