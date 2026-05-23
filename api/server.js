'use strict';
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const Database   = require('better-sqlite3');
const path       = require('path');
const fs         = require('fs');
const nodemailer = require('nodemailer');
const crypto     = require('crypto');
// Optional deps — present after `npm install multer sharp` in api/. We require
// them lazily so the server still boots if a deploy skipped the install step.
let multer = null;  try { multer = require('multer'); } catch { console.warn('[nawra-api] ! multer not installed — image upload endpoint disabled until `npm i multer` runs in api/'); }
let sharp  = null;  try { sharp  = require('sharp');  } catch { console.warn('[nawra-api] ! sharp not installed — image conversion endpoint disabled until `npm i sharp` runs in api/'); }
let cron   = null;  try { cron   = require('node-cron'); } catch { console.warn('[nawra-api] ! node-cron not installed — nightly customer-recategorize disabled until `npm i node-cron` runs in api/'); }

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
  CREATE TABLE IF NOT EXISTS stock_movements (
    id                       TEXT PRIMARY KEY,
    product_id               TEXT NOT NULL,
    product_name             TEXT,
    type                     TEXT NOT NULL,
    quantity_delta           INTEGER NOT NULL DEFAULT 0,
    balance_after_available  INTEGER,
    balance_after_reserved   INTEGER,
    balance_after_damaged    INTEGER,
    reason                   TEXT,
    reference                TEXT,
    unit_cost                REAL DEFAULT 0,
    user_id                  TEXT,
    user_name                TEXT,
    created_at               DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id            TEXT PRIMARY KEY,
    from_user_id  TEXT,
    from_user_name TEXT,
    to_user_id    TEXT NOT NULL,
    type          TEXT NOT NULL,         -- request | approval | rejection | info
    subject       TEXT,
    body          TEXT,
    metadata      TEXT DEFAULT '{}',
    read_at       DATETIME,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id          TEXT PRIMARY KEY,
    category    TEXT NOT NULL,
    description TEXT,
    quantity    REAL DEFAULT 1,
    unit_price  REAL DEFAULT 0,
    amount      REAL DEFAULT 0,
    date        TEXT,
    notes       TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
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
ensureColumn('orders',    'stock_applied', 'INTEGER DEFAULT 0'); // 1 once available→reserved ran
ensureColumn('orders',    'stock_released', 'INTEGER DEFAULT 0'); // 1 once reserved→0 ran
ensureColumn('orders',    'order_number',       'INTEGER');                  // sequential short id, e.g. 1001
ensureColumn('orders',    'payment_method',     "TEXT DEFAULT 'cash'");      // cash | visa | wallet
ensureColumn('orders',    'payment_status',     "TEXT DEFAULT 'unpaid'");    // paid | unpaid
ensureColumn('orders',    'payment_reference',  'TEXT');                     // transaction id for online payments
ensureColumn('orders',    'customer_notes',     'TEXT');                     // optional note from checkout
ensureColumn('orders',    'cancellation_reason','TEXT');                     // required when admin cancels
ensureColumn('orders',    'status_history',     "TEXT DEFAULT '[]'");        // JSON [{status, at, by_id, by_name, note}]
ensureColumn('orders',    'subtotal',           'REAL');                     // before shipping/discount
ensureColumn('orders',    'shipping_cost',      'REAL');                     // shipping fee charged
ensureColumn('orders',    'discount_amount',    'REAL');                     // coupon savings
ensureColumn('orders',    'coupon_code',        'TEXT');                     // applied coupon, if any

// Backfill order_number for any legacy orders missing one (one-shot, sequential
// over created_at). Safe to run on every boot — only touches rows with NULL.
(() => {
  try {
    const max = db.prepare('SELECT COALESCE(MAX(order_number), 1000) AS m FROM orders').get().m || 1000;
    const missing = db.prepare('SELECT id FROM orders WHERE order_number IS NULL ORDER BY created_at ASC').all();
    if (!missing.length) return;
    let n = max;
    const upd = db.prepare('UPDATE orders SET order_number = ? WHERE id = ?');
    db.transaction(() => { missing.forEach(r => { n += 1; upd.run(n, r.id); }); })();
    console.log(`[nawra-api] backfilled order_number for ${missing.length} legacy orders (now up to #${n})`);
  } catch (e) { console.warn('[nawra-api] order_number backfill skipped:', e.message); }
})();
ensureColumn('addresses', 'lat',       'REAL');
ensureColumn('addresses', 'lng',       'REAL');
ensureColumn('products',  'stock_reserved', 'INTEGER DEFAULT 0');
ensureColumn('products',  'stock_damaged',  'INTEGER DEFAULT 0');
ensureColumn('returns',   'inspection_status', "TEXT DEFAULT 'pending'"); // pending | good | damaged
ensureColumn('returns',   'inspected_at',      'DATETIME');
ensureColumn('returns',   'stock_settled',     'INTEGER DEFAULT 0'); // 1 once available/damaged was updated
ensureColumn('approvals', 'requester_id',  'TEXT');  // email of the requester
ensureColumn('approvals', 'requester_name','TEXT');

// ── Product migrations (bilingual + slug + size + variants + best-seller) ────
// Each *_i18n column stores { ar: '...', en: '...' } as JSON. The legacy
// single-language columns (name, description, ingredients, seo_title,
// seo_description) are kept in sync with the AR side for back-compat with
// older queries / the storefront fallback.
ensureColumn('products', 'name_i18n',            "TEXT DEFAULT '{}'");
ensureColumn('products', 'description_i18n',     "TEXT DEFAULT '{}'");
ensureColumn('products', 'ingredients_i18n',     "TEXT DEFAULT '{}'");
ensureColumn('products', 'usage_text',           'TEXT');                  // raw AR fallback
ensureColumn('products', 'usage_i18n',           "TEXT DEFAULT '{}'");
ensureColumn('products', 'seo_title_i18n',       "TEXT DEFAULT '{}'");
ensureColumn('products', 'seo_description_i18n', "TEXT DEFAULT '{}'");
ensureColumn('products', 'slug',                 'TEXT');                  // unique below
ensureColumn('products', 'size',                 'TEXT');                  // e.g. "30ml", "100g"
ensureColumn('products', 'publish_at',           'DATETIME');              // optional scheduled publish
ensureColumn('products', 'is_best_seller',       'INTEGER DEFAULT 0');
ensureColumn('products', 'has_variants',         'INTEGER DEFAULT 0');
ensureColumn('products', 'archived',             'INTEGER DEFAULT 0');

// Variant rows — one product can have many (size variants etc.). When
// has_variants = 1 the storefront should display from these instead of the
// product's top-level price / stock fields.
db.exec(`
  CREATE TABLE IF NOT EXISTS product_variants (
    id           TEXT PRIMARY KEY,
    product_id   TEXT NOT NULL,
    size         TEXT,
    price        REAL DEFAULT 0,
    price_before REAL DEFAULT 0,
    stock        INTEGER DEFAULT 0,
    sku          TEXT,
    sort_order   INTEGER DEFAULT 0,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
try { db.exec('CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id)'); } catch {}

// ── Customer (users) CRM additions ─────────────────────────────────────────
// Cached/derived fields live on the row so the customers list query stays a
// single, fast SELECT — no per-row joins. They're refreshed:
//   1. live, whenever an order is placed/cancelled (cheap incremental update)
//   2. nightly via the node-cron job below (full recompute for date drift —
//      especially the "inactive after 90 days" rule)
ensureColumn('users', 'category',              "TEXT DEFAULT 'new'");
ensureColumn('users', 'manual_vip_override',   'INTEGER DEFAULT 0');
ensureColumn('users', 'blocked',               'INTEGER DEFAULT 0');
ensureColumn('users', 'registered_at',         'DATETIME');
ensureColumn('users', 'last_login_date',       'DATETIME');
ensureColumn('users', 'preferred_lang',        "TEXT DEFAULT 'ar'");
ensureColumn('users', 'marketing_emails_enabled',     'INTEGER DEFAULT 1');
ensureColumn('users', 'whatsapp_notifications_enabled','INTEGER DEFAULT 1');
ensureColumn('users', 'date_of_birth',         'TEXT');
ensureColumn('users', 'gender',                'TEXT');

db.exec(`
  CREATE TABLE IF NOT EXISTS customer_notes (
    id            TEXT PRIMARY KEY,
    customer_email TEXT NOT NULL,
    author_id     TEXT,
    author_name   TEXT,
    note          TEXT,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
try { db.exec('CREATE INDEX IF NOT EXISTS idx_notes_customer ON customer_notes(customer_email)'); } catch {}

db.exec(`
  CREATE TABLE IF NOT EXISTS customer_activity_log (
    id            TEXT PRIMARY KEY,
    customer_email TEXT NOT NULL,
    event_type    TEXT NOT NULL,            -- registered | order_placed | order_cancelled | return | email_sent | coupon_created | note_added | login | blocked | unblocked | vip_set | vip_cleared
    event_data    TEXT DEFAULT '{}',        -- JSON blob
    actor_id      TEXT,
    actor_name    TEXT,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
try { db.exec('CREATE INDEX IF NOT EXISTS idx_activity_customer ON customer_activity_log(customer_email, created_at)'); } catch {}

// ── Expenses: CRM-grade columns + supporting tables ─────────────────────────
// All additive. Existing rows get sensible defaults so the old GET shape stays
// compatible with the legacy frontend until the new UI ships.
ensureColumn('expenses', 'type',             "TEXT DEFAULT 'variable'");        // fixed | variable
ensureColumn('expenses', 'supplier_id',      'TEXT');                            // FK → suppliers.id (nullable)
ensureColumn('expenses', 'payment_method',   "TEXT DEFAULT 'cash'");            // cash | transfer | card | wallet
ensureColumn('expenses', 'receipt_path',     'TEXT');                            // /uploads/receipts/...
ensureColumn('expenses', 'is_recurring',     'INTEGER DEFAULT 0');               // 1 → suggested next month
ensureColumn('expenses', 'status',           "TEXT DEFAULT 'approved'");        // approved | pending | rejected
ensureColumn('expenses', 'approved_by',      'TEXT');                            // admin email/id
ensureColumn('expenses', 'approved_at',      'DATETIME');
ensureColumn('expenses', 'rejection_reason', 'TEXT');
ensureColumn('expenses', 'created_by',       'TEXT');                            // admin email/id who added the row
ensureColumn('expenses', 'category_id',      'TEXT');                            // optional FK → expense_categories.id
ensureColumn('expenses', 'source_ref',       'TEXT');                            // e.g. "return:<id>" when auto-generated

db.exec(`
  CREATE TABLE IF NOT EXISTS expense_categories (
    id          TEXT PRIMARY KEY,
    key         TEXT UNIQUE NOT NULL,         -- short slug used as legacy expenses.category value
    name_ar     TEXT NOT NULL,
    name_en     TEXT,
    color       TEXT DEFAULT '#6B7280',
    icon        TEXT,                          -- optional emoji or icon name
    is_default  INTEGER DEFAULT 0,             -- 1 → seeded default, can be renamed but not deleted
    active      INTEGER DEFAULT 1,
    sort_order  INTEGER DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS suppliers (
    id         TEXT PRIMARY KEY,
    name       TEXT UNIQUE NOT NULL,
    phone      TEXT,
    email      TEXT,
    notes      TEXT,
    active     INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS category_budgets (
    category_id    TEXT PRIMARY KEY,
    monthly_budget REAL DEFAULT 0,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Seed default categories (idempotent). The keys here match the legacy
// EXPENSE_CATEGORIES enum used by the old expenses.category column, plus the
// new ones the spec requires. Default rows have is_default=1 so the admin UI
// can block hard-delete (rename + hide-only allowed).
(() => {
  const seeds = [
    { key: 'salaries',  name_ar: 'رواتب',           name_en: 'Salaries',         color: '#534AB7', icon: '👥', sort_order: 1 },
    { key: 'marketing', name_ar: 'تسويق',           name_en: 'Marketing',        color: '#3B82F6', icon: '📣', sort_order: 2 },
    { key: 'packing',   name_ar: 'تغليف ومواد',     name_en: 'Packing',          color: '#16A34A', icon: '📦', sort_order: 3 },
    { key: 'shipping',  name_ar: 'شحن',              name_en: 'Shipping',         color: '#F97316', icon: '🚚', sort_order: 4 },
    { key: 'overhead',  name_ar: 'تشغيلي',           name_en: 'Operating',        color: '#EC4899', icon: '⚙', sort_order: 5 },
    { key: 'general',   name_ar: 'عام',              name_en: 'General',          color: '#6B7280', icon: '🧾', sort_order: 6 },
    { key: 'purchases', name_ar: 'مشتريات منتجات',   name_en: 'Product purchases', color: '#0EA5E9', icon: '🛒', sort_order: 7 },
    { key: 'banking',   name_ar: 'مصاريف بنكية',     name_en: 'Banking fees',     color: '#9333EA', icon: '🏦', sort_order: 8 },
    { key: 'taxes',     name_ar: 'ضرائب',            name_en: 'Taxes',            color: '#DC2626', icon: '🧾', sort_order: 9 },
    { key: 'returns',   name_ar: 'مرتجعات',          name_en: 'Returns',          color: '#B45309', icon: '↩',  sort_order: 10 },
  ];
  const ins = db.prepare(`
    INSERT INTO expense_categories (id, key, name_ar, name_en, color, icon, is_default, active, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?)
    ON CONFLICT(key) DO NOTHING
  `);
  seeds.forEach((s, i) => ins.run(`ec_def_${s.key}`, s.key, s.name_ar, s.name_en, s.color, s.icon, s.sort_order || i));
  // Backfill expenses.category_id from category.key for legacy rows
  try {
    const rows = db.prepare("SELECT id, category FROM expenses WHERE category_id IS NULL AND category IS NOT NULL").all();
    if (rows.length) {
      const lookup = new Map(db.prepare('SELECT id, key FROM expense_categories').all().map(r => [r.key, r.id]));
      const upd = db.prepare('UPDATE expenses SET category_id = ? WHERE id = ?');
      db.transaction(() => { rows.forEach(r => { const cid = lookup.get(r.category); if (cid) upd.run(cid, r.id); }); })();
    }
  } catch (err) { console.warn('[nawra-api] expense category_id backfill skipped:', err.message); }
})();

// Slug uniqueness — best-effort. We add a partial unique index that excludes
// NULLs so legacy rows without a slug don't all collide on NULL.
try { db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products(slug) WHERE slug IS NOT NULL'); } catch {}

// Backfill: assign a slug to any product that hasn't got one yet (derived
// from name, with a short suffix when collisions exist). Runs once per boot.
(() => {
  try {
    const rows = db.prepare('SELECT id, name, slug FROM products WHERE slug IS NULL OR slug = \'\'').all();
    if (!rows.length) return;
    const used = new Set(db.prepare('SELECT slug FROM products WHERE slug IS NOT NULL AND slug <> \'\'').all().map(r => r.slug));
    const upd = db.prepare('UPDATE products SET slug = ? WHERE id = ?');
    db.transaction(() => {
      rows.forEach(r => {
        let base = slugify(r.name || 'product') || 'product';
        let s = base, n = 2;
        while (used.has(s)) { s = `${base}-${n++}`; }
        used.add(s); upd.run(s, r.id);
      });
    })();
    console.log(`[nawra-api] backfilled slug for ${rows.length} products`);
  } catch (e) { console.warn('[nawra-api] slug backfill skipped:', e.message); }
})();

// URL-safe slug — keeps Arabic letters (browsers handle them in URLs), drops
// punctuation, collapses whitespace to dashes.
function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[‏‎]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

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
              <td style="color:#c9a96e; font-size:13px; text-align:left; font-family:monospace;">#${order.order_number || order.id}</td>
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
      subject: `✅ تم استلام طلبك من نوّرَة #${order.order_number || order.id}`,
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

// \u2500\u2500 Stock lifecycle helpers \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// Items are stored on orders as JSON arrays of { id?, name, qty, price }.
// Matching to a product row is done by id when present, otherwise by name.
function findProductForItem(item) {
  if (item && item.id != null) {
    const byId = db.prepare('SELECT * FROM products WHERE id = ?').get(String(item.id));
    if (byId) return byId;
  }
  if (item && item.name) {
    return db.prepare('SELECT * FROM products WHERE name = ?').get(item.name);
  }
  return null;
}
const SUPER_ADMIN_FALLBACK = 'nawraskincare@gmail.com';

// Append a single movement row. The caller passes the *post-event* balances so
// the history is fully self-describing without needing to replay earlier rows.
// All stock mutations on the products table also go through here.
function recordMovement({
  product_id, product_name, type, quantity_delta,
  balance_after_available, balance_after_reserved, balance_after_damaged,
  reason, reference, unit_cost, user_id, user_name
}) {
  const id = `mv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
  db.prepare(`
    INSERT INTO stock_movements
      (id, product_id, product_name, type, quantity_delta,
       balance_after_available, balance_after_reserved, balance_after_damaged,
       reason, reference, unit_cost, user_id, user_name)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    id, String(product_id), product_name || null, type, Number(quantity_delta) || 0,
    balance_after_available ?? null, balance_after_reserved ?? null, balance_after_damaged ?? null,
    reason || null, reference || null, Number(unit_cost) || 0,
    user_id || null, user_name || null
  );
  return id;
}

// Reserve stock when an order is placed: available -=, reserved +=.
// Idempotent via orders.stock_applied flag.
function reserveStockForOrder(order, items) {
  if (!order || order.stock_applied) return;
  (items || []).forEach(it => {
    const qty = Number(it.qty) || 0;
    if (!qty) return;
    const p = findProductForItem(it);
    if (!p) return;
    const newAvail = Math.max(0, (p.stock || 0) - qty);
    const newRes   = (p.stock_reserved || 0) + qty;
    db.prepare('UPDATE products SET stock = ?, stock_reserved = ? WHERE id = ?').run(newAvail, newRes, p.id);
    recordMovement({
      product_id: p.id, product_name: p.name,
      type: 'customer_order', quantity_delta: -qty,
      balance_after_available: newAvail,
      balance_after_reserved:  newRes,
      balance_after_damaged:   p.stock_damaged || 0,
      reason: '\u062d\u062c\u0632 \u0644\u0637\u0644\u0628 \u0639\u0645\u064a\u0644', reference: String(order.id),
      user_id: order.userEmail || null, user_name: order.name || null,
    });
  });
  db.prepare('UPDATE orders SET stock_applied = 1 WHERE id = ?').run(String(order.id));
}

// Release reserved stock once the order ships out (the goods physically left).
// Available is NOT changed \u2014 reservation just unwinds because the units are gone.
function shipStockForOrder(order, items) {
  if (!order || order.stock_released) return;
  (items || []).forEach(it => {
    const qty = Number(it.qty) || 0;
    if (!qty) return;
    const p = findProductForItem(it);
    if (!p) return;
    const newRes = Math.max(0, (p.stock_reserved || 0) - qty);
    db.prepare('UPDATE products SET stock_reserved = ? WHERE id = ?').run(newRes, p.id);
    recordMovement({
      product_id: p.id, product_name: p.name,
      type: 'shipped', quantity_delta: 0,
      balance_after_available: p.stock || 0,
      balance_after_reserved:  newRes,
      balance_after_damaged:   p.stock_damaged || 0,
      reason: '\u062a\u0645 \u0627\u0644\u0634\u062d\u0646', reference: String(order.id),
    });
  });
  db.prepare('UPDATE orders SET stock_released = 1 WHERE id = ?').run(String(order.id));
}

// Cancellation while still reserved: put units back to available.
function cancelStockForOrder(order, items) {
  if (!order || !order.stock_applied || order.stock_released) return;
  (items || []).forEach(it => {
    const qty = Number(it.qty) || 0;
    if (!qty) return;
    const p = findProductForItem(it);
    if (!p) return;
    const newAvail = (p.stock || 0) + qty;
    const newRes   = Math.max(0, (p.stock_reserved || 0) - qty);
    db.prepare('UPDATE products SET stock = ?, stock_reserved = ? WHERE id = ?').run(newAvail, newRes, p.id);
    recordMovement({
      product_id: p.id, product_name: p.name,
      type: 'order_cancelled', quantity_delta: +qty,
      balance_after_available: newAvail,
      balance_after_reserved:  newRes,
      balance_after_damaged:   p.stock_damaged || 0,
      reason: '\u0625\u0644\u063a\u0627\u0621 \u0637\u0644\u0628', reference: String(order.id),
    });
  });
  db.prepare('UPDATE orders SET stock_released = 1 WHERE id = ?').run(String(order.id));
}

// \u2500\u2500 Messages helper \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function sendMessage({ from_user_id, from_user_name, to_user_id, type, subject, body, metadata }) {
  if (!to_user_id) return null;
  const id = `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
  db.prepare(`
    INSERT INTO messages (id, from_user_id, from_user_name, to_user_id, type, subject, body, metadata)
    VALUES (?,?,?,?,?,?,?,?)
  `).run(id, from_user_id || null, from_user_name || null, to_user_id, type, subject || null,
         body || null, JSON.stringify(metadata || {}));
  return id;
}

// Allocate the next sequential public order number. Starts at 1001 so the first
// order looks like a real shop's. Wrapped in a tiny txn to avoid two
// simultaneous POSTs picking the same number.
const allocateOrderNumber = db.transaction(() => {
  const row = db.prepare('SELECT COALESCE(MAX(order_number), 1000) AS m FROM orders').get();
  return (row.m || 1000) + 1;
});

app.post('/api/orders', (req, res) => {
  try {
    const {
      id, date, name, phone, city, address, items, total, status, lat, lng, userEmail,
      payment_method, payment_status, payment_reference, customer_notes,
      subtotal, shipping_cost, discount_amount, coupon_code,
    } = req.body;
    if (!id || !name) return res.status(400).json({ error: 'id and name required' });

    const orderNumber = allocateOrderNumber();
    const history = [{
      status: status || '\u062c\u062f\u064a\u062f',
      at: new Date().toISOString(),
      by_id: userEmail || null,
      by_name: name || '\u0627\u0644\u0639\u0645\u064a\u0644',
      note: '\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0637\u0644\u0628',
    }];

    db.prepare(`
      INSERT OR REPLACE INTO orders (
        id, date, name, phone, city, address, items, total, status, lat, lng, userEmail,
        order_number, payment_method, payment_status, payment_reference, customer_notes,
        subtotal, shipping_cost, discount_amount, coupon_code, status_history
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      String(id), date, name, phone, city, address,
      JSON.stringify(items||[]), Number(total)||0, status||'\u062c\u062f\u064a\u062f',
      lat||null, lng||null, userEmail||null,
      orderNumber,
      payment_method || 'cash',
      payment_status || 'unpaid',
      payment_reference || null,
      customer_notes || null,
      subtotal != null ? Number(subtotal) : null,
      shipping_cost != null ? Number(shipping_cost) : null,
      discount_amount != null ? Number(discount_amount) : null,
      coupon_code || null,
      JSON.stringify(history)
    );

    if (userEmail) {
      upsertUser.run(userEmail, name||null, phone||null, Number(total)||0);
      // Ensure registered_at is set for legacy rows where it's NULL.
      db.prepare("UPDATE users SET registered_at = COALESCE(registered_at, firstOrder) WHERE email = ?").run(userEmail);
      recategorizeOne(userEmail);
      logCustomerActivity(userEmail, 'order_placed', { order_id: String(id), order_number: orderNumber, total: Number(total)||0 });
    }

    // Reserve stock so the inventory page reflects what's locked to this order.
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(String(id));
    reserveStockForOrder(order, items || []);

    // Notify the super admin so they see the new order in their inbox.
    sendMessage({
      from_user_id: userEmail || null,
      from_user_name: name || null,
      to_user_id: SUPER_ADMIN_FALLBACK,
      type: 'info',
      subject: `\u0637\u0644\u0628 \u062c\u062f\u064a\u062f #${orderNumber}`,
      body: `${name} \u00b7 ${city || '\u2014'} \u00b7 ${(Number(total)||0).toLocaleString()} \u062c`,
      metadata: { kind: 'new_order', order_id: String(id), order_number: orderNumber },
    });

    console.log('[nawra-api] order saved:', id, '#'+orderNumber, name, total, 'user:', userEmail||'guest');

    // Fire-and-forget: don't block the API response on SMTP latency
    sendOrderEmail({ id, order_number: orderNumber, date, name, phone, city, address, items, total, status, lat, lng, userEmail });

    res.json({ ok: true, id, order_number: orderNumber });
  } catch (e) { console.error('POST /api/orders error:', e); res.status(500).json({ error: e.message }); }
});

function hydrateOrder(r) {
  if (!r) return r;
  return {
    ...r,
    items: (() => { try { return JSON.parse(r.items||'[]'); } catch { return []; } })(),
    status_history: (() => { try { return JSON.parse(r.status_history||'[]'); } catch { return []; } })(),
  };
}

app.get('/api/orders', (req, res) => {
  try {
    const { userId } = req.query;
    const rows = userId
      ? db.prepare('SELECT * FROM orders WHERE userEmail = ? ORDER BY created_at DESC').all(userId)
      : db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    res.json(rows.map(hydrateOrder));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/orders/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?')
      .get(req.params.id, Number(req.params.id) || -1);
    if (!row) return res.status(404).json({ error: 'not found' });
    res.json(hydrateOrder(row));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/orders/:id', (req, res) => {
  try {
    const {
      status, payment_status, payment_reference,
      cancellation_reason, actor_id, actor_name, note,
    } = req.body;
    const cur = db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?')
      .get(req.params.id, Number(req.params.id) || -1);
    if (!cur) return res.status(404).json({ error: 'not found' });

    const items = (() => { try { return JSON.parse(cur.items || '[]'); } catch { return []; } })();

    // Stock lifecycle reacts to status transitions (only when status actually changes).
    if (status && status !== cur.status) {
      if (status === '\u062a\u0645 \u0627\u0644\u0634\u062d\u0646' && !cur.stock_released) {
        shipStockForOrder(cur, items);
      } else if (status === '\u0645\u0644\u063a\u064a') {
        cancelStockForOrder(cur, items);
      }
    }

    // Append to status_history when the status changes.
    let history = [];
    try { history = JSON.parse(cur.status_history || '[]'); } catch {}
    if (!Array.isArray(history)) history = [];
    if (status && status !== cur.status) {
      history.push({
        status,
        at: new Date().toISOString(),
        by_id: actor_id || null,
        by_name: actor_name || '\u0627\u0644\u0625\u062f\u0627\u0631\u0629',
        note: note || (status === '\u0645\u0644\u063a\u064a' && cancellation_reason ? cancellation_reason : null),
      });
    }

    // Build dynamic UPDATE
    const sets = [];
    const vals = [];
    if (status != null)              { sets.push('status = ?');              vals.push(status); }
    if (payment_status != null)      { sets.push('payment_status = ?');      vals.push(payment_status); }
    if (payment_reference != null)   { sets.push('payment_reference = ?');   vals.push(payment_reference); }
    if (cancellation_reason != null) { sets.push('cancellation_reason = ?'); vals.push(cancellation_reason); }
    sets.push('status_history = ?'); vals.push(JSON.stringify(history));

    // Auto-mark cash orders as paid on delivery.
    if (status === '\u0645\u0643\u062a\u0645\u0644' && cur.payment_method === 'cash' && cur.payment_status !== 'paid') {
      sets.push('payment_status = ?'); vals.push('paid');
    }

    vals.push(cur.id);
    const info = db.prepare(`UPDATE orders SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    if (!info.changes) return res.status(404).json({ error: 'not found' });

    const fresh = db.prepare('SELECT * FROM orders WHERE id = ?').get(cur.id);
    // Log cancellation to the customer's activity timeline.
    if (status === 'ملغي' && cur.userEmail) {
      logCustomerActivity(cur.userEmail, 'order_cancelled',
        { order_id: cur.id, order_number: cur.order_number, reason: cancellation_reason || null },
        actor_id, actor_name);
      recategorizeOne(cur.userEmail);
    }
    res.json({ ok: true, order: hydrateOrder(fresh) });
  } catch (e) { console.error('PATCH /api/orders error:', e); res.status(500).json({ error: e.message }); }
});

// Re-send the order confirmation/invoice email to the customer on demand.
app.post('/api/orders/:id/email-invoice', async (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?')
      .get(req.params.id, Number(req.params.id) || -1);
    if (!row) return res.status(404).json({ error: 'not found' });
    const order = hydrateOrder(row);
    const to = req.body && req.body.to ? String(req.body.to) : order.userEmail;
    if (!to) return res.status(400).json({ error: 'no recipient email available for this order' });
    if (!mailer) return res.status(503).json({ error: 'email transport not configured' });
    const info = await mailer.sendMail({
      from: `"\u0646\u0648\u0651\u0631\u064e\u0629 Skincare" <${gmailUser}>`,
      to,
      subject: `\ud83e\uddfe \u0641\u0627\u062a\u0648\u0631\u0629 \u0637\u0644\u0628\u0643 \u0645\u0646 \u0646\u0648\u0651\u0631\u064e\u0629 #${order.order_number || order.id}`,
      html: orderEmailHtml(order),
    });
    console.log('[nawra-api] \u2713 invoice email sent to', to, '|', info.messageId);
    res.json({ ok: true, to, messageId: info.messageId });
  } catch (e) {
    console.error('POST /api/orders/:id/email-invoice error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ── USERS / CUSTOMERS CRM ────────────────────────────────────────────────────
// Categorization rules (priority order):
//   vip       — manual_vip_override OR total spent >= threshold
//   inactive  — last order > 90 days ago
//   repeat    — 4+ orders
//   regular   — 1-3 orders
//   new       — registered < 30d ago AND zero orders (also default)
function getVipThreshold() {
  try {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('store');
    if (!row) return 5000;
    const v = JSON.parse(row.value || '{}');
    const n = Number(v.vip_threshold);
    return Number.isFinite(n) && n > 0 ? n : 5000;
  } catch { return 5000; }
}

function categorize(u, vipThreshold) {
  if (!u) return 'new';
  const vipT = vipThreshold || getVipThreshold();
  if (u.manual_vip_override || (Number(u.totalSpent) || 0) >= vipT) return 'vip';
  if (u.lastOrder) {
    const days = (Date.now() - new Date(u.lastOrder).getTime()) / 86400000;
    if (Number.isFinite(days) && days > 90) return 'inactive';
  }
  const oc = Number(u.totalOrders) || 0;
  if (oc >= 4) return 'repeat';
  if (oc >= 1) return 'regular';
  // No orders → either brand-new (within 30d of registration) or just empty
  if (u.registered_at) {
    const days = (Date.now() - new Date(u.registered_at).getTime()) / 86400000;
    if (Number.isFinite(days) && days <= 30) return 'new';
  }
  return 'new';
}

const recategorizeOneStmt = db.prepare('UPDATE users SET category = ? WHERE email = ?');
function recategorizeOne(email) {
  const u = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!u) return null;
  const cat = categorize(u);
  recategorizeOneStmt.run(cat, email);
  return cat;
}
function recategorizeAll() {
  const vipT = getVipThreshold();
  const rows = db.prepare('SELECT email, totalSpent, totalOrders, lastOrder, registered_at, manual_vip_override FROM users').all();
  let changed = 0;
  const upd = db.prepare('UPDATE users SET category = ? WHERE email = ? AND (category IS NULL OR category != ?)');
  db.transaction(() => {
    rows.forEach(r => {
      const c = categorize(r, vipT);
      const info = upd.run(c, r.email, c);
      if (info.changes) changed += 1;
    });
  })();
  return { total: rows.length, changed };
}

function logCustomerActivity(email, event_type, event_data = {}, actor_id = null, actor_name = null) {
  if (!email) return;
  try {
    const id = `ca_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
    db.prepare(`
      INSERT INTO customer_activity_log (id, customer_email, event_type, event_data, actor_id, actor_name)
      VALUES (?,?,?,?,?,?)
    `).run(id, email, event_type, JSON.stringify(event_data || {}), actor_id, actor_name);
  } catch (e) { console.warn('[nawra-api] activity log skipped:', e.message); }
}

// Hydrate user row → JSON-friendly shape.
function rowToCustomer(r) {
  if (!r) return null;
  return {
    ...r,
    manual_vip_override: !!r.manual_vip_override,
    blocked: !!r.blocked,
    marketing_emails_enabled:     !!r.marketing_emails_enabled,
    whatsapp_notifications_enabled: !!r.whatsapp_notifications_enabled,
    totalSpent: Number(r.totalSpent) || 0,
    totalOrders: Number(r.totalOrders) || 0,
  };
}

// GET /api/users — paginated list with filters + sort.
// Query params:
//   page, perPage (default 25)
//   q (name OR email OR phone substring)
//   category (all|new|regular|repeat|vip|inactive)
//   reg_from, reg_to       (registration date — ISO YYYY-MM-DD)
//   order_from, order_to   (last order date)
//   sort (newest|top_spender|top_orders|last_activity, default last_activity)
//   ids=csv  (for bulk operations: return ALL matching rows ignoring pagination)
app.get('/api/users', (req, res) => {
  try {
    const where = ['1=1']; const params = [];
    if (req.query.q) {
      where.push('(LOWER(COALESCE(name,\'\')) LIKE ? OR LOWER(email) LIKE ? OR LOWER(COALESCE(phone,\'\')) LIKE ?)');
      const like = `%${String(req.query.q).toLowerCase()}%`;
      params.push(like, like, like);
    }
    if (req.query.category && req.query.category !== 'all') {
      where.push('category = ?'); params.push(req.query.category);
    }
    if (req.query.reg_from)   { where.push('registered_at >= ?'); params.push(`${req.query.reg_from} 00:00:00`); }
    if (req.query.reg_to)     { where.push('registered_at <= ?'); params.push(`${req.query.reg_to} 23:59:59`); }
    if (req.query.order_from) { where.push('lastOrder >= ?');     params.push(`${req.query.order_from} 00:00:00`); }
    if (req.query.order_to)   { where.push('lastOrder <= ?');     params.push(`${req.query.order_to} 23:59:59`); }

    let orderBy = 'COALESCE(lastOrder, registered_at) DESC';
    switch (req.query.sort) {
      case 'newest':       orderBy = 'COALESCE(registered_at, firstOrder) DESC'; break;
      case 'top_spender':  orderBy = 'totalSpent DESC'; break;
      case 'top_orders':   orderBy = 'totalOrders DESC'; break;
      case 'last_activity':
      default: orderBy = 'COALESCE(last_login_date, lastOrder, registered_at) DESC';
    }

    const baseSql = `FROM users WHERE ${where.join(' AND ')}`;
    const total = db.prepare(`SELECT COUNT(*) AS n ${baseSql}`).get(...params).n;

    const page    = Math.max(1, Number(req.query.page)    || 1);
    const perPage = Math.min(200, Math.max(1, Number(req.query.perPage) || 25));
    const offset  = (page - 1) * perPage;

    // Bulk mode — caller wants the full filtered set (used by CSV export +
    // "select all matching" bulk actions). Capped to a safety ceiling.
    const isBulk = req.query.bulk === '1';
    const limit = isBulk ? Math.min(5000, total) : perPage;
    const off   = isBulk ? 0 : offset;

    const rows = db.prepare(`
      SELECT email, name, phone, firstOrder, lastOrder,
             totalOrders, totalSpent, category, manual_vip_override,
             blocked, registered_at, last_login_date,
             marketing_emails_enabled, whatsapp_notifications_enabled,
             date_of_birth, gender, preferred_lang
      ${baseSql} ORDER BY ${orderBy} LIMIT ? OFFSET ?
    `).all(...params, limit, off).map(rowToCustomer);

    res.json({ total, page, perPage, rows });
  } catch (e) { console.error('GET /api/users error:', e); res.status(500).json({ error: e.message }); }
});

// GET /api/users/aggregates — KPI summary for the customers list header
app.get('/api/users/aggregates', (_req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10) + ' 00:00:00';
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0,10) + ' 00:00:00';
    const newThisMonth = db.prepare('SELECT COUNT(*) AS n FROM users WHERE COALESCE(registered_at, firstOrder) >= ?').get(startOfThisMonth).n;
    const newLastMonth = db.prepare('SELECT COUNT(*) AS n FROM users WHERE COALESCE(registered_at, firstOrder) >= ? AND COALESCE(registered_at, firstOrder) < ?').get(startOfLastMonth, startOfThisMonth).n;
    const vip = db.prepare("SELECT COUNT(*) AS n FROM users WHERE category = 'vip'").get().n;
    const repeatCust = db.prepare('SELECT COUNT(*) AS n FROM users WHERE totalOrders >= 2').get().n;
    const repeatRate = total ? Math.round((repeatCust / total) * 100) : 0;
    const totalSpentAll = db.prepare('SELECT COALESCE(SUM(totalSpent), 0) AS s FROM users').get().s;
    const clv = total ? Math.round(totalSpentAll / total) : 0;
    const newChangePct = newLastMonth ? Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 100) : (newThisMonth ? 100 : 0);
    res.json({
      total_customers: total,
      new_this_month: newThisMonth,
      new_change_pct: newChangePct,
      vip_count: vip,
      repeat_rate_pct: repeatRate,
      avg_clv: clv,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/users/:email — full record (computed fields, address list excluded —
// the addresses endpoint is its own thing)
app.get('/api/users/:email', (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const u = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!u) return res.status(404).json({ error: 'not found' });
    const orders = db.prepare(`SELECT * FROM orders WHERE userEmail = ? ORDER BY created_at DESC LIMIT 50`).all(email).map(hydrateOrder);
    const notes  = db.prepare(`SELECT * FROM customer_notes WHERE customer_email = ? ORDER BY created_at DESC`).all(email);
    const activity = db.prepare(`SELECT * FROM customer_activity_log WHERE customer_email = ? ORDER BY created_at DESC LIMIT 100`).all(email).map(r => ({
      ...r, event_data: (() => { try { return JSON.parse(r.event_data||'{}'); } catch { return {}; } })(),
    }));
    // Favorite products — aggregate from this user's items
    const favMap = new Map();
    orders.forEach(o => (o.items || []).forEach(it => {
      const key = it.name || it.nameAr || '—';
      const prev = favMap.get(key) || { name: key, qty: 0, rev: 0, img: it.img || null };
      prev.qty += Number(it.qty) || 0;
      prev.rev += (Number(it.price) || 0) * (Number(it.qty) || 0);
      if (!prev.img && it.img) prev.img = it.img;
      favMap.set(key, prev);
    }));
    const favorite_products = Array.from(favMap.values()).sort((a,b) => b.qty - a.qty).slice(0, 5);
    res.json({
      customer: rowToCustomer(u),
      orders,
      notes,
      activity,
      favorite_products,
    });
  } catch (e) { console.error('GET /api/users/:email error:', e); res.status(500).json({ error: e.message }); }
});

// POST /api/users — create a customer manually (no orders yet).
app.post('/api/users', (req, res) => {
  try {
    const { email, name, phone, date_of_birth, gender, preferred_lang } = req.body || {};
    if (!email) return res.status(400).json({ error: 'email required' });
    db.prepare(`
      INSERT INTO users (email, name, phone, registered_at, totalOrders, totalSpent, category,
                         date_of_birth, gender, preferred_lang)
      VALUES (?, ?, ?, datetime('now'), 0, 0, 'new', ?, ?, ?)
      ON CONFLICT(email) DO NOTHING
    `).run(email, name || null, phone || null, date_of_birth || null, gender || null, preferred_lang || 'ar');
    recategorizeOne(email);
    logCustomerActivity(email, 'registered', { manual: true });
    const u = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    res.json(rowToCustomer(u));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH /api/users/:email — block, unblock, toggle VIP, update marketing/lang
app.patch('/api/users/:email', (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const cur = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!cur) return res.status(404).json({ error: 'not found' });
    const p = req.body || {};
    const sets = []; const vals = [];
    const allow = ['name','phone','date_of_birth','gender','preferred_lang'];
    allow.forEach(c => { if (Object.prototype.hasOwnProperty.call(p, c)) { sets.push(`${c} = ?`); vals.push(p[c]); } });
    if (Object.prototype.hasOwnProperty.call(p, 'blocked'))              { sets.push('blocked = ?');              vals.push(p.blocked ? 1 : 0); }
    if (Object.prototype.hasOwnProperty.call(p, 'manual_vip_override')) { sets.push('manual_vip_override = ?'); vals.push(p.manual_vip_override ? 1 : 0); }
    if (Object.prototype.hasOwnProperty.call(p, 'marketing_emails_enabled'))     { sets.push('marketing_emails_enabled = ?');     vals.push(p.marketing_emails_enabled ? 1 : 0); }
    if (Object.prototype.hasOwnProperty.call(p, 'whatsapp_notifications_enabled')){ sets.push('whatsapp_notifications_enabled = ?');vals.push(p.whatsapp_notifications_enabled ? 1 : 0); }
    if (Object.prototype.hasOwnProperty.call(p, 'last_login_date'))      { sets.push('last_login_date = ?'); vals.push(p.last_login_date); }
    if (!sets.length) return res.json({ ok: true, noop: true });
    vals.push(email);
    db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE email = ?`).run(...vals);
    recategorizeOne(email);
    // Log block/unblock and VIP toggle for the audit timeline
    if (Object.prototype.hasOwnProperty.call(p, 'blocked')) {
      logCustomerActivity(email, p.blocked ? 'blocked' : 'unblocked', {}, p.actor_id, p.actor_name);
    }
    if (Object.prototype.hasOwnProperty.call(p, 'manual_vip_override')) {
      logCustomerActivity(email, p.manual_vip_override ? 'vip_set' : 'vip_cleared', {}, p.actor_id, p.actor_name);
    }
    const u = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    res.json(rowToCustomer(u));
  } catch (e) { console.error('PATCH /api/users error:', e); res.status(500).json({ error: e.message }); }
});

// DELETE /api/users/:email — super-admin only (frontend gates this).
app.delete('/api/users/:email', (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    db.prepare('DELETE FROM customer_notes WHERE customer_email = ?').run(email);
    db.prepare('DELETE FROM customer_activity_log WHERE customer_email = ?').run(email);
    db.prepare('DELETE FROM addresses WHERE userId = ?').run(email);
    const info = db.prepare('DELETE FROM users WHERE email = ?').run(email);
    if (!info.changes) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Notes for one customer
app.get('/api/users/:email/notes', (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const rows = db.prepare('SELECT * FROM customer_notes WHERE customer_email = ? ORDER BY created_at DESC').all(email);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/users/:email/notes', (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const { note, author_id, author_name } = req.body || {};
    if (!note || !String(note).trim()) return res.status(400).json({ error: 'note required' });
    const id = `cn_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
    db.prepare(`
      INSERT INTO customer_notes (id, customer_email, author_id, author_name, note)
      VALUES (?,?,?,?,?)
    `).run(id, email, author_id || null, author_name || null, String(note).trim());
    logCustomerActivity(email, 'note_added', { preview: String(note).slice(0, 80) }, author_id, author_name);
    res.json({ ok: true, id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/users/:email/notes/:noteId', (req, res) => {
  try {
    db.prepare('DELETE FROM customer_notes WHERE id = ? AND customer_email = ?')
      .run(req.params.noteId, decodeURIComponent(req.params.email));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Activity log read endpoint (already returned by GET /api/users/:email — this
// gives a longer history when admins click "show all").
app.get('/api/users/:email/activity', (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const rows = db.prepare('SELECT * FROM customer_activity_log WHERE customer_email = ? ORDER BY created_at DESC LIMIT 500').all(email).map(r => ({
      ...r, event_data: (() => { try { return JSON.parse(r.event_data||'{}'); } catch { return {}; } })(),
    }));
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Send a one-off email to a single customer. Template supports the standard
// variables: {{customer_name}}, {{order_count}}, {{total_spent}}.
function renderTemplate(body, ctx) {
  return String(body || '').replace(/\{\{(\w+)\}\}/g, (_, k) => (ctx[k] != null ? String(ctx[k]) : ''));
}
app.post('/api/users/:email/email', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const u = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!u) return res.status(404).json({ error: 'not found' });
    if (!mailer) return res.status(503).json({ error: 'email transport not configured' });
    const { subject, body, actor_id, actor_name } = req.body || {};
    if (!subject || !body) return res.status(400).json({ error: 'subject + body required' });
    const ctx = {
      customer_name: u.name || u.email,
      order_count: u.totalOrders || 0,
      total_spent: u.totalSpent || 0,
    };
    const sub = renderTemplate(subject, ctx);
    const html = `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;font-size:14px;line-height:1.8;color:#111;">${renderTemplate(body, ctx).replace(/\n/g, '<br/>')}</div>`;
    const info = await mailer.sendMail({
      from: `"نوّرَة Skincare" <${gmailUser}>`,
      to: email, subject: sub, html,
    });
    logCustomerActivity(email, 'email_sent', { subject: sub, messageId: info.messageId }, actor_id, actor_name);
    res.json({ ok: true, messageId: info.messageId });
  } catch (e) { console.error('POST /api/users/:email/email error:', e); res.status(500).json({ error: e.message }); }
});

// Bulk email — accepts { recipients: [emails], subject, body }
app.post('/api/users/bulk-email', async (req, res) => {
  try {
    if (!mailer) return res.status(503).json({ error: 'email transport not configured' });
    const { recipients, subject, body, actor_id, actor_name } = req.body || {};
    if (!Array.isArray(recipients) || !recipients.length) return res.status(400).json({ error: 'recipients required' });
    if (!subject || !body) return res.status(400).json({ error: 'subject + body required' });
    const sent = []; const failed = [];
    for (const email of recipients) {
      try {
        const u = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        const ctx = u ? {
          customer_name: u.name || u.email,
          order_count: u.totalOrders || 0, total_spent: u.totalSpent || 0,
        } : { customer_name: email, order_count: 0, total_spent: 0 };
        const sub = renderTemplate(subject, ctx);
        const html = `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;font-size:14px;line-height:1.8;color:#111;">${renderTemplate(body, ctx).replace(/\n/g, '<br/>')}</div>`;
        // eslint-disable-next-line no-await-in-loop
        const info = await mailer.sendMail({ from: `"نوّرَة Skincare" <${gmailUser}>`, to: email, subject: sub, html });
        sent.push({ email, messageId: info.messageId });
        logCustomerActivity(email, 'email_sent', { subject: sub, bulk: true, messageId: info.messageId }, actor_id, actor_name);
      } catch (e) { failed.push({ email, error: e.message }); }
    }
    res.json({ ok: true, sent: sent.length, failed: failed.length, fails: failed });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Personalized coupon for one customer — creates a coupon row + logs activity
app.post('/api/users/:email/coupon', (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const u = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!u) return res.status(404).json({ error: 'not found' });
    const { discount, type, min_order, max_uses, end_date, actor_id, actor_name } = req.body || {};
    const code = `VIP-${String(email.split('@')[0]).toUpperCase().slice(0,6)}-${Math.random().toString(36).slice(2,5).toUpperCase()}`;
    const id = `cp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
    db.prepare(`
      INSERT INTO coupons (id, code, type, discount, min_order, max_uses, active, end_date)
      VALUES (?,?,?,?,?,?,1,?)
    `).run(id, code, ['percent','fixed','free_shipping'].includes(type) ? type : 'percent',
           Number(discount) || 10, Number(min_order) || 0, Number(max_uses) || 1, end_date || null);
    logCustomerActivity(email, 'coupon_created', { code, discount: Number(discount) || 10, type: type || 'percent' }, actor_id, actor_name);
    res.json({ ok: true, code });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Manual recategorize — handy for admins after bulk imports.
app.post('/api/users/recategorize', (_req, res) => {
  try { res.json(recategorizeAll()); }
  catch (e) { res.status(500).json({ error: e.message }); }
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
// Parse a JSON column safely, returning a default on failure.
function parseJsonCol(raw, def) {
  if (raw == null) return def;
  try { const v = JSON.parse(raw); return v == null ? def : v; }
  catch { return def; }
}

// Coerce a value into the {ar,en} bilingual shape used by *_i18n columns.
// Accepts: a string (treated as AR), a {ar,en} object, or null/undefined.
function toI18n(v, fallbackAr) {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    return { ar: (v.ar ?? fallbackAr ?? ''), en: (v.en ?? '') };
  }
  if (typeof v === 'string') return { ar: v, en: '' };
  return { ar: fallbackAr || '', en: '' };
}

function rowToProduct(r) {
  if (!r) return null;
  const images = parseJsonCol(r.images, []);
  const tags   = parseJsonCol(r.tags, []);
  const variants = db.prepare('SELECT * FROM product_variants WHERE product_id = ? ORDER BY sort_order, created_at').all(r.id);
  return {
    ...r,
    images, tags, variants,
    in_stock:       !!r.in_stock,
    featured:       !!r.featured,
    is_best_seller: !!r.is_best_seller,
    has_variants:   !!r.has_variants,
    archived:       !!r.archived,
    name_i18n:            parseJsonCol(r.name_i18n,            { ar: r.name||'', en: '' }),
    description_i18n:     parseJsonCol(r.description_i18n,     { ar: r.description||'', en: '' }),
    ingredients_i18n:     parseJsonCol(r.ingredients_i18n,     { ar: r.ingredients||'', en: '' }),
    usage_i18n:           parseJsonCol(r.usage_i18n,           { ar: r.usage_text||'', en: '' }),
    seo_title_i18n:       parseJsonCol(r.seo_title_i18n,       { ar: r.seo_title||'', en: '' }),
    seo_description_i18n: parseJsonCol(r.seo_description_i18n, { ar: r.seo_description||'', en: '' }),
  };
}

// Generate a sensible SKU when client doesn't supply one. Format:
// "{BRAND4}-{NAME4}-{NNN}" where NNN is a 3-digit sequence per brand.
function generateSku(brand, name) {
  const b = String(brand||'').replace(/[^A-Za-z0-9]+/g,'').slice(0,4).toUpperCase() || 'NWR';
  const n = String(name||'PROD').replace(/[^A-Za-z0-9]+/g,'').slice(0,4).toUpperCase() || 'PROD';
  const row = db.prepare("SELECT COUNT(*) AS c FROM products WHERE sku LIKE ?").get(`${b}-%`);
  const seq = String(((row && row.c) || 0) + 1).padStart(3, '0');
  return `${b}-${n}-${seq}`;
}

// Resolve a unique slug derived from name. If `excludeId` is provided we
// don't count the product itself as a collision (used when editing).
function resolveSlug(desired, fallbackName, excludeId) {
  let base = slugify(desired || fallbackName) || 'product';
  let s = base, n = 2;
  const stmt = db.prepare('SELECT 1 FROM products WHERE slug = ? AND id <> ?');
  while (stmt.get(s, excludeId || '')) { s = `${base}-${n++}`; }
  return s;
}

app.get('/api/products', (req, res) => {
  try {
    const { status, category, q, brand, archived } = req.query;
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    if (status)   { sql += ' AND status = ?';   params.push(status); }
    if (category) { sql += ' AND category = ?'; params.push(category); }
    if (brand)    { sql += ' AND brand = ?';    params.push(brand); }
    // Exclude archived rows unless explicitly asked for.
    if (archived === '1') { sql += ' AND archived = 1'; }
    else if (archived !== 'all') { sql += ' AND (archived IS NULL OR archived = 0)'; }
    if (q) {
      sql += ' AND (name LIKE ? OR brand LIKE ? OR sku LIKE ? OR slug LIKE ?)';
      const like = `%${q}%`; params.push(like, like, like, like);
    }
    sql += ' ORDER BY created_at DESC';
    const rows = db.prepare(sql).all(...params);
    res.json(rows.map(rowToProduct));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Live slug-uniqueness check used by the admin form's onBlur validation.
// Must be defined BEFORE /api/products/:id, otherwise Express matches the
// param route first and we never reach this handler.
app.get('/api/products/slug-check', (req, res) => {
  try {
    const slug = slugify(req.query.slug || '');
    if (!slug) return res.json({ available: false, slug: '', error: 'invalid slug' });
    const excludeId = String(req.query.exclude || '');
    const hit = db.prepare('SELECT id FROM products WHERE slug = ? AND id <> ?').get(slug, excludeId);
    res.json({ available: !hit, slug });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM products WHERE id = ? OR slug = ?').get(req.params.id, req.params.id);
    if (!row) return res.status(404).json({ error: 'not found' });
    res.json(rowToProduct(row));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Replace all variant rows for a product (insert-after-delete keeps the API
// simple — the admin form always re-sends the entire variant list).
function replaceVariants(productId, variants) {
  db.prepare('DELETE FROM product_variants WHERE product_id = ?').run(String(productId));
  if (!Array.isArray(variants) || !variants.length) return;
  const ins = db.prepare(`
    INSERT INTO product_variants (id, product_id, size, price, price_before, stock, sku, sort_order)
    VALUES (?,?,?,?,?,?,?,?)
  `);
  variants.forEach((v, i) => {
    const id = v.id || `pv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}_${i}`;
    ins.run(
      id, String(productId),
      v.size || null,
      Number(v.price) || 0,
      Number(v.price_before) || 0,
      Number.isFinite(+v.stock) ? +v.stock : 0,
      v.sku || null,
      Number.isFinite(+v.sort_order) ? +v.sort_order : i
    );
  });
}

app.post('/api/products', (req, res) => {
  try {
    const p = req.body || {};
    // Bilingual primary name is required (Arabic side).
    const nameI18n = toI18n(p.name_i18n, p.name);
    if (!nameI18n.ar) return res.status(400).json({ error: 'name (ar) required' });
    const id   = p.id  || `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`;
    const sku  = p.sku || generateSku(p.brand, nameI18n.ar);
    const slug = resolveSlug(p.slug || nameI18n.ar, nameI18n.ar, id);

    const descI18n = toI18n(p.description_i18n, p.description);
    const ingI18n  = toI18n(p.ingredients_i18n, p.ingredients);
    const useI18n  = toI18n(p.usage_i18n,       p.usage_text || p.usage);
    const seoTI18n = toI18n(p.seo_title_i18n,       p.seo_title);
    const seoDI18n = toI18n(p.seo_description_i18n, p.seo_description);

    db.prepare(`
      INSERT INTO products (
        id, sku, name, description, category, brand, ingredients, images,
        price, price_before, cost, stock, alert_threshold,
        status, in_stock, featured, seo_title, seo_description, tags,
        name_i18n, description_i18n, ingredients_i18n,
        usage_text, usage_i18n,
        seo_title_i18n, seo_description_i18n,
        slug, size, publish_at, is_best_seller, has_variants, archived,
        created_at, updated_at
      ) VALUES (
        ?,?,?,?,?,?,?,?,
        ?,?,?,?,?,
        ?,?,?,?,?,?,
        ?,?,?,
        ?,?,
        ?,?,
        ?,?,?,?,?,?,
        datetime('now'), datetime('now')
      )
    `).run(
      id, sku, nameI18n.ar, descI18n.ar || null, p.category || null, p.brand || null,
      ingI18n.ar || null, JSON.stringify(Array.isArray(p.images) ? p.images : []),
      Number(p.price)||0, Number(p.price_before)||0, Number(p.cost)||0,
      Number.isFinite(+p.stock) ? +p.stock : 0, Number.isFinite(+p.alert_threshold) ? +p.alert_threshold : 5,
      p.status === 'published' ? 'published' : 'draft',
      p.in_stock === false ? 0 : 1,
      p.featured ? 1 : 0,
      seoTI18n.ar || null, seoDI18n.ar || null,
      JSON.stringify(Array.isArray(p.tags) ? p.tags : []),
      JSON.stringify(nameI18n), JSON.stringify(descI18n), JSON.stringify(ingI18n),
      useI18n.ar || null, JSON.stringify(useI18n),
      JSON.stringify(seoTI18n), JSON.stringify(seoDI18n),
      slug, p.size || null, p.publish_at || null,
      p.is_best_seller ? 1 : 0,
      p.has_variants ? 1 : 0,
      p.archived ? 1 : 0
    );

    if (p.has_variants && Array.isArray(p.variants)) replaceVariants(id, p.variants);

    console.log('[nawra-api] product created:', id, nameI18n.ar, '(', p.status, ', slug=' + slug + ')');
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.json({ ok: true, ...rowToProduct(row) });
  } catch (e) { console.error('POST /api/products error:', e); res.status(500).json({ error: e.message }); }
});

app.patch('/api/products/:id', (req, res) => {
  try {
    const cur = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!cur) return res.status(404).json({ error: 'not found' });
    const p = req.body || {};

    const sets = []; const vals = [];

    // Plain scalar columns — set when present on the body.
    const scalars = [
      'category','brand','price','price_before','cost','stock','alert_threshold',
      'status','sku','size','publish_at',
    ];
    scalars.forEach(c => {
      if (Object.prototype.hasOwnProperty.call(p, c)) { sets.push(`${c} = ?`); vals.push(p[c]); }
    });

    // Bilingual fields — when provided, update both the *_i18n JSON column and
    // the legacy AR-only column to keep storefront fallback working.
    const i18nMap = [
      ['name',        'name_i18n'],
      ['description', 'description_i18n'],
      ['ingredients', 'ingredients_i18n'],
      ['seo_title',       'seo_title_i18n'],
      ['seo_description', 'seo_description_i18n'],
    ];
    i18nMap.forEach(([legacy, jsonCol]) => {
      if (Object.prototype.hasOwnProperty.call(p, jsonCol) || Object.prototype.hasOwnProperty.call(p, legacy)) {
        const v = toI18n(p[jsonCol] ?? p[legacy], parseJsonCol(cur[jsonCol], {ar:cur[legacy]||'',en:''}).ar);
        sets.push(`${jsonCol} = ?`); vals.push(JSON.stringify(v));
        sets.push(`${legacy} = ?`);   vals.push(v.ar || null);
      }
    });
    // usage uses a different legacy column name (usage_text).
    if (Object.prototype.hasOwnProperty.call(p, 'usage_i18n') || Object.prototype.hasOwnProperty.call(p, 'usage_text') || Object.prototype.hasOwnProperty.call(p, 'usage')) {
      const v = toI18n(p.usage_i18n ?? p.usage_text ?? p.usage, parseJsonCol(cur.usage_i18n, {ar:cur.usage_text||'',en:''}).ar);
      sets.push('usage_i18n = ?'); vals.push(JSON.stringify(v));
      sets.push('usage_text = ?'); vals.push(v.ar || null);
    }

    // JSON arrays
    if (Object.prototype.hasOwnProperty.call(p, 'images')) { sets.push('images = ?'); vals.push(JSON.stringify(Array.isArray(p.images)?p.images:[])); }
    if (Object.prototype.hasOwnProperty.call(p, 'tags'))   { sets.push('tags = ?');   vals.push(JSON.stringify(Array.isArray(p.tags)?p.tags:[])); }

    // Booleans
    if (Object.prototype.hasOwnProperty.call(p, 'in_stock'))       { sets.push('in_stock = ?');       vals.push(p.in_stock ? 1 : 0); }
    if (Object.prototype.hasOwnProperty.call(p, 'featured'))       { sets.push('featured = ?');       vals.push(p.featured ? 1 : 0); }
    if (Object.prototype.hasOwnProperty.call(p, 'is_best_seller')) { sets.push('is_best_seller = ?'); vals.push(p.is_best_seller ? 1 : 0); }
    if (Object.prototype.hasOwnProperty.call(p, 'has_variants'))   { sets.push('has_variants = ?');   vals.push(p.has_variants ? 1 : 0); }
    if (Object.prototype.hasOwnProperty.call(p, 'archived'))       { sets.push('archived = ?');       vals.push(p.archived ? 1 : 0); }

    // Slug — resolve to unique form (excluding self).
    if (Object.prototype.hasOwnProperty.call(p, 'slug')) {
      const newSlug = resolveSlug(p.slug, cur.name, cur.id);
      sets.push('slug = ?'); vals.push(newSlug);
    }

    if (!sets.length && !Object.prototype.hasOwnProperty.call(p, 'variants')) {
      return res.json({ ok: true, noop: true });
    }

    if (sets.length) {
      sets.push("updated_at = datetime('now')");
      vals.push(req.params.id);
      db.prepare(`UPDATE products SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    }

    // Variants — replace the whole set when the caller passes an array.
    if (Object.prototype.hasOwnProperty.call(p, 'variants')) {
      replaceVariants(req.params.id, p.variants);
    }

    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json(rowToProduct(row));
  } catch (e) { console.error('PATCH /api/products error:', e); res.status(500).json({ error: e.message }); }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM product_variants WHERE product_id = ?').run(req.params.id);
    const info = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    if (!info.changes) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Product image upload ──────────────────────────────────────────────────────
// Multipart endpoint that converts the upload to webp (+ generates a 200×200
// thumbnail) and stores both under /uploads/products/. Returns the public
// URLs; the admin form then includes them in the product's `images` array.
const PRODUCT_UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'products');
try { fs.mkdirSync(PRODUCT_UPLOAD_DIR, { recursive: true }); } catch {}
// Serve uploaded files publicly. The frontend embeds the returned URLs
// directly in <img src=...>.
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
  maxAge: '7d', fallthrough: true,
}));

if (multer && sharp) {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits:  { fileSize: 5 * 1024 * 1024 }, // 5 MB raw cap; sharp shrinks heavily
    fileFilter: (_req, file, cb) => {
      const ok = /^image\/(jpeg|png|webp)$/.test(file.mimetype);
      cb(ok ? null : new Error('unsupported file type — jpg, png, webp only'), ok);
    },
  });
  app.post('/api/products/upload-image', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'no file' });
      const stamp = Date.now().toString(36) + Math.random().toString(36).slice(2,5);
      const fullName  = `${stamp}.webp`;
      const thumbName = `${stamp}-thumb.webp`;
      // Full-size: cap longest side at 1400px so banners aren't huge but the
      // detail-page image still looks crisp on retina screens.
      await sharp(req.file.buffer)
        .rotate()
        .resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(path.join(PRODUCT_UPLOAD_DIR, fullName));
      // Thumbnail: hard-cropped 200×200 for table rows and storefront cards.
      await sharp(req.file.buffer)
        .rotate()
        .resize({ width: 200, height: 200, fit: 'cover', position: 'centre' })
        .webp({ quality: 80 })
        .toFile(path.join(PRODUCT_UPLOAD_DIR, thumbName));
      const url      = `/uploads/products/${fullName}`;
      const thumbUrl = `/uploads/products/${thumbName}`;
      console.log('[nawra-api] product image saved:', url);
      res.json({ ok: true, url, thumbUrl, original: req.file.originalname });
    } catch (e) {
      console.error('POST /api/products/upload-image error:', e);
      res.status(500).json({ error: e.message });
    }
  });
} else {
  app.post('/api/products/upload-image', (_req, res) => {
    res.status(503).json({ error: 'image upload unavailable — install multer+sharp on the server' });
  });
}

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
    const cur = db.prepare('SELECT * FROM returns WHERE id = ?').get(req.params.id);
    if (!cur) return res.status(404).json({ error: 'not found' });

    const sets = []; const vals = [];
    ['status','admin_note','amount','reason'].forEach(k => {
      if (Object.prototype.hasOwnProperty.call(r, k)) { sets.push(`${k} = ?`); vals.push(r[k]); }
    });
    // Inspection: 'good' returns units to stock_available; 'damaged' adds
    // to stock_damaged AND creates a "damaged" expense for the cost.
    let inspectionApplied = false;
    if (r.inspection_status && ['good','damaged'].includes(r.inspection_status) && !cur.stock_settled) {
      sets.push('inspection_status = ?'); vals.push(r.inspection_status);
      sets.push('inspected_at = datetime(\'now\')');
      sets.push('stock_settled = 1');
      // Resolve target product by name (returns store a single product string).
      const productRow = cur.product
        ? db.prepare('SELECT * FROM products WHERE name = ?').get(cur.product)
        : null;
      const qty = 1; // Returns table doesn't carry qty granularity yet; settle 1 unit per return.
      if (productRow) {
        if (r.inspection_status === 'good') {
          const newAvail = (productRow.stock || 0) + qty;
          db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(newAvail, productRow.id);
          recordMovement({
            product_id: productRow.id, product_name: productRow.name,
            type: 'return_good', quantity_delta: +qty,
            balance_after_available: newAvail,
            balance_after_reserved:  productRow.stock_reserved || 0,
            balance_after_damaged:   productRow.stock_damaged || 0,
            reason: 'مرتجع سليم — رجع للمخزون', reference: String(cur.id),
          });
        } else {
          const newDam = (productRow.stock_damaged || 0) + qty;
          db.prepare('UPDATE products SET stock_damaged = ? WHERE id = ?').run(newDam, productRow.id);
          // Auto-expense for damaged unit @ cost
          const unitCost = Number(productRow.cost) || 0;
          if (unitCost > 0) {
            const expId = `ex_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
            db.prepare(`
              INSERT INTO expenses (id, category, description, quantity, unit_price, amount, date, notes)
              VALUES (?, 'general', ?, ?, ?, ?, date('now'), ?)
            `).run(expId, `هالك — ${productRow.name}`, qty, unitCost, unitCost * qty, `مرتجع #${cur.id}`);
          }
          recordMovement({
            product_id: productRow.id, product_name: productRow.name,
            type: 'damaged', quantity_delta: 0,
            balance_after_available: productRow.stock || 0,
            balance_after_reserved:  productRow.stock_reserved || 0,
            balance_after_damaged:   newDam,
            reason: 'هالك — مرتجع معيب', reference: String(cur.id),
            unit_cost: Number(productRow.cost) || 0,
          });
        }
      }
      inspectionApplied = true;
    }

    if (!sets.length) return res.json({ ok: true, noop: true });
    sets.push("updated_at = datetime('now')");
    vals.push(req.params.id);
    db.prepare(`UPDATE returns SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    const fresh = db.prepare('SELECT * FROM returns WHERE id=?').get(req.params.id);
    res.json({ ...fresh, inspectionApplied });
  } catch (e) { console.error('PATCH /api/returns', e); res.status(500).json({ error: e.message }); }
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
    const id = String(req.params.id);
    // Default seeded categories are immutable. Two prefixes exist for
    // historical reasons (cat_seed_* and cat_default_*).
    if (id.startsWith('cat_seed_') || id.startsWith('cat_default_'))
      return res.status(403).json({ error: 'الفئة الافتراضية لا يمكن حذفها' });
    const info = db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    if (!info.changes) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Keys that must NEVER be returned by the public unified GET because they
// contain secrets (password hashes, API tokens, etc.). The per-key GET also
// refuses to serve them.
const SECRET_SETTINGS_KEYS = new Set(['admin_credentials']);

// Unified settings endpoints — return / update all keys at once.
app.get('/api/settings', (_req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const out = {};
    rows.forEach(r => {
      if (SECRET_SETTINGS_KEYS.has(r.key)) return; // never expose secrets
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
    const guard = (k) => {
      if (SECRET_SETTINGS_KEYS.has(k))
        throw new Error(`setting "${k}" is protected and cannot be set via this endpoint`);
    };
    if (body.key) {
      guard(body.key);
      const json = typeof body.value === 'string' ? body.value : JSON.stringify(body.value);
      upsert.run(body.key, json);
    } else {
      Object.keys(body).forEach(k => {
        guard(k);
        const v = body[k];
        const json = typeof v === 'string' ? v : JSON.stringify(v);
        upsert.run(k, json);
      });
    }
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.get('/api/settings/:key', (req, res) => {
  try {
    if (SECRET_SETTINGS_KEYS.has(req.params.key))
      return res.status(403).json({ error: 'protected setting' });
    const row = db.prepare('SELECT value FROM settings WHERE key=?').get(req.params.key);
    if (!row) return res.json({ value: null });
    try { res.json({ value: JSON.parse(row.value) }); }
    catch { res.json({ value: row.value }); }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/settings/:key', (req, res) => {
  try {
    if (SECRET_SETTINGS_KEYS.has(req.params.key))
      return res.status(403).json({ error: 'protected setting; use /api/auth/change-password' });
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
    const requesterId = a.requester_id || a.requester || null;
    db.prepare(`
      INSERT INTO approvals (id, type, target_id, target_label, requester, requester_id, requester_name, payload, reason, status)
      VALUES (?,?,?,?,?,?,?,?,?, 'pending')
    `).run(id, a.type, a.target_id || null, a.target_label || null,
           a.requester || null, requesterId, a.requester_name || null,
           JSON.stringify(a.payload || {}), a.reason || null);

    // ONE consolidated message to super admin's inbox containing everything.
    const labelMap = {
      product_delete: 'حذف منتج',
      product_add:    'إضافة منتج',
      stock_reduce:   'تقليل كمية مخزون',
    };
    const subject = `طلب ${labelMap[a.type] || a.type} — ${a.target_label || a.target_id || ''}`;
    const bodyLines = [];
    if (a.target_label) bodyLines.push(`المنتج: ${a.target_label}`);
    if (a.requester_name || requesterId) bodyLines.push(`الطالب: ${a.requester_name || requesterId}`);
    if (a.reason) bodyLines.push(`السبب: ${a.reason}`);
    if (a.payload) {
      try {
        const p = typeof a.payload === 'string' ? JSON.parse(a.payload) : a.payload;
        if (p.old_qty != null && p.new_qty != null)
          bodyLines.push(`الكمية: ${p.old_qty} → ${p.new_qty} (—${p.old_qty - p.new_qty})`);
      } catch {}
    }
    sendMessage({
      from_user_id: requesterId,
      from_user_name: a.requester_name || requesterId || null,
      to_user_id: SUPER_ADMIN_FALLBACK,
      type: 'request',
      subject,
      body: bodyLines.join('\n'),
      metadata: { approval_id: id, approval_type: a.type, target_id: a.target_id || null, requires_action: true },
    });

    res.json({ ok: true, id });
  } catch (e) { console.error('POST /api/approvals', e); res.status(500).json({ error: e.message }); }
});

app.patch('/api/approvals/:id', (req, res) => {
  try {
    const { status, resolution_note } = req.body || {};
    if (!['approved','rejected'].includes(status))
      return res.status(400).json({ error: 'status must be approved or rejected' });
    const cur = db.prepare('SELECT * FROM approvals WHERE id = ?').get(req.params.id);
    if (!cur) return res.status(404).json({ error: 'not found' });
    if (cur.status !== 'pending') return res.status(409).json({ error: 'already resolved' });

    // Side-effects on approval:
    if (status === 'approved') {
      if (cur.type === 'product_delete' && cur.target_id) {
        try { db.prepare('DELETE FROM products WHERE id = ?').run(cur.target_id); } catch {}
      }
      if (cur.type === 'stock_reduce' && cur.target_id) {
        let p = {};
        try { p = JSON.parse(cur.payload || '{}'); } catch {}
        if (Number.isFinite(+p.new_qty)) {
          const productRow = db.prepare('SELECT * FROM products WHERE id = ?').get(cur.target_id);
          if (productRow) {
            const newQty = Math.max(0, +p.new_qty);
            const oldQty = productRow.stock || 0;
            const delta  = newQty - oldQty;
            db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(newQty, cur.target_id);
            recordMovement({
              product_id: productRow.id, product_name: productRow.name,
              type: 'stock_take_legacy', quantity_delta: delta,
              balance_after_available: newQty,
              balance_after_reserved:  productRow.stock_reserved || 0,
              balance_after_damaged:   productRow.stock_damaged || 0,
              reason: cur.reason || 'تعديل كمية', reference: cur.id,
              user_id: cur.requester_id, user_name: cur.requester_name,
            });
          }
        }
      }
      // New movement-based stock out — payload carries { quantity, reason, unit_cost }
      if (cur.type === 'stock_out_movement' && cur.target_id) {
        let p = {};
        try { p = JSON.parse(cur.payload || '{}'); } catch {}
        const qty = Math.max(0, Number(p.quantity) || 0);
        const productRow = db.prepare('SELECT * FROM products WHERE id = ?').get(cur.target_id);
        if (productRow && qty > 0) {
          const newAvail = Math.max(0, (productRow.stock || 0) - qty);
          db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(newAvail, productRow.id);
          recordMovement({
            product_id: productRow.id, product_name: productRow.name,
            type: 'out', quantity_delta: -qty,
            balance_after_available: newAvail,
            balance_after_reserved:  productRow.stock_reserved || 0,
            balance_after_damaged:   productRow.stock_damaged || 0,
            reason: p.reason || cur.reason || 'صرف',
            reference: cur.id,
            unit_cost: Number(p.unit_cost) || Number(productRow.cost) || 0,
            user_id: cur.requester_id, user_name: cur.requester_name,
          });
        }
      }
    }

    db.prepare(`
      UPDATE approvals SET status = ?, resolution_note = ?, resolved_at = datetime('now')
      WHERE id = ?
    `).run(status, resolution_note || null, req.params.id);

    const fresh = db.prepare('SELECT * FROM approvals WHERE id = ?').get(req.params.id);
    try { fresh.payload = JSON.parse(fresh.payload || '{}'); } catch { fresh.payload = {}; }

    // Reply message → routes to the *original requester* only.
    const recipient = cur.requester_id || cur.requester;
    if (recipient && recipient !== SUPER_ADMIN_FALLBACK) {
      const subject = status === 'approved'
        ? `تمت الموافقة على طلبك: ${cur.target_label || cur.type}`
        : `تم رفض طلبك: ${cur.target_label || cur.type}`;
      const bodyLines = [];
      if (cur.target_label) bodyLines.push(`الموضوع: ${cur.target_label}`);
      if (cur.reason)        bodyLines.push(`السبب الأصلي: ${cur.reason}`);
      if (resolution_note)   bodyLines.push(`${status === 'rejected' ? 'سبب الرفض' : 'ملاحظة Super Admin'}: ${resolution_note}`);
      sendMessage({
        from_user_id: SUPER_ADMIN_FALLBACK,
        from_user_name: 'Super Admin',
        to_user_id: recipient,
        type: status === 'approved' ? 'approval' : 'rejection',
        subject,
        body: bodyLines.join('\n'),
        metadata: { approval_id: cur.id, approval_type: cur.type, original_request: true },
      });
    }
    res.json(fresh);
  } catch (e) { console.error('PATCH /api/approvals', e); res.status(500).json({ error: e.message }); }
});

// ── MESSAGES (inbox) ──────────────────────────────────────────────────────────
// GET /api/messages?to=<email>&unread=1 — inbox for one user.
// POST /api/messages — send a one-off (used for tests / direct admin notes).
// PATCH /api/messages/:id/read — mark single message as read.
app.get('/api/messages', (req, res) => {
  try {
    const { to, unread } = req.query;
    let sql = 'SELECT * FROM messages WHERE 1=1';
    const params = [];
    if (to)     { sql += ' AND LOWER(to_user_id) = LOWER(?)'; params.push(to); }
    if (unread) { sql += ' AND read_at IS NULL'; }
    sql += ' ORDER BY created_at DESC LIMIT 200';
    const rows = db.prepare(sql).all(...params).map(r => {
      try { r.metadata = JSON.parse(r.metadata || '{}'); } catch { r.metadata = {}; }
      return r;
    });
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/messages', (req, res) => {
  try {
    const m = req.body || {};
    if (!m.to_user_id) return res.status(400).json({ error: 'to_user_id required' });
    const id = sendMessage(m);
    res.json({ ok: true, id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.patch('/api/messages/:id/read', (req, res) => {
  try {
    const info = db.prepare("UPDATE messages SET read_at = datetime('now') WHERE id = ? AND read_at IS NULL").run(req.params.id);
    res.json({ ok: true, changed: info.changes });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.patch('/api/messages/read-all', (req, res) => {
  try {
    const { to } = req.body || {};
    if (!to) return res.status(400).json({ error: 'to required' });
    db.prepare("UPDATE messages SET read_at = datetime('now') WHERE LOWER(to_user_id) = LOWER(?) AND read_at IS NULL").run(to);
    res.json({ ok: true });
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

// ── EXPENSES ──────────────────────────────────────────────────────────────────
// Categories are now DB-backed via expense_categories. The legacy enum is
// kept ONLY as a fallback for validation when category_id isn't supplied —
// older clients still POST the bare `category` slug, which we accept.
const LEGACY_CATEGORY_KEYS = new Set([
  'salaries','marketing','packing','shipping','overhead','general',
  'purchases','banking','taxes','returns',
]);
const EXPENSE_PAYMENT_METHODS = new Set(['cash','transfer','card','wallet']);
const EXPENSE_TYPES = new Set(['fixed','variable']);

// Returns the configured "expense approval required above X EGP" threshold.
// Stored in settings.store.expense_approval_* (set via Settings → المصروفات).
function getExpenseApprovalConfig() {
  try {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('store');
    const store = row ? JSON.parse(row.value || '{}') : {};
    return {
      enabled:   !!store.expense_approval_enabled,
      threshold: Number(store.expense_approval_threshold) || 0,
    };
  } catch { return { enabled: false, threshold: 0 }; }
}

function expenseRowOut(r) {
  if (!r) return null;
  // Cast booleans + numbers for the frontend
  return {
    ...r,
    is_recurring: !!r.is_recurring,
  };
}

app.get('/api/expenses', (req, res) => {
  try {
    const { month, year, category, category_id, from, to, status, type, payment_method, supplier_id, q } = req.query;
    let sql = 'SELECT * FROM expenses WHERE 1=1';
    const params = [];
    if (category)        { sql += ' AND category = ?';        params.push(category); }
    if (category_id)     { sql += ' AND category_id = ?';     params.push(category_id); }
    if (status)          { sql += ' AND status = ?';          params.push(status); }
    if (type)            { sql += ' AND type = ?';            params.push(type); }
    if (payment_method)  { sql += ' AND payment_method = ?';  params.push(payment_method); }
    if (supplier_id)     { sql += ' AND supplier_id = ?';     params.push(supplier_id); }
    if (q)               { sql += ' AND (description LIKE ? OR notes LIKE ?)'; const like = `%${q}%`; params.push(like, like); }
    if (from) { sql += ' AND date >= ?'; params.push(from); }
    if (to)   { sql += ' AND date <= ?'; params.push(to); }
    if (month && year) {
      const mm = String(month).padStart(2, '0');
      sql += ' AND date >= ? AND date <= ?';
      params.push(`${year}-${mm}-01`, `${year}-${mm}-31`);
    } else if (year) {
      sql += ' AND date >= ? AND date <= ?';
      params.push(`${year}-01-01`, `${year}-12-31`);
    }
    sql += ' ORDER BY date DESC, created_at DESC';
    const rows = db.prepare(sql).all(...params).map(expenseRowOut);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

function computeAmount(qty, unit, given) {
  const computed = (Number(qty)||0) * (Number(unit)||0);
  if (given !== undefined && given !== null && given !== '' && !Number.isNaN(Number(given))) return Number(given);
  return computed;
}

// Resolve a category slug → id, or accept an id directly. Returns null/null on
// invalid input so the caller can 400 out.
function resolveCategory({ category, category_id }) {
  if (category_id) {
    const row = db.prepare('SELECT id, key FROM expense_categories WHERE id = ?').get(category_id);
    if (row) return { id: row.id, key: row.key };
  }
  if (category) {
    const row = db.prepare('SELECT id, key FROM expense_categories WHERE key = ?').get(category);
    if (row) return { id: row.id, key: row.key };
    // Legacy enum fallback — accept the bare slug without a DB row
    if (LEGACY_CATEGORY_KEYS.has(category)) return { id: null, key: category };
  }
  return { id: null, key: null };
}

app.post('/api/expenses', (req, res) => {
  try {
    const e = req.body || {};
    const cat = resolveCategory(e);
    if (!cat.key) return res.status(400).json({ error: 'category required' });

    const id = e.id || `ex_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
    const qty  = Number(e.quantity)   || 0;
    const unit = Number(e.unit_price) || 0;
    const amt  = computeAmount(qty, unit, e.amount);
    const date = e.date || new Date().toISOString().slice(0,10);
    const type = EXPENSE_TYPES.has(e.type) ? e.type : 'variable';
    const pm   = EXPENSE_PAYMENT_METHODS.has(e.payment_method) ? e.payment_method : 'cash';

    // Approval workflow — if enabled and the expense crosses the threshold AND
    // the caller is not the super admin, mark as pending.
    const cfg = getExpenseApprovalConfig();
    const isSuper = e.created_by === SUPER_ADMIN_FALLBACK || e.actor_role === 'super_admin';
    let status = 'approved';
    if (cfg.enabled && cfg.threshold > 0 && amt >= cfg.threshold && !isSuper) {
      status = 'pending';
    }
    if (e.status === 'pending' || e.status === 'rejected' || e.status === 'approved') status = e.status;

    db.prepare(`
      INSERT INTO expenses (
        id, category, category_id, description, quantity, unit_price, amount, date, notes,
        type, supplier_id, payment_method, receipt_path, is_recurring,
        status, approved_by, approved_at, rejection_reason, created_by, source_ref
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      id, cat.key, cat.id, e.description||null, qty, unit, amt, date, e.notes||null,
      type, e.supplier_id || null, pm, e.receipt_path || null, e.is_recurring ? 1 : 0,
      status,
      status === 'approved' ? (e.created_by || SUPER_ADMIN_FALLBACK) : null,
      status === 'approved' ? new Date().toISOString() : null,
      null,
      e.created_by || null,
      e.source_ref || null,
    );

    // If pending → notify super admin via inbox.
    if (status === 'pending') {
      sendMessage({
        from_user_id: e.created_by || null,
        from_user_name: e.created_by_name || 'الإدارة',
        to_user_id: SUPER_ADMIN_FALLBACK,
        type: 'request',
        subject: `مصروف بانتظار الموافقة: ${(e.description||'').slice(0,60) || '—'}`,
        body: `${cat.key} · ${amt.toLocaleString()} ج`,
        metadata: { kind: 'expense_approval', expense_id: id, amount: amt, category: cat.key, requires_action: true },
      });
    }

    res.json({ ok: true, id, amount: amt, status });
  } catch (err) { console.error('POST /api/expenses error:', err); res.status(500).json({ error: err.message }); }
});

app.put('/api/expenses/:id', (req, res) => {
  try {
    const cur = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
    if (!cur) return res.status(404).json({ error: 'not found' });
    const e = req.body || {};

    const qty  = e.quantity   !== undefined ? Number(e.quantity)   : cur.quantity;
    const unit = e.unit_price !== undefined ? Number(e.unit_price) : cur.unit_price;
    const amt  = e.amount     !== undefined ? Number(e.amount)     : computeAmount(qty, unit);

    // Optional category change — resolve via slug OR id.
    let catKey = cur.category;
    let catId  = cur.category_id;
    if (e.category != null || e.category_id != null) {
      const resolved = resolveCategory(e);
      if (resolved.key) { catKey = resolved.key; catId = resolved.id; }
    }

    const type = e.type != null && EXPENSE_TYPES.has(e.type) ? e.type : cur.type;
    const pm   = e.payment_method != null && EXPENSE_PAYMENT_METHODS.has(e.payment_method) ? e.payment_method : cur.payment_method;

    db.prepare(`
      UPDATE expenses SET
        category        = ?,
        category_id     = ?,
        description     = COALESCE(?, description),
        quantity        = ?, unit_price = ?, amount = ?,
        date            = COALESCE(?, date),
        notes           = COALESCE(?, notes),
        type            = ?,
        supplier_id     = COALESCE(?, supplier_id),
        payment_method  = ?,
        receipt_path    = COALESCE(?, receipt_path),
        is_recurring    = COALESCE(?, is_recurring),
        updated_at      = datetime('now')
      WHERE id = ?
    `).run(
      catKey, catId,
      e.description ?? null, qty, unit, amt,
      e.date ?? null, e.notes ?? null,
      type, e.supplier_id ?? null, pm, e.receipt_path ?? null,
      e.is_recurring === undefined ? null : (e.is_recurring ? 1 : 0),
      req.params.id
    );
    res.json(expenseRowOut(db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id)));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/expenses/:id', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
    if (!info.changes) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Expense approval flow ────────────────────────────────────────────────────
app.post('/api/expenses/:id/approve', (req, res) => {
  try {
    const cur = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
    if (!cur) return res.status(404).json({ error: 'not found' });
    const actor = (req.body && req.body.actor) || SUPER_ADMIN_FALLBACK;
    db.prepare(`
      UPDATE expenses SET status = 'approved', approved_by = ?, approved_at = datetime('now'), rejection_reason = NULL
      WHERE id = ?
    `).run(actor, req.params.id);
    if (cur.created_by) {
      sendMessage({
        from_user_id: actor, from_user_name: 'Super Admin',
        to_user_id: cur.created_by, type: 'approval',
        subject: 'تمت الموافقة على مصروف',
        body: `${cur.description || '—'} · ${(cur.amount||0).toLocaleString()} ج`,
        metadata: { kind: 'expense_approved', expense_id: cur.id },
      });
    }
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/expenses/:id/reject', (req, res) => {
  try {
    const cur = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
    if (!cur) return res.status(404).json({ error: 'not found' });
    const actor  = (req.body && req.body.actor)  || SUPER_ADMIN_FALLBACK;
    const reason = (req.body && req.body.reason) || null;
    db.prepare(`
      UPDATE expenses SET status = 'rejected', approved_by = ?, approved_at = datetime('now'), rejection_reason = ?
      WHERE id = ?
    `).run(actor, reason, req.params.id);
    if (cur.created_by) {
      sendMessage({
        from_user_id: actor, from_user_name: 'Super Admin',
        to_user_id: cur.created_by, type: 'rejection',
        subject: 'تم رفض مصروف',
        body: reason || 'بدون سبب محدد',
        metadata: { kind: 'expense_rejected', expense_id: cur.id, reason },
      });
    }
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Recurring-expense suggestions: look at last month's expenses where
// is_recurring = 1, exclude any that already exist this month with the same
// description + supplier_id + category_id. Returns the list — frontend asks
// the user to confirm each one before copying it forward.
app.get('/api/expenses/recurring-suggestions', (req, res) => {
  try {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    const lastMonth = (() => {
      const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    })();
    const lastRows = db.prepare(`
      SELECT * FROM expenses WHERE is_recurring = 1 AND date >= ? AND date < ?
    `).all(`${lastMonth}-01`, `${thisMonth}-01`);
    const thisRows = db.prepare(`SELECT description, category_id, supplier_id FROM expenses WHERE date >= ? AND date < ?`)
      .all(`${thisMonth}-01`, `${(() => { const d=new Date(now.getFullYear(), now.getMonth()+1, 1); return d.toISOString().slice(0,10); })()}`);
    const seen = new Set(thisRows.map(r => `${r.description||''}|${r.category_id||''}|${r.supplier_id||''}`));
    const suggestions = lastRows
      .filter(r => !seen.has(`${r.description||''}|${r.category_id||''}|${r.supplier_id||''}`))
      .map(expenseRowOut);
    res.json({ suggestions });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Expense categories CRUD ──────────────────────────────────────────────────
app.get('/api/expense-categories', (req, res) => {
  try {
    const all = req.query.all === '1';
    const sql = all
      ? 'SELECT * FROM expense_categories ORDER BY sort_order, name_ar'
      : 'SELECT * FROM expense_categories WHERE active = 1 ORDER BY sort_order, name_ar';
    res.json(db.prepare(sql).all());
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/expense-categories', (req, res) => {
  try {
    const c = req.body || {};
    if (!c.name_ar) return res.status(400).json({ error: 'name_ar required' });
    const id  = c.id  || `ec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
    const key = c.key || String(c.name_ar).toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_؀-ۿ-]/g,'').slice(0,40) || `cat_${id.slice(-5)}`;
    const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order),0) AS m FROM expense_categories').get().m;
    db.prepare(`
      INSERT INTO expense_categories (id, key, name_ar, name_en, color, icon, is_default, active, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, 0, 1, ?)
    `).run(id, key, c.name_ar, c.name_en || null, c.color || '#6B7280', c.icon || null, (maxOrder || 0) + 1);
    res.json(db.prepare('SELECT * FROM expense_categories WHERE id = ?').get(id));
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.patch('/api/expense-categories/:id', (req, res) => {
  try {
    const cur = db.prepare('SELECT * FROM expense_categories WHERE id = ?').get(req.params.id);
    if (!cur) return res.status(404).json({ error: 'not found' });
    const c = req.body || {};
    db.prepare(`
      UPDATE expense_categories SET
        name_ar = COALESCE(?, name_ar),
        name_en = COALESCE(?, name_en),
        color   = COALESCE(?, color),
        icon    = COALESCE(?, icon),
        active  = COALESCE(?, active),
        sort_order = COALESCE(?, sort_order),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(c.name_ar ?? null, c.name_en ?? null, c.color ?? null, c.icon ?? null,
           c.active === undefined ? null : (c.active ? 1 : 0),
           c.sort_order ?? null, req.params.id);
    res.json(db.prepare('SELECT * FROM expense_categories WHERE id = ?').get(req.params.id));
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/expense-categories/:id', (req, res) => {
  try {
    const cur = db.prepare('SELECT * FROM expense_categories WHERE id = ?').get(req.params.id);
    if (!cur) return res.status(404).json({ error: 'not found' });
    if (cur.is_default) return res.status(400).json({ error: 'cannot delete a default category (you can deactivate it instead)' });
    const inUse = db.prepare('SELECT 1 FROM expenses WHERE category_id = ? LIMIT 1').get(req.params.id);
    if (inUse) return res.status(400).json({ error: 'category is in use by existing expenses' });
    db.prepare('DELETE FROM expense_categories WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Suppliers CRUD ──────────────────────────────────────────────────────────
app.get('/api/suppliers', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM suppliers WHERE active = 1 ORDER BY name').all();
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/suppliers', (req, res) => {
  try {
    const s = req.body || {};
    if (!s.name) return res.status(400).json({ error: 'name required' });
    const id = s.id || `sup_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
    db.prepare(`
      INSERT INTO suppliers (id, name, phone, email, notes)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(name) DO UPDATE SET
        phone = excluded.phone, email = excluded.email, notes = excluded.notes
    `).run(id, s.name, s.phone || null, s.email || null, s.notes || null);
    res.json(db.prepare('SELECT * FROM suppliers WHERE name = ?').get(s.name));
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.patch('/api/suppliers/:id', (req, res) => {
  try {
    const cur = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(req.params.id);
    if (!cur) return res.status(404).json({ error: 'not found' });
    const s = req.body || {};
    db.prepare(`
      UPDATE suppliers SET
        name   = COALESCE(?, name),
        phone  = COALESCE(?, phone),
        email  = COALESCE(?, email),
        notes  = COALESCE(?, notes),
        active = COALESCE(?, active)
      WHERE id = ?
    `).run(s.name ?? null, s.phone ?? null, s.email ?? null, s.notes ?? null,
           s.active === undefined ? null : (s.active ? 1 : 0),
           req.params.id);
    res.json(db.prepare('SELECT * FROM suppliers WHERE id = ?').get(req.params.id));
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/suppliers/:id', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM suppliers WHERE id = ?').run(req.params.id);
    if (!info.changes) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Category budgets (one row per category) ─────────────────────────────────
app.get('/api/expense-budgets', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT cb.category_id, cb.monthly_budget, c.key, c.name_ar, c.color
      FROM category_budgets cb
      LEFT JOIN expense_categories c ON c.id = cb.category_id
    `).all();
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/expense-budgets/:categoryId', (req, res) => {
  try {
    const amount = Number((req.body || {}).monthly_budget) || 0;
    db.prepare(`
      INSERT INTO category_budgets (category_id, monthly_budget, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(category_id) DO UPDATE SET
        monthly_budget = excluded.monthly_budget,
        updated_at     = datetime('now')
    `).run(req.params.categoryId, amount);
    res.json({ ok: true, category_id: req.params.categoryId, monthly_budget: amount });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Receipt upload (image OR pdf) ────────────────────────────────────────────
const RECEIPTS_DIR = path.join(__dirname, '..', 'uploads', 'receipts');
try { fs.mkdirSync(RECEIPTS_DIR, { recursive: true }); } catch {}
if (multer) {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 3 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const ok = /^(image\/(jpeg|png|webp)|application\/pdf)$/.test(file.mimetype);
      cb(ok ? null : new Error('only jpg / png / webp / pdf accepted'), ok);
    },
  });
  app.post('/api/expenses/upload-receipt', upload.single('receipt'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'no file' });
      const stamp = Date.now().toString(36) + Math.random().toString(36).slice(2,5);
      const isPdf = req.file.mimetype === 'application/pdf';
      // Images → convert to webp; PDFs → store raw
      let outPath;
      if (!isPdf && sharp) {
        outPath = path.join(RECEIPTS_DIR, `${stamp}.webp`);
        await sharp(req.file.buffer).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(outPath);
        return res.json({ ok: true, url: `/uploads/receipts/${stamp}.webp`, kind: 'image' });
      }
      // PDF (or no sharp): just write the bytes through
      const ext = isPdf ? 'pdf' : (req.file.mimetype.split('/')[1] || 'bin');
      outPath = path.join(RECEIPTS_DIR, `${stamp}.${ext}`);
      fs.writeFileSync(outPath, req.file.buffer);
      res.json({ ok: true, url: `/uploads/receipts/${stamp}.${ext}`, kind: isPdf ? 'pdf' : 'image' });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
} else {
  app.post('/api/expenses/upload-receipt', (_req, res) => res.status(503).json({ error: 'multer not installed on server' }));
}

// ── FINANCE — derived endpoints ───────────────────────────────────────────────
// Revenue: SUM(orders.total) where status != 'ملغي'
// COGS:    SUM over orders.items[*] of (item.qty * product.cost),  joined by
//          product name → products.cost (best-effort; falls back to 0).
// Net:     gross profit − expenses in range.

function parseOrderDateStr(s) {
  if (!s) return null;
  const d = new Date(s); if (!isNaN(d)) return d;
  const m = String(s).match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m) {
    const yr = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    return new Date(yr, Number(m[2]) - 1, Number(m[1]));
  }
  return null;
}
function inRangeISO(dateLike, fromISO, toISO) {
  const d = parseOrderDateStr(dateLike); if (!d) return false;
  const day = d.toISOString().slice(0,10);
  return (!fromISO || day >= fromISO) && (!toISO || day <= toISO);
}

function aggregateFinance(fromISO, toISO) {
  const orders   = db.prepare('SELECT * FROM orders').all();
  const products = db.prepare('SELECT name, cost FROM products').all();
  const expenses = db.prepare('SELECT * FROM expenses WHERE 1=1'
    + (fromISO ? ' AND date >= ?' : '')
    + (toISO   ? ' AND date <= ?' : '')).all(...[fromISO, toISO].filter(Boolean));
  const returnsRows = db.prepare('SELECT * FROM returns WHERE status = ?').all('refunded');

  const costByName = new Map(products.map(p => [(p.name||'').trim().toLowerCase(), Number(p.cost)||0]));
  const findCost = (name) => costByName.get(String(name||'').trim().toLowerCase()) || 0;

  let revenue = 0, cogs = 0, refunds = 0, orderCount = 0;
  const productAgg = new Map();
  orders.forEach(o => {
    if (!inRangeISO(o.created_at || o.date, fromISO, toISO)) return;
    if (o.status === 'ملغي') return;
    revenue += Number(o.total) || 0;
    orderCount++;
    let items = [];
    try { items = JSON.parse(o.items || '[]'); } catch {}
    items.forEach(it => {
      const qty   = Number(it.qty)   || 0;
      const price = Number(it.price) || 0;
      const cost  = findCost(it.name);
      cogs += cost * qty;
      const key = (it.name || '').trim() || '—';
      const prev = productAgg.get(key) || { name: key, qty: 0, revenue: 0, cost: 0 };
      prev.qty     += qty;
      prev.revenue += qty * price;
      prev.cost    += qty * cost;
      productAgg.set(key, prev);
    });
  });
  returnsRows.forEach(r => {
    if (!inRangeISO(r.created_at, fromISO, toISO)) return;
    refunds += Number(r.amount) || 0;
  });

  // Expenses by category in range
  const expensesByCategory = {};
  let expensesTotal = 0;
  expenses.forEach(x => {
    expensesByCategory[x.category] = (expensesByCategory[x.category] || 0) + (Number(x.amount)||0);
    expensesTotal += Number(x.amount) || 0;
  });

  const grossProfit = revenue - cogs;
  const netProfit   = grossProfit - expensesTotal - refunds;
  const margin      = revenue ? (netProfit / revenue) * 100 : 0;

  const topProducts = Array.from(productAgg.values())
    .map(p => ({ ...p,
      margin_pct: p.revenue ? Math.round(((p.revenue - p.cost) / p.revenue) * 100) : 0
    }))
    .sort((a,b) => b.revenue - a.revenue)
    .slice(0, 5);

  return { revenue, cogs, grossProfit, expensesTotal, refunds, netProfit, margin,
           orderCount, expensesByCategory, topProducts, expensesRows: expenses };
}

app.get('/api/finance/summary', (req, res) => {
  try {
    const { from, to } = req.query;
    const cur = aggregateFinance(from || null, to || null);

    // Previous-period KPIs (for % change). When range is omitted, prev is null.
    let prev = null;
    if (from && to) {
      const f = new Date(from), t = new Date(to);
      const days = Math.round((t - f) / 86400000) + 1;
      const prevFrom = new Date(f); prevFrom.setDate(prevFrom.getDate() - days);
      const prevTo   = new Date(f); prevTo.setDate(prevTo.getDate() - 1);
      prev = aggregateFinance(prevFrom.toISOString().slice(0,10), prevTo.toISOString().slice(0,10));
    }

    const pct = (a, b) => b ? Math.round(((a - b) / Math.abs(b)) * 100) : (a ? 100 : 0);
    res.json({
      revenue:        cur.revenue,
      cogs:           cur.cogs,
      gross_profit:   cur.grossProfit,
      expenses_total: cur.expensesTotal,
      net_profit:     cur.netProfit,
      margin_pct:     Math.round(cur.margin * 10) / 10,
      order_count:    cur.orderCount,
      refunds:        cur.refunds,
      expenses_by_category: cur.expensesByCategory,
      top_products: cur.topProducts,
      change: prev ? {
        revenue:        pct(cur.revenue,      prev.revenue),
        cogs:           pct(cur.cogs,         prev.cogs),
        gross_profit:   pct(cur.grossProfit,  prev.grossProfit),
        expenses_total: pct(cur.expensesTotal, prev.expensesTotal),
        net_profit:     pct(cur.netProfit,    prev.netProfit),
        margin_pct:     Math.round((cur.margin - prev.margin) * 10) / 10,
      } : null,
    });
  } catch (e) { console.error('GET /api/finance/summary error:', e); res.status(500).json({ error: e.message }); }
});

// Monthly chart data (revenue / expenses / net) for the last N months ending at `to`.
app.get('/api/finance/chart', (req, res) => {
  try {
    const { from, to } = req.query;
    const end   = to   ? new Date(to)   : new Date();
    const start = from ? new Date(from) : (() => { const d = new Date(end); d.setMonth(d.getMonth() - 11); d.setDate(1); return d; })();
    const months = [];
    const cur = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cur <= endMonth) {
      const y = cur.getFullYear(), m = cur.getMonth();
      const mFromISO = `${y}-${String(m+1).padStart(2,'0')}-01`;
      const last = new Date(y, m+1, 0); // last day of this month
      const mToISO = `${y}-${String(m+1).padStart(2,'0')}-${String(last.getDate()).padStart(2,'0')}`;
      const agg = aggregateFinance(mFromISO, mToISO);
      months.push({
        label: `${m+1}/${y}`,
        from: mFromISO, to: mToISO,
        revenue: agg.revenue, expenses: agg.expensesTotal,
        cogs: agg.cogs, net: agg.netProfit, gross: agg.grossProfit,
      });
      cur.setMonth(cur.getMonth() + 1);
    }
    res.json(months);
  } catch (e) { console.error('GET /api/finance/chart error:', e); res.status(500).json({ error: e.message }); }
});

// Expense breakdown by category for [from, to], plus same comparison vs prev period.
app.get('/api/finance/expenses', (req, res) => {
  try {
    const { from, to } = req.query;
    const cur = aggregateFinance(from || null, to || null);
    let prev = null;
    if (from && to) {
      const f = new Date(from), t = new Date(to);
      const days = Math.round((t - f) / 86400000) + 1;
      const prevFrom = new Date(f); prevFrom.setDate(prevFrom.getDate() - days);
      const prevTo   = new Date(f); prevTo.setDate(prevTo.getDate() - 1);
      prev = aggregateFinance(prevFrom.toISOString().slice(0,10), prevTo.toISOString().slice(0,10));
    }
    const allCats = new Set([...Object.keys(cur.expensesByCategory),
                             ...(prev ? Object.keys(prev.expensesByCategory) : [])]);
    const rows = Array.from(allCats).map(cat => {
      const amount = cur.expensesByCategory[cat] || 0;
      const prevAmt = prev ? (prev.expensesByCategory[cat] || 0) : 0;
      return {
        category: cat,
        amount,
        pct_of_revenue: cur.revenue ? Math.round((amount / cur.revenue) * 1000) / 10 : 0,
        change_pct:     prev ? (prevAmt ? Math.round(((amount - prevAmt) / Math.abs(prevAmt)) * 100) : (amount ? 100 : 0)) : null,
      };
    }).sort((a,b) => b.amount - a.amount);
    res.json({ rows, total: cur.expensesTotal, revenue: cur.revenue });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── INVENTORY (current state across all products) ────────────────────────────
app.get('/api/inventory', (_req, res) => {
  try {
    const rows = db.prepare(`
      SELECT id, name, sku, category, brand, cost, alert_threshold,
             stock AS available, stock_reserved AS reserved, stock_damaged AS damaged,
             images, updated_at
      FROM products ORDER BY name ASC
    `).all();
    const out = rows.map(r => {
      let images = [];
      try { images = JSON.parse(r.images || '[]'); } catch {}
      const available = Number(r.available) || 0;
      const reserved  = Number(r.reserved)  || 0;
      const damaged   = Number(r.damaged)   || 0;
      const cost      = Number(r.cost)      || 0;
      return {
        ...r, images,
        available, reserved, damaged,
        total: available + reserved + damaged,
        value_at_cost: cost * available,
      };
    });
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── STOCK MOVEMENTS (audit history + new mutation surface) ───────────────────
app.get('/api/stock-movements', (req, res) => {
  try {
    const { product_id, type, from, to } = req.query;
    let sql = 'SELECT * FROM stock_movements WHERE 1=1';
    const params = [];
    if (product_id) { sql += ' AND product_id = ?'; params.push(product_id); }
    if (type)       { sql += ' AND type = ?';       params.push(type); }
    if (from)       { sql += ' AND created_at >= ?'; params.push(from); }
    if (to)         { sql += ' AND created_at <= ?'; params.push(to); }
    sql += ' ORDER BY created_at DESC LIMIT 500';
    res.json(db.prepare(sql).all(...params));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Stock In — immediate. Adds to available + auto-creates an expense row
// for the purchase cost so Finance reflects the spend right away.
app.post('/api/stock-movements/in', (req, res) => {
  try {
    const b = req.body || {};
    if (!b.product_id) return res.status(400).json({ error: 'product_id required' });
    const qty = Math.max(0, Number(b.quantity) || 0);
    if (!qty) return res.status(400).json({ error: 'quantity must be > 0' });
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(b.product_id);
    if (!product) return res.status(404).json({ error: 'product not found' });
    const unitCost = Number(b.unit_cost) || Number(product.cost) || 0;

    const newAvail = (product.stock || 0) + qty;
    db.prepare('UPDATE products SET stock = ?, cost = COALESCE(NULLIF(?,0), cost) WHERE id = ?')
      .run(newAvail, unitCost, product.id);

    const mvId = recordMovement({
      product_id: product.id, product_name: product.name,
      type: 'in', quantity_delta: +qty,
      balance_after_available: newAvail,
      balance_after_reserved:  product.stock_reserved || 0,
      balance_after_damaged:   product.stock_damaged || 0,
      reason: b.supplier ? `وارد جديد — مورد: ${b.supplier}` : 'وارد جديد',
      reference: b.reference || null, unit_cost: unitCost,
      user_id: b.user_id || null, user_name: b.user_name || null,
    });

    // Auto-expense: stock purchase cost
    if (unitCost > 0) {
      const expId = `ex_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
      db.prepare(`
        INSERT INTO expenses (id, category, description, quantity, unit_price, amount, date, notes)
        VALUES (?, 'general', ?, ?, ?, ?, date('now'), ?)
      `).run(expId,
        `وارد — ${product.name}${b.supplier ? ' (' + b.supplier + ')' : ''}`,
        qty, unitCost, unitCost * qty, b.notes || `حركة #${mvId}`);
    }

    res.json({ ok: true, movement_id: mvId, available: newAvail });
  } catch (e) { console.error('POST /api/stock-movements/in', e); res.status(500).json({ error: e.message }); }
});

// Stock Out — needs super-admin approval. Does NOT touch stock here; just
// creates an approval request. The PATCH /api/approvals handler applies the
// movement when status === approved (see stock_out_movement branch above).
app.post('/api/stock-movements/out', (req, res) => {
  try {
    const b = req.body || {};
    if (!b.product_id) return res.status(400).json({ error: 'product_id required' });
    const qty = Math.max(0, Number(b.quantity) || 0);
    if (!qty) return res.status(400).json({ error: 'quantity must be > 0' });
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(b.product_id);
    if (!product) return res.status(404).json({ error: 'product not found' });
    if (qty > (product.stock || 0))
      return res.status(400).json({ error: 'الكمية أكبر من المتاح' });

    const apId = `ap_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
    db.prepare(`
      INSERT INTO approvals
        (id, type, target_id, target_label, requester, requester_id, requester_name, payload, reason, status)
      VALUES (?, 'stock_out_movement', ?, ?, ?, ?, ?, ?, ?, 'pending')
    `).run(apId, product.id, product.name,
      b.user_id || null, b.user_id || null, b.user_name || null,
      JSON.stringify({ quantity: qty, reason: b.reason || '', unit_cost: Number(b.unit_cost) || Number(product.cost) || 0, notes: b.notes || '' }),
      b.reason || null);

    sendMessage({
      from_user_id: b.user_id || null,
      from_user_name: b.user_name || null,
      to_user_id: SUPER_ADMIN_FALLBACK,
      type: 'request',
      subject: `طلب صرف مخزون — ${product.name}`,
      body: [
        `المنتج: ${product.name}`,
        `الكمية: ${qty}`,
        `السبب: ${b.reason || '—'}`,
        b.notes ? `ملاحظات: ${b.notes}` : null,
        b.user_name ? `الطالب: ${b.user_name}` : null,
      ].filter(Boolean).join('\n'),
      metadata: { approval_id: apId, approval_type: 'stock_out_movement', target_id: product.id, requires_action: true },
    });
    res.json({ ok: true, approval_id: apId, status: 'pending' });
  } catch (e) { console.error('POST /api/stock-movements/out', e); res.status(500).json({ error: e.message }); }
});

// Stock Take — bulk update. Body: { counts: [{product_id, counted}, ...] }
// Records one `stock_take` movement per product that has a non-zero diff and
// updates stock to the counted value. Immediate.
app.post('/api/stock-movements/stock-take', (req, res) => {
  try {
    const b = req.body || {};
    const counts = Array.isArray(b.counts) ? b.counts : [];
    if (!counts.length) return res.status(400).json({ error: 'counts array required' });
    const results = [];
    counts.forEach(c => {
      if (!c.product_id) return;
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(c.product_id);
      if (!product) return;
      const counted = Math.max(0, Number(c.counted) || 0);
      const oldQty  = product.stock || 0;
      const delta   = counted - oldQty;
      if (delta === 0) return;
      db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(counted, product.id);
      const mvId = recordMovement({
        product_id: product.id, product_name: product.name,
        type: 'stock_take', quantity_delta: delta,
        balance_after_available: counted,
        balance_after_reserved:  product.stock_reserved || 0,
        balance_after_damaged:   product.stock_damaged || 0,
        reason: b.reason || 'تعديل جرد',
        reference: b.reference || null,
        user_id: b.user_id || null, user_name: b.user_name || null,
      });
      results.push({ product_id: product.id, delta, movement_id: mvId });
    });
    res.json({ ok: true, applied: results.length, results });
  } catch (e) { console.error('POST /api/stock-movements/stock-take', e); res.status(500).json({ error: e.message }); }
});

// ── Customer recategorize: one full sweep on boot + nightly via cron ────────
try {
  const stats = recategorizeAll();
  if (stats.changed) console.log(`[nawra-api] startup recategorize: ${stats.changed}/${stats.total} customers updated`);
} catch (e) { console.warn('[nawra-api] startup recategorize failed:', e.message); }

if (cron) {
  // Every day at 02:00 — the "inactive after 90 days" rule needs date-driven
  // re-eval even when nothing else has changed.
  cron.schedule('0 2 * * *', () => {
    try {
      const stats = recategorizeAll();
      console.log(`[nawra-api] nightly recategorize: ${stats.changed}/${stats.total} customers updated`);
    } catch (e) { console.warn('[nawra-api] nightly recategorize failed:', e.message); }
  }, { timezone: 'Africa/Cairo' });
  console.log('[nawra-api] ✓ nightly customer-recategorize cron registered (02:00 Africa/Cairo)');
}

app.listen(PORT, '127.0.0.1', () =>
  console.log(`[nawra-api] listening on http://127.0.0.1:${PORT}`)
);
