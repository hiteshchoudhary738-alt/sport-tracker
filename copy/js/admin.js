/**
 * CricTrack Admin Panel Logic
 * Authentication, Live Match Ball-by-Ball Updater, Player CRUD, and Data Reset
 */

document.addEventListener("DOMContentLoaded", () => {
  initAdminPage();
});

let adminState = {
  selectedMatchId: null,
  selectedPlayerId: null
};

function initAdminPage() {
  const isLoggedIn = CricData.isAdminLoggedIn();
  const authSection = document.getElementById("adminAuthSection");
  const dashboardSection = document.getElementById("adminDashboardSection");

  if (!isLoggedIn) {
    if (authSection) authSection.style.display = "block";
    if (dashboardSection) dashboardSection.style.display = "none";
  } else {
    if (authSection) authSection.style.display = "none";
    if (dashboardSection) dashboardSection.style.display = "block";
    loadAdminDashboard();
  }
}

function handleAdminLogin(e) {
  if (e) e.preventDefault();
  const passInput = document.getElementById("adminPasswordInput");
  const errorMsg = document.getElementById("adminLoginError");

  if (passInput.value === "admin123") {
    CricData.setAdminLoggedIn(true);
    errorMsg.style.display = "none";
    initAdminPage();
  } else {
    errorMsg.style.display = "block";
    errorMsg.innerText = "Incorrect password! Default password is: admin123";
  }
}

function handleAdminLogout() {
  CricData.setAdminLoggedIn(false);
  initAdminPage();
}

function loadAdminDashboard() {
  populateMatchSelector();
  populatePlayerSelector();
}

// ----------------------------------------------------
// 1. LIVE MATCH UPDATER MODULE
// ----------------------------------------------------

function populateMatchSelector() {
  const select = document.getElementById("adminMatchSelect");
  if (!select) return;

  const matches = CricData.getMatches();
  select.innerHTML = `<option value="">-- Select Match to Update --</option>` + 
    matches.map(m => `<option value="${m.id}">${m.team1.shortName} vs ${m.team2.shortName} (${m.status} • ${m.series})</option>`).join("");

  if (matches.length > 0) {
    select.value = matches[0].id;
    onAdminMatchSelectChange(matches[0].id);
  }
}

function onAdminMatchSelectChange(matchId) {
  adminState.selectedMatchId = matchId;
  const container = document.getElementById("adminLiveUpdaterContainer");
  if (!matchId) {
    container.innerHTML = `<div style="color: var(--text-muted);">Please select a match above.</div>`;
    return;
  }

  const match = CricData.getMatchById(matchId);
  if (!match) return;

  const live = match.liveData || {
    currentBatsmen: [
      { name: "Batsman 1", runs: 0, balls: 0, fours: 0, sixes: 0, isStriker: true },
      { name: "Batsman 2", runs: 0, balls: 0, fours: 0, sixes: 0, isStriker: false }
    ],
    currentBowler: { name: "Bowler 1", overs: 0, maidens: 0, runs: 0, wickets: 0 },
    recentBalls: []
  };

  const striker = live.currentBatsmen.find(b => b.isStriker) || live.currentBatsmen[0];
  const nonStriker = live.currentBatsmen.find(b => !b.isStriker) || live.currentBatsmen[1];
  const bowler = live.currentBowler;

  container.innerHTML = `
    <div style="background: var(--bg-subtle); padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 1.25rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
        <h4 style="font-weight: 700; font-size: 1.1rem;">${match.team1.name} vs ${match.team2.name}</h4>
        <select id="updateMatchStatus" class="form-control" style="width: auto;" onchange="updateMatchStatusDirect('${match.id}', this.value)">
          <option value="Live" ${match.status === 'Live' ? 'selected' : ''}>🔴 Live</option>
          <option value="Upcoming" ${match.status === 'Upcoming' ? 'selected' : ''}>📅 Upcoming</option>
          <option value="Completed" ${match.status === 'Completed' ? 'selected' : ''}>✅ Completed</option>
        </select>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label>Team 1 Score (Runs / Wkts)</label>
          <input type="text" id="t1ScoreInput" class="form-control" value="${match.team1Score ? match.team1Score.runs : 0}/${match.team1Score ? match.team1Score.wickets : 0}">
        </div>
        <div class="form-group">
          <label>Team 1 Overs</label>
          <input type="number" step="0.1" id="t1OversInput" class="form-control" value="${match.team1Score ? match.team1Score.overs : 0}">
        </div>
        <div class="form-group">
          <label>Result / Status Note</label>
          <input type="text" id="resultTextInput" class="form-control" value="${match.resultText || ''}">
        </div>
      </div>
      <button class="btn btn-secondary" onclick="saveMatchScoreHeader('${match.id}')" style="margin-top: 0.5rem;">Save Score Header</button>
    </div>

    <!-- Quick Ball Action Buttons -->
    <div style="margin-bottom: 1.25rem;">
      <label style="font-size: 0.9rem; font-weight: 700; color: var(--accent-green); margin-bottom: 0.5rem; display: block;">Quick Ball Updater (Live Scoring)</label>
      <div class="quick-ball-btns">
        <button class="ball-btn" onclick="addBallEvent('0')">0</button>
        <button class="ball-btn" onclick="addBallEvent('1')">1</button>
        <button class="ball-btn" onclick="addBallEvent('2')">2</button>
        <button class="ball-btn" onclick="addBallEvent('3')">3</button>
        <button class="ball-btn" style="border-color: var(--accent-green);" onclick="addBallEvent('4')">4</button>
        <button class="ball-btn" style="border-color: var(--accent-gold);" onclick="addBallEvent('6')">6</button>
        <button class="ball-btn w" onclick="addBallEvent('W')">W</button>
        <button class="ball-btn" onclick="addBallEvent('1wd')">Wd</button>
        <button class="ball-btn" onclick="addBallEvent('1nb')">Nb</button>
      </div>
    </div>

    <!-- Batsman & Bowler Realtime Edit -->
    <div class="form-grid">
      <div class="form-group">
        <label>Striker Name</label>
        <input type="text" id="strikerNameInput" class="form-control" value="${striker ? striker.name : ''}">
      </div>
      <div class="form-group">
        <label>Striker Runs (Balls)</label>
        <input type="text" id="strikerRunsInput" class="form-control" value="${striker ? striker.runs : 0} (${striker ? striker.balls : 0}b)">
      </div>
      <div class="form-group">
        <label>Bowler Name</label>
        <input type="text" id="bowlerNameInput" class="form-control" value="${bowler ? bowler.name : ''}">
      </div>
    </div>

    <!-- Commentary text -->
    <div class="form-group" style="margin-top: 1rem;">
      <label>Add Commentary Line</label>
      <input type="text" id="commTextInput" class="form-control" placeholder="e.g. Cummins to Kohli, FOUR! Gorgeous cover drive.">
    </div>
  `;
}

function updateMatchStatusDirect(matchId, status) {
  const match = CricData.getMatchById(matchId);
  if (match) {
    match.status = status;
    CricData.saveMatch(match);
    alert(`Match status updated to ${status}`);
  }
}

function saveMatchScoreHeader(matchId) {
  const match = CricData.getMatchById(matchId);
  if (!match) return;

  const scoreStr = document.getElementById("t1ScoreInput").value;
  const oversVal = parseFloat(document.getElementById("t1OversInput").value) || 0;
  const resultText = document.getElementById("resultTextInput").value;

  const parts = scoreStr.split("/");
  const runs = parseInt(parts[0]) || 0;
  const wickets = parseInt(parts[1]) || 0;

  match.team1Score = { runs, wickets, overs: oversVal };
  match.resultText = resultText;

  CricData.saveMatch(match);
  alert("Match header updated successfully!");
  onAdminMatchSelectChange(matchId);
}

function addBallEvent(ballVal) {
  if (!adminState.selectedMatchId) return;
  const match = CricData.getMatchById(adminState.selectedMatchId);
  if (!match) return;

  if (!match.liveData) {
    match.liveData = { currentBatsmen: [], currentBowler: {}, recentBalls: [] };
  }

  // Update recent balls
  if (!match.liveData.recentBalls) match.liveData.recentBalls = [];
  match.liveData.recentBalls.push(ballVal);
  if (match.liveData.recentBalls.length > 10) {
    match.liveData.recentBalls.shift();
  }

  // Calculate runs added
  let addedRuns = 0;
  let addedWicket = 0;

  if (ballVal === '1') addedRuns = 1;
  else if (ballVal === '2') addedRuns = 2;
  else if (ballVal === '3') addedRuns = 3;
  else if (ballVal === '4') addedRuns = 4;
  else if (ballVal === '6') addedRuns = 6;
  else if (ballVal === 'W') addedWicket = 1;
  else if (ballVal === '1wd' || ballVal === '1nb') addedRuns = 1;

  if (!match.team1Score) match.team1Score = { runs: 0, wickets: 0, overs: 0 };
  match.team1Score.runs += addedRuns;
  match.team1Score.wickets += addedWicket;

  // Add commentary line if provided
  const commInput = document.getElementById("commTextInput");
  const commText = commInput ? commInput.value.trim() : "";
  if (commText) {
    if (!match.commentary) match.commentary = [];
    match.commentary.unshift({
      ball: `${match.team1Score.overs}`,
      text: commText
    });
    if (commInput) commInput.value = "";
  }

  CricData.saveMatch(match);
  onAdminMatchSelectChange(match.id);
}

// ----------------------------------------------------
// 2. PLAYER CRUD MODULE
// ----------------------------------------------------

function populatePlayerSelector() {
  const select = document.getElementById("adminPlayerSelect");
  if (!select) return;

  const players = CricData.getPlayers();
  select.innerHTML = `<option value="NEW">+ Add New Player</option>` + 
    players.map(p => `<option value="${p.id}">${p.name} (${p.country} • ${p.role})</option>`).join("");

  onAdminPlayerSelectChange("NEW");
}

function onAdminPlayerSelectChange(playerId) {
  adminState.selectedPlayerId = playerId;
  const formContainer = document.getElementById("adminPlayerFormContainer");

  let player = {
    id: "",
    name: "",
    country: "",
    role: "Batsman",
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm medium",
    photo: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=400&q=80",
    stats: {
      Test: { matches: 0, runs: 0, highest: 0, avg: 0, sr: 0, hundreds: 0, fifties: 0, wickets: 0, bestBowling: "0/0", economy: 0, bowlAvg: 0 },
      ODI:  { matches: 0, runs: 0, highest: 0, avg: 0, sr: 0, hundreds: 0, fifties: 0, wickets: 0, bestBowling: "0/0", economy: 0, bowlAvg: 0 },
      T20:  { matches: 0, runs: 0, highest: 0, avg: 0, sr: 0, hundreds: 0, fifties: 0, wickets: 0, bestBowling: "0/0", economy: 0, bowlAvg: 0 }
    }
  };

  if (playerId !== "NEW") {
    const existing = CricData.getPlayerById(playerId);
    if (existing) player = existing;
  }

  formContainer.innerHTML = `
    <div class="form-grid">
      <div class="form-group">
        <label>Player Name</label>
        <input type="text" id="pName" class="form-control" value="${player.name}" required>
      </div>
      <div class="form-group">
        <label>Country</label>
        <input type="text" id="pCountry" class="form-control" value="${player.country}" required>
      </div>
      <div class="form-group">
        <label>Role</label>
        <select id="pRole" class="form-control">
          <option value="Batsman" ${player.role === 'Batsman' ? 'selected' : ''}>Batsman</option>
          <option value="Bowler" ${player.role === 'Bowler' ? 'selected' : ''}>Bowler</option>
          <option value="All-rounder" ${player.role === 'All-rounder' ? 'selected' : ''}>All-rounder</option>
          <option value="Wicket-keeper" ${player.role === 'Wicket-keeper' ? 'selected' : ''}>Wicket-keeper</option>
        </select>
      </div>
      <div class="form-group">
        <label>Photo Image URL</label>
        <input type="text" id="pPhoto" class="form-control" value="${player.photo}">
      </div>
    </div>

    <!-- ODI Career Quick Stats Edit -->
    <h4 style="margin: 1rem 0 0.5rem 0; color: var(--accent-green);">ODI Career Stats Overview</h4>
    <div class="form-grid">
      <div class="form-group">
        <label>ODI Matches</label>
        <input type="number" id="pOdiMatches" class="form-control" value="${player.stats.ODI ? player.stats.ODI.matches : 0}">
      </div>
      <div class="form-group">
        <label>ODI Runs</label>
        <input type="number" id="pOdiRuns" class="form-control" value="${player.stats.ODI ? player.stats.ODI.runs : 0}">
      </div>
      <div class="form-group">
        <label>ODI Highest Score</label>
        <input type="number" id="pOdiHighest" class="form-control" value="${player.stats.ODI ? player.stats.ODI.highest : 0}">
      </div>
      <div class="form-group">
        <label>ODI Batting Avg</label>
        <input type="number" step="0.01" id="pOdiAvg" class="form-control" value="${player.stats.ODI ? player.stats.ODI.avg : 0}">
      </div>
      <div class="form-group">
        <label>ODI Wickets</label>
        <input type="number" id="pOdiWickets" class="form-control" value="${player.stats.ODI ? player.stats.ODI.wickets : 0}">
      </div>
    </div>

    <div style="display: flex; gap: 1rem; margin-top: 1.25rem;">
      <button class="btn btn-primary" onclick="saveAdminPlayer('${player.id}')">💾 Save Player</button>
      ${player.id ? `<button class="btn btn-danger" onclick="deleteAdminPlayer('${player.id}')">🗑️ Delete Player</button>` : ''}
    </div>
  `;
}

function saveAdminPlayer(existingId) {
  const name = document.getElementById("pName").value.trim();
  const country = document.getElementById("pCountry").value.trim();
  const role = document.getElementById("pRole").value;
  const photo = document.getElementById("pPhoto").value.trim();

  if (!name || !country) {
    alert("Please fill in player name and country!");
    return;
  }

  let player = existingId ? CricData.getPlayerById(existingId) : { stats: {} };
  player.name = name;
  player.country = country;
  player.role = role;
  player.photo = photo || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=400&q=80";

  if (!player.stats) player.stats = {};
  if (!player.stats.ODI) player.stats.ODI = {};

  player.stats.ODI.matches = parseInt(document.getElementById("pOdiMatches").value) || 0;
  player.stats.ODI.runs = parseInt(document.getElementById("pOdiRuns").value) || 0;
  player.stats.ODI.highest = parseInt(document.getElementById("pOdiHighest").value) || 0;
  player.stats.ODI.avg = parseFloat(document.getElementById("pOdiAvg").value) || 0;
  player.stats.ODI.wickets = parseInt(document.getElementById("pOdiWickets").value) || 0;

  // Initialize Test and T20 default structures if missing
  if (!player.stats.Test) player.stats.Test = { matches: 0, runs: 0, highest: 0, avg: 0, sr: 0, hundreds: 0, fifties: 0, wickets: 0 };
  if (!player.stats.T20) player.stats.T20 = { matches: 0, runs: 0, highest: 0, avg: 0, sr: 0, hundreds: 0, fifties: 0, wickets: 0 };

  CricData.savePlayer(player);
  alert("Player saved successfully!");
  populatePlayerSelector();
}

function deleteAdminPlayer(id) {
  if (confirm("Are you sure you want to delete this player?")) {
    CricData.deletePlayer(id);
    alert("Player deleted!");
    populatePlayerSelector();
  }
}

// ----------------------------------------------------
// 3. RESET SYSTEM DATA
// ----------------------------------------------------

function handleResetDefaultData() {
  if (confirm("Are you sure you want to reset all players, matches, and stats to default seed data?")) {
    CricData.resetToDefault();
    alert("Data reset to default successfully!");
    loadAdminDashboard();
  }
}
