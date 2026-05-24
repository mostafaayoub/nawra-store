# Nawra API

Express + better-sqlite3 backend deployed under PM2 at
`/var/www/nawra-api/` on the VPS. Behind nginx at
`https://nawra.ayoupstudio.tech/api/*`.

## Endpoints

| Method | Path                         | Purpose                                         |
| ------ | ---------------------------- | ----------------------------------------------- |
| GET    | `/api/health`                | Liveness probe — returns `mailer: true/false`   |
| POST   | `/api/orders`                | Save new order → upserts user → sends email     |
| GET    | `/api/orders?userId=email`   | Customer's My Orders / admin's full list        |
| PATCH  | `/api/orders/:id`            | Admin status update                             |
| GET    | `/api/users`                 | Admin customers list (auto-built from orders)   |
| GET    | `/api/addresses/:userId`     | Customer's saved delivery addresses             |
| POST   | `/api/addresses`             | Save / replace an address                       |
| PUT    | `/api/addresses/:id`         | Edit address                                    |
| DELETE | `/api/addresses/:id`         | Delete address                                  |
| PATCH  | `/api/addresses/:id/default` | Set one address as default for the user         |

## Environment

Copy `.env.example` to `.env` (on the server only — never commit
the real file). Required keys:

- `GMAIL_USER` — sender Gmail address
- `GMAIL_PASS` — 16-char App Password (spaces OK)

## Auto-deploy

The repo's `.github/workflows/deploy.yml` SSHes into the VPS, pulls the
latest `main` into `/var/www/nawra-store`, runs `npm ci` + `npm run build`
for the frontend, runs `npm install` inside `api/`, and restarts the PM2
process. PM2 executes `/var/www/nawra-store/api/server.js` in-place — there
is no longer a separate `/var/www/nawra-api/` copy. The `.env` and the
SQLite `orders.db` files inside `api/` are preserved across `git reset`.

## Manual deploy (if Actions is down)

```bash
ssh root@194.5.157.90
cd /var/www/nawra-store
git fetch origin main && git reset --hard origin/main
npm ci --prefer-offline && npm run build
cd api && npm install --prefer-offline && cd ..
pm2 restart nawra-api
nginx -t && systemctl reload nginx
```
