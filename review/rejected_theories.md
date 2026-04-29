# Rejected / Replaced Theories

Past hypotheses that have been superseded or contradicted. **Not deleted** — kept here so you can re-evaluate if new evidence surfaces.

---

## REJECTED: Matilda Bess as Jacob Bess Sr.'s wife
- **The theory:** Matilda Bess, who served as administratrix of Jacob's estate, is Jacob's widow.
- **Why it was attractive:** Administratrix is often the surviving spouse.
- **Why it's rejected:** 1850 census shows Matilda living in Jacob's household at age ~30 (born ~1820), consistent with daughter not wife. 1880 census places her in Daniel Bess's household listed as "sister." Daughter interpretation is much better supported.
- **Where in data:** `matilda-bess` record has a `spouse-of jacob-bess-sr` claim with `status: REJECTED` preserved.

---

## REPLACED: Jacob Bess Sr.'s spouse = UNKNOWN
- **The theory:** Jacob Bess Sr.'s wife is unidentified; she likely died before 1859 (no widow in 1859 deed or in probate).
- **Replaced by:** Identification with Barbara Slinkard (`barbara-slinkard`) via the Jacob Miller guardianship distribution naming her husband as "Jacob Best." Combined with the 1823 deed identifying "Barbary Best wife of Jacob Best," this is VERY STRONGLY SUPPORTED.
- **Why both can be true:** Barbara Slinkard could have predeceased Jacob — that explains both the marriage (1814) AND her absence from 1859 records.
- **Where in data:** `jacob-bess-sr` record has the prior claim preserved as `status: REPLACED` with `replacedBy: spouse-of barbara-slinkard`. A placeholder person `unknown-wife-implied` is also kept with status REPLACED.

---

## DISPROVEN / EXCLUDED: External tree claims (do not re-import)

These were considered and ruled out. If you see them on Ancestry or other public trees, do not let them back in without new primary evidence.

- **Polly Slinker → Henry Clark (1823 Kentucky)** — wrong location.
- **Mary Slinkard (1860 Indiana)** — separate family.
- **Mary Guest (1850)** — no supporting linkage.
- **"Jacob 'Uncle Jake' Bess"** as a separate identity from Jacob Bess Sr. — no support.
- **Catherine Crites** as mother of anyone in this file — no proof.
- **Geneanet/public-tree child lists for Barbara Slinkard** — unsupported, do not import.

---

## How status values are used in the data files

When a claim is recorded in `data/people.json`, its `status` field uses these values:

- `PROVEN` — directly stated in a primary record.
- `STRONGLY SUPPORTED` — heavily implied by multiple records, but no single record makes the explicit statement.
- `SUPPORTED` — consistent with available evidence; no direct statement; no contradicting evidence.
- `UNKNOWN` — no evidence either way. Placeholder.
- `REJECTED` — the claim was considered and contradicted by better evidence. Kept for history.
- `DISPROVEN` — actively contradicted by a record. (Stronger than rejected — there is positive evidence against.)
- `REPLACED` — a previous claim that has been superseded by a better claim. The `replacedBy` field points to what replaced it.
