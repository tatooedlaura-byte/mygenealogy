# Pending removal — jacob-bess-sr

_Staged 2026-05-02._

Per user cleanup feedback, three claims were removed from
`jacob-bess-sr` in `data/people.json`. They are preserved here in
full so nothing is lost. Restore from this file if any removal
was wrong.

## Reasons for removal

1. **NC↔MO leakage** — `possibly-related-to jacob-bess-elder-nc` violates
   PROTOCOL.md ("No NC individual may be linked to Jacob as parent,
   grandparent, or ancestor unless a specific record names that
   relationship explicitly"). Migration/origin theories belong in
   `review/proof_arguments/jacob-bess-migration-cluster.md`, not as
   a person-level claim.
2. **Duplicate `born` claim** — superseded by the structured `born`
   claim with evidence ref to `ev-1850-census-jacob-bess`.
3. **Vague `resided` claim** — superseded by two PROVEN `resided`
   claims (1823-1830 Cape Girardeau, 1860 Bollinger).

## Removed claims (verbatim)

```json
[
  {
    "predicate": "born",
    "value": "North Carolina (~1798)",
    "status": "SUPPORTED",
    "evidence": [],
    "notes": "Date from 1850 census age (estimated); birthplace from 1850 census (self-reported). Both SUPPORTED only per protocol."
  },
  {
    "predicate": "resided",
    "value": "Cape Girardeau / Bollinger County, Missouri",
    "status": "SUPPORTED",
    "evidence": [],
    "notes": "Downgraded from PROVEN: no evidence record attached"
  },
  {
    "predicate": "possibly-related-to",
    "object": "jacob-bess-elder-nc",
    "status": "SUPPORTED",
    "evidence": [],
    "notes": "Same surname, same county of origin, correct timeframe — but no direct evidence. Do NOT assign father-son or any specific relationship without a record."
  }
]
```
