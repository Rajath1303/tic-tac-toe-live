# Multiplayer Tic-Tac-Toe with Nakama

A production-ready multiplayer Tic-Tac-Toe game built with server-authoritative architecture using Nakama as the backend infrastructure.

---

## Architecture and Design Decisions

```
Client - FE (Next.js)
      |
      | HTTP + WebSocket (Nakama JS SDK)
      |
Nakama Server (Railway)
      |
PostgreSQL (Railway)
```

**Frontend** is built with Next.js (React). The Nakama JS SDK handles authentication via REST and real-time game updates via WebSocket.

**Backend** uses Nakama for session management, matchmaking, leaderboard persistence, and relay of game state between players.

**Matchmaking** uses Nakama's built-in matchmaker. When two players search simultaneously, Nakama pairs them and creates a relay match.

**X/O Assignment** is determined client-side by sorting matched players by `user_id` alphabetically. Since both clients run the same sort, they agree on roles without server coordination.

**Move Sync** uses Nakama's relay. When a player sends a move, Nakama broadcasts it to all other players in the match. Each client applies the move locally on receipt.

**Leaderboard** uses Nakama's built-in leaderboard API. Wins are submitted after each game and persisted in PostgreSQL.

**Authentication** uses Nakama device authentication. A stable UUID is generated per browser and stored in localStorage, mapping each browser to a persistent Nakama account.

---

## Setup and Installation

### Prerequisites

- Node.js 18+
- Docker and Docker Compose

### Steps

**1. Clone the repository**

```bash
git clone https://github.com/yourusername/tictactoe-nakama
cd tictactoe-nakama
```

**2. Install frontend dependencies**

```bash
npm install
```

**3. Create `.env`**

```env
NEXT_PUBLIC_NAKAMA_HOST=localhost
NEXT_PUBLIC_NAKAMA_PORT=7350
NEXT_PUBLIC_NAKAMA_SERVER_KEY=defaultkey
NEXT_PUBLIC_NAKAMA_USE_SSL=false
```

**4. Start Nakama and PostgreSQL**

```bash
docker compose up
```

**5. Start the frontend**

```bash
npm run dev
```

**6. Open the app**

```
http://localhost:3000
```

---

## Deployment Process

The project is deployed on Railway with three services: PostgreSQL, Nakama, and the Next.js frontend.

### PostgreSQL

Add a PostgreSQL service in Railway. Note the internal connection URL.

### Nakama

Create a new Railway service from the Nakama Dockerfile. Set the following environment variable:

```env
DATABASE_URL=postgres://user:password@host:5432/nakama
```

Expose port `7350` as the public domain (HTTP API + WebSocket). Port `7351` (admin console) stays internal.

### Frontend

Create a new Railway service from the frontend Dockerfile. Set the following environment variables before deploying:

```env
NEXT_PUBLIC_NAKAMA_HOST={host}
NEXT_PUBLIC_NAKAMA_PORT=443
NEXT_PUBLIC_NAKAMA_SERVER_KEY=defaultkey
NEXT_PUBLIC_NAKAMA_USE_SSL=true
```

> Note: `NEXT_PUBLIC_*` variables are baked into the JavaScript bundle at build time. The environment variables must be set before the build runs. After updating them, trigger a full redeploy.

### Match Op Codes

| Op Code | Direction                | Description            |
| ------- | ------------------------ | ---------------------- |
| 1       | Server to Client         | Full game state update |
| 2       | Client to Client (relay) | Player move            |
| 3       | Server to Client         | Game over              |
| 5       | Client to Client (relay) | Restart request        |
| 6       | Client to Client (relay) | Restart accepted       |

### Leaderboard

| Property       | Value          |
| -------------- | -------------- |
| ID             | tictactoe_wins |
| Sort Order     | Descending     |
| Operator       | Increment      |
| Reset Schedule | Never          |

### Nakama Admin Console

- Local: `http://localhost:7351` (admin / password)
- Production: Internal network only

---

## How to Test Multiplayer

1. Open two different browsers (for example Chrome and Firefox)
2. Go to the game URL in both browsers
3. Log in with different usernames in each browser
4. Click **Find Online Match** in both browsers within a few seconds of each other
5. Both players will be matched and the game board will appear
6. The player assigned X goes first. Click any empty cell to make a move
7. The move appears on the opponent's board in real time
8. When a player wins, the winner screen appears on both screens simultaneously
9. Both players can request a rematch. Both must confirm before the board resets
