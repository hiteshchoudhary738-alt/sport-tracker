# Real-Time Sports Score Tracker

A high-performance, real-time sports scoreboard and administrative panel supporting multiple sports (Football, Basketball, Tennis, Cricket) with live commentary, squad statistics, and historic career stats.

---

## 🚀 Performance & Scalability (1,000 - 5,000+ Concurrent Users)

To handle high traffic volume without server lag or crashes, the system is designed with several production-ready optimizations:

1. **In-Memory Live Cache (`server/cache.js`)**:
   - Active match simulations and operations run fully in-memory. 
   - Reads/writes during live gameplay bypass disk lookups entirely, maintaining sub-millisecond response times.
2. **Asynchronous Write-Back**:
   - The server batches and syncs the live cache to the database asynchronously in the background once every 5 seconds.
   - For local JSON storage, file operations are fully cached in memory and written non-blocking to prevent event loop delay.
3. **Socket.io Broadcasts**:
   - Match updates are room-scoped (`io.to('match:id')`) so clients only receive events for the match they are viewing. This drastically reduces bandwidth consumption under load.

### Production Scaling Recommendations
* **Database**: Set the `DATABASE_URL` environment variable to connect to a production **PostgreSQL** instance. Postgres handles thousands of concurrent operations with ease.
* **WebSocket Clustering**: If scaling beyond a single Node.js instance, configure Socket.io with a **Redis Adapter** to broadcast events across multiple server instances.
* **Static Assets**: Deploy the frontend (`client`) via a CDN (e.g. Vercel, Netlify, Cloudflare Pages) to offload static file requests from your Node server.

---

## 📁 Git Guidelines

A root `.gitignore` file has been added to exclude temporary and local database files:
* **Excluded**: `node_modules/`, `dist/`, `.env`, and `server/sports_tracker_db.json`.
* Only the clean codebase structure is pushed to git.

### Committing to Git
1. Initialize your repository:
   ```bash
   git init
   ```
2. Add your remote:
   ```bash
   git remote add origin <YOUR_GITHUB_REPO_URL>
   ```
3. Commit and push:
   ```bash
   git add .
   git commit -m "feat: live match controllers, career player stats, and scalability optimizations"
   git branch -M main
   git push -u origin main
   ```

---

## 🛠️ Running Locally

1. Install dependencies at root, server, and client:
   ```bash
   npm install
   npm install --prefix server
   npm install --prefix client
   ```
2. Start the dev server and client concurrently:
   ```bash
   npm run dev
   ```
   * Frontend: `http://localhost:5173` (or next free port)
   * Backend: `http://localhost:5000`
