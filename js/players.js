/**
 * CricTrack Player Directory & Profile Manager
 */

document.addEventListener("DOMContentLoaded", () => {
  initPlayersPage();
});

let playersState = {
  roleFilter: "All",
  searchQuery: "",
  activePlayerId: null,
  activeFormatTab: "ODI"
};

function initPlayersPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const playerIdParam = urlParams.get("id");

  const searchInput = document.getElementById("playerSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      playersState.searchQuery = e.target.value.toLowerCase().trim();
      renderPlayersGrid();
    });
  }

  renderPlayersGrid();

  if (playerIdParam) {
    openPlayerModal(playerIdParam);
  }
}

function filterPlayerRole(role, btn) {
  playersState.roleFilter = role;
  document.querySelectorAll("#roleFilters .tab-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderPlayersGrid();
}

function renderPlayersGrid() {
  const grid = document.getElementById("playersGrid");
  if (!grid) return;

  const players = CricData.getPlayers();

  let filtered = players.filter(p => {
    const matchRole = playersState.roleFilter === "All" || p.role.toLowerCase().includes(playersState.roleFilter.toLowerCase());
    const matchQuery = !playersState.searchQuery || 
                       p.name.toLowerCase().includes(playersState.searchQuery) || 
                       p.country.toLowerCase().includes(playersState.searchQuery);
    return matchRole && matchQuery;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; padding: 3rem; text-align: center; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-md);">No players match your search or filter.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    return `
      <div class="player-card" onclick="openPlayerModal('${p.id}')">
        <div class="player-header">
          <img src="${CricData.resolvePlayerPhoto(p.photo)}" alt="${p.name}" class="player-photo" onerror="this.src='https://via.placeholder.com/400x300?text=Player+Photo'">
        </div>
        <div class="player-body">
          <div class="player-name">${p.name}</div>
          <div class="player-country">📍 ${p.country}</div>
          <span class="player-role-badge">${p.role}</span>
          
          <div class="player-stats-preview">
            <div class="stat-box">
              <div class="val">${p.stats.ODI ? p.stats.ODI.matches : 0}</div>
              <div class="lbl">Matches</div>
            </div>
            <div class="stat-box">
              <div class="val">${p.stats.ODI ? p.stats.ODI.runs : 0}</div>
              <div class="lbl">Runs</div>
            </div>
            <div class="stat-box">
              <div class="val">${p.stats.ODI ? p.stats.ODI.wickets : 0}</div>
              <div class="lbl">Wickets</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function openPlayerModal(playerId) {
  const player = CricData.getPlayerById(playerId);
  if (!player) return;

  playersState.activePlayerId = playerId;
  playersState.activeFormatTab = "ODI";

  const modal = document.getElementById("playerModal");
  const modalTitle = document.getElementById("playerModalTitle");
  modalTitle.innerHTML = `${player.name} — Profile & Stats`;

  renderPlayerModalBody(player);
  modal.classList.add("show");
}

function closePlayerModal() {
  document.getElementById("playerModal").classList.remove("show");
}

function switchFormatTab(format, btn) {
  playersState.activeFormatTab = format;
  document.querySelectorAll("#playerModalBody .tab-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  const player = CricData.getPlayerById(playersState.activePlayerId);
  if (player) {
    document.getElementById("formatStatsContent").innerHTML = renderFormatStatsTable(player, format);
  }
}

function renderPlayerModalBody(player) {
  const modalBody = document.getElementById("playerModalBody");

  modalBody.innerHTML = `
    <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; align-items: center; background: var(--bg-subtle); padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 1.5rem;">
      <img src="${CricData.resolvePlayerPhoto(player.photo)}" alt="${player.name}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-green);" onerror="this.src='https://via.placeholder.com/150'">
      <div>
        <h2 style="font-size: 1.4rem; font-weight: 800;">${player.name}</h2>
        <div style="font-size: 0.95rem; color: var(--accent-green); font-weight: 600; margin-bottom: 0.4rem;">${player.country} • ${player.role}</div>
        <div style="font-size: 0.85rem; color: var(--text-muted);">
          <span>Batting: ${player.battingStyle || 'Right-hand bat'}</span> • 
          <span>Bowling: ${player.bowlingStyle || 'None'}</span>
        </div>
      </div>
    </div>

    <div class="filter-tabs">
      <button class="tab-btn ${playersState.activeFormatTab === 'Test' ? 'active' : ''}" onclick="switchFormatTab('Test', this)">Test Stats</button>
      <button class="tab-btn ${playersState.activeFormatTab === 'ODI' ? 'active' : ''}" onclick="switchFormatTab('ODI', this)">ODI Stats</button>
      <button class="tab-btn ${playersState.activeFormatTab === 'T20' ? 'active' : ''}" onclick="switchFormatTab('T20', this)">T20 Stats</button>
    </div>

    <div id="formatStatsContent">
      ${renderFormatStatsTable(player, playersState.activeFormatTab)}
    </div>
  `;
}

function renderFormatStatsTable(player, format) {
  const st = (player.stats && player.stats[format]) ? player.stats[format] : {
    matches: 0, runs: 0, highest: 0, avg: 0, sr: 0, hundreds: 0, fifties: 0, wickets: 0, bestBowling: "0/0", economy: 0, bowlAvg: 0
  };

  return `
    <div style="margin-bottom: 1.5rem;">
      <h4 style="font-size: 1rem; color: var(--accent-green); margin-bottom: 0.6rem;">Batting Career (${format})</h4>
      <div class="table-container">
        <table class="cric-table">
          <thead>
            <tr>
              <th>Matches</th>
              <th>Runs</th>
              <th>Highest</th>
              <th>Average</th>
              <th>Strike Rate</th>
              <th>100s</th>
              <th>50s</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${st.matches}</strong></td>
              <td><strong>${st.runs}</strong></td>
              <td>${st.highest}</td>
              <td>${st.avg}</td>
              <td>${st.sr}</td>
              <td><span style="color: var(--accent-gold); font-weight: 700;">${st.hundreds}</span></td>
              <td>${st.fifties}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div>
      <h4 style="font-size: 1rem; color: var(--accent-green); margin-bottom: 0.6rem;">Bowling Career (${format})</h4>
      <div class="table-container">
        <table class="cric-table">
          <thead>
            <tr>
              <th>Wickets</th>
              <th>Best Bowling</th>
              <th>Economy Rate</th>
              <th>Bowling Average</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong style="color: var(--accent-green); font-size: 1.1rem;">${st.wickets}</strong></td>
              <td>${st.bestBowling || '0/0'}</td>
              <td>${st.economy || 0}</td>
              <td>${st.bowlAvg || 0}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}
