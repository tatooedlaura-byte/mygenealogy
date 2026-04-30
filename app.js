// My Genealogy SPA
// Data: data/people.json, data/evidence.json, data/tasks.json
// Routes: #/, #/person/:id, #/relationships, #/evidence, #/evidence/:id, #/tasks, #/conflicts, #/duplicates, #/rejected, #/proof/:slug

const DATA = { people: {}, evidence: {}, tasks: [], directLine: [], groups: {} };

const STATUS_ORDER = ['PROVEN', 'PROVEN (By Argument)', 'STRONGLY SUPPORTED', 'SUPPORTED', 'UNKNOWN', 'REPLACED', 'REJECTED', 'DISPROVEN'];

function statusClass(status) {
  return 'status-' + (status || 'UNKNOWN').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');
}

function statusBadge(status) {
  if (!status) return '';
  return `<span class="status ${statusClass(status)}">${escape(status)}</span>`;
}

function escape(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
}

function personLink(id, fallbackName) {
  if (!id) return escape(fallbackName || '(unknown)');
  const p = DATA.people[id];
  const name = p ? p.name : (fallbackName || id);
  if (!p) return `<span class="muted">${escape(name)} <code>(${escape(id)})</code></span>`;
  return `<a href="#/person/${encodeURIComponent(id)}">${escape(name)}</a>`;
}

function formatValue(value) {
  if (typeof value === 'string') return escape(value);
  if (value && typeof value === 'object') {
    const parts = [];
    if (value.date) parts.push(escape(value.date));
    if (value.yearRange && value.yearRange !== value.date) parts.push(`(${escape(value.yearRange)})`);
    if (value.year && !value.date) parts.push(escape(value.year));
    if (value.place) parts.push('in ' + escape(value.place));
    return parts.join(' ');
  }
  return '';
}

function formatPredicate(claim) {
  const p = claim.predicate;
  switch (p) {
    case 'born': return `<strong>Born:</strong> ${formatValue(claim.value)}`;
    case 'died': return `<strong>Died:</strong> ${formatValue(claim.value)}`;
    case 'resided': return `<strong>Resided:</strong> ${formatValue(claim.value)}`;
    case 'child-of': return `<strong>Child of</strong> ${claim.object ? personLink(claim.object) : escape(claim.value || '(unknown)')}`;
    case 'father-of': return `<strong>Father of</strong> ${claim.object ? personLink(claim.object) : escape(claim.value || '(unknown)')}`;
    case 'mother-of': return `<strong>Mother of</strong> ${claim.object ? personLink(claim.object) : escape(claim.value || '(unknown)')}`;
    case 'spouse-of': {
      const target = claim.object ? personLink(claim.object) : escape(claim.value || '(unknown)');
      let extra = '';
      if (claim.marriageDate) extra += ` <span class="muted small">m. ${escape(claim.marriageDate)}</span>`;
      else if (claim.marriageYear) extra += ` <span class="muted small">m. ${escape(claim.marriageYear)}</span>`;
      return `<strong>Spouse of</strong> ${target}${extra}`;
    }
    case 'aka': return `<strong>AKA:</strong> ${escape(claim.value)}`;
    case 'role': return `<strong>Role:</strong> ${escape(claim.value)}`;
    case 'member-of': return `<strong>Member of:</strong> ${escape(claim.value)}`;
    default: return `<strong>${escape(p)}:</strong> ${claim.object ? personLink(claim.object) : escape(claim.value || '')}`;
  }
}

function renderEvidenceCard(evId) {
  const ev = DATA.evidence[evId];
  if (!ev) {
    return `<div class="evidence-record"><span class="muted">Evidence not found: <code>${escape(evId)}</code></span></div>`;
  }
  let html = `<div class="evidence-record">`;
  html += `<div><span class="ev-type">${escape(ev.type || 'record')}</span> <a href="#/evidence/${encodeURIComponent(ev.id)}" class="ev-id">${escape(ev.id)}</a></div>`;
  html += `<dl>`;
  if (ev.date) html += `<dt>Date</dt><dd>${escape(ev.date)}</dd>`;
  if (ev.location) html += `<dt>Location</dt><dd>${escape(ev.location)}</dd>`;
  if (ev.citation) html += `<dt>Citation</dt><dd>${escape(ev.citation)}</dd>`;
  if (ev.url) html += `<dt>Source</dt><dd><a href="${escape(ev.url)}" target="_blank" rel="noopener">View original record ↗</a></dd>`;
  html += `</dl>`;
  if (ev.extract) html += `<div class="ev-extract">${escape(ev.extract)}</div>`;
  if (ev.proves && ev.proves.length) {
    html += `<dt>What it proves</dt><ul>${ev.proves.map(p => `<li>${escape(p)}</li>`).join('')}</ul>`;
  }
  if (ev.doesNotProve && ev.doesNotProve.length) {
    html += `<dt>What it does NOT prove</dt><ul>${ev.doesNotProve.map(p => `<li>${escape(p)}</li>`).join('')}</ul>`;
  }
  if (ev.notes) html += `<div class="muted small">Note: ${escape(ev.notes)}</div>`;
  html += `</div>`;
  return html;
}

function renderClaim(claim, idx) {
  const cls = (claim.status || 'unknown').toLowerCase().replace(/ /g, '-');
  let html = `<div class="claim ${cls}">`;
  html += `<div class="claim-main">${formatPredicate(claim)} ${statusBadge(claim.status)}</div>`;

  if (claim.replacedBy) {
    html += `<div class="claim-meta">↳ Replaced by: <code>${escape(claim.replacedBy)}</code></div>`;
  }

  if (claim.evidence && claim.evidence.length) {
    const toggleId = `ev-toggle-${idx}-${Math.random().toString(36).slice(2, 8)}`;
    html += `<div class="claim-evidence">`;
    html += `<span class="claim-evidence-toggle" onclick="document.getElementById('${toggleId}').classList.toggle('open')">▸ ${claim.evidence.length} evidence record${claim.evidence.length === 1 ? '' : 's'}</span>`;
    html += `<div class="claim-evidence-list" id="${toggleId}">`;
    claim.evidence.forEach(evId => { html += renderEvidenceCard(evId); });
    html += `</div></div>`;
  } else {
    html += `<div class="claim-meta muted small">No evidence references attached.</div>`;
  }

  if (claim.notes) {
    html += `<div class="claim-notes">${escape(claim.notes)}</div>`;
  }

  if (claim.justification) {
    html += `<div class="claim-justification">`;
    html += `<div class="claim-justification-header">📌 Evidence Status: PROVEN (By Argument)</div>`;
    html += `<div class="claim-justification-body">${escape(claim.justification)}</div>`;
    if (claim.contradictionsChecked) {
      html += `<div class="claim-justification-contradictions">Contradictions checked: ${escape(claim.contradictionsChecked)}</div>`;
    }
    html += `</div>`;
  }

  html += `</div>`;
  return html;
}

function getInverseClaimsFor(personId) {
  // Find claims from OTHER people that target this person.
  const inverse = [];
  for (const [otherId, other] of Object.entries(DATA.people)) {
    if (otherId === personId) continue;
    if (!other.claims) continue;
    for (const claim of other.claims) {
      if (claim.object === personId) {
        inverse.push({ fromId: otherId, claim });
      }
    }
  }
  return inverse;
}

function renderHome() {
  let html = '';

  // Direct line
  html += `<div class="direct-line"><h2>Direct Line</h2>`;
  html += `<p class="muted small">Top to bottom: oldest ancestor to you. Click any name for the person page.</p><ol>`;
  for (const id of DATA.directLine) {
    const p = DATA.people[id];
    if (!p) {
      html += `<li class="unknown"><span class="muted">${escape(id)} (no record)</span></li>`;
      continue;
    }
    html += `<li><a href="#/person/${encodeURIComponent(id)}"><strong>${escape(p.name)}</strong></a>`;
    if (p.aka && p.aka.length) html += ` <span class="muted small">(${p.aka.map(escape).join(', ')})</span>`;
    html += `</li>`;
  }
  html += `</ol></div>`;

  // Quick stats
  const peopleCount = Object.keys(DATA.people).length;
  const evCount = Object.keys(DATA.evidence).length;
  const taskCount = DATA.tasks.length;
  const openTasks = DATA.tasks.filter(t => t.status === 'open').length;

  html += `<div class="claims-section"><h2>At a glance</h2>`;
  html += `<p>${peopleCount} people · ${evCount} evidence records · ${openTasks} open research tasks (${taskCount} total)</p>`;
  html += `<p>`;
  html += `<a class="section-link" href="#/relationships">→ Relationship tracker</a>`;
  html += `<a class="section-link" href="#/evidence">→ Evidence browser</a>`;
  html += `<a class="section-link" href="#/tasks">→ Research tasks</a>`;
  html += `<a class="section-link" href="#/conflicts">→ Conflict log</a>`;
  html += `<a class="section-link" href="#/duplicates">→ Possible duplicates</a>`;
  html += `<a class="section-link" href="#/rejected">→ Rejected theories</a>`;
  html += `</p></div>`;

  // Browse by group
  html += `<h2>Browse by group</h2>`;
  const peopleByGroup = {};
  for (const [id, p] of Object.entries(DATA.people)) {
    const g = p.group || 'other';
    (peopleByGroup[g] ||= []).push(p);
  }
  for (const [groupId, label] of Object.entries(DATA.groups)) {
    const people = peopleByGroup[groupId] || [];
    if (!people.length) continue;
    people.sort((a, b) => a.name.localeCompare(b.name));
    html += `<div class="group-section">`;
    html += `<div class="group-header" onclick="this.nextElementSibling.classList.toggle('open')">`;
    html += `<span>${escape(label)}</span><span class="count">${people.length}</span></div>`;
    html += `<div class="group-body"><ul>`;
    for (const p of people) {
      html += `<li><a href="#/person/${encodeURIComponent(p.id)}">${escape(p.name)}</a></li>`;
    }
    html += `</ul></div></div>`;
  }

  // Catch any group not declared in DATA.groups
  for (const [g, people] of Object.entries(peopleByGroup)) {
    if (DATA.groups[g]) continue;
    people.sort((a, b) => a.name.localeCompare(b.name));
    html += `<div class="group-section">`;
    html += `<div class="group-header" onclick="this.nextElementSibling.classList.toggle('open')">`;
    html += `<span>${escape(g)}</span><span class="count">${people.length}</span></div>`;
    html += `<div class="group-body"><ul>`;
    for (const p of people) html += `<li><a href="#/person/${encodeURIComponent(p.id)}">${escape(p.name)}</a></li>`;
    html += `</ul></div></div>`;
  }

  return html;
}

function renderPerson(id) {
  const p = DATA.people[id];
  if (!p) {
    return `<div class="claims-section"><h2>Person not found</h2><p>No record for <code>${escape(id)}</code>. <a href="#/">Back to home</a>.</p></div>`;
  }

  let html = '';

  // Header
  html += `<div class="person-header">`;
  html += `<h1>${escape(p.name)}</h1>`;
  if (p.aka && p.aka.length) html += `<div class="aka">Also known as: ${p.aka.map(escape).join(' · ')}</div>`;
  if (p.tags && p.tags.length) {
    html += `<div class="tags">${p.tags.map(t => `<span class="tag">${escape(t)}</span>`).join('')}</div>`;
  }
  if (p.group && DATA.groups[p.group]) {
    html += `<div class="muted small" style="margin-top:6px;">Group: ${escape(DATA.groups[p.group])}</div>`;
  }
  html += `</div>`;

  // Group claims by category
  const claims = (p.claims || []).slice();
  const byCat = { vitals: [], parents: [], spouses: [], children: [], other: [] };
  let idx = 0;
  for (const c of claims) {
    if (['born', 'died', 'resided'].includes(c.predicate)) byCat.vitals.push(c);
    else if (c.predicate === 'child-of') byCat.parents.push(c);
    else if (c.predicate === 'spouse-of') byCat.spouses.push(c);
    else if (c.predicate === 'father-of' || c.predicate === 'mother-of') byCat.children.push(c);
    else byCat.other.push(c);
  }

  // Inverse claims: people whose claims target this person
  const inverse = getInverseClaimsFor(id);
  // Inverse "father-of"/"mother-of" → this person is a child
  // Inverse "child-of" → this person is a parent (already shown via father-of/mother-of)
  // Inverse "spouse-of" → mutual; usually already covered, but include if missing
  // Inverse "father-of" pointing at me: I am a child of fromId
  for (const { fromId, claim } of inverse) {
    if (claim.predicate === 'father-of' || claim.predicate === 'mother-of') {
      // Add a synthetic "child-of" entry if not already present
      const exists = byCat.parents.some(c => c.object === fromId);
      if (!exists) {
        byCat.parents.push({
          predicate: 'child-of',
          object: fromId,
          status: claim.status,
          evidence: claim.evidence,
          notes: claim.notes ? `(via ${DATA.people[fromId]?.name || fromId} record) ${claim.notes}` : `(via ${DATA.people[fromId]?.name || fromId} record)`
        });
      }
    } else if (claim.predicate === 'child-of') {
      // This person is a parent of fromId
      const exists = byCat.children.some(c => c.object === fromId);
      if (!exists) {
        byCat.children.push({
          predicate: 'father-of', // we don't know gender; default
          object: fromId,
          status: claim.status,
          evidence: claim.evidence,
          notes: `(via ${DATA.people[fromId]?.name || fromId} record)${claim.notes ? ' ' + claim.notes : ''}`
        });
      }
    } else if (claim.predicate === 'spouse-of') {
      const exists = byCat.spouses.some(c => c.object === fromId);
      if (!exists) {
        byCat.spouses.push({ ...claim, object: fromId, notes: `(recorded on ${DATA.people[fromId]?.name || fromId} record)${claim.notes ? ' ' + claim.notes : ''}` });
      }
    }
  }

  // Sort claims by status order (proven first)
  const sortByStatus = (a, b) => STATUS_ORDER.indexOf(a.status || 'UNKNOWN') - STATUS_ORDER.indexOf(b.status || 'UNKNOWN');
  byCat.vitals.sort(sortByStatus);
  byCat.parents.sort(sortByStatus);
  byCat.spouses.sort(sortByStatus);
  byCat.children.sort(sortByStatus);
  byCat.other.sort(sortByStatus);

  if (byCat.vitals.length) {
    html += `<div class="claims-section"><h3>Vitals</h3>`;
    byCat.vitals.forEach((c, i) => { html += renderClaim(c, idx++); });
    html += `</div>`;
  }
  if (byCat.parents.length) {
    html += `<div class="claims-section"><h3>Parents</h3>`;
    byCat.parents.forEach((c, i) => { html += renderClaim(c, idx++); });
    html += `</div>`;
  }
  if (byCat.spouses.length) {
    html += `<div class="claims-section"><h3>Spouses</h3>`;
    byCat.spouses.forEach((c, i) => { html += renderClaim(c, idx++); });
    html += `</div>`;
  }
  if (byCat.children.length) {
    html += `<div class="claims-section"><h3>Children</h3>`;
    byCat.children.forEach((c, i) => { html += renderClaim(c, idx++); });
    html += `</div>`;
  }
  if (byCat.other.length) {
    html += `<div class="claims-section"><h3>Other claims</h3>`;
    byCat.other.forEach((c, i) => { html += renderClaim(c, idx++); });
    html += `</div>`;
  }

  // Open questions
  if (p.openQuestions && p.openQuestions.length) {
    html += `<div class="claims-section"><h3>Open questions</h3><ul>`;
    p.openQuestions.forEach(q => { html += `<li>${escape(q)}</li>`; });
    html += `</ul></div>`;
  }

  // Notes
  if (p.notes && p.notes.length) {
    html += `<div class="claims-section"><h3>Notes</h3><ul>`;
    p.notes.forEach(n => { html += `<li>${escape(n)}</li>`; });
    html += `</ul></div>`;
  }

  // Summary
  if (p.summary) {
    html += `<div class="claims-section"><h3>Summary</h3><p>${escape(p.summary)}</p></div>`;
  }

  // Related research tasks
  const related = DATA.tasks.filter(t => (t.relatedPeople || []).includes(id));
  if (related.length) {
    html += `<div class="claims-section"><h3>Related research tasks</h3><ul>`;
    related.forEach(t => {
      html += `<li><span class="task-status ${t.status}">${escape(t.status)}</span> ${escape(t.description)}</li>`;
    });
    html += `</ul></div>`;
  }

  return html;
}

function renderRelationships() {
  // Gather every relationship claim across the data set.
  const rels = [];
  for (const [pid, p] of Object.entries(DATA.people)) {
    if (!p.claims) continue;
    for (const c of p.claims) {
      if (['father-of', 'mother-of', 'child-of', 'spouse-of'].includes(c.predicate)) {
        rels.push({ subjectId: pid, ...c });
      }
    }
  }

  // Filters via URL params or defaults
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const filterStatus = params.get('status') || '';
  const filterPredicate = params.get('predicate') || '';
  const filterText = (params.get('q') || '').toLowerCase();

  let html = '';
  html += `<h2>Relationship tracker</h2>`;
  html += `<p class="muted">Every parent / child / spouse claim across the data set, with status and evidence count.</p>`;
  html += `<div class="filters">`;
  html += `<label>Status: <select onchange="setFilter('status', this.value)">`;
  html += `<option value="">All</option>`;
  for (const s of STATUS_ORDER) html += `<option value="${s}" ${s === filterStatus ? 'selected' : ''}>${s}</option>`;
  html += `</select></label>`;
  html += `<label>Type: <select onchange="setFilter('predicate', this.value)">`;
  html += `<option value="">All</option>`;
  for (const p of ['father-of', 'mother-of', 'child-of', 'spouse-of']) {
    html += `<option value="${p}" ${p === filterPredicate ? 'selected' : ''}>${p}</option>`;
  }
  html += `</select></label>`;
  html += `<label>Search: <input type="text" oninput="setFilter('q', this.value)" value="${escape(filterText)}" placeholder="surname or name…"></label>`;
  html += `</div>`;

  const filtered = rels.filter(r => {
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterPredicate && r.predicate !== filterPredicate) return false;
    if (filterText) {
      const subjName = DATA.people[r.subjectId]?.name?.toLowerCase() || '';
      const objName = (r.object && DATA.people[r.object]?.name?.toLowerCase()) || (r.value || '').toLowerCase();
      if (!subjName.includes(filterText) && !objName.includes(filterText)) return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    const sa = STATUS_ORDER.indexOf(a.status || 'UNKNOWN');
    const sb = STATUS_ORDER.indexOf(b.status || 'UNKNOWN');
    if (sa !== sb) return sa - sb;
    return (DATA.people[a.subjectId]?.name || '').localeCompare(DATA.people[b.subjectId]?.name || '');
  });

  html += `<table><thead><tr><th>Subject</th><th>Relationship</th><th>Object</th><th>Status</th><th>Evidence</th></tr></thead><tbody>`;
  for (const r of filtered) {
    const subj = personLink(r.subjectId);
    const obj = r.object ? personLink(r.object) : escape(r.value || '');
    html += `<tr>`;
    html += `<td>${subj}</td>`;
    html += `<td>${escape(r.predicate)}</td>`;
    html += `<td>${obj}</td>`;
    html += `<td>${statusBadge(r.status)}</td>`;
    html += `<td class="small">${(r.evidence || []).length}</td>`;
    html += `</tr>`;
  }
  html += `</tbody></table>`;
  html += `<p class="muted small" style="margin-top:8px;">${filtered.length} of ${rels.length} relationships shown.</p>`;
  return html;
}

function setFilter(key, value) {
  const [path, query] = location.hash.split('?');
  const params = new URLSearchParams(query || '');
  if (value) params.set(key, value); else params.delete(key);
  location.hash = path + (params.toString() ? '?' + params.toString() : '');
}

function renderEvidenceList() {
  const evs = Object.values(DATA.evidence);
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const filterType = params.get('type') || '';
  const filterText = (params.get('q') || '').toLowerCase();

  let html = `<h2>Evidence browser</h2>`;
  html += `<p class="muted">${evs.length} evidence records. Each is a single source document with extract, citation, and what it does (and does NOT) prove.</p>`;
  html += `<div class="filters">`;
  html += `<label>Type: <select onchange="setFilter('type', this.value)">`;
  html += `<option value="">All</option>`;
  const types = [...new Set(evs.map(e => e.type))].sort();
  for (const t of types) html += `<option value="${escape(t)}" ${t === filterType ? 'selected' : ''}>${escape(t)}</option>`;
  html += `</select></label>`;
  html += `<label>Search: <input type="text" oninput="setFilter('q', this.value)" value="${escape(filterText)}" placeholder="extract / citation / location…"></label>`;
  html += `</div>`;

  let filtered = evs;
  if (filterType) filtered = filtered.filter(e => e.type === filterType);
  if (filterText) {
    filtered = filtered.filter(e => {
      return (e.extract || '').toLowerCase().includes(filterText)
        || (e.citation || '').toLowerCase().includes(filterText)
        || (e.location || '').toLowerCase().includes(filterText)
        || (e.id || '').toLowerCase().includes(filterText);
    });
  }
  filtered.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  html += `<table><thead><tr><th>ID</th><th>Type</th><th>Date</th><th>Location</th><th>Extract</th></tr></thead><tbody>`;
  for (const ev of filtered) {
    html += `<tr>`;
    html += `<td><a href="#/evidence/${encodeURIComponent(ev.id)}" class="small">${escape(ev.id)}</a></td>`;
    html += `<td>${escape(ev.type || '')}</td>`;
    html += `<td>${escape(ev.date || '')}</td>`;
    html += `<td>${escape(ev.location || '')}</td>`;
    html += `<td class="small">${escape((ev.extract || '').slice(0, 120))}${(ev.extract || '').length > 120 ? '…' : ''}</td>`;
    html += `</tr>`;
  }
  html += `</tbody></table>`;
  html += `<p class="muted small" style="margin-top:8px;">${filtered.length} of ${evs.length} records shown.</p>`;
  return html;
}

function renderEvidenceDetail(id) {
  const ev = DATA.evidence[id];
  if (!ev) return `<div class="claims-section"><h2>Evidence not found</h2><p><code>${escape(id)}</code> — <a href="#/evidence">Back to evidence list</a>.</p></div>`;

  let html = `<h2>Evidence: ${escape(id)}</h2>`;
  html += renderEvidenceCard(id);

  // Find all claims that reference this evidence
  const refs = [];
  for (const [pid, p] of Object.entries(DATA.people)) {
    if (!p.claims) continue;
    for (const c of p.claims) {
      if ((c.evidence || []).includes(id)) {
        refs.push({ subjectId: pid, claim: c });
      }
    }
  }
  html += `<div class="claims-section"><h3>Claims using this evidence (${refs.length})</h3>`;
  if (refs.length === 0) html += `<p class="muted">No claims currently reference this evidence.</p>`;
  else {
    html += `<table><thead><tr><th>Person</th><th>Claim</th><th>Status</th></tr></thead><tbody>`;
    for (const { subjectId, claim } of refs) {
      const obj = claim.object ? personLink(claim.object) : escape(claim.value || formatValue(claim.value) || '');
      html += `<tr><td>${personLink(subjectId)}</td><td>${escape(claim.predicate)} → ${obj}</td><td>${statusBadge(claim.status)}</td></tr>`;
    }
    html += `</tbody></table>`;
  }
  html += `</div>`;

  // Find related research tasks
  const related = DATA.tasks.filter(t => (t.relatedEvidence || []).includes(id));
  if (related.length) {
    html += `<div class="claims-section"><h3>Related research tasks</h3><ul>`;
    related.forEach(t => { html += `<li><span class="task-status ${t.status}">${escape(t.status)}</span> ${escape(t.description)}</li>`; });
    html += `</ul></div>`;
  }
  return html;
}

function renderTasks() {
  let html = `<h2>Research tasks</h2>`;
  html += `<p class="muted">Open research questions. Add or update by asking (e.g. "mark task t-jacob-bess-dower-release as done").</p>`;

  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const filterStatus = params.get('status') || '';
  const filterPriority = params.get('priority') || '';

  html += `<div class="filters">`;
  html += `<label>Status: <select onchange="setFilter('status', this.value)">`;
  html += `<option value="">All</option>`;
  for (const s of ['open', 'in-progress', 'done', 'blocked']) html += `<option value="${s}" ${s === filterStatus ? 'selected' : ''}>${s}</option>`;
  html += `</select></label>`;
  html += `<label>Priority: <select onchange="setFilter('priority', this.value)">`;
  html += `<option value="">All</option>`;
  for (const p of ['high', 'medium', 'low']) html += `<option value="${p}" ${p === filterPriority ? 'selected' : ''}>${p}</option>`;
  html += `</select></label>`;
  html += `</div>`;

  let filtered = DATA.tasks;
  if (filterStatus) filtered = filtered.filter(t => t.status === filterStatus);
  if (filterPriority) filtered = filtered.filter(t => t.priority === filterPriority);

  // Sort by priority then status
  const PR = { high: 0, medium: 1, low: 2 };
  filtered.sort((a, b) => (PR[a.priority] ?? 3) - (PR[b.priority] ?? 3));

  for (const t of filtered) {
    html += `<div class="task-card priority-${escape(t.priority || 'low')}">`;
    html += `<div><span class="task-status ${escape(t.status)}">${escape(t.status)}</span> `;
    html += `<span class="pill">${escape(t.priority || '')}</span> `;
    html += `<code class="small">${escape(t.id)}</code></div>`;
    html += `<div style="margin-top:6px;"><strong>${escape(t.description)}</strong></div>`;
    if (t.purpose) html += `<div class="muted small" style="margin-top:4px;">${escape(t.purpose)}</div>`;
    if (t.relatedPeople && t.relatedPeople.length) {
      html += `<div class="small" style="margin-top:6px;">People: ${t.relatedPeople.map(id => personLink(id)).join(' · ')}</div>`;
    }
    if (t.relatedEvidence && t.relatedEvidence.length) {
      html += `<div class="small" style="margin-top:4px;">Evidence: ${t.relatedEvidence.map(id => `<a href="#/evidence/${encodeURIComponent(id)}"><code>${escape(id)}</code></a>`).join(' · ')}</div>`;
    }
    html += `</div>`;
  }
  if (filtered.length === 0) html += `<p class="muted">No tasks match the filter.</p>`;
  return html;
}

async function renderMarkdownFile(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error('Not found: ' + path);
    const text = await res.text();
    const html = marked.parse(text);
    return `<div class="md-content">${html}</div>`;
  } catch (err) {
    return `<div class="md-content"><h2>File not found</h2><p>Could not load <code>${escape(path)}</code>.</p><p class="muted">${escape(err.message)}</p></div>`;
  }
}

function renderSearch(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) return '';
  const matches = [];
  for (const [id, p] of Object.entries(DATA.people)) {
    const name = (p.name || '').toLowerCase();
    const akas = (p.aka || []).join(' ').toLowerCase();
    if (name.includes(q) || akas.includes(q) || id.toLowerCase().includes(q)) {
      matches.push(p);
    }
  }
  matches.sort((a, b) => a.name.localeCompare(b.name));
  let html = `<div class="search-results"><strong>${matches.length}</strong> match${matches.length === 1 ? '' : 'es'} for "${escape(q)}":`;
  if (matches.length) {
    html += `<ul>`;
    for (const p of matches) {
      html += `<li><a href="#/person/${encodeURIComponent(p.id)}">${escape(p.name)}</a>`;
      if (p.aka && p.aka.length) html += ` <span class="muted small">(${p.aka.map(escape).join(', ')})</span>`;
      html += `</li>`;
    }
    html += `</ul>`;
  }
  html += `</div>`;
  return html;
}

async function route() {
  const app = document.getElementById('app');
  const hash = location.hash.replace(/^#/, '') || '/';
  const [path, query] = hash.split('?');
  const parts = path.split('/').filter(Boolean);

  let html = '';

  if (parts.length === 0) {
    html = renderHome();
  } else if (parts[0] === 'person' && parts[1]) {
    html = renderPerson(decodeURIComponent(parts[1]));
  } else if (parts[0] === 'relationships') {
    html = renderRelationships();
  } else if (parts[0] === 'evidence' && parts[1]) {
    html = renderEvidenceDetail(decodeURIComponent(parts[1]));
  } else if (parts[0] === 'evidence') {
    html = renderEvidenceList();
  } else if (parts[0] === 'tasks') {
    html = renderTasks();
  } else if (parts[0] === 'conflicts') {
    app.innerHTML = '<div class="loading">Loading…</div>';
    html = await renderMarkdownFile('review/conflicts.md');
  } else if (parts[0] === 'duplicates') {
    app.innerHTML = '<div class="loading">Loading…</div>';
    html = await renderMarkdownFile('review/possible_duplicates.md');
  } else if (parts[0] === 'rejected') {
    app.innerHTML = '<div class="loading">Loading…</div>';
    html = await renderMarkdownFile('review/rejected_theories.md');
  } else if (parts[0] === 'proof' && parts[1]) {
    app.innerHTML = '<div class="loading">Loading…</div>';
    html = await renderMarkdownFile('review/proof_arguments/' + decodeURIComponent(parts[1]) + '.md');
  } else {
    html = `<div class="claims-section"><h2>Not found</h2><p>Unknown route. <a href="#/">Home</a>.</p></div>`;
  }

  app.innerHTML = html;
  window.scrollTo(0, 0);
}

async function init() {
  try {
    const [peopleRes, evidenceRes, tasksRes] = await Promise.all([
      fetch('data/people.json'),
      fetch('data/evidence.json'),
      fetch('data/tasks.json')
    ]);
    const peopleData = await peopleRes.json();
    const evidenceData = await evidenceRes.json();
    const tasksData = await tasksRes.json();
    DATA.people = peopleData.people || {};
    DATA.directLine = peopleData.directLine || [];
    DATA.groups = peopleData.groups || {};
    DATA.evidence = evidenceData.evidence || {};
    DATA.tasks = tasksData.tasks || [];
  } catch (err) {
    document.getElementById('app').innerHTML = `<div class="claims-section"><h2>Failed to load data</h2><p>${escape(err.message)}</p><p class="muted">If you opened this file directly (file://), browsers block fetch. Use a local web server: <code>python3 -m http.server</code> in this directory, then open <code>http://localhost:8000</code>.</p></div>`;
    return;
  }

  // Search box
  const searchInput = document.getElementById('search');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      const q = e.target.value;
      const app = document.getElementById('app');
      const existing = app.querySelector('.search-results');
      const html = renderSearch(q);
      if (existing) existing.remove();
      if (html) app.insertAdjacentHTML('afterbegin', html);
    });
  }

  window.addEventListener('hashchange', route);
  await route();
}

init();
