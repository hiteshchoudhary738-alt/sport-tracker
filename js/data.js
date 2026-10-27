// In data.js — replace getPlayers() with API fetch

const API_KEY = ""; // cricketdata.org or cricapi.com
const API_BASE = "";
window.CricData = {

  async fetchPlayersFromAPI() {
    try {
      const res = await fetch(
        `https://api.cricapi.com/v1/players?apikey=${API_KEY}&offset=0`
      );
      const data = await res.json();
      if (data.status === "success") {
        localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(data.data));
      }
    } catch (e) {
      console.warn("API failed, using defaults", e);
    }
  },

  async getPlayerStats(playerId) {
    const res = await fetch(
      `https://api.cricapi.com/v1/players_info?apikey=${API_KEY}&id=${playerId}`
    );
    const data = await res.json();
    return data.data;
  },

  getPlayers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAYERS)) || DEFAULT_PLAYERS;
    } catch (e) {
      return DEFAULT_PLAYERS;
    }
  }
  // ... rest stays same
}