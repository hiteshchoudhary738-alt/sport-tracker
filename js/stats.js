/**
 * CricTrack Leaderboard & Statistics Manager
 */

document.addEventListener("DOMContentLoaded", () => {
  initStatsPage();
});

let statsState = {
  format: "ODI",
  category: "runs", // 'runs', 'avg', 'sr', 'hundreds', 'wickets', 'economy', 'bowlAvg'
  sortColumn: "stat",
  sortAsc: false
};

function initStatsPage() {
  renderLeaderboard();
}

function setStatsFormat(format, btn) {
  statsState.format = format;
  document.querySelectorAll("#formatTabs .tab-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderLeaderboard();
}

function setStatsCategory(cat, btn) {
  statsState.category = cat;
  document.querySelectorAll("#categoryTabs .tab-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderLeaderboard();
}

function toggleSort(col) {
  if (statsState.sortColumn === col) {
    statsState.sortAsc = !statsState.sortAsc;
  } else {
    statsState.sortColumn = col;
    statsState.sortAsc = false;
  }
  renderLeaderboard();
}

function renderLeaderboard() {
  const container = document.getElementById("leaderboardContainer");
  if (!container) return;

  const players = CricData.getPlayers();
  const format = statsState.format;
  const cat = statsState.category;

  // Map player with stat metric
  let list = players.map(p => {
    const st = (p.stats && p.stats[format]) ? p.stats[format] : {
      matches: 0, runs: 0, highest: 0, avg: 0, sr: 0, hundreds: 0, fifties: 0, wickets: 0, economy: 0, bowlAvg: 0
    };
    return {
      id: p.id,
      name: p.name,
      country: p.country,
      role: p.role,
      photo: p.photo,
      matches: st.matches,
      runs: st.runs,
      highest: st.highest,
      avg: st.avg,
      sr: st.sr,
      hundreds: st.hundreds,
      fifties: st.fifties,
      wickets: st.wickets,
      economy: st.economy || 99,
      bowlAvg: st.bowlAvg || 999
    };
  });

  // Sort based on category
  list.sort((a, b) => {
    let valA = a[cat];
    let valB = b[cat];

    if (cat === "economy" || cat === "bowlAvg") {
      // Lower is better for economy / bowling average (unless 0)
      if (valA === 0) valA = 999;
      if (valB === 0) valB = 999;
      return statsState.sortAsc ? valB - valA : valA - valB;
    }

    return statsState.sortAsc ? valA - valB : valB - valA;
  });

  // Category title label mapping
  const titles = {
    runs: "Most Runs",
    avg: "Highest Batting Average",
    sr: "Highest Strike Rate",
    hundreds: "Most Centuries (100s)",
    wickets: "Most Wickets",
    economy: "Best Economy Rate",
    bowlAvg: "Best Bowling Average"
  };

  document.getElementById("leaderboardTitle").innerText = `${statsState.format} — ${titles[cat]}`;

  let rows = list.map((item, index) => {
    const rank = index + 1;
    let rankBadgeClass = "rank-pill";
    if (rank === 1) rankBadgeClass += " rank-1";
    else if (rank === 2) rankBadgeClass += " rank-2";
    else if (rank === 3) rankBadgeClass += " rank-3";

    let primaryStatVal = item[cat];
    if (cat === "economy" && primaryStatVal === 99) primaryStatVal = "N/A";
    if (cat === "bowlAvg" && primaryStatVal === 999) primaryStatVal = "N/A";

    return `
      <tr onclick="window.location.href='players.html?id=${item.id}'" style="cursor: pointer;">
        <td><div class="${rankBadgeClass}">${rank}</div></td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <img src="${item.photo}" alt="${item.name}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;" onerror="this.src='https://via.placeholder.com/50'">
            <div>
              <div style="font-weight: 700;">${item.name}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${item.country}</div>
            </div>
          </div>
        </td>
        <td>${item.role}</td>
        <td>${item.matches}</td>
        <td><strong>${item.runs}</strong></td>
        <td>${item.avg}</td>
        <td>${item.sr}</td>
        <td>${item.hundreds}</td>
        <td><strong style="color: var(--accent-green); font-size: 1.05rem;">${item.wickets}</strong></td>
        <td style="font-weight: 800; color: var(--accent-gold);">${primaryStatVal}</td>
      </tr>
    `;
  }).join("");

  container.innerHTML = `
    <div class="table-container">
      <table class="cric-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Role</th>
            <th class="sortable-th" onclick="toggleSort('matches')">Mat ⇕</th>
            <th class="sortable-th" onclick="toggleSort('runs')">Runs ⇕</th>
            <th class="sortable-th" onclick="toggleSort('avg')">Avg ⇕</th>
            <th class="sortable-th" onclick="toggleSort('sr')">SR ⇕</th>
            <th class="sortable-th" onclick="toggleSort('hundreds')">100s ⇕</th>
            <th class="sortable-th" onclick="toggleSort('wickets')">Wkts ⇕</th>
            <th style="color: var(--accent-green);">Key Metric (${cat.toUpperCase()})</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}
