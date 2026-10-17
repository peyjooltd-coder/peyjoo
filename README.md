# Divar Vancouver

Metro Vancouver marketplace â€” React frontend + Express API + SQLite.

## Quick start (development)

### 1. Backend

```bash
cd server
npm install
cp .env.example .env   # optional â€” .env may already exist
npm run db:seed
npm run dev
```

API: http://localhost:3001/api/health

**Auth:** `ali.rezaei@divarvancouver.ca` / `12345` â€” or mobile `6045550100` with OTP `12345`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in â†’ JWT |
| POST | `/api/auth/logout` | Sign out (client clears token) |
| DELETE | `/api/auth/account` | Delete account permanently |

### 2. Frontend

```bash
# from project root
npm install
npm run dev
```

App: http://localhost:5173 â€” requests to `/api` are proxied to the backend.

### Run both

```bash
npm install          # includes concurrently
npm run dev:all
```

Or two terminals: `npm run dev:api` + `npm run dev`.

### Windows: `better-sqlite3` / NODE_MODULE_VERSION error

Use the same Node as your terminal (`C:\Program Files\nodejs`, e.g. v24). Close any running `node` processes, then:

```bash
npm run fix:sqlite
npm run db:seed
```

If rebuild says **EBUSY** or **EPERM**, stop the API (`Ctrl+C`), close other Node apps, and run `fix:sqlite` again.

## Production

### API only

```bash
cd server
npm ci --omit=dev
npm run db:seed
NODE_ENV=production JWT_SECRET=<long-random-secret> npm start
```

### Docker

```bash
docker compose up --build
```

- Web: http://localhost:5173  
- API: http://localhost:3001  

Set `JWT_SECRET` and `CORS_ORIGINS` in environment before real deployment.

### Windows server deploy (no port conflict)

1) Copy deploy env and pick free host ports:

```bash
cp .env.deploy.example .env
```

2) Check current used ports on Windows:

```powershell
netstat -ano | findstr :13001
netstat -ano | findstr :15173
```

If either port is in use, change `API_HOST_PORT` / `WEB_HOST_PORT` in `.env`.

3) Start containers using selected ports:

```bash
docker compose --env-file .env up -d --build
```

4) Open firewall for external tests:

```powershell
netsh advfirewall firewall add rule name="Divar API" dir=in action=allow protocol=TCP localport=13001
netsh advfirewall firewall add rule name="Divar Web" dir=in action=allow protocol=TCP localport=15173
```

5) If server is behind router/cloud NAT, forward ports to this machine IP.

6) Test:
- LAN: `http://SERVER_LAN_IP:15173`
- Internet: `http://SERVER_PUBLIC_IP:15173`

For production, set real domain/IP origins in `CORS_ORIGINS`.

### Background (Ø¨Ø¯ÙˆÙ† CMD Ø¨Ø§Ø²) + Ø¢Ù¾Ø¯ÛŒØª Ø®ÙˆØ¯Ú©Ø§Ø±

Ø¨Ø§ **PM2** Ø§Ù¾ Ù‡Ù…ÛŒØ´Ù‡ Ø¯Ø± Ù¾Ø³â€ŒØ²Ù…ÛŒÙ†Ù‡ Ø§Ø¬Ø±Ø§ Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› Ø¨Ø§ ØªØºÛŒÛŒØ± Ú©Ø¯ØŒ API Ùˆ build ÙØ±Ø§Ù†Øª Ø®ÙˆØ¯Ú©Ø§Ø± Ø±ÛŒâ€ŒØ§Ø³ØªØ§Ø±Øª/Ø¨Ù‡â€ŒØ±ÙˆØ² Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯.

```powershell
cd C:\Users\Administrator\Documents\divarvanciver\divarvanciver
npm run fix:sqlite
npm run db:seed
npm run build

# ÛŒÚ©â€ŒØ¨Ø§Ø± â€” PowerShell Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† Administrator (Ø¨Ø±Ø§ÛŒ Ø§Ø³ØªØ§Ø±Øª Ø¨Ø§ Ø±ÙˆØ´Ù† Ø´Ø¯Ù† ÙˆÛŒÙ†Ø¯ÙˆØ²)
npm run bg:setup
```

| Ø¯Ø³ØªÙˆØ± | Ú©Ø§Ø± |
|--------|-----|
| `npm run bg:status` | ÙˆØ¶Ø¹ÛŒØª Ø³Ø±ÙˆÛŒØ³â€ŒÙ‡Ø§ |
| `npm run bg:logs` | Ù„Ø§Ú¯ Ø²Ù†Ø¯Ù‡ |
| `npm run bg:restart` | Ø±ÛŒâ€ŒØ§Ø³ØªØ§Ø±Øª Ù‡Ù…Ù‡ |
| `npm run bg:stop` | ØªÙˆÙ‚Ù |

- **ÙˆØ¨:** http://142.44.160.190:15173/
- **API Ø¯Ø§Ø®Ù„ÛŒ:** Ù¾ÙˆØ±Øª 13001 (Ø§Ø² Ø·Ø±ÛŒÙ‚ `/api` Ø±ÙˆÛŒ 15173)

## API overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | â€” | Health check |
| POST | `/api/auth/login` | â€” | JWT login |
| GET | `/api/auth/me` | âœ“ | Current user |
| GET | `/api/listings` | optional | All listings |
| POST | `/api/listings` | âœ“ | Create ad |
| PATCH | `/api/listings/:id` | âœ“ | Update own ad |
| DELETE | `/api/listings/:id` | âœ“ | Soft-delete ad |
| POST | `/api/user/saved/:id/toggle` | âœ“ | Save/unsave |
| POST | `/api/user/compare/:id/toggle` | âœ“ | Compare (max 3) |
| GET/POST/DELETE | `/api/user/alerts` | âœ“ | Search alerts |
| GET/POST | `/api/chat/threads` | âœ“ | Dashboard inbox |
| GET/POST | `/api/pulse/*` | mixed | Pulseâ„¢, handshakes, wants |

## Database

- SQLite file: `server/data/divar.db` (gitignored)
- Reset: `cd server && npm run db:reset && npm run db:seed`
- Seed imports listings from `src/data/mockData.js`

## Environment

| Variable | Where | Description |
|----------|-------|-------------|
| `VITE_API_URL` | frontend | API base (default `/api`) |
| `PORT` | server | API port (default 3001) |
| `JWT_SECRET` | server | **Required in production** |
| `DATABASE_PATH` | server | SQLite path |
| `CORS_ORIGINS` | server | Allowed frontend URLs |

## Stack

- **Frontend:** Vite, React 19, Tailwind v4  
- **Backend:** Express, better-sqlite3, JWT, Zod  
- **Features:** Smart search (client), category filters, Pulseâ„¢, Handshake, Dashboard chat