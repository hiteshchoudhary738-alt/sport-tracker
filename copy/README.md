# CricTrack — Cricket Stats & Live Match Dashboard

A responsive, feature-packed cricket statistics and live match web application inspired by **Cricbuzz**. Built with pure **HTML5, CSS3, and JavaScript**, running entirely on the client side with data persisted in `localStorage`.

---

## 🌟 Key Features

1. **Live Match & Scores Dashboard (`index.html`)**:
   - Live match highlight banner featuring real-time scores, overs, current batsmen, bowler, and recent ball-by-ball tracker circles (4s in green, 6s in gold, Wickets in red).
   - Match cards grid filterable by status (**All**, **Live**, **Upcoming**, **Completed**).
   - Top News Headlines section and Top Players highlight cards.

2. **Full Match Scorecards (`pages/matches.html`)**:
   - Comprehensive match listing filterable by status and format (**Test**, **ODI**, **T20**).
   - Interactive **Scorecard Modal**:
     - Complete Batting tables (Runs, Balls, 4s, 6s, Strike Rate, Dismissal status).
     - Complete Bowling tables (Overs, Maidens, Runs, Wickets, Economy).
     - Extras & Total score breakdown.
     - Live ball-by-ball commentary feed tab.

3. **Player Directory & Profiles (`pages/players.html`)**:
   - Instant search bar and role filters (**Batsmen**, **Bowlers**, **All-rounders**, **Wicket-keepers**).
   - Detailed **Player Profile Modal**:
     - Player avatar, country badge, role, batting & bowling styles.
     - Format tabs (**Test**, **ODI**, **T20**) showing full career batting and bowling statistics.

4. **Interactive Stats Leaderboards (`pages/stats.html`)**:
   - Filter by Format (**Test**, **ODI**, **T20**) and Category (**Most Runs**, **Batting Avg**, **Strike Rate**, **100s**, **Most Wickets**, **Economy**, **Bowling Avg**).
   - Sortable table columns (click column headers to sort ascending / descending).
   - Rank badges (#1 Gold, #2 Silver, #3 Bronze).

5. **Admin Panel (`pages/admin.html`)**:
   - Password protected with default password: `admin123`.
   - **Live Scoring Interface**: Quick ball action buttons (+0, +1, +2, +3, +4, +6, W, Wd, Nb) to update live match state instantly.
   - **Player CRUD**: Add new players or modify existing player career stats across formats.
   - **Data Reset**: One-click restore default seed international cricket dataset.

6. **UI & Theme**:
   - **Dark Navy / Cricbuzz Green** theme by default with light theme toggle support saved to `localStorage`.
   - Responsive mobile navigation drawer & responsive table containers.
   - Global quick search bar in navbar to instantly locate players and matches.

---

## 📁 Project Structure

```
crinb/
├── index.html              ← Home page (Live summary + matches + top players)
├── README.md               ← Documentation
├── css/
│   └── style.css           ← Global styles (colors, layout, components, themes)
├── js/
│   ├── data.js             ← localStorage data manager & seed dataset
│   ├── app.js              ← Core application logic (theme, navbar, global search)
│   ├── matches.js          ← Match list filtering & scorecard modal
│   ├── players.js          ← Player directory search, filtering & profile modal
│   ├── stats.js            ← Leaderboard rendering & column sorting
│   └── admin.js            ← Admin authentication, live ball updater & player CRUD
└── pages/
    ├── matches.html        ← All matches + live scorecard detailed view
    ├── players.html        ← Player list + career stats breakdown
    ├── stats.html          ← Leaderboards (Batting & Bowling across formats)
    └── admin.html          ← Admin panel for live scoring and player editing
```

---

## 🚀 How to Run

1. Clone or download the project files.
2. Open `index.html` in any web browser (or serve using VS Code Live Server / Python `http.server`).
3. To access Admin features, go to **Admin Panel** (`pages/admin.html`) and enter password: `admin123`.

---

## 🛠️ Tech Stack

- **HTML5**: Semantic markup
- **CSS3**: CSS Custom Variables, Grid, Flexbox, Keyframe Animations
- **JavaScript (ES6+)**: DOM manipulation, ES modules, `localStorage` & `sessionStorage` APIs
