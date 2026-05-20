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

The repo's `.github/workflows/deploy.yml` copies `api/server.js` and
`api/package.json` into `/var/www/nawra-api/` on every push to `main`,
runs `npm install`, and restarts the PM2 process. The `.env` and the
SQLite `orders.db` files on the server are preserved.

## Manual deploy (if Actions is down)

```bash
ssh root@194.5.157.90
cd /var/www/nawra/api          # repo's api/ folder (pulled by deploy.yml)
cp server.js   /var/www/nawra-api/server.js
cp package.json /var/www/nawra-api/package.json
cd /var/www/nawra-api && npm install --prefer-offline
pm2 restart nawra-api
```
