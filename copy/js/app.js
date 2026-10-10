/**
 * CricTrack Core Application Script
 * Theme management, navigation, search bar handling, and shared UI helpers
 */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNavigation();
  initGlobalSearch();
});

// Theme Initialization & Switching
function initTheme() {
  const currentTheme = window.CricData ? window.CricData.getTheme() : "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
  updateThemeIcon(currentTheme);

  const themeBtn = document.getElementById("themeToggleBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const activeTheme = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", activeTheme);
      if (window.CricData) window.CricData.setTheme(activeTheme);
      updateThemeIcon(activeTheme);
    });
  }
}

function updateThemeIcon(theme) {
  const themeBtn = document.getElementById("themeToggleBtn");
  if (themeBtn) {
    themeBtn.innerHTML = theme === "light" ? "🌙" : "☀️";
    themeBtn.setAttribute("title", `Switch to ${theme === "light" ? "Dark" : "Light"} Mode`);
  }
}

// Navigation & Active Link Highlight
function initNavigation() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll(".nav-link");
  
  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href && (currentPath.endsWith(href) || (href === "index.html" && (currentPath.endsWith("/") || currentPath.endsWith("crinb/") || currentPath.endsWith("index.html"))))) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  const mobileToggle = document.getElementById("mobileToggle");
  const navMenu = document.getElementById("navMenu");
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }
}

// Global Quick Search Bar
function initGlobalSearch() {
  const searchInput = document.getElementById("searchInput");
  const searchDropdown = document.getElementById("searchDropdown");

  if (!searchInput || !searchDropdown) return;

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim().toLowerCase();
    if (!query) {
      searchDropdown.classList.remove("show");
      searchDropdown.innerHTML = "";
      return;
    }

    const players = window.CricData ? window.CricData.getPlayers() : [];
    const matches = window.CricData ? window.CricData.getMatches() : [];

    const matchedPlayers = players.filter(p => p.name.toLowerCase().includes(query) || p.country.toLowerCase().includes(query) || p.role.toLowerCase().includes(query));
    const matchedMatches = matches.filter(m => m.team1.name.toLowerCase().includes(query) || m.team2.name.toLowerCase().includes(query) || m.series.toLowerCase().includes(query));

    if (matchedPlayers.length === 0 && matchedMatches.length === 0) {
      searchDropdown.innerHTML = `<div class="search-item" style="color: var(--text-muted);">No results found</div>`;
      searchDropdown.classList.add("show");
      return;
    }

    let html = "";
    if (matchedPlayers.length > 0) {
      html += `<div style="padding: 0.4rem 1rem; font-size: 0.75rem; font-weight: 700; color: var(--accent-green); text-transform: uppercase; background: var(--bg-subtle);">Players</div>`;
      matchedPlayers.slice(0, 4).forEach(p => {
        const isSubDir = window.location.pathname.includes("/pages/");
        const targetUrl = isSubDir ? `players.html?id=${p.id}` : `pages/players.html?id=${p.id}`;
        html += `
          <div class="search-item" onclick="window.location.href='${targetUrl}'">
            <div style="font-weight: 600;">${p.name}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-left: auto;">${p.country} (${p.role})</div>
          </div>
        `;
      });
    }

    if (matchedMatches.length > 0) {
      html += `<div style="padding: 0.4rem 1rem; font-size: 0.75rem; font-weight: 700; color: var(--accent-green); text-transform: uppercase; background: var(--bg-subtle);">Matches</div>`;
      matchedMatches.slice(0, 4).forEach(m => {
        const isSubDir = window.location.pathname.includes("/pages/");
        const targetUrl = isSubDir ? `matches.html?id=${m.id}` : `pages/matches.html?id=${m.id}`;
        html += `
          <div class="search-item" onclick="window.location.href='${targetUrl}'">
            <div style="font-weight: 600;">${m.team1.shortName} vs ${m.team2.shortName}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-left: auto;">${m.status} • ${m.matchType}</div>
          </div>
        `;
      });
    }

    searchDropdown.innerHTML = html;
    searchDropdown.classList.add("show");
  });

  // Close dropdown on outside click
  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
      searchDropdown.classList.remove("show");
    }
  });
}

// Global UI Helper to Render Match Cards
window.renderMatchCardHTML = function(m, isSubDir = false) {
  const targetUrl = isSubDir ? `matches.html?id=${m.id}` : `pages/matches.html?id=${m.id}`;
  
  let statusBadge = "";
  if (m.status === "Live") {
    statusBadge = `<span class="badge badge-live"><span class="pulse-dot"></span> LIVE</span>`;
  } else if (m.status === "Completed") {
    statusBadge = `<span class="badge badge-completed">RESULT</span>`;
  } else {
    statusBadge = `<span class="badge badge-upcoming">UPCOMING</span>`;
  }

  const team1ScoreText = m.team1Score && m.team1Score.runs > 0 ? `${m.team1Score.runs}/${m.team1Score.wickets} <span class="team-overs">(${m.team1Score.overs} ov)</span>` : (m.status === "Upcoming" ? "" : "Yet to bat");
  const team2ScoreText = m.team2Score && m.team2Score.runs > 0 ? `${m.team2Score.runs}/${m.team2Score.wickets} <span class="team-overs">(${m.team2Score.overs} ov)</span>` : (m.status === "Upcoming" ? "" : "Yet to bat");

  return `
    <div class="match-card" onclick="window.location.href='${targetUrl}'">
      <div class="match-header">
        <span>${m.series} • ${m.matchType}</span>
        ${statusBadge}
      </div>
      <div class="match-teams">
        <div class="team-row">
          <div class="team-info">
            <span class="team-flag">${m.team1.flag}</span>
            <span>${m.team1.name}</span>
          </div>
          <div class="team-score">${team1ScoreText}</div>
        </div>
        <div class="team-row">
          <div class="team-info">
            <span class="team-flag">${m.team2.flag}</span>
            <span>${m.team2.name}</span>
          </div>
          <div class="team-score">${team2ScoreText}</div>
        </div>
      </div>
      <div class="match-footer">
        ${m.resultText || m.tossInfo || m.venue}
      </div>
    </div>
  `;
};
