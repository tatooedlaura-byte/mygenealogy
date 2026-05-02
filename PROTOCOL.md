# Genealogy Data Protocol — Bess / Best / Missouri Cluster

This file governs every edit made to `data/people.json`, `data/evidence.json`, and `data/tasks.json`.
Follow these rules without exception.

---

## CORE RULES (DO NOT VIOLATE)

- Do NOT merge individuals based on name alone
- Do NOT connect North Carolina and Missouri Bess/Best individuals
- Do NOT assign parents to Jacob Bess Sr.
- Do NOT upgrade SUPPORTED to PROVEN without direct evidence
- Do NOT delete or overwrite existing claims
- If uncertain → create a NEW person instead of merging
- Use `associated-with` instead of family relationships when unclear
- Preserve all conflicting evidence

---

## CRITICAL WARNING

**Jacob Bess Sr.'s father is UNKNOWN.**
Do NOT assign a father without direct documentary proof.
No NC individual may be linked to Jacob as parent, grandparent, or ancestor
unless a specific record names that relationship explicitly.

---

## DATA INTEGRITY RULES

| Source | What it proves |
|---|---|
| 1850 census | Presence in a location; approximate age and birthplace (self-reported) |
| 1850 census household | Co-residence only — does NOT prove family relationship |
| Probate / partition records | Strongest evidence; explicit legal naming of heirs |
| Same birthplace | Does NOT mean same person |
| Same name | Does NOT mean same person |

### Status levels — when to use each

| Status | Requirement |
|---|---|
| `PROVEN` | Directly and explicitly stated in a primary record |
| `PROVEN (By Argument)` | No single record states it, but multiple records together make it certain with no viable alternative |
| `STRONGLY SUPPORTED` | Multiple records heavily imply it; no direct statement |
| `SUPPORTED` | Consistent with evidence; no direct statement; no contradiction |
| `UNKNOWN` | No evidence either way |
| `REJECTED` | Considered and contradicted by better evidence — keep, never delete |
| `REPLACED` | Superseded by a better claim — keep, never delete |

Census birthplace = `SUPPORTED` only (self-reported, not a primary birth record).
Census household co-residence = `SUPPORTED` only for any relationship claim.

---

## NC / MISSOURI SEPARATION RULE

The North Carolina Best/Bess individuals and the Missouri Bess individuals
**must be treated as completely separate** unless a direct record bridges them.

- Do NOT link any NC individual to any MO individual as parent, child, or sibling
- Do NOT merge NC and MO profiles with matching names
- `associated-with` between NC and MO is only allowed if it is labeled UNKNOWN
  and accompanied by a note that the connection is unproven
- All MO individuals: group = `bess-mo-cluster` (or sub-group)
- All NC individuals: group = `bess-nc-origins` (or sub-group)

---

## NO-DELETE RULE

Bad theories, rejected hypotheses, and superseded claims are **never deleted**.

- Downgrade to `REJECTED`, `DISPROVEN`, or `REPLACED`
- Add a `notes` field explaining why
- Add `replacedBy` if a new claim supersedes it
- This keeps the full history visible and reviewable

---

## HOW TO ADD A NEW PERSON

1. Create a new profile with a unique ID — do not reuse an existing ID
2. Add only what the evidence directly supports
3. Start with the minimum: born, born-in, resided
4. Use `household-member-of` for census co-residents (not `child-of` or `spouse-of`)
5. Use `possibly-same-as` to flag candidate matches — do not merge
6. Do not add ages without attaching a census evidence ID

---

## HOW TO ADD A NEW CLAIM

1. Choose the weakest status that is honest — do not over-claim
2. Always include an `evidence` array (even if empty with a note explaining why)
3. Never remove an existing claim — add a new one and mark the old as REPLACED if needed
4. Use `notes` to explain reasoning or flag uncertainty

---

## PREDICATES — APPROVED LIST

| Predicate | Use when |
|---|---|
| `born` | Birth date (approximate or exact) |
| `born-in` | Birth location |
| `died` | Death date/place |
| `resided` | Documented presence in a location |
| `spouse-of` | Marriage relationship |
| `child-of` | Parent-child (use only when evidence supports) |
| `father-of` | Explicit parentage |
| `household-member-of` | Census co-residence only — no relationship implied |
| `associated-with` | Same cluster, time, location — relationship UNKNOWN |
| `possibly-same-as` | Candidate match — do not merge until proven |
| `widow-of` | Documented widow status |
| `minor-heir-of` | Named in probate as minor heir — does not force child-of |

---

## MISSOURI CLUSTER — CURRENT STATE

Three NC-born men documented in Cape Girardeau County, Missouri, ~1850.
Relationship between them: **UNKNOWN**.

| ID | Name | Born | NC Origin | Relationship |
|---|---|---|---|---|
| `jacob-bess-sr` | Jacob Bess Sr. | ~1798 | PROVEN (census) | anchor |
| `peter-bess-mo` | Peter Bess | ~1797 | PROVEN (census) | associated-with Jacob (SUPPORTED) |
| `michael-bess-mo` | Michael Bess | ~1794 | PROVEN (census) | associated-with Jacob + Peter (SUPPORTED) |

---

## COMMIT CHECKLIST

Before every commit:

- [ ] `python3 -c "import json; json.load(open('data/people.json'))"` passes
- [ ] `python3 -c "import json; json.load(open('data/evidence.json'))"` passes
- [ ] No NC individual linked to MO individual as family
- [ ] No new PROVEN claims without a direct evidence source
- [ ] No existing claims deleted
- [ ] No profiles merged without a `possibly-same-as` step first
