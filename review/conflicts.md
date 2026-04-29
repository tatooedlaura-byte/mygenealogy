# Conflict Log

Same-name problems, contradictions between sources, possible duplicates, claims to verify, and items needing original records. Nothing here is deleted — review and decide.

---

## ACTIVE CONFLICTS

### 1. Jacob Bess Sr.'s spouse — UNKNOWN vs. Barbara Slinkard
- **Source A (older notes):** Jacob's spouse is UNKNOWN; conclusion "wife likely deceased before 1859" because the 1859 deed shows Jacob alone and probate names no widow.
- **Source B (newer research):** Jacob Bess Sr. = Jacob Best (1814 marriage to Barbara Slinkard); identification VERY STRONGLY SUPPORTED via the Jacob Miller guardianship distribution naming her husband as "Jacob Best."
- **Current handling in data:** Spouse is recorded as Barbara Slinkard (PROVEN). The prior UNKNOWN claim is preserved as `status: REPLACED` on the Jacob Bess Sr. record so the history is not lost.
- **Reconciliation:** Both can be true. Barbara may have predeceased Jacob, which explains both the 1814 marriage AND her absence from 1859 deed and probate.
- **What confirms it:** A Cape Girardeau dower release between 1814 and 1859, OR a death/burial record for Barbara before 1859. (See research task `t-jacob-bess-dower-release`.)
- **Decision needed from user:** Confirm the Source B identification is correct. If yes, leave as-is. If you want the conservative UNKNOWN held until a deed is found, say so.

### 2. Daniel Slinkard's wife — Hannah vs. Eve Morrison
- **Source A (1823 deed cluster):** "Daniel Slinkard & wife Hannah" appears in the 1823 Cape Girardeau land cluster.
- **Source B (1838 probate + marriage index):** Daniel's widow is "Eve Slinkard"; marriage index has "Daniel Slinkard — Eve Morrison."
- **Possible explanations:**
  1. Hannah was a prior wife who died/separated before 1838.
  2. Transcription error in the 1823 deed (Hannah → Eve, or vice versa).
  3. The 1823 Daniel is a different Daniel from the d.-1838 Daniel.
- **Current handling:** Eve Morrison recorded as PROVEN spouse; the Hannah claim recorded as REJECTED on the same Daniel pending a tie-breaker record. See research task `t-daniel-slinkard-hannah`.
- **Decision needed:** None yet — leave as-is until evidence resolves it.

### 3. Jacob Slinkard (MO) — guardianship date vs. 1818 deed
- **Source A (guardianship/court record, ~1813–1816):** Jacob Slinkard listed as **deceased** with minor children Polly, Barbara, David, and Jacob.
- **Source B (1818 deed, ev-1818-jacob-slinkard-mo-deed):** Jacob Slinkard **alive**, selling a town lot in Cape Girardeau Co., MO.
- **The conflict:** Jacob can't have died before 1816 AND been alive in 1818. One of the dates must be wrong, or there are two different Jacob Slinkards in MO during this period.
- **Possible resolutions:**
  1. The "~1813–1816" date range on the guardianship record is approximate or wrong — the actual proceeding may be ~1819–1822 (which fits with the 1823 deed showing Jacob deceased).
  2. Two different Jacob Slinkards in Cape Girardeau Co. — one died early, one was active in 1818.
  3. The 1818 deed is for a different Jacob (cousin? son?).
- **Current handling:** All four minors are linked to `jacob-slinkard-mo` per consistency with the rest of the user's research; both pieces of evidence are kept. The conflict is flagged on each affected claim and tracked under task `t-jacob-slinkard-guardianship-date`.
- **What resolves it:** Original citation for the guardianship record showing the actual filing date.

### 4. John Slinkard — Nancy Stroder vs. Viney Stroder
- **Source A (marriage index):** John Slinkard — Nancy Stroder (no date in source).
- **Source B (1839 Cape Girardeau marriage record):** John Slinkard m. Viney Stroder, 8 Dec 1839.
- **Possible explanations:**
  1. Same marriage; Nancy/Viney is a transcription/recording variant ("Viney" can be short for Lavina/Lavinia, "Nancy" for Anne — these are not normal substitutes for each other).
  2. Two different John Slinkards, two different wives.
- **Current handling:** Two separate person records (`john-slinkard-stroder-1839` and `john-slinkard-nancy-stroder`), neither merged with John Slinkard (Daniel's heir).
- **Decision needed:** None yet — see research task `t-john-slinkard-stroder`.

---

## NEEDS ORIGINAL RECORD

These are claims that rest on derivative or indirect sources and should be re-anchored to primary documents:

- **Jane Sanders' maiden name** — currently STRONGLY SUPPORTED via Albert Ransom Bess's 1935 death record only. Need primary marriage record for Edward B. Bess + Jane.
- **Rhoda B. Bess + Joseph Labrot marriage** — SUPPORTED in research notes only. Need primary marriage record.
- **Virginia Labrot vitals** — direct-line position PROVEN per family knowledge but not yet anchored to primary docs in this file.
- **Jacob Slinkard (NC 1788) "heir at law" of Frederick Slinker** — SUPPORTED via 1788 deed language. Heir-at-law can mean a child OR another close relation. A deed/will explicitly using "son" would upgrade to PROVEN.
- **Peter Best as father of Jacob Bess Sr.** — SUPPORTED via cluster + 1832 will to "my children" (unnamed). No record names Jacob explicitly.
- **Boston Best Sr. as Peter Best's father** — STRONGLY SUPPORTED via 1779 bondsman role + 1809 estate involvement, but no document explicitly names Peter as son.

---

## BAD TREE CLAIMS (REJECTED FROM EXTERNAL TREES — DO NOT IMPORT)

- **Geneanet/public-tree child lists for Barbara Slinkard.** Not supported.
- **"Jacob 'Uncle Jake' Bess"** as a separate identity. Not supported.
- **Catherine Crites as mother (of anyone in this file).** No proof.
- **Any merge of Slinkard ↔ Bess line beyond Barbara → Jacob.** Speculative.
- **Polly Slinker (m. Henry Clark, 1823 Kentucky)** — wrong location, not the same Polly.
- **Mary Slinkard (1860 Indiana)** — separate family.
- **Mary Guest (1850)** — no supporting linkage.

---

## DO NOT MERGE (SAME-NAME, DIFFERENT PEOPLE)

The data file keeps these explicitly separated. The list below is the canonical set that should never be auto-merged:

| Name | IDs | Reason |
|---|---|---|
| Jacob Slinkard | `jacob-slinkard-nc-1788`, `jacob-slinkard-mo`, `jacob-slinkard-1812`, `jacob-slinkard-minor` | Different times, places, contexts |
| Polly Slinkard | `polly-slinkard-a`, `polly-slinkard-b` | Jacob (MO)'s minor daughter ~1813–1816 vs. Daniel's adult heir 1838 |
| Catharine/Katherine Slinkard | `catharine-slinkard-b`, `catharine-slinkard-smith`, `katherine-slinkard-link` | Three records, may or may not all be the same person |
| David Slinkard | `david-slinkard-b`, `david-slinkard-minor` | Daniel's heir (1838) vs. 1816 minor under Peter Critz |
| Boston Best/Bess | `boston-best-sr`, `boston-bess-1869` | Direct ancestor d. 1809 vs. NC cluster d. 1869 |
| Peter Best/Bess | `peter-best`, `peter-bess-elder` | Possibly same person; possibly father and son. Kept separate. |
| Frederick Slinker | `frederick-slinker-sr`, `frederick-slinker-mo` | Possibly same person. Kept separate until bridged. |
| Barbara/Barbary Bess | `barbara-slinkard`, `barbara-bess-blaylock`, `barbary-levi-wife` | Wife of Jacob Bess Sr.; daughter of Jacob Bess Sr. (m. Blaylock); wife of Levi Bess |
| Mary Bess | `mary-a-bess`, `mary-f-bess` | Jacob's daughter vs. Edward's daughter |
| Catherine Bess | `catherine-bess-jacob-daughter`, `catherine-bess-edward-daughter` | Jacob's daughter vs. Edward's daughter |
| James Bess | `james-bess-son`, "James Bess husband of Sarah" (in Sarah's record) | Jacob's son vs. Sarah's husband — surname collision could mean cousin marriage or two different men |
| John Slinkard | `john-slinkard-b`, `john-slinkard-stroder-1839`, `john-slinkard-nancy-stroder` | Three records with overlapping but unconfirmed identity |
| Joseph Slinkard | `joseph-slinkerd-shrum`, `joseph-slinkard-anna-green`, `joseph-slinkard-bollinger` | Three different marriages, three different periods |
| Daniel Slinkard | `daniel-slinkard` (d. 1838), `daniel-slinkard-jr`, `daniel-slinkard-1881` | Three distinct men |
