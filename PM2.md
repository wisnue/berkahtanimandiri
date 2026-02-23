# Process Management - KTH BTM

## Development Mode (Recommended untuk Windows)

Untuk development di Windows, kami menggunakan **Concurrently** karena lebih stabil dibanding PM2.

### Start Development Server

```bash
npm run dev
```

Command ini akan menjalankan:
- Backend pada `http://localhost:5000`
- Frontend pada `http://localhost:5173`

Output akan ditampilkan dengan color-coded prefix:
- 🔵 `backend` - Express server dengan tsx watch (hot reload)
- 🟣 `frontend` - Vite dev server (hot reload)

### Stop Development Server

Tekan `Ctrl+C` di terminal untuk stop semua processes.

## Production Mode dengan PM2 (Optional)

PM2 dapat digunakan untuk production deployment, namun di Windows memiliki compatibility issues dengan npm scripts.

### PM2 Commands

```bash
# Install PM2 globally (optional)
npm install -g pm2

# Start apps dengan PM2
npm run pm2:start

# Check status
npm run pm2:status

# View logs
npm run pm2:logs

# Monitor processes
npm run pm2:monit

# Restart apps
npm run pm2:restart

# Stop apps
npm run pm2:stop

# Delete apps dari PM2
npm run pm2:delete
```

## Log Files

Logs disimpan di directory `logs/`:
- `logs/backend-out.log` - Backend stdout
- `logs/backend-error.log` - Backend stderr
- `logs/frontend-out.log` - Frontend stdout
- `logs/frontend-error.log` - Frontend stderr

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend + frontend (concurrently) ✅ |
| `npm run dev:backend` | Start backend only |
| `npm run dev:frontend` | Start frontend only |
| `npm run build` | Build production bundles |
| `npm run pm2:start` | Start with PM2 (experimental) |
| `npm run pm2:stop` | Stop PM2 processes |
| `npm run pm2:restart` | Restart PM2 processes |
| `npm run pm2:logs` | View PM2 logs |
| `npm run pm2:status` | Check PM2 status |
| `npm run pm2:monit` | Monitor with PM2 |

## Production Deployment

Untuk production deployment:

1. Build aplikasi:
```bash
npm run build
```

2. Set environment variables di `.env` files:
   - `apps/backend/.env` - Backend config
   - `apps/frontend/.env` - Frontend config

3. **Recommended:** Deploy ke Linux server dan gunakan PM2:
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## Troubleshooting

### Check Process Status
```bash
pm2 list
```

### View Specific App Logs
```bash
pm2 logs kth-btm-backend
pm2 logs kth-btm-frontend
```

### Flush Logs
```bash
pm2 flush
```

### Restart Specific App
```bash
pm2 restart kth-btm-backend
pm2 restart kth-btm-frontend
```

### Stop Specific App
```bash
pm2 stop kth-btm-backend
pm2 stop kth-btm-frontend
```

## Auto-Start on System Boot

Untuk auto-start saat boot:
```bash
pm2 startup
pm2 save
```
