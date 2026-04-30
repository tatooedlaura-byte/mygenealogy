# My Genealogy — Bess / Slinkard / Best / Labrot

Personal genealogy tracker. Every claim is tied to evidence; nothing gets silently merged or deleted.

## Live site

Once GitHub Pages is enabled, the site is at:
**https://tatooedlaura-byte.github.io/mygenealogy/**

(Pages requires the repo to be public, or GitHub Pro/Team for private Pages.)

## Run locally

The site uses `fetch()` to load JSON, which browsers block on `file://`. Serve it with any static server:

```bash
cd ~/mygenealogy
python3 -m http.server 8000
# then open http://localhost:8000
```

## Regenerate Markdown View

```bash
python3 scripts/regenerate_people_reorganized.py
```

- Regenerates `review/people_reorganized.md` from `data/people.json` and `data/evidence.json` (and links research tasks from `data/tasks.json`).
- JSON files remain the source of truth.
- The markdown is a read-only review snapshot — re-run after any data change.

## How to ask for updates

Just say what you want changed and name the person. Examples:

- **Update a person's page:** *"On Jacob Bess Sr.'s page, change birth date to 1797."*
- **Add a new person:** *"Add a new person: John Bess, son of Eve Bess, born NC ~1805."*
- **Add evidence:** *"For Edward B. Bess, add 1880 census record showing him in Madison County."*
- **Resolve a conflict:** *"Confirm Barbara Slinkard is Jacob Bess's wife — promote that claim from supported to proven."*
- **Reject a theory:** *"Reject the claim that Matilda is Jacob's wife."* (Already done; this is just an example.)
- **Add a research task:** *"Add a task: search Bollinger County 1860 census for Bess households."*
- **Mark task done:** *"Mark task t-jacob-bess-dower-release as done — found the deed."*

The data files (`data/people.json`, `data/evidence.json`, `data/tasks.json`) are the source of truth. The site is read-only — edits flow through me.

## Data model

### Three core files

| File | Contains |
|---|---|
| `data/people.json` | Each person + their `claims` array. A claim is a single assertion (born, died, child-of, spouse-of, etc.) with its own status and evidence references. |
| `data/evidence.json` | Each source document with type, date, location, exact extract, citation, what it proves, and what it does **not** prove. |
| `data/tasks.json` | Open research questions with priority, purpose, and links to people/evidence. |

### Status values

Used on every claim:

| Status | Meaning |
|---|---|
| `PROVEN` | Directly stated in a primary record. |
| `STRONGLY SUPPORTED` | Heavily implied by multiple records, but no single record makes the explicit statement. |
| `SUPPORTED` | Consistent with available evidence; no direct statement; no contradicting evidence. |
| `UNKNOWN` | No evidence either way. |
| `REJECTED` | Considered and contradicted by better evidence. **Kept for history.** |
| `DISPROVEN` | Actively contradicted by a record. **Kept for history.** |
| `REPLACED` | A previous claim that has been superseded. The `replacedBy` field points to what replaced it. **Kept for history.** |

### No-delete rule

Bad theories, superseded claims, and possible duplicates are **never deleted** from the data file. They are downgraded to `REJECTED` / `DISPROVEN` / `REPLACED` so they remain visible and reviewable.

When merging or removing content, anything I'd cut goes to `review/` (markdown files) for your decision.

## Files

```
mygenealogy/
├── index.html              ← single-page app entry
├── style.css
├── app.js                  ← router + renderers
├── data/
│   ├── people.json         ← people + claims
│   ├── evidence.json       ← evidence records
│   └── tasks.json          ← research tasks
├── review/
│   ├── conflicts.md        ← active conflicts (Hannah vs. Eve, etc.)
│   ├── possible_duplicates.md
│   ├── rejected_theories.md
│   └── proof_arguments/
│       └── jacob-bess-parentage.md
└── README.md
```

## Site sections

- **Home** — direct line tree + browse by family group
- **Person page** — name, AKA, vitals, parents, spouses, children, evidence (click to expand), notes, related research tasks
- **Relationships** — every parent/child/spouse claim across the file, filterable by status
- **Evidence** — every source document, filterable by type
- **Research** — open tasks with priority and context
- **Conflicts / Duplicates / Rejected** — review files in markdown

## Direct line (current state)

```
Jacob Bess Sr.        (~1798, NC → MO)           PROVEN identity
   + Barbara Slinkard                            PROVEN (By Argument) as wife
   ↓
Edward B. Bess        (~1835, MO)                PROVEN as son
   ↓
Rhoda B. Bess         (Roddi)                    PROVEN as daughter
   ↓
Joseph Labrot         + Rhoda                    SUPPORTED marriage
   ↓
Virginia Labrot                                  PROVEN
   ↓
Robert Stokes                                    PROVEN
   ↓
(You)
```

> **Note on earlier generations.** Boston Best Sr. and Peter Best were previously included in the direct line (Boston → Peter → Jacob, at STRONGLY SUPPORTED / SUPPORTED). They have been reclassified into a new **POSSIBLE NC ORIGINS** cluster (`group: bess-nc-origins`) pending further evidence: the Lincoln County, NC Best family structure shows multiple unresolved Best/Bess branches, and no record explicitly names Peter as Boston's son or Jacob as Peter's son. The previous parent-child claims are preserved as `REPLACED` (per the no-delete rule) on each affected record. See `review/proof_arguments/jacob-bess-parentage.md` and `review/conflicts.md`.

## Possible NC origins (under evaluation, not merged)

```
Boston Best Sr.       (d. 1809, Lincoln Co. NC)  PROVEN identity
Peter Best (Bess)     (m. Cristina 1779)         PROVEN identity
Jacob Best (NC, 1809) (1809 deed grantee)        PROVEN identity; SUPPORTED as son of Boston
Daniel Best (NC, 1795)(1795 deed grantee)        PROVEN identity; relationship UNKNOWN
Martin Best (NC, 1795)(1795 deed adjoining)      PROVEN identity; relationship UNKNOWN
```

Connection of any of the above to Jacob Bess Sr. (MO): **UNPROVEN**. Cluster + timeline only.
