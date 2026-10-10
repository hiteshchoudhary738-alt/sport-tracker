/**
 * CricTrack Matches & Scorecard Manager
 */

document.addEventListener("DOMContentLoaded", () => {
  initMatchesPage();
});

let matchesState = {
  statusFilter: "All",
  formatFilter: "All",
  activeMatchId: null
};

function initMatchesPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const matchIdParam = urlParams.get("id");

  renderMatchesList();

  if (matchIdParam) {
    openScorecardModal(matchIdParam);
  }
}

function filterStatus(status, btn) {
  matchesState.statusFilter = status;
  document.querySelectorAll("#statusFilters .tab-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderMatchesList();
}

function filterFormat(format, btn) {
  matchesState.formatFilter = format;
  document.querySelectorAll("#formatFilters .tab-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderMatchesList();
}

function renderMatchesList() {
  const container = document.getElementById("matchesContainer");
  if (!container) return;

  const matches = CricData.getMatches();
  
  let filtered = matches.filter(m => {
    const matchStatus = matchesState.statusFilter === "All" || m.status === matchesState.statusFilter;
    const matchFormat = matchesState.formatFilter === "All" || m.matchType === matchesState.formatFilter;
    return matchStatus && matchFormat;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; padding: 3rem; text-align: center; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-md);">No matches found matching your filters.</div>`;
    return;
  }

  container.innerHTML = filtered.map(m => {
    return `
      <div class="match-card" onclick="openScorecardModal('${m.id}')">
        <div class="match-header">
          <span>${m.series} • ${m.matchType}</span>
          ${m.status === 'Live' ? '<span class="badge badge-live"><span class="pulse-dot"></span> LIVE</span>' : 
            m.status === 'Completed' ? '<span class="badge badge-completed">RESULT</span>' : '<span class="badge badge-upcoming">UPCOMING</span>'}
        </div>
        <div class="match-teams">
          <div class="team-row">
            <div class="team-info">
              <span class="team-flag">${m.team1.flag}</span>
              <span>${m.team1.name}</span>
            </div>
            <div class="team-score">${m.team1Score && m.team1Score.runs > 0 ? `${m.team1Score.runs}/${m.team1Score.wickets} <span class="team-overs">(${m.team1Score.overs} ov)</span>` : (m.status === 'Upcoming' ? '' : 'Yet to bat')}</div>
          </div>
          <div class="team-row">
            <div class="team-info">
              <span class="team-flag">${m.team2.flag}</span>
              <span>${m.team2.name}</span>
            </div>
            <div class="team-score">${m.team2Score && m.team2Score.runs > 0 ? `${m.team2Score.runs}/${m.team2Score.wickets} <span class="team-overs">(${m.team2Score.overs} ov)</span>` : (m.status === 'Upcoming' ? '' : 'Yet to bat')}</div>
          </div>
        </div>
        <div class="match-footer">
          ${m.resultText || m.tossInfo || m.venue}
        </div>
      </div>
    `;
  }).join("");
}

function openScorecardModal(matchId) {
  const match = CricData.getMatchById(matchId);
  if (!match) return;

  matchesState.activeMatchId = matchId;
  const modal = document.getElementById("scorecardModal");
  const modalBody = document.getElementById("scorecardModalBody");
  const modalTitle = document.getElementById("scorecardModalTitle");

  modalTitle.innerHTML = `${match.team1.shortName} vs ${match.team2.shortName} — Full Scorecard`;

  let sc = match.scorecard || {};
  let team1InningsHtml = renderInningsTable(sc.team1Innings);
  let team2InningsHtml = sc.team2Innings ? renderInningsTable(sc.team2Innings) : `<div style="padding: 1.5rem; text-align: center; color: var(--text-muted); background: var(--bg-subtle); border-radius: var(--radius-md); margin-top: 1rem;">Innings 2 not started yet.</div>`;

  let commentaryHtml = "";
  if (match.commentary && match.commentary.length > 0) {
    commentaryHtml = match.commentary.map(c => `
      <div style="padding: 0.75rem; border-bottom: 1px solid var(--border-color); font-size: 0.88rem;">
        <span style="font-weight: 700; color: var(--accent-green); margin-right: 0.5rem;">${c.ball}</span>
        <span>${c.text}</span>
      </div>
    `).join("");
  } else {
    commentaryHtml = `<div style="padding: 1.5rem; color: var(--text-muted);">No commentary available yet.</div>`;
  }

  modalBody.innerHTML = `
    <!-- Header Banner -->
    <div style="background: var(--bg-subtle); padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 1.5rem;">
      <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.4rem;">${match.series} • ${match.venue}</div>
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 0.6rem;">
        <div>
          <div style="font-size: 1.3rem; font-weight: 800;">
            ${match.team1.flag} ${match.team1.name}: ${match.team1Score ? `${match.team1Score.runs}/${match.team1Score.wickets} (${match.team1Score.overs} ov)` : '0/0'}
          </div>
          <div style="font-size: 1.3rem; font-weight: 800; color: var(--text-muted);">
            ${match.team2.flag} ${match.team2.name}: ${match.team2Score && match.team2Score.runs > 0 ? `${match.team2Score.runs}/${match.team2Score.wickets} (${match.team2Score.overs} ov)` : 'Yet to bat'}
          </div>
        </div>
        <div>
          ${match.status === 'Live' ? '<span class="badge badge-live" style="font-size: 0.9rem;"><span class="pulse-dot"></span> LIVE</span>' : 
            match.status === 'Completed' ? '<span class="badge badge-completed" style="font-size: 0.9rem;">COMPLETED</span>' : '<span class="badge badge-upcoming" style="font-size: 0.9rem;">UPCOMING</span>'}
        </div>
      </div>
      <div style="font-size: 0.9rem; font-weight: 600; color: var(--accent-green);">${match.resultText || match.tossInfo}</div>
    </div>

    <!-- Scorecard Sub-tabs -->
    <div class="filter-tabs">
      <button class="tab-btn active" onclick="switchScorecardSubTab('inningsTab', this)">Scorecard</button>
      <button class="tab-btn" onclick="switchScorecardSubTab('commentaryTab', this)">Ball-by-Ball Commentary</button>
    </div>

    <div id="inningsTab">
      <h3 style="font-size: 1.1rem; margin: 1.2rem 0 0.6rem 0; color: var(--accent-green);">${match.team1.name} Innings</h3>
      ${team1InningsHtml}

      <h3 style="font-size: 1.1rem; margin: 1.5rem 0 0.6rem 0; color: var(--accent-green);">${match.team2.name} Innings</h3>
      ${team2InningsHtml}
    </div>

    <div id="commentaryTab" style="display: none; background: var(--bg-subtle); border-radius: var(--radius-md); padding: 0.5rem;">
      ${commentaryHtml}
    </div>
  `;

  modal.classList.add("show");
}

function closeScorecardModal() {
  document.getElementById("scorecardModal").classList.remove("show");
}

function switchScorecardSubTab(tabId, btn) {
  document.querySelectorAll("#scorecardModalBody .tab-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  document.getElementById("inningsTab").style.display = tabId === "inningsTab" ? "block" : "none";
  document.getElementById("commentaryTab").style.display = tabId === "commentaryTab" ? "block" : "none";
}

function renderInningsTable(inningsData) {
  if (!inningsData) return `<div style="padding: 1rem; color: var(--text-muted);">No innings data available</div>`;

  let battingRows = (inningsData.batting || []).map(b => `
    <tr>
      <td><strong>${b.player}</strong></td>
      <td style="color: var(--text-muted); font-size: 0.82rem;">${b.status}</td>
      <td><strong>${b.runs}</strong></td>
      <td>${b.balls}</td>
      <td>${b.fours}</td>
      <td>${b.sixes}</td>
      <td>${b.sr}</td>
    </tr>
  `).join("");

  let bowlingRows = (inningsData.bowling || []).map(bw => `
    <tr>
      <td><strong>${bw.player}</strong></td>
      <td>${bw.overs}</td>
      <td>${bw.maidens}</td>
      <td>${bw.runs}</td>
      <td><strong>${bw.wickets}</strong></td>
      <td>${bw.economy}</td>
    </tr>
  `).join("");

  return `
    <div class="table-container" style="margin-bottom: 1rem;">
      <table class="cric-table">
        <thead>
          <tr>
            <th>Batter</th>
            <th>Dismissal</th>
            <th>R</th>
            <th>B</th>
            <th>4s</th>
            <th>6s</th>
            <th>SR</th>
          </tr>
        </thead>
        <tbody>
          ${battingRows}
          <tr style="background-color: var(--bg-subtle); font-weight: 700;">
            <td colspan="2">Extras: ${inningsData.extras || '0'}</td>
            <td colspan="5" style="text-align: right;">Total: ${inningsData.totalRuns}/${inningsData.wickets} (${inningsData.overs} ov)</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="table-container">
      <table class="cric-table">
        <thead>
          <tr>
            <th>Bowler</th>
            <th>O</th>
            <th>M</th>
            <th>R</th>
            <th>W</th>
            <th>Econ</th>
          </tr>
        </thead>
        <tbody>
          ${bowlingRows}
        </tbody>
      </table>
    </div>
  `;
}
