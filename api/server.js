'use strict';
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const Database   = require('better-sqlite3');
const path       = require('path');
const nodemailer = require('nodemailer');

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
app.use(express.json({ limit: '1mb' }));

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
  <title>تأكيد طلبك من نوّرة</title>
</head>
<body style="margin:0; padding:0; background:#0d0d0d; font-family:'Segoe UI', Tahoma, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d; padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; background:#1a1a1a; color:#fff; border:1px solid rgba(201,169,110,.18);">

        <!-- Brand header -->
        <tr><td align="center" style="padding:36px 20px 28px; border-bottom:1px solid rgba(201,169,110,.18);">
          <div style="color:#c9a96e; font-size:42px; font-weight:400; letter-spacing:0.12em; font-family:'Times New Roman', serif;">نوّرة</div>
          <div style="color:rgba(201,169,110,.6); font-size:11px; letter-spacing:0.3em; margin-top:6px;">SKINCARE&nbsp;&nbsp;E-SHOP</div>
        </td></tr>

        <!-- Success -->
        <tr><td align="center" style="padding:38px 20px 6px;">
          <div style="font-size:48px; line-height:1; margin-bottom:8px;">✅</div>
          <h2 style="margin:8px 0 0; color:#fff; font-size:22px; font-weight:500;">تم استلام طلبك بنجاح</h2>
          <p style="color:rgba(255,255,255,.6); margin:10px 0 0; font-size:14px;">شكراً لاختيارك نوّرة 💕</p>
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
            شكراً لثقتك في <span style="color:#c9a96e; font-weight:600;">نوّرة</span><br/>
            نسعد بخدمتك دائماً ✨
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding:20px; background:#0d0d0d; color:rgba(255,255,255,.35); font-size:11px; letter-spacing:0.04em;">
          © 2025 NAWRA SKINCARE — نوّرة للعناية بالبشرة<br/>
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
      from: `"نوّرة Skincare" <${gmailUser}>`,
      to:   order.userEmail,
      subject: `✅ تم استلام طلبك من نوّرة #${order.id}`,
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

app.listen(PORT, '127.0.0.1', () =>
  console.log(`[nawra-api] listening on http://127.0.0.1:${PORT}`)
);
