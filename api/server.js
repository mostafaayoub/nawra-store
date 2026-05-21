'use strict';
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const Database   = require('better-sqlite3');
const path       = require('path');
const nodemailer = require('nodemailer');
const crypto     = require('crypto');

const app  = express();
const PORT = 3001;
const db   = new Database(path.join(__dirname, 'orders.db'));

// ── Schema ────────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id         TEXT PRIMARY KEY,
    date       TEXT,
    name       TEXT,
    phone      TEXT,
    city       TEXT,
    address    TEXT,
    items      TEXT,
    total      REAL DEFAULT 0,
    status     TEXT DEFAULT '\u062c\u062f\u064a\u062f',
    lat        REAL,
    lng        REAL,
    userEmail  TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS addresses (
    id          TEXT PRIMARY KEY,
    userId      TEXT NOT NULL,
    fullName    TEXT,
    phone       TEXT,
    street      TEXT,
    building    TEXT,
    city        TEXT,
    district    TEXT,
    governorate TEXT,
    landmark    TEXT,
    type        TEXT DEFAULT 'home',
    officeFri   INTEGER DEFAULT 0,
    officeSat   INTEGER DEFAULT 0,
    lat         REAL,
    lng         REAL,
    isDefault   INTEGER DEFAULT 0,
    createdAt   TEXT
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    email       TEXT PRIMARY KEY,
    name        TEXT,
    phone       TEXT,
    firstOrder  DATETIME,
    lastOrder   DATETIME,
    totalOrders INTEGER DEFAULT 0,
    totalSpent  REAL DEFAULT 0
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS coupons (
    id           TEXT PRIMARY KEY,
    code         TEXT UNIQUE NOT NULL,
    type         TEXT DEFAULT 'percent',
    discount     REAL DEFAULT 0,
    min_order    REAL DEFAULT 0,
    max_discount REAL DEFAULT 0,
    start_date   TEXT,
    end_date     TEXT,
    max_uses     INTEGER DEFAULT 0,
    uses         INTEGER DEFAULT 0,
    active       INTEGER DEFAULT 1,
    total_saved  REAL DEFAULT 0,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS returns (
    id          TEXT PRIMARY KEY,
    order_id    TEXT,
    customer    TEXT,
    customer_email TEXT,
    product     TEXT,
    reason      TEXT,
    amount      REAL DEFAULT 0,
    status      TEXT DEFAULT 'pending',
    admin_note  TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key        TEXT PRIMARY KEY,
    value      TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id         TEXT PRIMARY KEY,
    name       TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
// Seed default product categories (idempotent). Use id prefix `cat_default_`
// so the admin UI can recognise them as undeletable defaults.
{
  const seedCats = ["سيروم", "غسول", "مرطب", "واقي شمس"];
  const ins = db.prepare("INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?)");
  seedCats.forEach((n, i) => ins.run(`cat_default_${i}`, n));
}

db.exec(`
  CREATE TABLE IF NOT EXISTS approvals (
    id           TEXT PRIMARY KEY,
    type         TEXT NOT NULL,
    target_id    TEXT,
    target_label TEXT,
    requester    TEXT,
    payload      TEXT DEFAULT '{}',
    reason       TEXT,
    status       TEXT DEFAULT 'pending',
    resolution_note TEXT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at  DATETIME
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS stock_changes (
    id          TEXT PRIMARY KEY,
    product_id  TEXT,
    product_name TEXT,
    old_qty     INTEGER,
    new_qty     INTEGER,
    reason      TEXT,
    actor       TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// ── Super-admin credentials bootstrap ─────────────────────────────────────────
// On first launch (or whenever the `admin_credentials` setting is empty), we
// generate a strong random password, hash it with scrypt, save the hash under
// the `admin_credentials` setting key, and print the plaintext ONCE so the
// operator can capture it from the deploy log. The plaintext is never stored.
function hashPassword(plain, salt = crypto.randomBytes(16)) {
  const buf = crypto.scryptSync(String(plain), salt, 64);
  return { salt: salt.toString('hex'), hash: buf.toString('hex') };
}
function verifyPassword(plain, salt, hash) {
  try {
    const buf = crypto.scryptSync(String(plain), Buffer.from(salt, 'hex'), 64);
    return crypto.timingSafeEqual(buf, Buffer.from(hash, 'hex'));
  } catch { return false; }
}
function generatePassword() {
  // 4 groups of 4 alphanumerics, e.g. "Nwra-Xa12-7Pq9-Kb3M". Easy to read,
  // hard to brute-force at ~10^21 combos.
  const ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const grp = () => Array.from({length:4}, () => ABC[crypto.randomInt(0, ABC.length)]).join('');
  return `Nwra-${grp()}-${grp()}-${grp()}`;
}
{
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_credentials');
  let needBootstrap = !row;
  if (row) {
    try { const v = JSON.parse(row.value); if (!v || !v.hash || !v.email) needBootstrap = true; }
    catch { needBootstrap = true; }
  }
  if (needBootstrap) {
    const email = 'nawraskincare@gmail.com';
    const plain = generatePassword();
    const { salt, hash } = hashPassword(plain);
    db.prepare(`
      INSERT INTO settings (key, value, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
    `).run('admin_credentials', JSON.stringify({ email, salt, hash, role: 'super_admin', created_at: new Date().toISOString() }));
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  🔐  SUPER ADMIN CREDENTIALS (seed — store securely!)');
    console.log('  Email:    ' + email);
    console.log('  Password: ' + plain);
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
  }
}
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id              TEXT PRIMARY KEY,
    sku             TEXT,
    name            TEXT NOT NULL,
    description     TEXT,
    category        TEXT,
    brand           TEXT,
    ingredients     TEXT,
    images          TEXT DEFAULT '[]',
    price           REAL DEFAULT 0,
    price_before    REAL DEFAULT 0,
    cost            REAL DEFAULT 0,
    stock           INTEGER DEFAULT 0,
    alert_threshold INTEGER DEFAULT 5,
    status          TEXT DEFAULT 'draft',
    in_stock        INTEGER DEFAULT 1,
    featured        INTEGER DEFAULT 0,
    seo_title       TEXT,
    seo_description TEXT,
    tags            TEXT DEFAULT '[]',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

function ensureColumn(table, col, type) {
  try { db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`);
        console.log(`[nawra-api] migrated: ${table}.${col} added`);
  } catch (e) { /* exists */ }
}
ensureColumn('orders',    'lat',       'REAL');
ensureColumn('orders',    'lng',       'REAL');
ensureColumn('orders',    'userEmail', 'TEXT');
ensureColumn('addresses', 'lat',       'REAL');
ensureColumn('addresses', 'lng',       'REAL');

console.log('[nawra-api] DB ready:', path.join(__dirname, 'orders.db'));

app.use(cors({ origin: '*' }));
// Lifted to 20mb so the admin Add-Product page can POST multiple base64 images
// in one request without 413s.
app.use(express.json({ limit: '20mb' }));

// ── Nodemailer transport (Gmail SMTP, App Password) ───────────────────────────
const gmailUser = process.env.GMAIL_USER;
const gmailPass = (process.env.GMAIL_PASS || '').replace(/\s+/g, ''); // strip spaces from app pw
const mailer = (gmailUser && gmailPass) ? nodemailer.createTransport({
  service: 'gmail',
  auth: { user: gmailUser, pass: gmailPass }
}) : null;

if (mailer) {
  mailer.verify().then(
    () => console.log('[nawra-api] ✓ Gmail SMTP ready, sender:', gmailUser),
    (err) => console.error('[nawra-api] ✗ Gmail SMTP verify failed:', err.message)
  );
} else {
  console.warn('[nawra-api] ! GMAIL_USER / GMAIL_PASS not set — email disabled');
}

function orderEmailHtml(order) {
  const items = (order.items || []).map(i => `
    <tr style="border-top:1px solid rgba(201,169,110,.12);">
      <td style="padding:12px 14px; color:#fff; font-size:13px;">${i.name || ''}</td>
      <td style="padding:12px 14px; color:rgba(255,255,255,.8); font-size:13px; text-align:center;">×${i.qty}</td>
      <td style="padding:12px 14px; color:#fff; font-size:13px; text-align:left;">${(i.price||0)*(i.qty||0)} جنيه</td>
    </tr>`).join('');

  const mapLink = (order.lat && order.lng)
    ? `<a href="https://www.google.com/maps?q=${order.lat},${order.lng}" style="color:#c9a96e; font-size:12px; text-decoration:none;">📍 موقع التوصيل على الخريطة</a>`
    : '';

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>تأكيد طلبك من نوّرَة</title>
</head>
<body style="margin:0; padding:0; background:#0d0d0d; font-family:'Segoe UI', Tahoma, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d; padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; background:#1a1a1a; color:#fff; border:1px solid rgba(201,169,110,.18);">

        <!-- Brand header -->
        <tr><td align="center" style="padding:36px 20px 28px; border-bottom:1px solid rgba(201,169,110,.18);">
          <div style="color:#c9a96e; font-size:42px; font-weight:400; letter-spacing:0.12em; font-family:'Times New Roman', serif;">نوّرَة</div>
          <div style="color:rgba(201,169,110,.6); font-size:11px; letter-spacing:0.3em; margin-top:6px;">SKINCARE&nbsp;&nbsp;E-SHOP</div>
        </td></tr>

        <!-- Success -->
        <tr><td align="center" style="padding:38px 20px 6px;">
          <div style="font-size:48px; line-height:1; margin-bottom:8px;">✅</div>
          <h2 style="margin:8px 0 0; color:#fff; font-size:22px; font-weight:500;">تم استلام طلبك بنجاح</h2>
          <p style="color:rgba(255,255,255,.6); margin:10px 0 0; font-size:14px;">شكراً لاختيارك نوّرَة 💕</p>
        </td></tr>

        <!-- Order # + date -->
        <tr><td style="padding:24px 28px 6px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(201,169,110,.18); padding-top:16px;">
            <tr>
              <td style="color:rgba(255,255,255,.5); font-size:12px;">رقم الطلب</td>
              <td style="color:#c9a96e; font-size:13px; text-align:left; font-family:monospace;">#${order.id}</td>
            </tr>
            <tr>
              <td style="color:rgba(255,255,255,.5); font-size:12px; padding-top:8px;">التاريخ</td>
              <td style="color:#fff; font-size:13px; text-align:left; padding-top:8px;">${order.date || ''}</td>
            </tr>
          </table>
        </td></tr>

        <!-- Items -->
        <tr><td style="padding:22px 28px 8px;">
          <h3 style="color:#c9a96e; font-size:12px; letter-spacing:0.22em; margin:0 0 12px; font-weight:600;">🛍️ المنتجات</h3>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,.03); border:1px solid rgba(201,169,110,.15);">
            <thead>
              <tr style="background:rgba(201,169,110,.1);">
                <th style="padding:10px 14px; text-align:right; color:#c9a96e; font-size:11px; font-weight:600;">المنتج</th>
                <th style="padding:10px 14px; text-align:center; color:#c9a96e; font-size:11px; font-weight:600;">الكمية</th>
                <th style="padding:10px 14px; text-align:left; color:#c9a96e; font-size:11px; font-weight:600;">السعر</th>
              </tr>
            </thead>
            <tbody>${items}</tbody>
            <tfoot>
              <tr style="background:rgba(201,169,110,.12); border-top:2px solid rgba(201,169,110,.3);">
                <td colspan="2" style="padding:14px; color:#c9a96e; font-size:14px; font-weight:600;">الإجمالي</td>
                <td style="padding:14px; color:#c9a96e; font-size:18px; font-weight:600; text-align:left;">${order.total || 0} جنيه</td>
              </tr>
            </tfoot>
          </table>
        </td></tr>

        <!-- Delivery address -->
        <tr><td style="padding:18px 28px 8px;">
          <h3 style="color:#c9a96e; font-size:12px; letter-spacing:0.22em; margin:0 0 12px; font-weight:600;">📍 عنوان التوصيل</h3>
          <div style="background:rgba(255,255,255,.03); border-right:3px solid #c9a96e; padding:14px 16px; color:#fff; font-size:13px; line-height:1.85;">
            <strong style="color:#c9a96e;">${order.name || ''}</strong><br/>
            ${order.address || ''}<br/>
            ${order.city || ''}<br/>
            📞 <span style="font-family:monospace; direction:ltr; display:inline-block;">${order.phone || ''}</span>
            ${mapLink ? '<br/>' + mapLink : ''}
          </div>
        </td></tr>

        <!-- Status callout -->
        <tr><td style="padding:18px 28px 8px;">
          <div style="background:rgba(201,169,110,.08); border:1px solid rgba(201,169,110,.3); padding:18px 20px; text-align:center; color:#c9a96e; font-size:14px; font-weight:500;">
            🔄 جاري التجهيز وسيتم التواصل معك قريباً
          </div>
        </td></tr>

        <!-- Thank you -->
        <tr><td align="center" style="padding:24px 28px 32px;">
          <p style="color:rgba(255,255,255,.65); font-size:14px; line-height:1.85; margin:0;">
            شكراً لثقتك في <span style="color:#c9a96e; font-weight:600;">نوّرَة</span><br/>
            نسعد بخدمتك دائماً ✨
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding:20px; background:#0d0d0d; color:rgba(255,255,255,.35); font-size:11px; letter-spacing:0.04em;">
          © 2025 NAWRA SKINCARE — نوّرَة للعناية بالبشرة<br/>
          <a href="https://nawra.ayoupstudio.tech" style="color:#c9a96e; text-decoration:none; margin-top:4px; display:inline-block;">nawra.ayoupstudio.tech</a>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendOrderEmail(order) {
  if (!mailer) return;
  if (!order.userEmail) {
    console.log('[nawra-api] no userEmail on order', order.id, '— skipping confirmation email');
    return;
  }
  try {
    const info = await mailer.sendMail({
      from: `"نوّرَة Skincare" <${gmailUser}>`,
      to:   order.userEmail,
      subject: `✅ تم استلام طلبك من نوّرَة #${order.id}`,
      html: orderEmailHtml(order)
    });
    console.log('[nawra-api] ✓ confirmation email sent to', order.userEmail, '|', info.messageId);
  } catch (err) {
    console.error('[nawra-api] ✗ email send failed for', order.userEmail, ':', err.message);
  }
}

app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now(), mailer: !!mailer }));

// ── ORDERS ────────────────────────────────────────────────────────────────────
const upsertUser = db.prepare(`
  INSERT INTO users (email, name, phone, firstOrder, lastOrder, totalOrders, totalSpent)
  VALUES (?, ?, ?, datetime('now'), datetime('now'), 1, ?)
  ON CONFLICT(email) DO UPDATE SET
    name        = excluded.name,
    phone       = COALESCE(excluded.phone, users.phone),
    lastOrder   = datetime('now'),
    totalOrders = users.totalOrders + 1,
    totalSpent  = users.totalSpent + excluded.totalSpent
`);

app.post('/api/orders', (req, res) => {
  try {
    const { id, date, name, phone, city, address, items, total, status, lat, lng, userEmail } = req.body;
    if (!id || !name) return res.status(400).json({ error: 'id and name required' });
    db.prepare(`
      INSERT OR REPLACE INTO orders (id,date,name,phone,city,address,items,total,status,lat,lng,userEmail)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(String(id), date, name, phone, city, address,
           JSON.stringify(items||[]), Number(total)||0, status||'\u062c\u062f\u064a\u062f',
           lat||null, lng||null, userEmail||null);

    if (userEmail) upsertUser.run(userEmail, name||null, phone||null, Number(total)||0);

    console.log('[nawra-api] order saved:', id, name, total, 'user:', userEmail||'guest');

    // Fire-and-forget: don't block the API response on SMTP latency
    sendOrderEmail({ id, date, name, phone, city, address, items, total, status, lat, lng, userEmail });

    res.json({ ok: true, id });
  } catch (e) { console.error('POST /api/orders error:', e); res.status(500).json({ error: e.message }); }
});

app.get('/api/orders', (req, res) => {
  try {
    const { userId } = req.query;
    const rows = userId
      ? db.prepare('SELECT * FROM orders WHERE userEmail = ? ORDER BY created_at DESC').all(userId)
      : db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    res.json(rows.map(r => ({ ...r, items: JSON.parse(r.items||'[]') })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/orders/:id', (req, res) => {
  try {
    const { status } = req.body;
    const info = db.prepare('UPDATE orders SET status=? WHERE id=?').run(status, req.params.id);
    if (!info.changes) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── USERS ─────────────────────────────────────────────────────────────────────
app.get('/api/users', (_req, res) => {
  try {
    const rows = db.prepare(`
      SELECT email, name, phone, firstOrder, lastOrder, totalOrders, totalSpent
      FROM users ORDER BY lastOrder DESC
    `).all();
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── ADDRESSES ─────────────────────────────────────────────────────────────────
app.get('/api/addresses/:userId', (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT * FROM addresses WHERE userId=? ORDER BY isDefault DESC, createdAt DESC'
    ).all(req.params.userId);
    res.json(rows.map(r => ({
      ...r, officeFri: !!r.officeFri, officeSat: !!r.officeSat, isDefault: !!r.isDefault
    })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/addresses', (req, res) => {
  try {
    const d = req.body;
    if (!d.id || !d.userId) return res.status(400).json({ error: 'id and userId required' });
    if (d.isDefault) db.prepare('UPDATE addresses SET isDefault=0 WHERE userId=?').run(d.userId);
    db.prepare(`
      INSERT OR REPLACE INTO addresses
        (id,userId,fullName,phone,street,building,city,district,governorate,landmark,
         type,officeFri,officeSat,lat,lng,isDefault,createdAt)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(d.id, d.userId, d.fullName, d.phone, d.street, d.building, d.city,
           d.district, d.governorate, d.landmark, d.type||'home',
           d.officeFri?1:0, d.officeSat?1:0, d.lat||null, d.lng||null,
           d.isDefault?1:0, d.createdAt||new Date().toISOString());
    res.json({ ok: true, id: d.id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/addresses/:id', (req, res) => {
  try {
    const d = req.body;
    if (d.isDefault) db.prepare('UPDATE addresses SET isDefault=0 WHERE userId=?').run(d.userId);
    const info = db.prepare(`
      UPDATE addresses SET
        fullName=?,phone=?,street=?,building=?,city=?,district=?,governorate=?,landmark=?,
        type=?,officeFri=?,officeSat=?,lat=?,lng=?,isDefault=?
      WHERE id=?
    `).run(d.fullName, d.phone, d.street, d.building, d.city, d.district,
           d.governorate, d.landmark, d.type||'home',
           d.officeFri?1:0, d.officeSat?1:0, d.lat||null, d.lng||null,
           d.isDefault?1:0, req.params.id);
    if (!info.changes) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/addresses/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM addresses WHERE id=?').run(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/addresses/:id/default', (req, res) => {
  try {
    const { userId } = req.body;
    db.prepare('UPDATE addresses SET isDefault=0 WHERE userId=?').run(userId);
    const info = db.prepare('UPDATE addresses SET isDefault=1 WHERE id=?').run(req.params.id);
    if (!info.changes) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── PRODUCTS ──────────────────────────────────────────────────────────────────
// Stored in SQLite. Images are accepted as either remote URLs or base64 data
// URLs and persisted as a JSON array string. Tags are also a JSON array.
function rowToProduct(r) {
  if (!r) return null;
  let images = []; let tags = [];
  try { images = JSON.parse(r.images || '[]'); } catch {}
  try { tags   = JSON.parse(r.tags   || '[]'); } catch {}
  return {
    ...r, images, tags,
    in_stock: !!r.in_stock,
    featured: !!r.featured,
  };
}

// Generate a sensible SKU when client doesn't supply one
function generateSku(name) {
  const base = String(name||'PROD').replace(/[^A-Za-z0-9]+/g,'').slice(0,4).toUpperCase() || 'PROD';
  return `${base}-${Date.now().toString(36).toUpperCase()}`;
}

app.get('/api/products', (req, res) => {
  try {
    const { status, category, q } = req.query;
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    if (status)   { sql += ' AND status = ?';   params.push(status); }
    if (category) { sql += ' AND category = ?'; params.push(category); }
    if (q)        { sql += ' AND (name LIKE ? OR brand LIKE ? OR sku LIKE ?)';
                    const like = `%${q}%`; params.push(like, like, like); }
    sql += ' ORDER BY created_at DESC';
    const rows = db.prepare(sql).all(...params);
    res.json(rows.map(rowToProduct));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'not found' });
    res.json(rowToProduct(row));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/products', (req, res) => {
  try {
    const p = req.body || {};
    if (!p.name) return res.status(400).json({ error: 'name required' });
    const id  = p.id  || `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`;
    const sku = p.sku || generateSku(p.name);
    db.prepare(`
      INSERT INTO products
        (id, sku, name, description, category, brand, ingredients, images,
         price, price_before, cost, stock, alert_threshold,
         status, in_stock, featured, seo_title, seo_description, tags,
         created_at, updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'),datetime('now'))
    `).run(
      id, sku, p.name, p.description||null, p.category||null, p.brand||null,
      p.ingredients||null, JSON.stringify(Array.isArray(p.images)?p.images:[]),
      Number(p.price)||0, Number(p.price_before)||0, Number(p.cost)||0,
      Number.isFinite(+p.stock)?+p.stock:0, Number.isFinite(+p.alert_threshold)?+p.alert_threshold:5,
      p.status === 'published' ? 'published' : 'draft',
      p.in_stock === false ? 0 : 1,
      p.featured ? 1 : 0,
      p.seo_title||null, p.seo_description||null,
      JSON.stringify(Array.isArray(p.tags)?p.tags:[])
    );
    console.log('[nawra-api] product created:', id, p.name, '(', p.status, ')');
    res.json({ ok: true, id, sku });
  } catch (e) { console.error('POST /api/products error:', e); res.status(500).json({ error: e.message }); }
});

app.patch('/api/products/:id', (req, res) => {
  try {
    const cur = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!cur) return res.status(404).json({ error: 'not found' });
    const p = req.body || {};
    // Whitelist of mutable fields → SQL column mapping
    const cols = ['name','description','category','brand','ingredients',
                  'price','price_before','cost','stock','alert_threshold',
                  'status','seo_title','seo_description','sku'];
    const sets = []; const vals = [];
    cols.forEach(c => {
      if (Object.prototype.hasOwnProperty.call(p, c)) {
        sets.push(`${c} = ?`);
        vals.push(p[c]);
      }
    });
    if (Object.prototype.hasOwnProperty.call(p, 'images')) { sets.push('images = ?'); vals.push(JSON.stringify(Array.isArray(p.images)?p.images:[])); }
    if (Object.prototype.hasOwnProperty.call(p, 'tags'))   { sets.push('tags = ?');   vals.push(JSON.stringify(Array.isArray(p.tags)?p.tags:[])); }
    if (Object.prototype.hasOwnProperty.call(p, 'in_stock')) { sets.push('in_stock = ?'); vals.push(p.in_stock ? 1 : 0); }
    if (Object.prototype.hasOwnProperty.call(p, 'featured')) { sets.push('featured = ?'); vals.push(p.featured ? 1 : 0); }
    if (!sets.length) return res.json({ ok: true, noop: true });
    sets.push("updated_at = datetime('now')");
    vals.push(req.params.id);
    db.prepare(`UPDATE products SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json(rowToProduct(row));
  } catch (e) { console.error('PATCH /api/products error:', e); res.status(500).json({ error: e.message }); }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    if (!info.changes) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── COUPONS ───────────────────────────────────────────────────────────────────
// types: 'percent' (discount = %), 'fixed' (discount = EGP), 'free_shipping'
function rowToCoupon(r) {
  if (!r) return null;
  return { ...r, active: !!r.active };
}
function couponStatus(c) {
  const now = new Date();
  if (!c.active) return 'منتهي';
  if (c.end_date && new Date(c.end_date) < now) return 'منتهي';
  if (c.max_uses && c.uses >= c.max_uses) return 'منتهي';
  if (c.start_date && new Date(c.start_date) > now) return 'مجدول';
  return 'نشط';
}

app.get('/api/coupons', (_req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM coupons ORDER BY created_at DESC').all().map(rowToCoupon);
    res.json(rows.map(c => ({ ...c, status: couponStatus(c) })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/coupons', (req, res) => {
  try {
    const c = req.body || {};
    if (!c.code) return res.status(400).json({ error: 'code required' });
    const code = String(c.code).trim().toUpperCase();
    if (!['percent','fixed','free_shipping'].includes(c.type))
      return res.status(400).json({ error: 'invalid type' });
    const id = c.id || `cp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
    try {
      db.prepare(`
        INSERT INTO coupons
          (id, code, type, discount, min_order, max_discount,
           start_date, end_date, max_uses, uses, active)
        VALUES (?,?,?,?,?,?,?,?,?,0,1)
      `).run(id, code, c.type,
             Number(c.discount)||0, Number(c.min_order)||0, Number(c.max_discount)||0,
             c.start_date||null, c.end_date||null,
             Number(c.max_uses)||0);
    } catch (e) {
      if (String(e.message).includes('UNIQUE')) return res.status(409).json({ error: 'code already exists' });
      throw e;
    }
    const saved = rowToCoupon(db.prepare('SELECT * FROM coupons WHERE id=?').get(id));
    res.json({ ok: true, ...saved, status: couponStatus(saved) });
  } catch (e) { console.error('POST /api/coupons error:', e); res.status(500).json({ error: e.message }); }
});

app.delete('/api/coupons/:id', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM coupons WHERE id=?').run(req.params.id);
    if (!info.changes) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Validate a coupon against an order total (used by checkout)
app.post('/api/coupons/validate', (req, res) => {
  try {
    const { code, total } = req.body || {};
    if (!code) return res.status(400).json({ valid:false, error: 'code required' });
    const c = db.prepare('SELECT * FROM coupons WHERE code=?').get(String(code).trim().toUpperCase());
    if (!c) return res.json({ valid:false, error: 'كود غير صحيح' });
    const cp = rowToCoupon(c);
    const st = couponStatus(cp);
    if (st !== 'نشط') return res.json({ valid:false, error:`الكود ${st}` });
    const orderTotal = Number(total)||0;
    if (cp.min_order && orderTotal < cp.min_order)
      return res.json({ valid:false, error:`الحد الأدنى ${cp.min_order} ج` });
    let discount = 0, free_shipping = false;
    if (cp.type === 'percent') {
      discount = orderTotal * (cp.discount/100);
      if (cp.max_discount && discount > cp.max_discount) discount = cp.max_discount;
    } else if (cp.type === 'fixed') {
      discount = cp.discount;
    } else if (cp.type === 'free_shipping') {
      free_shipping = true;
    }
    res.json({ valid:true, code: cp.code, type: cp.type, discount: Math.round(discount), free_shipping });
  } catch (e) { res.status(500).json({ valid:false, error: e.message }); }
});

// ── RETURNS ───────────────────────────────────────────────────────────────────
// statuses: pending | approved | rejected | refunded
app.get('/api/returns', (req, res) => {
  try {
    const { status } = req.query;
    const rows = status
      ? db.prepare('SELECT * FROM returns WHERE status=? ORDER BY created_at DESC').all(status)
      : db.prepare('SELECT * FROM returns ORDER BY created_at DESC').all();
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/returns', (req, res) => {
  try {
    const r = req.body || {};
    if (!r.order_id || !r.customer) return res.status(400).json({ error: 'order_id and customer required' });
    const id = r.id || `rt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
    db.prepare(`
      INSERT INTO returns (id, order_id, customer, customer_email, product, reason, amount, status, admin_note)
      VALUES (?,?,?,?,?,?,?,?,?)
    `).run(id, r.order_id, r.customer, r.customer_email||null, r.product||null,
           r.reason||null, Number(r.amount)||0, r.status||'pending', r.admin_note||null);
    res.json({ ok: true, id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/returns/:id', (req, res) => {
  try {
    const r = req.body || {};
    const sets = []; const vals = [];
    ['status','admin_note','amount','reason'].forEach(k => {
      if (Object.prototype.hasOwnProperty.call(r, k)) { sets.push(`${k} = ?`); vals.push(r[k]); }
    });
    if (!sets.length) return res.json({ ok: true, noop: true });
    sets.push("updated_at = datetime('now')");
    vals.push(req.params.id);
    const info = db.prepare(`UPDATE returns SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    if (!info.changes) return res.status(404).json({ error: 'not found' });
    res.json(db.prepare('SELECT * FROM returns WHERE id=?').get(req.params.id));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── SETTINGS (key/value JSON blobs) ───────────────────────────────────────────
// keys we use: 'shipping', 'payment', 'seo'
// ── CATEGORIES ────────────────────────────────────────────────────────────────
app.get('/api/categories', (_req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM categories ORDER BY created_at ASC').all();
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/categories', (req, res) => {
  try {
    const name = (req.body && req.body.name || '').trim();
    if (!name) return res.status(400).json({ error: 'name required' });
    const exists = db.prepare('SELECT * FROM categories WHERE name = ?').get(name);
    if (exists) return res.json(exists); // idempotent
    const id = `cat_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
    db.prepare('INSERT INTO categories (id, name) VALUES (?, ?)').run(id, name);
    res.json({ id, name });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/categories/:id', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    if (!info.changes) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Unified settings endpoints — return / update all keys at once.
app.get('/api/settings', (_req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const out = {};
    rows.forEach(r => {
      try { out[r.key] = JSON.parse(r.value); }
      catch { out[r.key] = r.value; }
    });
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
// Accept either `{ key, value }` or a multi-key object `{ shipping:{...}, seo:{...} }`.
app.post('/api/settings', (req, res) => {
  try {
    const body = req.body || {};
    const upsert = db.prepare(`
      INSERT INTO settings (key, value, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
    `);
    if (body.key) {
      const json = typeof body.value === 'string' ? body.value : JSON.stringify(body.value);
      upsert.run(body.key, json);
    } else {
      Object.keys(body).forEach(k => {
        const v = body[k];
        const json = typeof v === 'string' ? v : JSON.stringify(v);
        upsert.run(k, json);
      });
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/settings/:key', (req, res) => {
  try {
    const row = db.prepare('SELECT value FROM settings WHERE key=?').get(req.params.key);
    if (!row) return res.json({ value: null });
    try { res.json({ value: JSON.parse(row.value) }); }
    catch { res.json({ value: row.value }); }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/settings/:key', (req, res) => {
  try {
    const v = req.body && Object.prototype.hasOwnProperty.call(req.body, 'value') ? req.body.value : req.body;
    const json = typeof v === 'string' ? v : JSON.stringify(v);
    db.prepare(`
      INSERT INTO settings (key, value, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
    `).run(req.params.key, json);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── AUTH (super-admin only at the moment) ─────────────────────────────────────
function loadAdminCreds() {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_credentials');
  if (!row) return null;
  try { return JSON.parse(row.value); } catch { return null; }
}
function saveAdminCreds(creds) {
  db.prepare(`
    INSERT INTO settings (key, value, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
  `).run('admin_credentials', JSON.stringify(creds));
}

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    const creds = loadAdminCreds();
    if (!creds) return res.status(500).json({ error: 'admin not configured' });
    if (String(email||'').trim().toLowerCase() !== creds.email.toLowerCase())
      return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
    if (!verifyPassword(password, creds.salt, creds.hash))
      return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
    res.json({ ok: true, email: creds.email, role: creds.role || 'super_admin', name: 'Super Admin' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/change-password', (req, res) => {
  try {
    const { current_password, new_password } = req.body || {};
    if (!new_password || String(new_password).length < 8)
      return res.status(400).json({ error: 'كلمة المرور الجديدة لازم تكون 8 أحرف على الأقل' });
    const creds = loadAdminCreds();
    if (!creds) return res.status(500).json({ error: 'admin not configured' });
    if (!verifyPassword(current_password, creds.salt, creds.hash))
      return res.status(401).json({ error: 'كلمة المرور الحالية غير صحيحة' });
    const { salt, hash } = hashPassword(new_password);
    saveAdminCreds({ ...creds, salt, hash, updated_at: new Date().toISOString() });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── APPROVALS ─────────────────────────────────────────────────────────────────
// type values currently used by the UI:
//   'product_delete' | 'product_add' | 'stock_reduce'
app.get('/api/approvals', (req, res) => {
  try {
    const { status, type } = req.query;
    let sql = 'SELECT * FROM approvals WHERE 1=1';
    const params = [];
    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (type)   { sql += ' AND type   = ?'; params.push(type);   }
    sql += ' ORDER BY created_at DESC LIMIT 100';
    const rows = db.prepare(sql).all(...params).map(r => {
      try { r.payload = JSON.parse(r.payload || '{}'); } catch { r.payload = {}; }
      return r;
    });
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/approvals', (req, res) => {
  try {
    const a = req.body || {};
    if (!a.type) return res.status(400).json({ error: 'type required' });
    const id = a.id || `ap_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
    db.prepare(`
      INSERT INTO approvals (id, type, target_id, target_label, requester, payload, reason, status)
      VALUES (?,?,?,?,?,?,?, 'pending')
    `).run(id, a.type, a.target_id || null, a.target_label || null, a.requester || null,
           JSON.stringify(a.payload || {}), a.reason || null);
    res.json({ ok: true, id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/approvals/:id', (req, res) => {
  try {
    const { status, resolution_note } = req.body || {};
    if (!['approved','rejected'].includes(status))
      return res.status(400).json({ error: 'status must be approved or rejected' });
    const cur = db.prepare('SELECT * FROM approvals WHERE id = ?').get(req.params.id);
    if (!cur) return res.status(404).json({ error: 'not found' });
    if (cur.status !== 'pending') return res.status(409).json({ error: 'already resolved' });

    // When a product-delete request is approved, actually delete the product.
    if (status === 'approved' && cur.type === 'product_delete' && cur.target_id) {
      try { db.prepare('DELETE FROM products WHERE id = ?').run(cur.target_id); } catch {}
    }

    db.prepare(`
      UPDATE approvals SET status = ?, resolution_note = ?, resolved_at = datetime('now')
      WHERE id = ?
    `).run(status, resolution_note || null, req.params.id);
    const fresh = db.prepare('SELECT * FROM approvals WHERE id = ?').get(req.params.id);
    try { fresh.payload = JSON.parse(fresh.payload || '{}'); } catch { fresh.payload = {}; }
    res.json(fresh);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── STOCK CHANGES (audit log) ─────────────────────────────────────────────────
app.post('/api/stock-changes', (req, res) => {
  try {
    const r = req.body || {};
    if (!r.product_id) return res.status(400).json({ error: 'product_id required' });
    const id = `sc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
    db.prepare(`
      INSERT INTO stock_changes (id, product_id, product_name, old_qty, new_qty, reason, actor)
      VALUES (?,?,?,?,?,?,?)
    `).run(id, r.product_id, r.product_name||null,
           Number.isFinite(+r.old_qty)?+r.old_qty:null,
           Number.isFinite(+r.new_qty)?+r.new_qty:null,
           r.reason||null, r.actor||null);
    res.json({ ok: true, id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get('/api/stock-changes', (_req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM stock_changes ORDER BY created_at DESC LIMIT 100').all();
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, '127.0.0.1', () =>
  console.log(`[nawra-api] listening on http://127.0.0.1:${PORT}`)
);
