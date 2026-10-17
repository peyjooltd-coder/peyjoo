# Divar Vancouver

Metro Vancouver marketplace — React frontend + Express API + SQLite.

## Quick start (development)

### 1. Backend

```bash
cd server
npm install
cp .env.example .env   # optional — .env may already exist
npm run db:seed
npm run dev
```

API: http://localhost:3001/api/health

**Auth:** `ali.rezaei@divarvancouver.ca` / `12345` — or mobile `6045550100` with OTP `12345`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in → JWT |
| POST | `/api/auth/logout` | Sign out (client clears token) |
| DELETE | `/api/auth/account` | Delete account permanently |

### 2. Frontend

```bash
# from project root
npm install
npm run dev
```

App: http://localhost:5173 — requests to `/api` are proxied to the backend.

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

### Background (بدون CMD باز) + آپدیت خودکار

با **PM2** اپ همیشه در پس‌زمینه اجرا می‌شود؛ با تغییر کد، API و build فرانت خودکار ری‌استارت/به‌روز می‌شوند.

```powershell
cd C:\Users\Administrator\Documents\divarvanciver\divarvanciver
npm run fix:sqlite
npm run db:seed
npm run build

# یک‌بار — PowerShell به‌عنوان Administrator (برای استارت با روشن شدن ویندوز)
npm run bg:setup
```

| دستور | کار |
|--------|-----|
| `npm run bg:status` | وضعیت سرویس‌ها |
| `npm run bg:logs` | لاگ زنده |
| `npm run bg:restart` | ری‌استارت همه |
| `npm run bg:stop` | توقف |

- **وب:** http://142.44.160.190:15173/
- **API داخلی:** پورت 13001 (از طریق `/api` روی 15173)

## API overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | — | Health check |
| POST | `/api/auth/login` | — | JWT login |
| GET | `/api/auth/me` | ✓ | Current user |
| GET | `/api/listings` | optional | All listings |
| POST | `/api/listings` | ✓ | Create ad |
| PATCH | `/api/listings/:id` | ✓ | Update own ad |
| DELETE | `/api/listings/:id` | ✓ | Soft-delete ad |
| POST | `/api/user/saved/:id/toggle` | ✓ | Save/unsave |
| POST | `/api/user/compare/:id/toggle` | ✓ | Compare (max 3) |
| GET/POST/DELETE | `/api/user/alerts` | ✓ | Search alerts |
| GET/POST | `/api/chat/threads` | ✓ | Dashboard inbox |
| GET/POST | `/api/pulse/*` | mixed | Pulse™, handshakes, wants |

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
- **Features:** Smart search (client), category filters, Pulse™, Handshake, Dashboard chat
