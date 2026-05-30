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
ensureColumn('orders',    'payment_settled_at', 'DATETIME');                  // when cash actually arrived: COD auto-fills on delivery; online fills on gateway confirmation (Phase 1 fills on delivery + manual PATCH to paid)
// Backfill payment_settled_at for already-paid orders so historical Cash In
// aggregates are not zero. Best proxy for when the cash actually arrived:
// updated_at on the row (the moment status was last touched, typically the
// مكتمل transition). Falls back to created_at when updated_at is missing.
(() => {
  try {
    // `orders` has no updated_at column; created_at is the best available
    // proxy for legacy paid rows. Future paid-transitions stamp the actual
    // settlement time via the PATCH handler.
    const info = db.prepare(`
      UPDATE orders SET payment_settled_at = created_at
      WHERE payment_status = 'paid' AND payment_settled_at IS NULL
    `).run();
    if (info.changes > 0) console.log(`[nawra-api] backfilled payment_settled_at for ${info.changes} historically-paid orders`);
  } catch (e) { console.warn('[nawra-api] payment_settled_at backfill skipped:', e.message); }
})();

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

// ── Returns Phase 1: multi-item + audit trail ───────────────────────────────
// Extends the legacy returns row with the columns the new admin pages need.
// All additive; legacy POST shape still works (product/customer/reason on
// the row itself). New POSTs may also write return_items rows for the
// per-line refund breakdown.
ensureColumn('returns', 'return_number',     'TEXT');                          // RET-0001 (unique, backfilled below)
ensureColumn('returns', 'customer_id',       'TEXT');                          // FK → users.email (preferred over customer_email)
ensureColumn('returns', 'reason_id',         'TEXT');                          // FK → return_reasons.id (legacy `reason` kept as fallback)
ensureColumn('returns', 'customer_notes',    'TEXT');                          // free-text from customer
ensureColumn('returns', 'refund_method',     'TEXT');                          // cash | transfer | wallet | store_credit | exchange
ensureColumn('returns', 'refund_reference',  'TEXT');                          // txn/transfer id once processed
ensureColumn('returns', 'refund_shipping',   'INTEGER DEFAULT 0');             // 1 = also refund shipping cost
ensureColumn('returns', 'shipping_refund',   'REAL DEFAULT 0');                // computed amount
ensureColumn('returns', 'discount_refund',   'REAL DEFAULT 0');                // proportional coupon refund
ensureColumn('returns', 'requested_at',      'DATETIME');                      // when customer requested (defaults to created_at)
ensureColumn('returns', 'reviewed_at',       'DATETIME');                      // when admin first actioned approve/reject
ensureColumn('returns', 'reviewed_by',       'TEXT');                          // admin email
ensureColumn('returns', 'processed_at',      'DATETIME');                      // when refund actually paid
ensureColumn('returns', 'processed_by',      'TEXT');                          // admin email
ensureColumn('returns', 'internal_notes',    'TEXT');                          // admin-only, not shown to customer
ensureColumn('returns', 'pickup_method',     "TEXT DEFAULT 'customer_ships'"); // home_pickup | customer_ships
ensureColumn('returns', 'pickup_address',    'TEXT');                          // when pickup_method=home_pickup
ensureColumn('returns', 'return_tracking',   'TEXT');                          // waybill from courier when customer ships
ensureColumn('returns', 'rejection_reason',  'TEXT');                          // when status=rejected

// Per-item refund breakdown — one return can contain many lines (this is
// the spec's "Products Card" data source). Legacy single-product returns
// continue to work with zero rows in this table (UI falls back to the
// `product` column on the parent row).
db.exec(`
  CREATE TABLE IF NOT EXISTS return_items (
    id              TEXT PRIMARY KEY,
    return_id       TEXT NOT NULL,
    order_item_idx  INTEGER,                      -- index into orders.items[] JSON
    product_id      TEXT,
    product_name    TEXT,
    product_image   TEXT,
    sku             TEXT,
    unit_price      REAL DEFAULT 0,
    quantity        INTEGER DEFAULT 1,
    refund_amount   REAL DEFAULT 0,
    condition       TEXT DEFAULT 'pending',       -- pending | good | partial_damage | full_damage
    restock_action  TEXT DEFAULT 'pending',       -- pending | restock_available | move_to_damaged | write_off
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
try { db.exec('CREATE INDEX IF NOT EXISTS idx_return_items_return ON return_items(return_id)'); } catch {}

db.exec(`
  CREATE TABLE IF NOT EXISTS return_reasons (
    id         TEXT PRIMARY KEY,
    name_ar    TEXT NOT NULL,
    name_en    TEXT,
    active     INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    is_default INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
// Seed the default reasons from the spec. Defaults are protected from
// hard-delete by the CRUD endpoints (renaming + hiding allowed instead).
(() => {
  const seeds = [
    { key: 'damaged_arrival', name_ar: 'وصل تالف',                     name_en: 'Arrived damaged' },
    { key: 'not_as_described',name_ar: 'المنتج مختلف عن الوصف',         name_en: 'Not as described' },
    { key: 'allergy',         name_ar: 'حساسية / تفاعل سلبي',            name_en: 'Allergy / adverse reaction' },
    { key: 'changed_mind',    name_ar: 'تغيير رأي',                      name_en: 'Changed mind' },
    { key: 'wrong_item',      name_ar: 'استلمت منتج خطأ',                name_en: 'Wrong item received' },
    { key: 'other',           name_ar: 'آخر',                            name_en: 'Other' },
  ];
  const ins = db.prepare(`
    INSERT INTO return_reasons (id, name_ar, name_en, active, sort_order, is_default)
    VALUES (?, ?, ?, 1, ?, 1)
    ON CONFLICT(id) DO NOTHING
  `);
  seeds.forEach((s, i) => ins.run(`rr_def_${s.key}`, s.name_ar, s.name_en, i + 1));
})();

db.exec(`
  CREATE TABLE IF NOT EXISTS return_attachments (
    id          TEXT PRIMARY KEY,
    return_id   TEXT NOT NULL,
    file_path   TEXT NOT NULL,                    -- /uploads/returns/...
    kind        TEXT DEFAULT 'photo',             -- photo | document
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
try { db.exec('CREATE INDEX IF NOT EXISTS idx_return_attachments_return ON return_attachments(return_id)'); } catch {}

db.exec(`
  CREATE TABLE IF NOT EXISTS return_activity_log (
    id           TEXT PRIMARY KEY,
    return_id    TEXT NOT NULL,
    event_type   TEXT NOT NULL,                   -- submitted | reviewed | approved | rejected | inspected | refund_processed | note_added | cancelled
    event_data   TEXT DEFAULT '{}',
    actor_id     TEXT,
    actor_name   TEXT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
try { db.exec('CREATE INDEX IF NOT EXISTS idx_return_activity_return ON return_activity_log(return_id, created_at)'); } catch {}

// Unique index on return_number — partial so legacy rows with NULL don't
// collide. Backfills below populate the column for any pre-existing rows.
try { db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_returns_number ON returns(return_number) WHERE return_number IS NOT NULL'); } catch {}
(() => {
  try {
    const max = db.prepare("SELECT COALESCE(MAX(CAST(SUBSTR(return_number, 5) AS INTEGER)), 0) AS m FROM returns WHERE return_number LIKE 'RET-%'").get().m || 0;
    const missing = db.prepare('SELECT id FROM returns WHERE return_number IS NULL ORDER BY created_at ASC').all();
    if (!missing.length) return;
    const upd = db.prepare('UPDATE returns SET return_number = ? WHERE id = ?');
    let n = max;
    db.transaction(() => { missing.forEach(r => { n += 1; upd.run(`RET-${String(n).padStart(4,'0')}`, r.id); }); })();
    console.log(`[nawra-api] backfilled return_number for ${missing.length} legacy returns`);
  } catch (e) { console.warn('[nawra-api] return_number backfill skipped:', e.message); }
})();
// Backfill requested_at from created_at for legacy rows missing it.
try { db.prepare('UPDATE returns SET requested_at = created_at WHERE requested_at IS NULL').run(); } catch {}

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
ensureColumn('products', 'weight_kg',            'REAL DEFAULT 0.3');           // per-unit weight; drives shipment weight auto-calc

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
ensureColumn('users', 'store_credit_balance',  'REAL DEFAULT 0');

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
ensureColumn('expenses', 'status',           "TEXT DEFAULT 'approved'");        // approved | pending | rejected | pending_budget_approval
ensureColumn('expenses', 'approved_by',      'TEXT');                            // admin email/id
ensureColumn('expenses', 'approved_at',      'DATETIME');
ensureColumn('expenses', 'rejection_reason', 'TEXT');
ensureColumn('expenses', 'created_by',       'TEXT');                            // admin email/id who added the row
ensureColumn('expenses', 'category_id',      'TEXT');                            // optional FK → expense_categories.id
ensureColumn('expenses', 'source_ref',       'TEXT');                            // e.g. "return:<id>" when auto-generated
ensureColumn('expenses', 'beneficiary_type', "TEXT DEFAULT 'supplier'");        // supplier | employee | platform | government | other
ensureColumn('expenses', 'budget_override_reason', 'TEXT');                      // populated when a pending_budget_approval expense is approved
ensureColumn('expenses', 'payment_date',        'DATETIME');                     // NULL = approved-but-not-yet-paid; set = actual cash-out date (Cash Out calc reads this)

// ── Phase 1 Catalog/Stock refactor: products column additions ───────────────
// WAC = Weighted Average Cost — computed from purchase_invoice_items, NOT
// from manual entry on the product form anymore. The legacy `cost` column
// stays populated (mirrored from WAC) so any legacy query that reads it
// keeps working until the Phase 3 frontend lockdown lands.
ensureColumn('products', 'weighted_average_cost', 'REAL DEFAULT 0');
ensureColumn('products', 'last_purchase_date',    'DATETIME');
ensureColumn('products', 'last_purchase_price',   'REAL');
ensureColumn('products', 'total_purchased_qty',   'INTEGER DEFAULT 0');

// Enhanced supplier fields (spec Part D sidebar).
ensureColumn('suppliers', 'supplier_type',              "TEXT DEFAULT 'other'"); // distributor | merchant | importer | other
ensureColumn('suppliers', 'default_payment_terms_days', 'INTEGER DEFAULT 0');     // 0 = cash; >0 = N-days deferred

// ── Test-data isolation: is_test column on every smoke-pollutable table ─────
// Smoke tests set is_test=1 on every row they create. Every business-metric
// aggregation (Finance, Dashboard, product/customer KPIs) excludes is_test=1
// rows so synthetic test runs cannot move real numbers. Boot purge below
// nukes any is_test=1 row left over from a crashed/aborted smoke as a safety
// net. Default 0 on every row, including legacy data → no migration needed.
[
  'orders', 'products', 'users', 'shipments', 'expenses',
  'returns', 'return_items',
].forEach((t) => {
  ensureColumn(t, 'is_test', 'INTEGER DEFAULT 0');
  try { db.exec(`CREATE INDEX IF NOT EXISTS idx_${t}_is_test ON ${t}(is_test)`); } catch {}
});

// One-shot per (category, year-month) log used to suppress duplicate 80% budget warnings.
db.exec(`
  CREATE TABLE IF NOT EXISTS budget_warning_log (
    id          TEXT PRIMARY KEY,
    category_id TEXT NOT NULL,
    year_month  CHAR(7) NOT NULL,                  -- e.g. '2026-05'
    sent_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, year_month)
  )
`);

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

// Pre-aggregated monthly financial summary. Populated on-demand via
// POST /api/finance/backfill in Phase 1; will be filled nightly by a cron
// in Phase 3. Reads are MUCH cheaper than re-running aggregateFinance over
// raw orders/expenses every page load. Current month is always live-computed
// (never cached) so admin sees today's numbers without waiting for the cron.
db.exec(`
  CREATE TABLE IF NOT EXISTS finance_monthly_summary (
    id                    TEXT PRIMARY KEY,
    year                  INTEGER NOT NULL,
    month                 INTEGER NOT NULL,
    revenue               REAL DEFAULT 0,
    cogs                  REAL DEFAULT 0,
    gross_profit          REAL DEFAULT 0,
    total_expenses        REAL DEFAULT 0,
    net_profit            REAL DEFAULT 0,
    cash_in               REAL DEFAULT 0,
    cash_out              REAL DEFAULT 0,
    orders_count          INTEGER DEFAULT 0,
    customers_count       INTEGER DEFAULT 0,
    new_customers_count   INTEGER DEFAULT 0,
    updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year, month)
  )
`);
try { db.exec('CREATE INDEX IF NOT EXISTS idx_finance_summary_ym ON finance_monthly_summary(year, month)'); } catch {}

// ── Shipping Phase 1 — 4 tables + seed ──────────────────────────────────────
// `shipping_zones` replaces the legacy JSON blob in settings.shipping.zones.
// One row per geographic zone with explicit weight tiers + free-shipping
// threshold + active flag. Migration below copies the 5 default zones from
// the old JSON the first time (idempotent — only runs when the table is empty).
db.exec(`
  CREATE TABLE IF NOT EXISTS shipping_zones (
    id                       TEXT PRIMARY KEY,
    name_ar                  TEXT NOT NULL,
    name_en                  TEXT,
    governorates             TEXT DEFAULT '[]',         -- JSON array of governorate names
    base_price               REAL DEFAULT 0,
    base_weight              REAL DEFAULT 1,             -- kg covered by base_price
    extra_per_kg             REAL DEFAULT 0,             -- additional fee per kg above base
    min_days                 INTEGER DEFAULT 1,
    max_days                 INTEGER DEFAULT 3,
    free_shipping_threshold  REAL,                       -- NULL = use global default
    active                   INTEGER DEFAULT 1,
    sort_order               INTEGER DEFAULT 0,
    created_at               DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at               DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// `couriers` — shipping companies. One can be `is_default=1` (only one); the
// admin UI enforces this. `zone_ids` is a JSON array indicating which zones
// this courier serves (empty = any). Tracking URL has a {tracking_number}
// placeholder that the frontend substitutes when rendering a tracking link.
db.exec(`
  CREATE TABLE IF NOT EXISTS couriers (
    id                       TEXT PRIMARY KEY,
    name                     TEXT NOT NULL,
    description              TEXT,
    logo_path                TEXT,
    contact_name             TEXT,
    contact_phone            TEXT,
    contact_email            TEXT,
    tracking_url_template    TEXT,                       -- e.g., https://bosta.co/track/{tracking_number}
    internal_notes           TEXT,
    is_default               INTEGER DEFAULT 0,
    active                   INTEGER DEFAULT 0,          -- inactive by default; admin enables explicitly
    zone_ids                 TEXT DEFAULT '[]',          -- JSON array of shipping_zones.id (empty = all)
    sort_order               INTEGER DEFAULT 0,
    created_at               DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// `shipments` — one row per actual shipment (linked to an order). AWB number
// is the human-facing handle; admins typically work with the AWB, not the id.
// `customer_paid_*` columns capture what the customer actually paid so the
// shipping-margin KPI on the management page can compare against
// `courier_cost`. Status enum follows the spec's tab names directly.
db.exec(`
  CREATE TABLE IF NOT EXISTS shipments (
    id                       TEXT PRIMARY KEY,
    awb_number               TEXT,                       -- AWB-XXXX (unique below)
    order_id                 TEXT NOT NULL,
    courier_id               TEXT,
    zone_id                  TEXT,
    weight_kg                REAL DEFAULT 0,
    courier_cost             REAL DEFAULT 0,             -- what the store pays the courier
    customer_paid_shipping   REAL DEFAULT 0,             -- shipping fee paid by customer
    customer_paid_cod        REAL DEFAULT 0,             -- COD amount (if applicable)
    status                   TEXT DEFAULT 'ready',       -- ready|shipped|delivered|returned|cancelled
    shipped_at               DATETIME,
    delivered_at             DATETIME,
    expected_delivery_date   DATE,
    tracking_number          TEXT,
    signature_required       INTEGER DEFAULT 0,
    special_instructions     TEXT,
    internal_notes           TEXT,
    created_at               DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at               DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
try { db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_shipments_awb ON shipments(awb_number) WHERE awb_number IS NOT NULL'); } catch {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments(order_id)'); } catch {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status)'); } catch {}

// `shipment_status_history` — audit log of every status transition.
db.exec(`
  CREATE TABLE IF NOT EXISTS shipment_status_history (
    id                       TEXT PRIMARY KEY,
    shipment_id              TEXT NOT NULL,
    from_status              TEXT,
    to_status                TEXT NOT NULL,
    notes                    TEXT,
    actor_id                 TEXT,
    actor_name               TEXT,
    created_at               DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
try { db.exec('CREATE INDEX IF NOT EXISTS idx_shipment_history_shipment ON shipment_status_history(shipment_id, created_at)'); } catch {}

// ── Seed: migrate the 5 zones from legacy settings.shipping.zones ───────────
// Only runs once: if the shipping_zones table has no rows AND the legacy JSON
// has zones, copy them across with sensible defaults for the new fields.
// After migration, the admin UI is the source of truth — the legacy JSON
// becomes read-only/orphan. (Storefront still reads it through Phase 2; in
// Phase 2 the storefront switches to the new endpoint.)
(() => {
  try {
    const haveRows = db.prepare("SELECT COUNT(*) AS n FROM shipping_zones").get().n;
    if (haveRows > 0) return;
    const row = db.prepare("SELECT value FROM settings WHERE key = 'shipping'").get();
    if (!row) return;
    let legacy = {};
    try { legacy = JSON.parse(row.value || '{}'); } catch {}
    const zones = Array.isArray(legacy.zones) ? legacy.zones : [];
    if (!zones.length) return;
    const ins = db.prepare(`
      INSERT INTO shipping_zones
        (id, name_ar, name_en, governorates, base_price, base_weight, extra_per_kg,
         min_days, max_days, free_shipping_threshold, active, sort_order)
      VALUES (?, ?, NULL, ?, ?, 1, 0, ?, ?, NULL, 1, ?)
    `);
    zones.forEach((z, i) => {
      // Split the comma-separated governorate string into a JSON array of trimmed names.
      const govs = String(z.governorates || '')
        .split(/[،,]/)
        .map(s => s.trim())
        .filter(Boolean);
      // Parse "1-2" / "3-5" style strings into min/max.
      let [minD, maxD] = String(z.days || '1-2').split('-').map(s => parseInt(s.trim(), 10));
      if (!Number.isFinite(minD)) minD = 1;
      if (!Number.isFinite(maxD)) maxD = minD;
      ins.run(
        z.id || `zone_${i+1}`,
        z.name || `Zone ${i+1}`,
        JSON.stringify(govs),
        Number(z.price) || 0,
        minD, maxD,
        i + 1
      );
    });
    console.log(`[nawra-api] migrated ${zones.length} shipping zones from legacy settings.shipping.zones`);
  } catch (e) { console.warn('[nawra-api] shipping zone migration skipped:', e.message); }
})();

// ── Seed: 3 default couriers (Bosta, J&T, Aramex), all inactive ─────────────
(() => {
  try {
    const haveRows = db.prepare("SELECT COUNT(*) AS n FROM couriers").get().n;
    if (haveRows > 0) return;
    const seeds = [
      { id: 'cou_bosta',  name: 'Bosta',       desc: 'شركة شحن مصرية',         track: 'https://bosta.co/track/{tracking_number}', sort: 1 },
      { id: 'cou_jt',     name: 'J&T Express', desc: 'J&T Express Egypt',       track: 'https://www.jtexpress.eg/track?awb={tracking_number}', sort: 2 },
      { id: 'cou_aramex', name: 'Aramex',      desc: 'شركة أرامكس للشحن الدولي', track: 'https://www.aramex.com/track/results?ShipmentNumber={tracking_number}', sort: 3 },
    ];
    const ins = db.prepare(`
      INSERT INTO couriers (id, name, description, tracking_url_template, is_default, active, zone_ids, sort_order)
      VALUES (?, ?, ?, ?, 0, 0, '[]', ?)
    `);
    seeds.forEach(s => ins.run(s.id, s.name, s.desc, s.track, s.sort));
    console.log(`[nawra-api] seeded ${seeds.length} default couriers (all inactive)`);
  } catch (e) { console.warn('[nawra-api] courier seed skipped:', e.message); }
})();

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
    // Phase 3: 'purchases' category is DEPRECATED. Inventory purchases now
    // flow through the Purchases module (purchase_invoices), not expenses.
    // Seed removed. Any historical row in this category remains visible on
    // the Expenses page so the admin can reclassify, but new defaults won't
    // include it. The boot-time cleanup below hard-deletes the seed row
    // when no expenses reference it.
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
  // Phase 3: drop the deprecated 'purchases' category if no expenses still
  // reference it. If any row remains, the category survives so the row
  // stays renderable on the Expenses page (and gets a deprecation banner
  // in the UI). Idempotent.
  try {
    const purCat = db.prepare("SELECT id FROM expense_categories WHERE key = 'purchases'").get();
    if (purCat) {
      const using = db.prepare("SELECT COUNT(*) AS n FROM expenses WHERE category = 'purchases' OR category_id = ?").get(purCat.id).n;
      if (!using) {
        db.prepare("DELETE FROM expense_categories WHERE id = ?").run(purCat.id);
        console.log("[nawra-api] dropped deprecated 'purchases' expense category (no referencing expenses)");
      } else {
        console.log(`[nawra-api] 'purchases' category retained — ${using} expenses still reference it (will surface with deprecation banner)`);
      }
    }
  } catch (err) { console.warn('[nawra-api] purchases category cleanup skipped:', err.message); }
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

// ── Phase 1 Catalog/Stock refactor: purchases + supplier payments tables ────
// Purchase invoices replace the old "buy inventory as an expense" pattern.
// Every stock-in to products MUST flow through a purchase_invoice (except
// the explicit Stock Adjustment path with a written reason). WAC is recomputed
// on every purchase save and on cancel/delete via replay.
db.exec(`
  CREATE TABLE IF NOT EXISTS purchase_invoices (
    id                    TEXT PRIMARY KEY,
    invoice_number        TEXT UNIQUE NOT NULL,           -- PUR-XXXX, sequential
    supplier_id           TEXT,                            -- nullable for Opening Balance
    supplier_invoice_ref  TEXT,                            -- supplier's own invoice #
    is_opening_balance    INTEGER DEFAULT 0,               -- 1 = founder's setup, not a real supplier obligation
    invoice_date          DATE,                            -- when the supplier issued it
    received_date         DATETIME,                        -- when goods actually arrived (drives stock_in date)
    due_date              DATE,                            -- when payment is due (deferred only)
    subtotal              REAL DEFAULT 0,                  -- sum(items.line_total) before landed costs
    shipping_cost         REAL DEFAULT 0,
    customs_fees          REAL DEFAULT 0,
    other_costs           REAL DEFAULT 0,
    total                 REAL DEFAULT 0,                  -- subtotal + landed costs
    landed_basis          TEXT DEFAULT 'value',            -- value | weight (how landed costs distribute)
    payment_method        TEXT DEFAULT 'cash',             -- cash | transfer | card | deferred
    payment_status        TEXT DEFAULT 'unpaid',           -- unpaid | partial | paid
    amount_paid           REAL DEFAULT 0,
    status                TEXT DEFAULT 'draft',            -- draft | received | cancelled
    notes                 TEXT,
    internal_notes        TEXT,
    is_test               INTEGER DEFAULT 0,
    created_by            TEXT,
    created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
try { db.exec('CREATE INDEX IF NOT EXISTS idx_purchase_invoices_supplier ON purchase_invoices(supplier_id)'); } catch {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_purchase_invoices_status ON purchase_invoices(status)'); } catch {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_purchase_invoices_payment_status ON purchase_invoices(payment_status)'); } catch {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_purchase_invoices_received_date ON purchase_invoices(received_date)'); } catch {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_purchase_invoices_is_test ON purchase_invoices(is_test)'); } catch {}

db.exec(`
  CREATE TABLE IF NOT EXISTS purchase_invoice_items (
    id                       TEXT PRIMARY KEY,
    purchase_invoice_id      TEXT NOT NULL,
    product_id               TEXT NOT NULL,
    quantity                 INTEGER DEFAULT 0,
    unit_cost                REAL DEFAULT 0,                -- from supplier
    allocated_landed_cost    REAL DEFAULT 0,                -- proportional share of shipping+customs+other
    effective_unit_cost      REAL DEFAULT 0,                -- unit_cost + (allocated_landed_cost / quantity)
    line_total               REAL DEFAULT 0,                -- unit_cost * quantity (pre-landed)
    notes                    TEXT,
    is_test                  INTEGER DEFAULT 0,
    created_at               DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
try { db.exec('CREATE INDEX IF NOT EXISTS idx_purchase_invoice_items_invoice ON purchase_invoice_items(purchase_invoice_id)'); } catch {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_purchase_invoice_items_product ON purchase_invoice_items(product_id)'); } catch {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_purchase_invoice_items_is_test ON purchase_invoice_items(is_test)'); } catch {}

db.exec(`
  CREATE TABLE IF NOT EXISTS purchase_attachments (
    id                   TEXT PRIMARY KEY,
    purchase_invoice_id  TEXT NOT NULL,
    file_path            TEXT NOT NULL,
    file_type            TEXT,                              -- invoice | delivery_note | payment_receipt | other
    original_name        TEXT,
    is_test              INTEGER DEFAULT 0,
    uploaded_at          DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
ensureColumn('purchase_attachments', 'is_test', 'INTEGER DEFAULT 0');   // belt-and-braces for existing rows
try { db.exec('CREATE INDEX IF NOT EXISTS idx_purchase_attachments_invoice ON purchase_attachments(purchase_invoice_id)'); } catch {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_purchase_attachments_is_test ON purchase_attachments(is_test)'); } catch {}

db.exec(`
  CREATE TABLE IF NOT EXISTS purchase_activity_log (
    id                   TEXT PRIMARY KEY,
    purchase_invoice_id  TEXT NOT NULL,
    event                TEXT NOT NULL,                     -- created | received | cancelled | payment_recorded | edited
    notes                TEXT,
    actor_id             TEXT,
    actor_name           TEXT,
    metadata             TEXT,                              -- JSON for arbitrary event details
    is_test              INTEGER DEFAULT 0,
    created_at           DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
ensureColumn('purchase_activity_log', 'is_test', 'INTEGER DEFAULT 0');
try { db.exec('CREATE INDEX IF NOT EXISTS idx_purchase_activity_log_invoice ON purchase_activity_log(purchase_invoice_id)'); } catch {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_purchase_activity_log_is_test ON purchase_activity_log(is_test)'); } catch {}

db.exec(`
  CREATE TABLE IF NOT EXISTS supplier_payments (
    id               TEXT PRIMARY KEY,
    payment_number   TEXT UNIQUE NOT NULL,                  -- PAY-XXXX
    supplier_id      TEXT NOT NULL,
    amount           REAL DEFAULT 0,                        -- must equal sum of allocations
    payment_date     DATE,
    payment_method   TEXT DEFAULT 'cash',                   -- cash | transfer | card | wallet
    reference_number TEXT,                                  -- bank txn id / cheque # / etc
    receipt_path     TEXT,
    notes            TEXT,
    is_test          INTEGER DEFAULT 0,
    created_by       TEXT,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
try { db.exec('CREATE INDEX IF NOT EXISTS idx_supplier_payments_supplier ON supplier_payments(supplier_id)'); } catch {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_supplier_payments_payment_date ON supplier_payments(payment_date)'); } catch {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_supplier_payments_is_test ON supplier_payments(is_test)'); } catch {}

db.exec(`
  CREATE TABLE IF NOT EXISTS supplier_payment_allocations (
    id                   TEXT PRIMARY KEY,
    supplier_payment_id  TEXT NOT NULL,
    purchase_invoice_id  TEXT NOT NULL,
    amount_allocated     REAL DEFAULT 0,
    is_test              INTEGER DEFAULT 0,
    created_at           DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
try { db.exec('CREATE INDEX IF NOT EXISTS idx_supplier_payment_allocations_payment ON supplier_payment_allocations(supplier_payment_id)'); } catch {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_supplier_payment_allocations_invoice ON supplier_payment_allocations(purchase_invoice_id)'); } catch {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_supplier_payment_allocations_is_test ON supplier_payment_allocations(is_test)'); } catch {}

// ── Test-data self-heal ──────────────────────────────────────────────────────
// Two complementary mechanisms:
//   1. Marker-text purge — historical: any row with `__NAWRA_TEST__` in a
//      distinctive textual field gets nuked. Legacy smokes relied on this.
//   2. is_test column purge — Phase B: any row with is_test=1 gets nuked,
//      cascade-aware.
// Both run at boot. Both are also exposed via POST /api/test-data/purge so
// smokes can call cleanup explicitly in their atexit handler, rather than
// waiting for the next PM2 restart. The endpoint is safe to expose — it only
// touches rows that were explicitly tagged as test data, never real rows.
const TEST_MARKER = '__NAWRA_TEST__';
function purgeTestData() {
  const breakdown = {};
  const log = (label, n) => { if (n > 0) { breakdown[label] = (breakdown[label] || 0) + n; console.log(`[nawra-api] test-data purge: ${label} → removed ${n}`); } };

  // ── Pass 1: marker-text ───────────────────────────────────────────────────
  const targets = [
    { table: 'expenses',           field: 'description' },
    { table: 'orders',             field: 'name' },
    { table: 'products',           field: 'name' },
    { table: 'suppliers',          field: 'name' },
    { table: 'expense_categories', field: 'name_ar' },
    { table: 'users',              field: 'email' },
    { table: 'customer_notes',     field: 'note' },
    { table: 'messages',           field: 'subject' },
    { table: 'returns',            field: 'customer' },
  ];
  try {
    const orphanIds = db.prepare("SELECT id FROM returns WHERE customer LIKE ?").all(`%${TEST_MARKER}%`).map(r => r.id);
    if (orphanIds.length) {
      ['return_items', 'return_attachments', 'return_activity_log'].forEach(t => {
        try { log(`${t} (cascade)`, db.prepare(`DELETE FROM ${t} WHERE return_id IN (${orphanIds.map(()=>'?').join(',')})`).run(...orphanIds).changes); } catch {}
      });
    }
  } catch {}
  targets.forEach(({ table, field }) => {
    try { log(`${table}.${field}`, db.prepare(`DELETE FROM ${table} WHERE ${field} LIKE ?`).run(`%${TEST_MARKER}%`).changes); }
    catch (err) { console.warn(`[nawra-api] purge skipped for ${table}: ${err.message}`); }
  });
  try { log('return_items.product_name', db.prepare("DELETE FROM return_items WHERE product_name LIKE ?").run(`%${TEST_MARKER}%`).changes); } catch {}
  try {
    const orphanShipIds = db.prepare(`
      SELECT s.id FROM shipments s
      LEFT JOIN couriers c ON c.id = s.courier_id
      LEFT JOIN shipping_zones z ON z.id = s.zone_id
      WHERE (c.name LIKE ? OR z.name_ar LIKE ?)
    `).all(`%${TEST_MARKER}%`, `%${TEST_MARKER}%`).map(r => r.id);
    if (orphanShipIds.length) {
      const ph = orphanShipIds.map(() => '?').join(',');
      try { log('shipment_status_history (cascade)', db.prepare(`DELETE FROM shipment_status_history WHERE shipment_id IN (${ph})`).run(...orphanShipIds).changes); } catch {}
      try { log('shipments (cascade)',               db.prepare(`DELETE FROM shipments               WHERE id IN (${ph})`).run(...orphanShipIds).changes); } catch {}
    }
  } catch {}
  ['couriers', 'shipping_zones'].forEach((t) => {
    const field = t === 'couriers' ? 'name' : 'name_ar';
    try { log(`${t}.${field}`, db.prepare(`DELETE FROM ${t} WHERE ${field} LIKE ?`).run(`%${TEST_MARKER}%`).changes); }
    catch (err) { console.warn(`[nawra-api] purge skipped for ${t}: ${err.message}`); }
  });

  // ── Pass 2: is_test=1 column ──────────────────────────────────────────────
  try {
    const polluted = db.prepare(`
      SELECT id FROM shipments WHERE is_test = 1
      UNION
      SELECT s.id FROM shipments s JOIN orders o ON o.id = s.order_id WHERE o.is_test = 1
    `).all().map(r => r.id);
    if (polluted.length) {
      const ph = polluted.map(() => '?').join(',');
      log('is_test shipment_status_history', db.prepare(`DELETE FROM shipment_status_history WHERE shipment_id IN (${ph})`).run(...polluted).changes);
      log('is_test shipments',               db.prepare(`DELETE FROM shipments               WHERE id IN (${ph})`).run(...polluted).changes);
    }
  } catch (e) { console.warn('[nawra-api] is_test purge shipments cascade:', e.message); }
  try {
    const retIds = db.prepare("SELECT id FROM returns WHERE is_test = 1").all().map(r => r.id);
    if (retIds.length) {
      const ph = retIds.map(() => '?').join(',');
      log('is_test return_items',        db.prepare(`DELETE FROM return_items        WHERE return_id IN (${ph}) OR is_test = 1`).run(...retIds).changes);
      log('is_test return_attachments',  db.prepare(`DELETE FROM return_attachments  WHERE return_id IN (${ph})`).run(...retIds).changes);
      log('is_test return_activity_log', db.prepare(`DELETE FROM return_activity_log WHERE return_id IN (${ph})`).run(...retIds).changes);
      log('is_test returns',             db.prepare(`DELETE FROM returns             WHERE id IN (${ph})`).run(...retIds).changes);
    } else {
      try { log('is_test return_items (orphan)', db.prepare("DELETE FROM return_items WHERE is_test = 1").run().changes); } catch {}
    }
  } catch (e) { console.warn('[nawra-api] is_test purge returns cascade:', e.message); }
  // Purchase invoices cascade: items + attachments + activity log first,
  // then the invoice rows. is_test=1 purchase rows are categorically test
  // (including any opening-balance flagged as test).
  try {
    const purIds = db.prepare("SELECT id FROM purchase_invoices WHERE is_test = 1").all().map(r => r.id);
    if (purIds.length) {
      const ph = purIds.map(() => '?').join(',');
      log('is_test purchase_invoice_items',  db.prepare(`DELETE FROM purchase_invoice_items  WHERE purchase_invoice_id IN (${ph}) OR is_test = 1`).run(...purIds).changes);
      log('is_test purchase_attachments',    db.prepare(`DELETE FROM purchase_attachments    WHERE purchase_invoice_id IN (${ph})`).run(...purIds).changes);
      log('is_test purchase_activity_log',   db.prepare(`DELETE FROM purchase_activity_log   WHERE purchase_invoice_id IN (${ph})`).run(...purIds).changes);
      // Allocations pointing at deleted invoices need wiping too.
      log('is_test supplier_payment_allocations (invoice)',
          db.prepare(`DELETE FROM supplier_payment_allocations WHERE purchase_invoice_id IN (${ph})`).run(...purIds).changes);
      log('is_test purchase_invoices',       db.prepare(`DELETE FROM purchase_invoices       WHERE id IN (${ph})`).run(...purIds).changes);
    } else {
      try { log('is_test purchase_invoice_items (orphan)', db.prepare("DELETE FROM purchase_invoice_items WHERE is_test = 1").run().changes); } catch {}
    }
  } catch (e) { console.warn('[nawra-api] is_test purge purchases cascade:', e.message); }

  // Supplier payments + their allocations.
  try {
    const payIds = db.prepare("SELECT id FROM supplier_payments WHERE is_test = 1").all().map(r => r.id);
    if (payIds.length) {
      const ph = payIds.map(() => '?').join(',');
      log('is_test supplier_payment_allocations (payment)', db.prepare(`DELETE FROM supplier_payment_allocations WHERE supplier_payment_id IN (${ph}) OR is_test = 1`).run(...payIds).changes);
      log('is_test supplier_payments',                       db.prepare(`DELETE FROM supplier_payments                       WHERE id IN (${ph})`).run(...payIds).changes);
    } else {
      try { log('is_test supplier_payment_allocations (orphan)', db.prepare("DELETE FROM supplier_payment_allocations WHERE is_test = 1").run().changes); } catch {}
    }
  } catch (e) { console.warn('[nawra-api] is_test purge payments cascade:', e.message); }

  ['orders', 'expenses', 'products', 'users'].forEach((t) => {
    try { log(`is_test ${t}`, db.prepare(`DELETE FROM ${t} WHERE is_test = 1`).run().changes); }
    catch (e) { console.warn(`[nawra-api] is_test purge ${t}:`, e.message); }
  });

  const total = Object.values(breakdown).reduce((s, n) => s + n, 0);
  if (total === 0) console.log('[nawra-api] test-data purge: nothing to remove');
  else              console.log(`[nawra-api] test-data purge: removed ${total} rows total`);
  return { total, breakdown };
}

// Boot-time purge.
purgeTestData();

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

// ── Email safety guard ──────────────────────────────────────────────────────
// Hard, non-bypassable guard against smoke tests reaching production SMTP.
// Originated from a real incident: a Phase-2 smoke run sent ~10 emails to
// `__NAWRA_TEST__-...@nawra-test.local` which Gmail bounced back into the
// admin inbox. EVERY mailer.sendMail() call in this codebase now goes
// through safeSendMail() — there are no exceptions.
//
// Layer 1 (always on): block any recipient that LOOKS like a test address.
//   patterns: contains __TEST__, __NAWRA_TEST__, __SMOKE__ (case-insensitive)
//             ends with @nawra-test.local, @test.local, @example.com,
//             @example.org, @example.net
// Layer 2 (strict mode, default): also require the recipient to be either the
//   admin/sender, OR an email that already exists in the users table.
//   Override with EMAIL_SAFETY_MODE=permissive to disable layer 2 (useful for
//   staging where you legitimately email never-before-seen prospects).
//
// Blocked emails are LOGGED with subject + reason so we keep an audit trail
// — they're not silently dropped.
const EMAIL_SAFETY_MODE = (process.env.EMAIL_SAFETY_MODE || 'strict').toLowerCase();
const TEST_EMAIL_DOMAINS = new Set(['nawra-test.local','test.local','example.com','example.org','example.net','invalid','localhost']);
const TEST_EMAIL_MARKERS = ['__test__','__nawra_test__','__smoke__'];
function isTestRecipient(to) {
  const s = String(to || '').toLowerCase().trim();
  if (!s) return true; // empty == nothing to send to
  if (TEST_EMAIL_MARKERS.some(m => s.includes(m))) return true;
  const dom = s.split('@')[1] || '';
  if (TEST_EMAIL_DOMAINS.has(dom)) return true;
  return false;
}
async function safeSendMail(options) {
  // Always returns an info-shaped object so callers can do `info.messageId`
  // without null-checking. When blocked, messageId is null and `skipped`
  // explains why.
  if (!mailer) {
    console.log('[nawra-api] ✋ mail-skip: transport disabled (GMAIL_USER/PASS missing)');
    return { messageId: null, skipped: 'no_mailer' };
  }
  const to = options && options.to;
  // Layer 1 — universal test-address block (cannot be disabled).
  if (isTestRecipient(to)) {
    console.log(`[nawra-api] ✋ mail-block: test recipient | to=${to} subject="${(options && options.subject || '').slice(0,80)}"`);
    return { messageId: null, skipped: 'test_recipient', to };
  }
  // Layer 2 — strict mode: recipient must be admin OR a known customer.
  if (EMAIL_SAFETY_MODE === 'strict') {
    const t = String(to).toLowerCase().trim();
    const admin = (SUPER_ADMIN_FALLBACK || '').toLowerCase();
    const sender = (gmailUser || '').toLowerCase();
    let allowed = t === admin || t === sender;
    if (!allowed) {
      try {
        const row = db.prepare('SELECT 1 AS x FROM users WHERE LOWER(email) = ?').get(t);
        allowed = !!row;
      } catch {}
    }
    if (!allowed) {
      console.log(`[nawra-api] ✋ mail-block: strict mode, unknown recipient | to=${to} subject="${(options && options.subject || '').slice(0,80)}"`);
      return { messageId: null, skipped: 'strict_unknown_recipient', to };
    }
  }
  return mailer.sendMail(options);
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
    const info = await safeSendMail({
      from: `"نوّرَة Skincare" <${gmailUser}>`,
      to:   order.userEmail,
      subject: `✅ تم استلام طلبك من نوّرَة #${order.order_number || order.id}`,
      html: orderEmailHtml(order)
    });
    if (!info.skipped) console.log('[nawra-api] ✓ confirmation email sent to', order.userEmail, '|', info.messageId);
  } catch (err) {
    console.error('[nawra-api] ✗ email send failed for', order.userEmail, ':', err.message);
  }
}

// ── Return email templates ───────────────────────────────────────────────────
// One small reusable template — the heading + intro change per `kind` but the
// brand frame stays identical to the order confirmation aesthetic. Fires
// from the POST /api/returns + PATCH approve/reject/refunded handlers.
function returnEmailHtml({ kind, returnRow, customer, intro, items, totalRefund, extra }) {
  const lines = (items || []).map(it => `
    <tr style="border-top:1px solid rgba(201,169,110,.12);">
      <td style="padding:11px 13px; color:#fff; font-size:13px;">${(it.product_name || '').toString().replace(/</g,'&lt;')}</td>
      <td style="padding:11px 13px; color:rgba(255,255,255,.8); font-size:13px; text-align:center;">×${it.quantity || 1}</td>
      <td style="padding:11px 13px; color:#fff; font-size:13px; text-align:left;">${(Number(it.refund_amount)||0).toLocaleString()} ج</td>
    </tr>`).join('');
  const titleByKind = {
    submitted: '📦 تم استلام طلب الإرجاع',
    approved:  '✅ تمت الموافقة على إرجاعك',
    rejected:  '❌ نأسف — تم رفض طلب الإرجاع',
    refunded:  '💰 تم استرداد المبلغ',
  };
  return `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:30px 14px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#1a1a1a;color:#fff;border:1px solid rgba(201,169,110,.18);">
        <tr><td align="center" style="padding:32px 20px 24px;border-bottom:1px solid rgba(201,169,110,.18);">
          <div style="color:#c9a96e;font-size:38px;font-weight:400;letter-spacing:0.12em;font-family:'Times New Roman',serif;">نوّرَة</div>
          <div style="color:rgba(201,169,110,.6);font-size:11px;letter-spacing:0.3em;margin-top:5px;">SKINCARE&nbsp;&nbsp;E-SHOP</div>
        </td></tr>
        <tr><td align="center" style="padding:32px 20px 6px;">
          <h2 style="margin:6px 0 0;color:#fff;font-size:20px;font-weight:500;">${titleByKind[kind] || 'تحديث طلب الإرجاع'}</h2>
          <p style="color:rgba(255,255,255,.65);margin:8px 0 0;font-size:13.5px;">${intro || ''}</p>
        </td></tr>
        <tr><td style="padding:18px 28px 6px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(201,169,110,.18);padding-top:14px;">
            <tr><td style="color:rgba(255,255,255,.55);font-size:12px;">رقم المرتجع</td>
                <td style="color:#c9a96e;font-size:13px;text-align:left;font-family:monospace;">${returnRow.return_number}</td></tr>
            <tr><td style="color:rgba(255,255,255,.55);font-size:12px;padding-top:6px;">رقم الطلب الأصلي</td>
                <td style="color:#fff;font-size:13px;text-align:left;padding-top:6px;font-family:monospace;">#${returnRow.order_id || '—'}</td></tr>
          </table>
        </td></tr>
        ${lines ? `<tr><td style="padding:18px 28px 6px;">
          <h3 style="color:#c9a96e;font-size:12px;letter-spacing:0.22em;margin:0 0 10px;font-weight:600;">المنتجات</h3>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,.03);border:1px solid rgba(201,169,110,.15);">
            <thead><tr style="background:rgba(201,169,110,.1);">
              <th style="padding:9px 13px;text-align:right;color:#c9a96e;font-size:11px;font-weight:600;">المنتج</th>
              <th style="padding:9px 13px;text-align:center;color:#c9a96e;font-size:11px;font-weight:600;">الكمية</th>
              <th style="padding:9px 13px;text-align:left;color:#c9a96e;font-size:11px;font-weight:600;">القيمة</th>
            </tr></thead>
            <tbody>${lines}</tbody>
          </table>
        </td></tr>` : ''}
        ${totalRefund != null ? `<tr><td style="padding:14px 28px 6px;">
          <div style="border-top:1px solid rgba(201,169,110,.18);padding-top:12px;display:flex;justify-content:space-between;color:#fff;font-size:14px;">
            <span>الإجمالي المسترد</span><b style="color:#c9a96e;">${(Number(totalRefund)||0).toLocaleString()} ج</b>
          </div>
        </td></tr>` : ''}
        ${extra ? `<tr><td style="padding:16px 28px;color:rgba(255,255,255,.85);font-size:13px;line-height:1.7;">${extra}</td></tr>` : ''}
        <tr><td align="center" style="padding:22px 22px 28px;border-top:1px solid rgba(201,169,110,.18);">
          <p style="color:rgba(255,255,255,.45);font-size:11px;margin:0;">لأي استفسار راسلنا على واتساب أو ${gmailUser || 'nawraskincare@gmail.com'}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

async function sendReturnEmail(kind, returnId, extras = {}) {
  if (!mailer) { console.warn('[nawra-api] mailer disabled — skipping return email'); return; }
  try {
    const row = db.prepare('SELECT * FROM returns WHERE id = ?').get(returnId);
    if (!row) return;
    const toEmail = row.customer_id || row.customer_email;
    if (!toEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail)) {
      console.log('[nawra-api] return email skipped — no valid recipient for', row.return_number);
      return;
    }
    const items = db.prepare('SELECT * FROM return_items WHERE return_id = ?').all(returnId);
    const subjects = {
      submitted: `📦 تم استلام طلب إرجاعك ${row.return_number}`,
      approved:  `✅ تمت الموافقة على إرجاعك ${row.return_number}`,
      rejected:  `بشأن طلب الإرجاع ${row.return_number}`,
      refunded:  `💰 تم استرداد ${(Number(row.amount)||0).toLocaleString()} ج — ${row.return_number}`,
    };
    const intros = {
      submitted: 'شكراً لتواصلك معنا. فريقنا سيراجع طلبك خلال 24 ساعة.',
      approved:  'تمت الموافقة على طلبك. سيتم تنسيق استلام/استرداد المنتج قريباً.',
      rejected:  extras.reason ? `للأسف لم نتمكن من قبول الطلب: ${extras.reason}` : 'للأسف لم نتمكن من قبول هذا الطلب.',
      refunded:  `تم تنفيذ استرداد المبلغ${row.refund_method ? ` عبر ${({cash:'كاش',transfer:'تحويل بنكي',wallet:'محفظة',store_credit:'رصيد متجر',exchange:'استبدال'})[row.refund_method] || row.refund_method}` : ''}.`,
    };
    let extra = '';
    if (kind === 'refunded' && row.refund_reference) {
      extra = `<b>المرجع:</b> <span style="font-family:monospace;color:#c9a96e;">${row.refund_reference}</span>`;
    }
    if (kind === 'refunded' && row.refund_method === 'store_credit' && extras.store_credit) {
      extra = `تم إضافة <b>${extras.store_credit.credit.toLocaleString()} ج</b> إلى رصيدك (${extras.store_credit.base.toLocaleString()} ج + ${extras.store_credit.bonus_pct}% مكافأة).`;
    }
    const html = returnEmailHtml({ kind, returnRow: row, items, totalRefund: row.amount, intro: intros[kind], extra });
    const info = await safeSendMail({
      from: `"نوّرَة Skincare" <${gmailUser}>`,
      to: toEmail,
      subject: subjects[kind] || `تحديث طلب الإرجاع ${row.return_number}`,
      html,
    });
    if (!info.skipped) console.log(`[nawra-api] ✓ return email (${kind}) → ${toEmail} | ${info.messageId}`);
  } catch (err) {
    console.error('[nawra-api] ✗ return email failed:', err.message);
  }
}

app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now(), mailer: !!mailer }));

// POST /api/test-data/purge — explicit cleanup endpoint for smoke tests.
// Safe to expose: only deletes rows tagged is_test=1 or carrying the
// __NAWRA_TEST__ marker text, never touches real production rows.
// Smokes call this in their atexit handler so cleanup is immediate
// instead of waiting for the next PM2 restart.
app.post('/api/test-data/purge', (_req, res) => {
  try {
    const result = purgeTestData();
    res.json({ ok: true, ...result });
  } catch (e) { console.error('POST /api/test-data/purge', e); res.status(500).json({ error: e.message }); }
});

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
      is_test,
    } = req.body;
    if (!id || !name) return res.status(400).json({ error: 'id and name required' });

    const orderNumber = allocateOrderNumber();
    const isTest = is_test ? 1 : 0;

    // ── Phase 3: cost_snapshot ─────────────────────────────────────────
    // Stamp each line item with the product's current WAC at order-create
    // time. Finance COGS reads this snapshot so historical orders keep their
    // cost basis even after later purchases shift the product's WAC.
    // Falls back to legacy products.cost when WAC is 0 (pre-refactor data).
    const itemsWithCost = (Array.isArray(items) ? items : []).map(it => {
      // Honour caller-provided snapshot when set (admin manual order with
      // override), otherwise look up from products.
      if (it && Number(it.cost_snapshot) > 0) return { ...it };
      const p = findProductForItem(it);
      const wac = p ? (Number(p.weighted_average_cost) || Number(p.cost) || 0) : 0;
      return { ...it, cost_snapshot: wac };
    });

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
        subtotal, shipping_cost, discount_amount, coupon_code, status_history, is_test
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      String(id), date, name, phone, city, address,
      JSON.stringify(itemsWithCost), Number(total)||0, status||'\u062c\u062f\u064a\u062f',
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
      JSON.stringify(history),
      isTest,
    );

    if (userEmail) {
      upsertUser.run(userEmail, name||null, phone||null, Number(total)||0);
      // Propagate the test flag to the auto-upserted user so the user row is
      // also caught by every is_test=0 aggregation guard.
      if (isTest) db.prepare('UPDATE users SET is_test = 1 WHERE email = ?').run(userEmail);
      // Ensure registered_at is set for legacy rows where it's NULL.
      db.prepare("UPDATE users SET registered_at = COALESCE(registered_at, firstOrder) WHERE email = ?").run(userEmail);
      recategorizeOne(userEmail);
      logCustomerActivity(userEmail, 'order_placed', { order_id: String(id), order_number: orderNumber, total: Number(total)||0 });
    }

    // Reserve stock so the inventory page reflects what's locked to this order.
    // Skip for is_test=1 orders so smoke runs can't increment stock_reserved
    // on real products — the orphan reservation would survive the order purge
    // and drift inventory_value across every run.
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(String(id));
    if (!isTest) reserveStockForOrder(order, itemsWithCost);

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
    // Track whether this transition ought to stamp payment_settled_at (so we
    // only do it ONCE \u2014 first time the row becomes paid).
    let willBePaid = false;
    if (status != null)              { sets.push('status = ?');              vals.push(status); }
    if (payment_status != null)      { sets.push('payment_status = ?');      vals.push(payment_status); if (payment_status === 'paid' && cur.payment_status !== 'paid') willBePaid = true; }
    if (payment_reference != null)   { sets.push('payment_reference = ?');   vals.push(payment_reference); }
    if (cancellation_reason != null) { sets.push('cancellation_reason = ?'); vals.push(cancellation_reason); }
    sets.push('status_history = ?'); vals.push(JSON.stringify(history));

    // Auto-mark cash orders as paid on delivery. This is the COD revenue
    // recognition trigger \u2014 Cash In aggregates rely on payment_settled_at,
    // so we stamp it here too. Online payment methods stay unpaid until
    // their gateway callback (Phase 1: also covered by the willBePaid
    // branch above when an admin manually PATCHes payment_status=paid).
    if (status === '\u0645\u0643\u062a\u0645\u0644' && cur.payment_method === 'cash' && cur.payment_status !== 'paid') {
      sets.push('payment_status = ?'); vals.push('paid');
      willBePaid = true;
    }
    if (willBePaid && !cur.payment_settled_at) {
      sets.push("payment_settled_at = datetime('now')");
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
    const info = await safeSendMail({
      from: `"\u0646\u0648\u0651\u0631\u064e\u0629 Skincare" <${gmailUser}>`,
      to,
      subject: `\ud83e\uddfe \u0641\u0627\u062a\u0648\u0631\u0629 \u0637\u0644\u0628\u0643 \u0645\u0646 \u0646\u0648\u0651\u0631\u064e\u0629 #${order.order_number || order.id}`,
      html: orderEmailHtml(order),
    });
    if (info.skipped) {
      // Bail loudly so the admin UI shows the blocked-test feedback instead of pretending it sent.
      return res.status(409).json({ ok: false, blocked: info.skipped, to });
    }
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
    // is_test guard so smoke users don't move CRM KPIs.
    const NOT_TEST = '(is_test = 0 OR is_test IS NULL)';
    const total = db.prepare(`SELECT COUNT(*) AS n FROM users WHERE ${NOT_TEST}`).get().n;
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10) + ' 00:00:00';
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0,10) + ' 00:00:00';
    const newThisMonth = db.prepare(`SELECT COUNT(*) AS n FROM users WHERE ${NOT_TEST} AND COALESCE(registered_at, firstOrder) >= ?`).get(startOfThisMonth).n;
    const newLastMonth = db.prepare(`SELECT COUNT(*) AS n FROM users WHERE ${NOT_TEST} AND COALESCE(registered_at, firstOrder) >= ? AND COALESCE(registered_at, firstOrder) < ?`).get(startOfLastMonth, startOfThisMonth).n;
    const vip = db.prepare(`SELECT COUNT(*) AS n FROM users WHERE ${NOT_TEST} AND category = 'vip'`).get().n;
    const repeatCust = db.prepare(`SELECT COUNT(*) AS n FROM users WHERE ${NOT_TEST} AND totalOrders >= 2`).get().n;
    const repeatRate = total ? Math.round((repeatCust / total) * 100) : 0;
    const totalSpentAll = db.prepare(`SELECT COALESCE(SUM(totalSpent), 0) AS s FROM users WHERE ${NOT_TEST}`).get().s;
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
    const { email, name, phone, date_of_birth, gender, preferred_lang, is_test } = req.body || {};
    if (!email) return res.status(400).json({ error: 'email required' });
    db.prepare(`
      INSERT INTO users (email, name, phone, registered_at, totalOrders, totalSpent, category,
                         date_of_birth, gender, preferred_lang, is_test)
      VALUES (?, ?, ?, datetime('now'), 0, 0, 'new', ?, ?, ?, ?)
      ON CONFLICT(email) DO NOTHING
    `).run(email, name || null, phone || null, date_of_birth || null, gender || null, preferred_lang || 'ar', is_test ? 1 : 0);
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
    const info = await safeSendMail({
      from: `"نوّرَة Skincare" <${gmailUser}>`,
      to: email, subject: sub, html,
    });
    if (info.skipped) {
      // Don't pretend it sent — return 409 so the admin UI can flag it.
      return res.status(409).json({ ok: false, blocked: info.skipped, to: email });
    }
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
        const info = await safeSendMail({ from: `"نوّرَة Skincare" <${gmailUser}>`, to: email, subject: sub, html });
        if (info.skipped) {
          failed.push({ email, error: `blocked: ${info.skipped}` });
          continue;
        }
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
        weight_kg,
        is_test,
        created_at, updated_at
      ) VALUES (
        ?,?,?,?,?,?,?,?,
        ?,?,?,?,?,
        ?,?,?,?,?,?,
        ?,?,?,
        ?,?,
        ?,?,
        ?,?,?,?,?,?,
        ?,
        ?,
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
      p.archived ? 1 : 0,
      Number.isFinite(+p.weight_kg) ? +p.weight_kg : 0.3,
      p.is_test ? 1 : 0,
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
    // Block deletion when ANY non-test row references this product. Same
    // referential-integrity pattern used by couriers/shipping_zones (those
    // refuse delete when shipments reference them — see /api/shipping/*).
    // Real rows (is_test=0/NULL) only — smoke residue doesn't block.
    const pid = req.params.id;
    // Smoke-created products (is_test=1) bypass the guard so atexit cleanup
    // never gets stuck on synthetic history rows. Real products get blocked.
    const productRow = db.prepare('SELECT is_test FROM products WHERE id = ?').get(pid);
    if (!productRow) return res.status(404).json({ error: 'not found' });
    const isTestProduct = !!productRow.is_test;

    // Purchase invoice items — the asset-trail. Once a product has
    // purchase history, deleting it would orphan the WAC inputs and any
    // future replay would silently drop the row.
    const purItems = db.prepare(
      "SELECT COUNT(*) AS n FROM purchase_invoice_items i " +
      "JOIN purchase_invoices pi ON pi.id = i.purchase_invoice_id " +
      "WHERE i.product_id = ? AND (pi.is_test = 0 OR pi.is_test IS NULL)"
    ).get(pid).n;

    // Stock movements — audit trail. Same reasoning.
    const moves = db.prepare("SELECT COUNT(*) AS n FROM stock_movements WHERE product_id = ?").get(pid).n;

    // Return items pointing at this product.
    const retItems = db.prepare(
      "SELECT COUNT(*) AS n FROM return_items ri " +
      "JOIN returns r ON r.id = ri.return_id " +
      "WHERE ri.product_id = ? AND (r.is_test = 0 OR r.is_test IS NULL)"
    ).get(pid).n;

    // Orders (items are JSON — substring check on serialized name).
    // Looks for product_id in any item's id field.
    const orderRefs = db.prepare(
      "SELECT COUNT(*) AS n FROM orders WHERE (is_test = 0 OR is_test IS NULL) AND items LIKE ?"
    ).get(`%"id":"${pid}"%`).n;

    const blockers = [];
    if (purItems  > 0) blockers.push({ resource: 'purchase_invoice_items', count: purItems });
    if (moves     > 0) blockers.push({ resource: 'stock_movements',        count: moves });
    if (retItems  > 0) blockers.push({ resource: 'return_items',           count: retItems });
    if (orderRefs > 0) blockers.push({ resource: 'orders',                 count: orderRefs });

    if (blockers.length && !isTestProduct) {
      return res.status(409).json({
        error: 'product has history — refuse delete; archive it instead (PATCH archived=true)',
        blockers,
      });
    }

    db.prepare('DELETE FROM product_variants WHERE product_id = ?').run(pid);
    const info = db.prepare('DELETE FROM products WHERE id = ?').run(pid);
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
// statuses: pending | approved | rejected | refunded | cancelled
// Phase 1 reshapes the row + adds per-item child rows. Legacy single-product
// POST is kept working — the UI just renders fewer details when items[] is
// empty. Status flow:
//   pending → approved → refunded   (happy path)
//   pending → rejected               (declined)
//
// Allocator — wrapped in a tiny txn so two simultaneous POSTs can't pick the
// same RET-XXXX. Starts at 0001 in a fresh DB; sequential thereafter.
const allocateReturnNumber = db.transaction(() => {
  const row = db.prepare("SELECT COALESCE(MAX(CAST(SUBSTR(return_number, 5) AS INTEGER)), 0) AS m FROM returns WHERE return_number LIKE 'RET-%'").get();
  const n = (row.m || 0) + 1;
  return `RET-${String(n).padStart(4,'0')}`;
});

function logReturnActivity({ return_id, event_type, event_data = {}, actor_id, actor_name }) {
  try {
    const id = `ral_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
    db.prepare(`
      INSERT INTO return_activity_log (id, return_id, event_type, event_data, actor_id, actor_name)
      VALUES (?,?,?,?,?,?)
    `).run(id, return_id, event_type, JSON.stringify(event_data || {}), actor_id || null, actor_name || null);
  } catch (e) { console.warn('[nawra-api] return activity log skipped:', e.message); }
}

function hydrateReturn(r) {
  if (!r) return null;
  const items = db.prepare('SELECT * FROM return_items WHERE return_id = ? ORDER BY created_at').all(r.id);
  const attachments = db.prepare('SELECT * FROM return_attachments WHERE return_id = ? ORDER BY uploaded_at').all(r.id);
  const activity = db.prepare('SELECT * FROM return_activity_log WHERE return_id = ? ORDER BY created_at').all(r.id).map(a => {
    try { a.event_data = JSON.parse(a.event_data || '{}'); } catch { a.event_data = {}; }
    return a;
  });
  // Best-effort join: reason label, original order summary, customer card.
  let reason_label = r.reason || null;
  if (r.reason_id) {
    const rr = db.prepare('SELECT name_ar FROM return_reasons WHERE id = ?').get(r.reason_id);
    if (rr) reason_label = rr.name_ar;
  }
  let order = null;
  if (r.order_id) {
    const o = db.prepare('SELECT id, order_number, date, created_at, total, subtotal, shipping_cost, discount_amount, status, items AS items_json FROM orders WHERE id = ?').get(r.order_id);
    if (o) {
      try { o.items = JSON.parse(o.items_json || '[]'); } catch { o.items = []; }
      delete o.items_json;
      order = o;
    }
  }
  let customer = null;
  const email = r.customer_id || r.customer_email;
  if (email) {
    customer = db.prepare('SELECT email, name, phone, category, totalOrders, totalSpent, store_credit_balance FROM users WHERE LOWER(email) = LOWER(?)').get(email) || null;
    if (customer) {
      const retCount = db.prepare('SELECT COUNT(*) AS c FROM returns WHERE LOWER(COALESCE(customer_id, customer_email)) = LOWER(?)').get(email).c;
      customer.total_returns = retCount;
    }
  }
  return { ...r, items, attachments, activity, reason_label, order, customer };
}

// LIST — filters + simple pagination. KPI numbers come from a separate
// /aggregates endpoint so the list query stays cheap.
app.get('/api/returns', (req, res) => {
  try {
    const { status, q, from, to, reason_id, refund_method, sort, page = '1', perPage = '25' } = req.query;
    let sql = 'SELECT * FROM returns WHERE 1=1';
    const params = [];
    if (status && status !== 'all') { sql += ' AND status = ?'; params.push(status); }
    if (reason_id)     { sql += ' AND reason_id = ?'; params.push(reason_id); }
    if (refund_method) { sql += ' AND refund_method = ?'; params.push(refund_method); }
    if (from) { sql += " AND DATE(COALESCE(requested_at, created_at)) >= ?"; params.push(from); }
    if (to)   { sql += " AND DATE(COALESCE(requested_at, created_at)) <= ?"; params.push(to); }
    if (q) {
      const like = `%${q}%`;
      sql += ` AND (return_number LIKE ? OR order_id LIKE ? OR customer LIKE ?
                OR customer_email LIKE ? OR customer_id LIKE ?)`;
      params.push(like, like, like, like, like);
    }
    if (sort === 'oldest')      sql += " ORDER BY COALESCE(requested_at, created_at) ASC";
    else if (sort === 'amount_desc') sql += ' ORDER BY amount DESC';
    else if (sort === 'amount_asc')  sql += ' ORDER BY amount ASC';
    else                         sql += " ORDER BY COALESCE(requested_at, created_at) DESC";

    const total = db.prepare(`SELECT COUNT(*) AS c FROM (${sql})`).get(...params).c;
    const lim = Math.max(1, Math.min(200, parseInt(perPage, 10) || 25));
    const off = (Math.max(1, parseInt(page, 10) || 1) - 1) * lim;
    sql += ' LIMIT ? OFFSET ?'; params.push(lim, off);

    const rows = db.prepare(sql).all(...params);
    // Lightweight hydration — only include the first-2 item thumbs + count
    // so the table can render small images without a per-row roundtrip.
    const enriched = rows.map(r => {
      const items = db.prepare('SELECT product_image, product_name FROM return_items WHERE return_id = ? LIMIT 5').all(r.id);
      return { ...r, items_preview: items, items_count: items.length };
    });
    res.json({ rows: enriched, total, page: Number(page), perPage: lim });
  } catch (e) { console.error('GET /api/returns', e); res.status(500).json({ error: e.message }); }
});

// AGGREGATES — KPI cards + insight cards. One round-trip for the list page.
app.get('/api/returns/aggregates', (_req, res) => {
  try {
    // is_test guard so smoke returns don't move the return-rate KPI.
    const all = db.prepare('SELECT * FROM returns WHERE (is_test = 0 OR is_test IS NULL)').all();
    const byStatus = (s) => all.filter(r => r.status === s);
    const counts = {
      total:     all.length,
      pending:   byStatus('pending').length,
      approved:  byStatus('approved').length,
      rejected:  byStatus('rejected').length,
      refunded:  byStatus('refunded').length,
    };
    const refunded_total = byStatus('refunded').reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const orderCount = db.prepare('SELECT COUNT(*) AS c FROM orders WHERE (is_test = 0 OR is_test IS NULL)').get().c || 0;
    const return_rate_pct = orderCount ? Math.round((all.length / orderCount) * 1000) / 10 : 0;

    // avg processing days = mean( (processed_at - requested_at) for refunded rows )
    let avg_processing_days = null;
    const refunded = byStatus('refunded').filter(r => r.processed_at && (r.requested_at || r.created_at));
    if (refunded.length) {
      const totalMs = refunded.reduce((s, r) => {
        const a = new Date((r.requested_at || r.created_at).replace(' ', 'T') + 'Z').getTime();
        const b = new Date(r.processed_at.replace(' ', 'T') + 'Z').getTime();
        return s + Math.max(0, b - a);
      }, 0);
      avg_processing_days = Math.round((totalMs / refunded.length / 86400000) * 10) / 10;
    }

    // Insight: top returned product (by aggregate quantity in return_items;
    // falls back to the legacy `product` text column if items table is empty).
    const itemAgg = db.prepare(`
      SELECT product_name AS name, SUM(quantity) AS qty
      FROM return_items WHERE (is_test = 0 OR is_test IS NULL)
      GROUP BY product_name ORDER BY qty DESC LIMIT 1
    `).get();
    let topProductName = itemAgg && itemAgg.name;
    let topProductQty  = itemAgg ? Number(itemAgg.qty) || 0 : 0;
    if (!topProductName) {
      const legacy = db.prepare("SELECT product, COUNT(*) AS c FROM returns WHERE product IS NOT NULL AND product <> '' AND (is_test = 0 OR is_test IS NULL) GROUP BY product ORDER BY c DESC LIMIT 1").get();
      if (legacy) { topProductName = legacy.product; topProductQty = legacy.c; }
    }
    // Sales count of that product across all orders (rough — sums qty from
    // orders.items[] JSON where item.name matches).
    let topProductSales = 0;
    if (topProductName) {
      const orders = db.prepare('SELECT items FROM orders WHERE (is_test = 0 OR is_test IS NULL)').all();
      orders.forEach(o => {
        try { (JSON.parse(o.items || '[]') || []).forEach(it => { if ((it.name || '') === topProductName) topProductSales += Number(it.qty) || 0; }); }
        catch {}
      });
    }
    const top_product = topProductName ? {
      name: topProductName, return_count: topProductQty, sales_count: topProductSales,
      return_pct: topProductSales > 0 ? Math.round((topProductQty / topProductSales) * 1000) / 10 : null,
    } : null;

    // Insight: top reason
    let topReason = null;
    const reasonAgg = db.prepare(`
      SELECT COALESCE(reason_id, '') AS rid, reason, COUNT(*) AS c
      FROM returns WHERE (reason_id IS NOT NULL OR reason IS NOT NULL)
        AND (is_test = 0 OR is_test IS NULL)
      GROUP BY rid, reason ORDER BY c DESC LIMIT 1
    `).get();
    if (reasonAgg) {
      let label = reasonAgg.reason || '—';
      if (reasonAgg.rid) {
        const rr = db.prepare('SELECT name_ar FROM return_reasons WHERE id = ?').get(reasonAgg.rid);
        if (rr) label = rr.name_ar;
      }
      const pct = all.length ? Math.round((reasonAgg.c / all.length) * 1000) / 10 : 0;
      topReason = { label, count: reasonAgg.c, pct };
    }

    res.json({ counts, refunded_total, return_rate_pct, avg_processing_days, top_product, top_reason: topReason });
  } catch (e) { console.error('GET /api/returns/aggregates', e); res.status(500).json({ error: e.message }); }
});

// SINGLE (by id OR return_number RET-XXXX)
app.get('/api/returns/:key', (req, res) => {
  try {
    const k = req.params.key;
    const row = (k.startsWith('RET-')
      ? db.prepare('SELECT * FROM returns WHERE return_number = ?').get(k)
      : db.prepare('SELECT * FROM returns WHERE id = ?').get(k));
    if (!row) return res.status(404).json({ error: 'not found' });
    res.json(hydrateReturn(row));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// CREATE — accepts BOTH the legacy single-product shape AND the new shape
// with `items: [{ order_item_idx, product_id, product_name, product_image,
// sku, unit_price, quantity, refund_amount }, ...]`. Auto-allocates RET-XXXX.
app.post('/api/returns', (req, res) => {
  try {
    const r = req.body || {};
    if (!r.order_id) return res.status(400).json({ error: 'order_id required' });
    const id = r.id || `rt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
    const retNum = allocateReturnNumber();
    const itemsIn = Array.isArray(r.items) ? r.items : [];
    // Sum amount from items if not explicitly given.
    const computedAmount = itemsIn.length
      ? itemsIn.reduce((s, it) => s + (Number(it.refund_amount) || ((Number(it.unit_price)||0) * (Number(it.quantity)||1))), 0)
      : (Number(r.amount) || 0);
    const requestedAt = r.requested_at || new Date().toISOString().slice(0, 19).replace('T', ' ');
    const customer = r.customer || (r.customer_id ? r.customer_id.split('@')[0] : null);
    // Inherit is_test from parent order so smoke returns are auto-flagged.
    // Body can override (e.g. smoke that constructs a return without an order row).
    let isTest = r.is_test ? 1 : 0;
    if (!isTest && r.order_id) {
      try {
        const o = db.prepare('SELECT is_test FROM orders WHERE id = ?').get(String(r.order_id));
        if (o && o.is_test) isTest = 1;
      } catch {}
    }

    db.transaction(() => {
      db.prepare(`
        INSERT INTO returns (id, return_number, order_id, customer, customer_email, customer_id,
                             product, reason, reason_id, customer_notes, amount, status,
                             refund_method, refund_shipping, shipping_refund, discount_refund,
                             pickup_method, pickup_address, requested_at, is_test)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `).run(
        id, retNum, r.order_id, customer, r.customer_email || r.customer_id || null,
        r.customer_id || r.customer_email || null,
        r.product || (itemsIn[0] && itemsIn[0].product_name) || null,
        r.reason || null, r.reason_id || null, r.customer_notes || null,
        computedAmount, r.status || 'pending',
        r.refund_method || null,
        r.refund_shipping ? 1 : 0, Number(r.shipping_refund) || 0, Number(r.discount_refund) || 0,
        r.pickup_method || 'customer_ships', r.pickup_address || null, requestedAt, isTest,
      );
      const insItem = db.prepare(`
        INSERT INTO return_items (id, return_id, order_item_idx, product_id, product_name,
                                  product_image, sku, unit_price, quantity, refund_amount,
                                  condition, restock_action, is_test)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
      `);
      itemsIn.forEach((it, i) => {
        const itemId = `ri_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}_${i}`;
        const qty = Number(it.quantity) || 1;
        insItem.run(
          itemId, id,
          it.order_item_idx === undefined ? null : Number(it.order_item_idx),
          it.product_id || null, it.product_name || null, it.product_image || null, it.sku || null,
          Number(it.unit_price) || 0, qty,
          Number(it.refund_amount) || ((Number(it.unit_price) || 0) * qty),
          'pending', 'pending', isTest,
        );
      });
    })();
    logReturnActivity({
      return_id: id, event_type: 'submitted',
      event_data: { amount: computedAmount, item_count: itemsIn.length, source: r.created_by_admin ? 'admin' : 'customer' },
      actor_id: r.actor_id || r.customer_id || null, actor_name: r.actor_name || r.customer || null,
    });
    // Notify super admin via inbox so the new request shows up in the bell.
    sendMessage({
      from_user_id: r.actor_id || r.customer_id || null,
      from_user_name: customer || 'العميل',
      to_user_id: SUPER_ADMIN_FALLBACK,
      type: 'request',
      subject: `طلب إرجاع جديد ${retNum}`,
      body: `${customer || 'عميل'} طلب إرجاع طلب #${r.order_id} بقيمة ${(Number(computedAmount)||0).toLocaleString()} ج`,
      metadata: { kind: 'return_request', return_id: id, return_number: retNum, order_id: r.order_id, requires_action: false },
    });
    // Fire-and-forget confirmation email to the customer (and an alert email
    // to super admin if a separate address is set in env). Errors logged but
    // don't fail the request — the row is already created.
    sendReturnEmail('submitted', id);
    res.json({ ok: true, id, return_number: retNum, amount: computedAmount });
  } catch (e) { console.error('POST /api/returns', e); res.status(500).json({ error: e.message }); }
});

app.patch('/api/returns/:id', (req, res) => {
  try {
    const r = req.body || {};
    // Accept either internal id or RET-XXXX in the URL so the new admin
    // page can patch using whichever it has.
    const key = req.params.id;
    const cur = (key.startsWith('RET-')
      ? db.prepare('SELECT * FROM returns WHERE return_number = ?').get(key)
      : db.prepare('SELECT * FROM returns WHERE id = ?').get(key));
    if (!cur) return res.status(404).json({ error: 'not found' });

    const sets = []; const vals = [];
    ['status','admin_note','amount','reason','reason_id','customer_notes',
     'refund_method','refund_reference','refund_shipping','shipping_refund',
     'discount_refund','internal_notes','pickup_method','pickup_address',
     'return_tracking','rejection_reason'].forEach(k => {
      if (Object.prototype.hasOwnProperty.call(r, k)) {
        if (k === 'refund_shipping') { sets.push('refund_shipping = ?'); vals.push(r[k] ? 1 : 0); }
        else { sets.push(`${k} = ?`); vals.push(r[k]); }
      }
    });
    // Stamp review / process audit trail when the status transitions.
    const newStatus = r.status;
    const actor = r.actor_id || null;
    const actorName = r.actor_name || null;
    if (newStatus && newStatus !== cur.status) {
      if ((newStatus === 'approved' || newStatus === 'rejected') && !cur.reviewed_at) {
        sets.push("reviewed_at = datetime('now')"); sets.push('reviewed_by = ?'); vals.push(actor);
      }
      if (newStatus === 'refunded' && !cur.processed_at) {
        sets.push("processed_at = datetime('now')"); sets.push('processed_by = ?'); vals.push(actor);
      }
    }
    // Inspection: 'good' returns units to stock_available; 'damaged' adds
    // to stock_damaged AND creates a "damaged" expense for the cost.
    // Test-data isolation: skip ALL real-product side-effects for is_test
    // returns — otherwise the smoke would bump real products' stock,
    // creating cumulative drift in inventory_value across runs.
    let inspectionApplied = false;
    if (cur.is_test) {
      // No-op: don't mutate real product stock from a test return.
    } else if (r.inspection_status && ['good','damaged'].includes(r.inspection_status) && !cur.stock_settled) {
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
              INSERT INTO expenses (id, category, description, quantity, unit_price, amount, date, notes, is_test)
              VALUES (?, 'general', ?, ?, ?, ?, date('now'), ?, ?)
            `).run(expId, `هالك — ${productRow.name}`, qty, unitCost, unitCost * qty, `مرتجع #${cur.id}`,
              cur.is_test ? 1 : 0);
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
    vals.push(cur.id);
    db.prepare(`UPDATE returns SET ${sets.join(', ')} WHERE id = ?`).run(...vals);

    // ── Phase 2 side-effects ───────────────────────────────────────────
    // When a return transitions to 'refunded' we trigger three integrations.
    // Each is wrapped in try/catch so a downstream failure doesn't block the
    // status update — the activity log captures whatever ran successfully.
    const sideEffects = { restocked: [], expense_id: null, store_credit: null };
    if (newStatus === 'refunded' && cur.status !== 'refunded') {
      // -- 2a. Inventory restock per return_item.restock_action --
      // is_test guard so smoke returns don't bump real products' stock.
      try {
        const items = cur.is_test
          ? []
          : db.prepare('SELECT * FROM return_items WHERE return_id = ?').all(cur.id);
        items.forEach(it => {
          if (!it.product_id || !it.restock_action || it.restock_action === 'pending') return;
          const product = db.prepare('SELECT * FROM products WHERE id = ?').get(it.product_id);
          if (!product) return;
          const qty = Number(it.quantity) || 0;
          if (qty <= 0) return;
          let movementType = null, reason = null, newAvail = product.stock || 0, newDam = product.stock_damaged || 0;
          if (it.restock_action === 'restock_available') {
            newAvail = (product.stock || 0) + qty;
            db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(newAvail, product.id);
            movementType = 'return_good'; reason = `مرتجع سليم — رجع للمخزون (${cur.return_number})`;
          } else if (it.restock_action === 'move_to_damaged') {
            newDam = (product.stock_damaged || 0) + qty;
            db.prepare('UPDATE products SET stock_damaged = ? WHERE id = ?').run(newDam, product.id);
            movementType = 'damaged'; reason = `مرتجع تالف — هالك (${cur.return_number})`;
          } else if (it.restock_action === 'write_off') {
            movementType = 'write_off'; reason = `إتلاف مرتجع — لا يعود للمخزون (${cur.return_number})`;
          }
          if (movementType) {
            try {
              recordMovement({
                product_id: product.id, product_name: product.name,
                type: movementType,
                quantity_delta: (it.restock_action === 'restock_available' ? +qty : 0),
                balance_after_available: newAvail,
                balance_after_reserved:  product.stock_reserved || 0,
                balance_after_damaged:   newDam,
                reason, reference: cur.return_number,
                unit_cost: Number(product.cost) || 0,
                user_id: actor, user_name: actorName,
              });
              sideEffects.restocked.push({ product_id: product.id, qty, action: it.restock_action });
            } catch (e) { console.warn('[nawra-api] return restock movement skipped:', e.message); }
          }
        });
      } catch (e) { console.warn('[nawra-api] return restock skipped:', e.message); }

      // -- 2b. Finance: refund-as-expense (cash / transfer / wallet only) --
      const refundsCountAsExpense = ['cash', 'transfer', 'wallet'].includes(cur.refund_method || r.refund_method);
      if (refundsCountAsExpense) {
        try {
          const expId = `ex_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
          // Resolve the seeded 'returns' category id; fall back to legacy slug.
          const catRow = db.prepare("SELECT id, key FROM expense_categories WHERE key = 'returns'").get();
          const today = new Date().toISOString().slice(0, 10);
          db.prepare(`
            INSERT INTO expenses (id, category, category_id, description, quantity, unit_price, amount,
                                  date, notes, type, payment_method, status,
                                  approved_by, approved_at, created_by, source_ref, is_test)
            VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?, 'variable', ?, 'approved', ?, datetime('now'), ?, ?, ?)
          `).run(
            expId, catRow ? catRow.key : 'returns', catRow ? catRow.id : null,
            `استرداد مرتجع ${cur.return_number} — ${cur.customer || cur.customer_email || '—'}`,
            Number(cur.amount) || 0, Number(cur.amount) || 0,
            today, `طريقة: ${cur.refund_method || r.refund_method}${cur.refund_reference || r.refund_reference ? ` · مرجع: ${cur.refund_reference || r.refund_reference}` : ''}`,
            cur.refund_method || r.refund_method,
            actor || SUPER_ADMIN_FALLBACK,
            actor || SUPER_ADMIN_FALLBACK,
            `return:${cur.id}`,
            cur.is_test ? 1 : 0,
          );
          sideEffects.expense_id = expId;
        } catch (e) { console.warn('[nawra-api] refund-as-expense skipped:', e.message); }
      }

      // -- 2c. Store credit: when refund_method='store_credit' --
      // is_test guard so smoke returns don't credit real customers' wallets.
      if (!cur.is_test && (cur.refund_method || r.refund_method) === 'store_credit') {
        try {
          // Read bonus % from settings.store.returns.store_credit_bonus_pct (default 5).
          let bonusPct = 5;
          try {
            const row = db.prepare("SELECT value FROM settings WHERE key='store'").get();
            const store = row ? JSON.parse(row.value || '{}') : {};
            const rcfg = (store.returns || {});
            const b = Number(rcfg.store_credit_bonus_pct);
            if (Number.isFinite(b) && b >= 0 && b <= 100) bonusPct = b;
          } catch {}
          const base = Number(cur.amount) || 0;
          const bonus = Math.round(base * bonusPct) / 100;
          const credit = base + bonus;
          const email = cur.customer_id || cur.customer_email;
          if (email) {
            const u = db.prepare('SELECT email, store_credit_balance FROM users WHERE LOWER(email) = LOWER(?)').get(email);
            if (u) {
              const newBal = (Number(u.store_credit_balance) || 0) + credit;
              db.prepare('UPDATE users SET store_credit_balance = ? WHERE LOWER(email) = LOWER(?)').run(newBal, email);
              // Add to the customer activity log too (existing CRM table).
              try {
                db.prepare(`
                  INSERT INTO customer_activity_log (id, customer_email, event_type, event_data, actor_id, actor_name)
                  VALUES (?, ?, 'store_credit_added', ?, ?, ?)
                `).run(
                  `act_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`,
                  email,
                  JSON.stringify({ return_number: cur.return_number, base, bonus_pct: bonusPct, bonus, credit, new_balance: newBal }),
                  actor, actorName || 'النظام',
                );
              } catch {}
              sideEffects.store_credit = { email, base, bonus_pct: bonusPct, bonus, credit, new_balance: newBal };
            }
          }
        } catch (e) { console.warn('[nawra-api] store credit accrual skipped:', e.message); }
      }
    }

    // Activity log for the meaningful transitions. Inspection event is
    // logged above (inspectionApplied=true) — handled here for completeness.
    if (newStatus && newStatus !== cur.status) {
      logReturnActivity({
        return_id: cur.id, event_type: newStatus,
        event_data: {
          from: cur.status, to: newStatus,
          reason: r.rejection_reason || null,
          refund_method: r.refund_method || cur.refund_method || null,
          side_effects: sideEffects,
        },
        actor_id: actor, actor_name: actorName,
      });
    }
    if (inspectionApplied) {
      logReturnActivity({
        return_id: cur.id, event_type: 'inspected',
        event_data: { inspection_status: r.inspection_status },
        actor_id: actor, actor_name: actorName,
      });
    }

    const fresh = db.prepare('SELECT * FROM returns WHERE id=?').get(cur.id);
    // Customer-facing email for the meaningful transitions. Fire-and-forget
    // so a mailer hiccup doesn't 500 the PATCH.
    if (newStatus && newStatus !== cur.status) {
      if (newStatus === 'approved') sendReturnEmail('approved', cur.id);
      else if (newStatus === 'rejected') sendReturnEmail('rejected', cur.id, { reason: r.rejection_reason || null });
      else if (newStatus === 'refunded') sendReturnEmail('refunded', cur.id, { store_credit: sideEffects.store_credit });
    }
    res.json({ ...hydrateReturn(fresh), inspectionApplied, sideEffects });
  } catch (e) { console.error('PATCH /api/returns', e); res.status(500).json({ error: e.message }); }
});

// PATCH a single return_item — admin sets condition + restock decision
// during inspection. Phase 1 stores the choice; the inventory-write side
// effects ship in Phase 2 alongside the refund-as-expense integration.
app.patch('/api/return-items/:id', (req, res) => {
  try {
    const r = req.body || {};
    const cur = db.prepare('SELECT * FROM return_items WHERE id = ?').get(req.params.id);
    if (!cur) return res.status(404).json({ error: 'not found' });
    const sets = []; const vals = [];
    ['condition','restock_action','refund_amount','quantity'].forEach(k => {
      if (Object.prototype.hasOwnProperty.call(r, k)) { sets.push(`${k} = ?`); vals.push(r[k]); }
    });
    if (!sets.length) return res.json({ ok: true, noop: true });
    vals.push(req.params.id);
    db.prepare(`UPDATE return_items SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    res.json(db.prepare('SELECT * FROM return_items WHERE id = ?').get(req.params.id));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Return reasons — CRUD used by both the admin filter dropdown and the
// (Phase 2) customer-facing return form.
app.get('/api/return-reasons', (req, res) => {
  try {
    const all = req.query.all === '1';
    const sql = all
      ? 'SELECT * FROM return_reasons ORDER BY sort_order, name_ar'
      : 'SELECT * FROM return_reasons WHERE active = 1 ORDER BY sort_order, name_ar';
    res.json(db.prepare(sql).all());
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/return-reasons', (req, res) => {
  try {
    const r = req.body || {};
    if (!r.name_ar) return res.status(400).json({ error: 'name_ar required' });
    const id = r.id || `rr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
    const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order),0) AS m FROM return_reasons').get().m;
    db.prepare(`
      INSERT INTO return_reasons (id, name_ar, name_en, active, sort_order, is_default)
      VALUES (?, ?, ?, 1, ?, 0)
    `).run(id, r.name_ar, r.name_en || null, (maxOrder || 0) + 1);
    res.json(db.prepare('SELECT * FROM return_reasons WHERE id = ?').get(id));
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.patch('/api/return-reasons/:id', (req, res) => {
  try {
    const cur = db.prepare('SELECT * FROM return_reasons WHERE id = ?').get(req.params.id);
    if (!cur) return res.status(404).json({ error: 'not found' });
    const r = req.body || {};
    const sets = []; const vals = [];
    ['name_ar','name_en','active','sort_order'].forEach(k => {
      if (Object.prototype.hasOwnProperty.call(r, k)) {
        sets.push(`${k} = ?`); vals.push(typeof r[k] === 'boolean' ? (r[k] ? 1 : 0) : r[k]);
      }
    });
    if (!sets.length) return res.json(cur);
    vals.push(req.params.id);
    db.prepare(`UPDATE return_reasons SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    res.json(db.prepare('SELECT * FROM return_reasons WHERE id = ?').get(req.params.id));
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/return-reasons/:id', (req, res) => {
  try {
    const cur = db.prepare('SELECT * FROM return_reasons WHERE id = ?').get(req.params.id);
    if (!cur) return res.status(404).json({ error: 'not found' });
    if (cur.is_default) return res.status(400).json({ error: 'default reasons cannot be deleted — set active=0 instead' });
    db.prepare('DELETE FROM return_reasons WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Append a note to internal_notes (Phase 1 stores plain newline-separated).
app.post('/api/returns/:key/notes', (req, res) => {
  try {
    const k = req.params.key;
    const cur = (k.startsWith('RET-')
      ? db.prepare('SELECT * FROM returns WHERE return_number = ?').get(k)
      : db.prepare('SELECT * FROM returns WHERE id = ?').get(k));
    if (!cur) return res.status(404).json({ error: 'not found' });
    const note = ((req.body && req.body.note) || '').trim();
    const author = ((req.body && req.body.author) || 'admin');
    if (!note) return res.status(400).json({ error: 'note required' });
    const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const line = `[${stamp} · ${author}] ${note}`;
    const merged = cur.internal_notes ? `${cur.internal_notes}\n${line}` : line;
    db.prepare("UPDATE returns SET internal_notes = ?, updated_at = datetime('now') WHERE id = ?").run(merged, cur.id);
    logReturnActivity({ return_id: cur.id, event_type: 'note_added', event_data: { note }, actor_name: author });
    res.json({ ok: true, internal_notes: merged });
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

// ── SHIPPING (Phase 1) ────────────────────────────────────────────────────────
// Helpers + endpoints for: shipping_zones, couriers, shipments. The admin UI
// (Phase 2) calls these; for now the storefront still reads the legacy
// settings.shipping JSON for the cart's free-shipping calc — that switch
// happens in Phase 2 alongside the new admin pages.

const SHIPMENT_STATUSES = new Set(['ready','shipped','delivered','returned','cancelled']);

// Sequential AWB allocator wrapped in a txn so two simultaneous POSTs can't
// pick the same number. Starts at 1 in a fresh DB.
const allocateAwbNumber = db.transaction(() => {
  const row = db.prepare(
    "SELECT COALESCE(MAX(CAST(SUBSTR(awb_number, 5) AS INTEGER)), 0) AS m FROM shipments WHERE awb_number LIKE 'AWB-%'"
  ).get();
  const n = (row.m || 0) + 1;
  return `AWB-${String(n).padStart(4, '0')}`;
});

// Purchase invoice number (PUR-XXXX) + supplier payment number (PAY-XXXX).
// Same sequential pattern as orders/AWB/RET — MAX(...) + 1 inside a txn so
// concurrent inserts can't collide on the unique constraint.
const allocatePurchaseInvoiceNumber = db.transaction(() => {
  const row = db.prepare(
    "SELECT COALESCE(MAX(CAST(SUBSTR(invoice_number, 5) AS INTEGER)), 0) AS m FROM purchase_invoices WHERE invoice_number LIKE 'PUR-%'"
  ).get();
  const n = (row.m || 0) + 1;
  return `PUR-${String(n).padStart(4, '0')}`;
});
const allocateSupplierPaymentNumber = db.transaction(() => {
  const row = db.prepare(
    "SELECT COALESCE(MAX(CAST(SUBSTR(payment_number, 5) AS INTEGER)), 0) AS m FROM supplier_payments WHERE payment_number LIKE 'PAY-%'"
  ).get();
  const n = (row.m || 0) + 1;
  return `PAY-${String(n).padStart(4, '0')}`;
});

// Match a customer's governorate string to a shipping zone. Iterates active
// zones and checks if the governorate appears in the zone's governorates
// array. Falls back to null when no match — caller should handle.
function matchZoneByGovernorate(governorate) {
  if (!governorate) return null;
  const target = String(governorate).trim();
  if (!target) return null;
  const zones = db.prepare('SELECT * FROM shipping_zones WHERE active = 1 ORDER BY sort_order, name_ar').all();
  for (const z of zones) {
    let govs = [];
    try { govs = JSON.parse(z.governorates || '[]'); } catch {}
    if (govs.some(g => String(g).trim() === target)) return z;
  }
  return null;
}

// Sum line items × per-unit weight. Falls back to settings.store
// .shipping_default_product_weight (default 0.3kg) when a line item's
// product has no weight set. `items` is the orders.items JSON-decoded array.
function computeOrderWeight(items, opts = {}) {
  const defaultW = Number(opts.defaultWeight) || 0.3;
  if (!Array.isArray(items) || !items.length) return 0;
  // Build a name→weight lookup once per call.
  const products = db.prepare("SELECT name, weight_kg FROM products").all();
  const weightByName = new Map(products.map(p => [(p.name || '').trim().toLowerCase(), Number(p.weight_kg) || 0]));
  let total = 0;
  items.forEach(it => {
    const qty = Number(it.qty) || 0;
    const w   = weightByName.get(String(it.name || '').trim().toLowerCase()) || defaultW;
    total += qty * w;
  });
  return Math.round(total * 100) / 100;
}

// Quote a shipping fee for a given zone + weight + order_total.
//   · Free when order_total >= zone.free_shipping_threshold (or the global
//     default when the zone has no threshold of its own AND the global is set).
//   · Otherwise: base_price + max(0, weight - base_weight) * extra_per_kg.
// Returns { fee, free, reason, zone_id }.
function computeShippingFee(zone, weight, orderTotal, globalFreeThreshold) {
  if (!zone) return { fee: 0, free: false, reason: 'no_zone', zone_id: null };
  const z = zone;
  const total = Number(orderTotal) || 0;
  const w     = Math.max(0, Number(weight) || 0);
  const zoneThreshold = Number(z.free_shipping_threshold);
  const globalThreshold = Number(globalFreeThreshold) || 0;
  const threshold = Number.isFinite(zoneThreshold) && zoneThreshold > 0
    ? zoneThreshold
    : (globalThreshold > 0 ? globalThreshold : null);
  if (threshold != null && total >= threshold) {
    return { fee: 0, free: true, reason: 'free_threshold', zone_id: z.id, threshold };
  }
  const base = Number(z.base_price) || 0;
  const baseW = Number(z.base_weight) || 1;
  const perKg = Number(z.extra_per_kg) || 0;
  const overWeight = Math.max(0, w - baseW);
  const fee = Math.round((base + overWeight * perKg) * 100) / 100;
  return { fee, free: false, reason: 'tiered', zone_id: z.id, base, base_weight: baseW, extra_per_kg: perKg };
}

// Read shipping_default_free_threshold from settings.store (set by the
// Phase-2 Settings → Shipping section D). Falls back to legacy
// settings.shipping.free_shipping_min_order. Returns 0 when neither is set.
function getGlobalFreeThreshold() {
  try {
    const row = db.prepare("SELECT value FROM settings WHERE key = 'store'").get();
    const store = row ? JSON.parse(row.value || '{}') : {};
    const v = Number(store.shipping_default_free_threshold);
    if (Number.isFinite(v) && v > 0) return v;
  } catch {}
  try {
    const row = db.prepare("SELECT value FROM settings WHERE key = 'shipping'").get();
    const sh  = row ? JSON.parse(row.value || '{}') : {};
    if (sh.free_shipping_enabled) return Number(sh.free_shipping_min_order) || 0;
  } catch {}
  return 0;
}

function logShipmentHistory({ shipment_id, from_status, to_status, notes, actor_id, actor_name }) {
  try {
    const id = `shh_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
    db.prepare(`
      INSERT INTO shipment_status_history (id, shipment_id, from_status, to_status, notes, actor_id, actor_name)
      VALUES (?,?,?,?,?,?,?)
    `).run(id, shipment_id, from_status || null, to_status, notes || null, actor_id || null, actor_name || null);
  } catch (e) { console.warn('[nawra-api] shipment history log skipped:', e.message); }
}

function hydrateShipment(s) {
  if (!s) return null;
  // Resolve courier + zone + order + status history in one go. Used by
  // GET /api/shipments/:awb to feed the modal.
  let courier = null, zone = null, order = null;
  if (s.courier_id) courier = db.prepare('SELECT id, name, logo_path, tracking_url_template, contact_phone FROM couriers WHERE id = ?').get(s.courier_id) || null;
  if (s.zone_id)    zone    = db.prepare('SELECT * FROM shipping_zones WHERE id = ?').get(s.zone_id) || null;
  if (s.order_id)   {
    const o = db.prepare('SELECT id, order_number, date, created_at, total, subtotal, shipping_cost, status, payment_method, payment_status, name, phone, city, address, items AS items_json, userEmail FROM orders WHERE id = ?').get(s.order_id);
    if (o) {
      try { o.items = JSON.parse(o.items_json || '[]'); } catch { o.items = []; }
      delete o.items_json;
      order = o;
    }
  }
  const history = db.prepare('SELECT * FROM shipment_status_history WHERE shipment_id = ? ORDER BY created_at').all(s.id);
  return { ...s, courier, zone, order, history };
}

// ─── Shipping ZONES CRUD ────────────────────────────────────────────────────
app.get('/api/shipping/zones', (req, res) => {
  try {
    const all = req.query.all === '1';
    const sql = all
      ? 'SELECT * FROM shipping_zones ORDER BY sort_order, name_ar'
      : 'SELECT * FROM shipping_zones WHERE active = 1 ORDER BY sort_order, name_ar';
    const rows = db.prepare(sql).all().map(z => {
      try { z.governorates = JSON.parse(z.governorates || '[]'); } catch { z.governorates = []; }
      // Optional shipment-count enrichment — useful insight on the settings page.
      const c = db.prepare("SELECT COUNT(*) AS n FROM shipments WHERE zone_id = ?").get(z.id);
      z.shipments_count = Number(c.n) || 0;
      return z;
    });
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/shipping/zones', (req, res) => {
  try {
    const z = req.body || {};
    if (!z.name_ar) return res.status(400).json({ error: 'name_ar required' });
    const id = z.id || `zone_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
    const govs = Array.isArray(z.governorates) ? z.governorates : [];
    const maxOrder = db.prepare("SELECT COALESCE(MAX(sort_order), 0) AS m FROM shipping_zones").get().m;
    db.prepare(`
      INSERT INTO shipping_zones
        (id, name_ar, name_en, governorates, base_price, base_weight, extra_per_kg,
         min_days, max_days, free_shipping_threshold, active, sort_order)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      id, z.name_ar, z.name_en || null, JSON.stringify(govs),
      Number(z.base_price)   || 0,
      Number(z.base_weight)  || 1,
      Number(z.extra_per_kg) || 0,
      Number.isFinite(+z.min_days) ? +z.min_days : 1,
      Number.isFinite(+z.max_days) ? +z.max_days : 3,
      z.free_shipping_threshold === '' || z.free_shipping_threshold == null ? null : Number(z.free_shipping_threshold),
      z.active === false ? 0 : 1,
      (maxOrder || 0) + 1,
    );
    const out = db.prepare('SELECT * FROM shipping_zones WHERE id = ?').get(id);
    try { out.governorates = JSON.parse(out.governorates || '[]'); } catch { out.governorates = []; }
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.patch('/api/shipping/zones/:id', (req, res) => {
  try {
    const cur = db.prepare('SELECT * FROM shipping_zones WHERE id = ?').get(req.params.id);
    if (!cur) return res.status(404).json({ error: 'not found' });
    const z = req.body || {};
    const sets = []; const vals = [];
    ['name_ar','name_en','base_price','base_weight','extra_per_kg','min_days','max_days','active','sort_order'].forEach(k => {
      if (Object.prototype.hasOwnProperty.call(z, k)) {
        let v = z[k];
        if (k === 'active') v = v ? 1 : 0;
        sets.push(`${k} = ?`); vals.push(v);
      }
    });
    if (Object.prototype.hasOwnProperty.call(z, 'governorates')) {
      sets.push('governorates = ?');
      vals.push(JSON.stringify(Array.isArray(z.governorates) ? z.governorates : []));
    }
    if (Object.prototype.hasOwnProperty.call(z, 'free_shipping_threshold')) {
      sets.push('free_shipping_threshold = ?');
      vals.push(z.free_shipping_threshold === '' || z.free_shipping_threshold == null ? null : Number(z.free_shipping_threshold));
    }
    if (!sets.length) return res.json(cur);
    sets.push("updated_at = datetime('now')");
    vals.push(req.params.id);
    db.prepare(`UPDATE shipping_zones SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    const out = db.prepare('SELECT * FROM shipping_zones WHERE id = ?').get(req.params.id);
    try { out.governorates = JSON.parse(out.governorates || '[]'); } catch { out.governorates = []; }
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/shipping/zones/:id', (req, res) => {
  try {
    const using = db.prepare("SELECT COUNT(*) AS n FROM shipments WHERE zone_id = ?").get(req.params.id).n;
    if (using > 0) return res.status(400).json({ error: `zone is used by ${using} shipment(s); set active=0 instead` });
    const info = db.prepare('DELETE FROM shipping_zones WHERE id = ?').run(req.params.id);
    if (!info.changes) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── COURIERS CRUD ──────────────────────────────────────────────────────────
app.get('/api/shipping/couriers', (req, res) => {
  try {
    const all = req.query.all === '1';
    const sql = all
      ? 'SELECT * FROM couriers ORDER BY sort_order, name'
      : 'SELECT * FROM couriers WHERE active = 1 ORDER BY sort_order, name';
    const rows = db.prepare(sql).all().map(c => {
      try { c.zone_ids = JSON.parse(c.zone_ids || '[]'); } catch { c.zone_ids = []; }
      return c;
    });
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/shipping/couriers', (req, res) => {
  try {
    const c = req.body || {};
    if (!c.name) return res.status(400).json({ error: 'name required' });
    const id = c.id || `cou_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
    const maxOrder = db.prepare("SELECT COALESCE(MAX(sort_order), 0) AS m FROM couriers").get().m;
    db.prepare(`
      INSERT INTO couriers
        (id, name, description, logo_path, contact_name, contact_phone, contact_email,
         tracking_url_template, internal_notes, is_default, active, zone_ids, sort_order)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      id, c.name, c.description || null, c.logo_path || null,
      c.contact_name || null, c.contact_phone || null, c.contact_email || null,
      c.tracking_url_template || null, c.internal_notes || null,
      c.is_default ? 1 : 0, c.active ? 1 : 0,
      JSON.stringify(Array.isArray(c.zone_ids) ? c.zone_ids : []),
      (maxOrder || 0) + 1,
    );
    // Enforce single-default invariant if this row was set as default.
    if (c.is_default) db.prepare("UPDATE couriers SET is_default = 0 WHERE id != ?").run(id);
    const out = db.prepare('SELECT * FROM couriers WHERE id = ?').get(id);
    try { out.zone_ids = JSON.parse(out.zone_ids || '[]'); } catch { out.zone_ids = []; }
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.patch('/api/shipping/couriers/:id', (req, res) => {
  try {
    const cur = db.prepare('SELECT * FROM couriers WHERE id = ?').get(req.params.id);
    if (!cur) return res.status(404).json({ error: 'not found' });
    const c = req.body || {};
    const sets = []; const vals = [];
    ['name','description','logo_path','contact_name','contact_phone','contact_email',
     'tracking_url_template','internal_notes','active','is_default','sort_order'].forEach(k => {
      if (Object.prototype.hasOwnProperty.call(c, k)) {
        let v = c[k];
        if (k === 'active' || k === 'is_default') v = v ? 1 : 0;
        sets.push(`${k} = ?`); vals.push(v);
      }
    });
    if (Object.prototype.hasOwnProperty.call(c, 'zone_ids')) {
      sets.push('zone_ids = ?');
      vals.push(JSON.stringify(Array.isArray(c.zone_ids) ? c.zone_ids : []));
    }
    if (!sets.length) return res.json(cur);
    vals.push(req.params.id);
    db.prepare(`UPDATE couriers SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    if (c.is_default) db.prepare("UPDATE couriers SET is_default = 0 WHERE id != ?").run(req.params.id);
    const out = db.prepare('SELECT * FROM couriers WHERE id = ?').get(req.params.id);
    try { out.zone_ids = JSON.parse(out.zone_ids || '[]'); } catch { out.zone_ids = []; }
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/shipping/couriers/:id', (req, res) => {
  try {
    const using = db.prepare("SELECT COUNT(*) AS n FROM shipments WHERE courier_id = ?").get(req.params.id).n;
    if (using > 0) return res.status(400).json({ error: `courier is used by ${using} shipment(s); set active=0 instead` });
    const info = db.prepare('DELETE FROM couriers WHERE id = ?').run(req.params.id);
    if (!info.changes) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Shipping fee calculator (storefront + admin preview) ──────────────────
app.get('/api/shipping/calculate', (req, res) => {
  try {
    const { governorate, total, weight } = req.query;
    const zone = matchZoneByGovernorate(governorate);
    const w    = weight != null ? Number(weight) : 0;
    const t    = total  != null ? Number(total)  : 0;
    const quote = computeShippingFee(zone, w, t, getGlobalFreeThreshold());
    res.json({ zone: zone ? { id: zone.id, name_ar: zone.name_ar, min_days: zone.min_days, max_days: zone.max_days } : null, ...quote });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── SHIPMENTS ──────────────────────────────────────────────────────────────
// GET /api/shipments — list with filters + pagination envelope. Spec section
// B/E tabs/filters land here. Heavy aggregations go to /aggregates below.
app.get('/api/shipments', (req, res) => {
  try {
    const { status, q, courier_id, zone_id, from, to, sort, page = '1', perPage = '25' } = req.query;
    let sql = `
      SELECT s.*, o.order_number, o.name AS customer_name, o.phone AS customer_phone, o.total AS order_total,
             c.name AS courier_name, c.logo_path AS courier_logo,
             z.name_ar AS zone_name
      FROM shipments s
      LEFT JOIN orders   o ON o.id = s.order_id
      LEFT JOIN couriers c ON c.id = s.courier_id
      LEFT JOIN shipping_zones z ON z.id = s.zone_id
      WHERE 1=1`;
    const params = [];
    if (status && status !== 'all') { sql += ' AND s.status = ?'; params.push(status); }
    if (courier_id) { sql += ' AND s.courier_id = ?'; params.push(courier_id); }
    if (zone_id)    { sql += ' AND s.zone_id = ?';    params.push(zone_id); }
    if (from)       { sql += ' AND DATE(s.created_at) >= ?'; params.push(from); }
    if (to)         { sql += ' AND DATE(s.created_at) <= ?'; params.push(to); }
    if (q) {
      const like = `%${q}%`;
      sql += ` AND (s.awb_number LIKE ? OR s.order_id LIKE ? OR o.order_number LIKE ?
                OR o.name LIKE ? OR o.phone LIKE ?)`;
      params.push(like, like, like, like, like);
    }
    if (sort === 'late') sql += ' ORDER BY (s.status = "shipped" AND DATE(s.expected_delivery_date) < DATE("now")) DESC, s.created_at DESC';
    else if (sort === 'heavy') sql += ' ORDER BY s.weight_kg DESC';
    else sql += ' ORDER BY s.created_at DESC';

    const total = db.prepare(`SELECT COUNT(*) AS c FROM (${sql})`).get(...params).c;
    const lim = Math.max(1, Math.min(200, parseInt(perPage, 10) || 25));
    const off = (Math.max(1, parseInt(page, 10) || 1) - 1) * lim;
    sql += ' LIMIT ? OFFSET ?'; params.push(lim, off);
    const rows = db.prepare(sql).all(...params);
    res.json({ rows, total, page: Number(page), perPage: lim });
  } catch (e) { console.error('GET /api/shipments', e); res.status(500).json({ error: e.message }); }
});

// /aggregates — feeds spec section B (5 KPI cards) + section C (margin insight)
// + tab counters. One round-trip for the list page.
app.get('/api/shipments/aggregates', (_req, res) => {
  try {
    // is_test guard so smoke shipments don't move shipping KPIs.
    const all = db.prepare('SELECT * FROM shipments WHERE (is_test = 0 OR is_test IS NULL)').all();
    const byStatus = (s) => all.filter(r => r.status === s);
    const counts = {
      total:     all.length,
      ready:     byStatus('ready').length,
      shipped:   byStatus('shipped').length,
      delivered: byStatus('delivered').length,
      returned:  byStatus('returned').length,
      cancelled: byStatus('cancelled').length,
    };
    // Current-month + previous-month delivered counts for % change card.
    const now = new Date();
    const ym  = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    const cur = ym(now);
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prev = ym(prevDate);
    const delivered = byStatus('delivered');
    const deliveredCurrent = delivered.filter(d => (d.delivered_at || '').startsWith(cur)).length;
    const deliveredPrev    = delivered.filter(d => (d.delivered_at || '').startsWith(prev)).length;
    const deliveredChangePct = deliveredPrev > 0
      ? Math.round(((deliveredCurrent - deliveredPrev) / deliveredPrev) * 100)
      : (deliveredCurrent > 0 ? 100 : 0);

    // Average delivery time (days) over all delivered shipments where we
    // recorded both shipped_at and delivered_at.
    let avgDeliveryDays = null;
    const settled = delivered.filter(d => d.shipped_at && d.delivered_at);
    if (settled.length) {
      const totMs = settled.reduce((s, d) => s + (new Date((d.delivered_at||'').replace(' ','T')+'Z').getTime() - new Date((d.shipped_at||'').replace(' ','T')+'Z').getTime()), 0);
      avgDeliveryDays = Math.round((totMs / settled.length / 86400000) * 10) / 10;
    }

    // On-time % — delivered shipments whose delivered_at <= expected_delivery_date.
    let onTimePct = null;
    const withExpected = delivered.filter(d => d.expected_delivery_date && d.delivered_at);
    if (withExpected.length) {
      const onTime = withExpected.filter(d => (d.delivered_at || '').slice(0,10) <= d.expected_delivery_date).length;
      onTimePct = Math.round((onTime / withExpected.length) * 1000) / 10;
    }

    // Current-month courier-cost total + customer-paid-shipping total (margin).
    const monthRows = all.filter(s => (s.created_at || '').startsWith(cur));
    const courierCostMonth   = monthRows.reduce((s, r) => s + (Number(r.courier_cost)           || 0), 0);
    const customerPaidMonth  = monthRows.reduce((s, r) => s + (Number(r.customer_paid_shipping) || 0), 0);
    const shippingMargin     = customerPaidMonth - courierCostMonth;

    res.json({
      counts,
      delivered_current_month: deliveredCurrent,
      delivered_change_pct:    deliveredChangePct,
      avg_delivery_days:       avgDeliveryDays,
      on_time_pct:             onTimePct,
      courier_cost_month:      Math.round(courierCostMonth),
      customer_paid_month:     Math.round(customerPaidMonth),
      shipping_margin_month:   Math.round(shippingMargin),
    });
  } catch (e) { console.error('GET /api/shipments/aggregates', e); res.status(500).json({ error: e.message }); }
});

// GET single shipment (by AWB or internal id).
app.get('/api/shipments/:key', (req, res) => {
  try {
    const k = req.params.key;
    const row = (k.startsWith('AWB-')
      ? db.prepare('SELECT * FROM shipments WHERE awb_number = ?').get(k)
      : db.prepare('SELECT * FROM shipments WHERE id = ?').get(k));
    if (!row) return res.status(404).json({ error: 'not found' });
    res.json(hydrateShipment(row));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/shipments — admin clicks "شحن الطلب" on an order. Auto-allocates
// AWB, auto-computes weight + zone if not provided, sets status='ready'.
// Body shape:
//   { order_id, courier_id?, weight_kg?, courier_cost?, customer_paid_shipping?,
//     customer_paid_cod?, expected_delivery_date?, signature_required?,
//     special_instructions?, internal_notes?, actor_id?, actor_name? }
app.post('/api/shipments', (req, res) => {
  try {
    const b = req.body || {};
    if (!b.order_id) return res.status(400).json({ error: 'order_id required' });
    // orders.id is TEXT — coerce to string here so a JSON-number id from
    // the client still matches (better-sqlite3 binds typed args strictly).
    const orderId = String(b.order_id);
    // Block duplicate active shipments per order (one shipment at a time).
    const existing = db.prepare("SELECT id, awb_number, status FROM shipments WHERE order_id = ? AND status NOT IN ('cancelled','returned')").get(orderId);
    if (existing) return res.status(409).json({ error: 'order already has an active shipment', existing });

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    if (!order) return res.status(404).json({ error: 'order not found' });
    let items = [];
    try { items = JSON.parse(order.items || '[]'); } catch {}

    // Resolve zone from explicit body or by matching the order's city/governorate.
    let zone = null;
    if (b.zone_id) zone = db.prepare('SELECT * FROM shipping_zones WHERE id = ?').get(b.zone_id) || null;
    if (!zone) zone = matchZoneByGovernorate(order.city);

    // Compute weight (admin can override).
    const defaultWeight = (() => {
      try {
        const r = db.prepare("SELECT value FROM settings WHERE key='store'").get();
        const s = r ? JSON.parse(r.value || '{}') : {};
        const v = Number(s.shipping_default_product_weight);
        return Number.isFinite(v) && v > 0 ? v : 0.3;
      } catch { return 0.3; }
    })();
    const weight = b.weight_kg != null ? Number(b.weight_kg) : computeOrderWeight(items, { defaultWeight });

    // Courier — body wins, else the default courier.
    let courierId = b.courier_id || null;
    if (!courierId) {
      const def = db.prepare("SELECT id FROM couriers WHERE is_default = 1 AND active = 1 LIMIT 1").get();
      if (def) courierId = def.id;
    }

    // Expected delivery — body wins, else today + zone.max_days + processing.
    let expectedDate = b.expected_delivery_date || null;
    if (!expectedDate) {
      let processing = 0;
      try {
        const r = db.prepare("SELECT value FROM settings WHERE key='store'").get();
        const s = r ? JSON.parse(r.value || '{}') : {};
        processing = Number(s.shipping_processing_days) || 0;
      } catch {}
      const days = (zone ? Number(zone.max_days) || 3 : 3) + processing;
      const d = new Date(); d.setDate(d.getDate() + days);
      expectedDate = d.toISOString().slice(0, 10);
    }

    // Customer-paid shipping defaults to order.shipping_cost; COD defaults
    // to order.total only when payment_method=cash and not yet paid.
    const customerPaidShipping = b.customer_paid_shipping != null
      ? Number(b.customer_paid_shipping)
      : (Number(order.shipping_cost) || 0);
    const customerPaidCod = b.customer_paid_cod != null
      ? Number(b.customer_paid_cod)
      : (order.payment_method === 'cash' && order.payment_status !== 'paid' ? Number(order.total) || 0 : 0);

    const id  = `sh_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
    const awb = allocateAwbNumber();
    // Inherit is_test from the parent order (so a smoke-created order's
    // shipment is also flagged automatically). Body can override.
    const isTest = b.is_test != null ? (b.is_test ? 1 : 0) : (order.is_test ? 1 : 0);
    db.prepare(`
      INSERT INTO shipments
        (id, awb_number, order_id, courier_id, zone_id, weight_kg, courier_cost,
         customer_paid_shipping, customer_paid_cod, status,
         expected_delivery_date, signature_required, special_instructions, internal_notes,
         is_test)
      VALUES (?,?,?,?,?,?,?,?,?, 'ready', ?,?,?,?,?)
    `).run(
      id, awb, orderId, courierId, zone ? zone.id : null, weight,
      Number(b.courier_cost) || 0,
      customerPaidShipping, customerPaidCod,
      expectedDate,
      b.signature_required ? 1 : 0,
      b.special_instructions || null,
      b.internal_notes || null,
      isTest,
    );
    logShipmentHistory({
      shipment_id: id, from_status: null, to_status: 'ready',
      notes: 'تم إنشاء الشحنة', actor_id: b.actor_id, actor_name: b.actor_name,
    });
    res.json({ ok: true, id, awb_number: awb, zone_id: zone ? zone.id : null, weight_kg: weight, expected_delivery_date: expectedDate });
  } catch (e) { console.error('POST /api/shipments', e); res.status(500).json({ error: e.message }); }
});

// PATCH /api/shipments/:key — status transitions, cost updates, courier
// reassignment, notes. Status changes auto-stamp shipped_at/delivered_at
// and log the transition. When status flips to 'delivered', the parent
// order auto-transitions to 'مكتمل' if not already (Phase 3 ties this in
// more tightly with the order audit log).
app.patch('/api/shipments/:key', (req, res) => {
  try {
    const k = req.params.key;
    const cur = (k.startsWith('AWB-')
      ? db.prepare('SELECT * FROM shipments WHERE awb_number = ?').get(k)
      : db.prepare('SELECT * FROM shipments WHERE id = ?').get(k));
    if (!cur) return res.status(404).json({ error: 'not found' });
    const b = req.body || {};
    if (b.status && !SHIPMENT_STATUSES.has(b.status)) {
      return res.status(400).json({ error: `status must be one of ${Array.from(SHIPMENT_STATUSES).join(',')}` });
    }
    const sets = []; const vals = [];
    ['courier_id','zone_id','weight_kg','courier_cost','customer_paid_shipping','customer_paid_cod',
     'tracking_number','expected_delivery_date','signature_required','special_instructions','internal_notes'].forEach(f => {
      if (Object.prototype.hasOwnProperty.call(b, f)) {
        let v = b[f];
        if (f === 'signature_required') v = v ? 1 : 0;
        sets.push(`${f} = ?`); vals.push(v);
      }
    });
    if (b.status && b.status !== cur.status) {
      sets.push('status = ?'); vals.push(b.status);
      if (b.status === 'shipped'   && !cur.shipped_at)   sets.push("shipped_at = datetime('now')");
      if (b.status === 'delivered' && !cur.delivered_at) sets.push("delivered_at = datetime('now')");
    }
    if (!sets.length) return res.json({ ok: true, noop: true });
    sets.push("updated_at = datetime('now')");
    vals.push(cur.id);
    db.prepare(`UPDATE shipments SET ${sets.join(', ')} WHERE id = ?`).run(...vals);

    if (b.status && b.status !== cur.status) {
      logShipmentHistory({
        shipment_id: cur.id, from_status: cur.status, to_status: b.status,
        notes: b.notes || null,
        actor_id: b.actor_id || null, actor_name: b.actor_name || null,
      });
      // Auto-progress parent order on delivery.
      if (b.status === 'delivered' && cur.order_id) {
        try {
          const o = db.prepare('SELECT status FROM orders WHERE id = ?').get(cur.order_id);
          if (o && o.status !== 'مكتمل' && o.status !== 'ملغي') {
            db.prepare("UPDATE orders SET status = 'مكتمل' WHERE id = ?").run(cur.order_id);
            // The PATCH /api/orders auto-flip rules already set payment_status
            // on completion; calling that here would require re-implementing
            // its body. Phase 2 will route shipment-delivery through the
            // existing order PATCH instead.
          }
        } catch {}
      }
    }
    const fresh = db.prepare('SELECT * FROM shipments WHERE id = ?').get(cur.id);
    res.json(hydrateShipment(fresh));
  } catch (e) { console.error('PATCH /api/shipments', e); res.status(500).json({ error: e.message }); }
});

// POST /api/shipments/:key/notes — append to internal_notes (timestamped).
app.post('/api/shipments/:key/notes', (req, res) => {
  try {
    const k = req.params.key;
    const cur = (k.startsWith('AWB-')
      ? db.prepare('SELECT * FROM shipments WHERE awb_number = ?').get(k)
      : db.prepare('SELECT * FROM shipments WHERE id = ?').get(k));
    if (!cur) return res.status(404).json({ error: 'not found' });
    const note   = ((req.body && req.body.note) || '').trim();
    const author = ((req.body && req.body.author) || 'admin');
    if (!note) return res.status(400).json({ error: 'note required' });
    const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const line  = `[${stamp} · ${author}] ${note}`;
    const merged = cur.internal_notes ? `${cur.internal_notes}\n${line}` : line;
    db.prepare("UPDATE shipments SET internal_notes = ?, updated_at = datetime('now') WHERE id = ?").run(merged, cur.id);
    res.json({ ok: true, internal_notes: merged });
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

// Budget overrun / warning alert config. Stored alongside the per-expense
// approval keys on settings.store. Defaults: enabled=true, threshold=80.
function getBudgetAlertConfig() {
  try {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('store');
    const store = row ? JSON.parse(row.value || '{}') : {};
    const enabled = store.budget_alerts_enabled === undefined ? true : !!store.budget_alerts_enabled;
    let threshold = Number(store.budget_warning_threshold);
    if (!Number.isFinite(threshold) || threshold <= 0 || threshold >= 100) threshold = 80;
    return { enabled, threshold };
  } catch { return { enabled: true, threshold: 80 }; }
}

// Evaluate where the category will sit AFTER adding `additionalAmount` to its
// current-month approved spend. `dateRef` is the new/edited expense's date —
// determines which month's budget window we measure against.
//   - `excludeExpenseId` is excluded from the "current spent" sum (so the
//     edit flow doesn't double-count the row being changed).
// Returns null when the category has no budget set (caller skips alert logic).
function evaluateBudget({ category_id, additionalAmount, dateRef, excludeExpenseId }) {
  if (!category_id) return null;
  const budgetRow = db.prepare('SELECT monthly_budget FROM category_budgets WHERE category_id = ?').get(category_id);
  const budget = Number(budgetRow && budgetRow.monthly_budget) || 0;
  if (budget <= 0) return null;

  const d = (dateRef && /^\d{4}-\d{2}-\d{2}/.test(dateRef)) ? dateRef.slice(0,10) : new Date().toISOString().slice(0,10);
  const ym = d.slice(0,7);                            // '2026-05'
  const monthStart = `${ym}-01`;
  const monthEnd   = `${ym}-31`;

  // NOTE: budget rollup intentionally does NOT filter is_test. Budget
  // approval is a workflow-internal mechanic (it generates inbox messages
  // for the admin to action), not a customer-facing or business-reporting
  // metric. The smoke tests for budget overrun rely on their own test
  // expenses counting toward the budget — excluding them here would make
  // the overrun logic untestable. Real-money KPIs (Finance summary, cash
  // flow, CAC/CLV, AOV) all keep their is_test guards.
  const sumRow = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) AS s FROM expenses
    WHERE category_id = ? AND status = 'approved'
      AND date >= ? AND date <= ?
      AND (? IS NULL OR id <> ?)
  `).get(category_id, monthStart, monthEnd, excludeExpenseId || null, excludeExpenseId || null);
  const currentSpent = Number(sumRow.s) || 0;

  const cfg = getBudgetAlertConfig();
  const addAmt = Number(additionalAmount) || 0;
  const newTotal = currentSpent + addAmt;
  const currentPct = (currentSpent / budget) * 100;
  const newPct     = (newTotal / budget) * 100;

  let state = 'safe';
  if (newPct >= 100)            state = 'overrun';
  else if (newPct >= cfg.threshold) state = 'warning';

  return { budget, currentSpent, addAmt, newTotal, currentPct, newPct, state,
           year_month: ym, threshold: cfg.threshold, alertsEnabled: cfg.enabled,
           remaining: Math.max(0, budget - newTotal) };
}

// Try to log a one-shot warning for (category, year-month). Returns true when
// the INSERT actually fired (i.e. this is the first warning of the month).
function tryLogBudgetWarning(category_id, year_month) {
  try {
    const id = `bwl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
    const info = db.prepare(`
      INSERT OR IGNORE INTO budget_warning_log (id, category_id, year_month)
      VALUES (?, ?, ?)
    `).run(id, category_id, year_month);
    return info.changes > 0;
  } catch { return false; }
}

function categoryDisplayName(category_id, fallbackKey) {
  if (category_id) {
    const row = db.prepare('SELECT name_ar FROM expense_categories WHERE id = ?').get(category_id);
    if (row && row.name_ar) return row.name_ar;
  }
  return fallbackKey || 'الفئة';
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
    // LEFT JOIN suppliers so each row carries the resolved name without the
    // frontend needing a side-fetch — fixes "—" showing when the suppliers
    // cache isn't loaded yet OR when the row was created by another admin
    // before this client's session.
    let sql = `
      SELECT e.*, s.name AS supplier_name
      FROM expenses e
      LEFT JOIN suppliers s ON s.id = e.supplier_id
      WHERE 1=1`;
    const params = [];
    if (category)        { sql += ' AND e.category = ?';        params.push(category); }
    if (category_id)     { sql += ' AND e.category_id = ?';     params.push(category_id); }
    if (status)          { sql += ' AND e.status = ?';          params.push(status); }
    if (type)            { sql += ' AND e.type = ?';            params.push(type); }
    if (payment_method)  { sql += ' AND e.payment_method = ?';  params.push(payment_method); }
    if (supplier_id)     { sql += ' AND e.supplier_id = ?';     params.push(supplier_id); }
    if (q)               { sql += ' AND (e.description LIKE ? OR e.notes LIKE ? OR s.name LIKE ?)'; const like = `%${q}%`; params.push(like, like, like); }
    if (from) { sql += ' AND e.date >= ?'; params.push(from); }
    if (to)   { sql += ' AND e.date <= ?'; params.push(to); }
    if (month && year) {
      const mm = String(month).padStart(2, '0');
      sql += ' AND e.date >= ? AND e.date <= ?';
      params.push(`${year}-${mm}-01`, `${year}-${mm}-31`);
    } else if (year) {
      sql += ' AND e.date >= ? AND e.date <= ?';
      params.push(`${year}-01-01`, `${year}-12-31`);
    }
    sql += ' ORDER BY e.date DESC, e.created_at DESC';
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

// Resolve a beneficiary into a supplier id.
// Precedence:
//   1. If `beneficiary_name` is non-empty → find-or-create by name (this
//      lets an edit RENAME the beneficiary without changing supplier_id
//      semantics — the caller "I typed a new name" wins).
//   2. Else if `supplier_id` points at an existing row → use it.
//   3. Else null.
function resolveBeneficiary({ supplier_id, beneficiary_name, beneficiary_type }) {
  const name = String(beneficiary_name || '').trim();
  if (!name) {
    if (supplier_id) {
      const row = db.prepare('SELECT id FROM suppliers WHERE id = ?').get(supplier_id);
      if (row) return row.id;
    }
    return null;
  }
  // Find existing by name (case-insensitive match would need COLLATE; SQLite is
  // case-insensitive by default for ASCII, but Arabic compares as-typed which
  // is what we want for human-entered names anyway).
  const existing = db.prepare('SELECT id FROM suppliers WHERE name = ?').get(name);
  if (existing) return existing.id;
  const newId = `sup_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
  try {
    db.prepare('INSERT INTO suppliers (id, name, notes, active) VALUES (?, ?, ?, 1)')
      .run(newId, name, beneficiary_type ? `auto-created (${beneficiary_type})` : 'auto-created from expense entry');
    return newId;
  } catch { return null; }
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
    const benType = e.beneficiary_type || 'supplier';
    const beneficiaryId = resolveBeneficiary({
      supplier_id: e.supplier_id,
      beneficiary_name: e.beneficiary_name,
      beneficiary_type: benType,
    });

    // Approval workflow — if enabled and the expense crosses the threshold AND
    // the caller is not the super admin, mark as pending.
    const cfg = getExpenseApprovalConfig();
    const isSuper = e.created_by === SUPER_ADMIN_FALLBACK || e.actor_role === 'super_admin';
    let status = 'approved';
    let perExpensePending = false;
    if (cfg.enabled && cfg.threshold > 0 && amt >= cfg.threshold && !isSuper) {
      status = 'pending';
      perExpensePending = true;
    }
    if (e.status === 'pending' || e.status === 'rejected' || e.status === 'approved') status = e.status;

    // Budget overrun check — applies to EVERYONE (including super admin) so a
    // single click doesn't accidentally bust a monthly budget. Runs even when
    // the per-expense approval already marked the row pending — overrun wins
    // and the inbox message merges both reasons.
    const budgetEval = evaluateBudget({ category_id: cat.id, additionalAmount: amt, dateRef: date });
    const budgetOverrun = !!(budgetEval && budgetEval.alertsEnabled && budgetEval.state === 'overrun');
    if (budgetOverrun) status = 'pending_budget_approval';

    // payment_date is the ACTUAL cash-out date (admin-entered, distinct from
    // the entry-date `date`). NULL = approved-but-unpaid (Payable); set = paid
    // (counts in Cash Out). Format expected: 'YYYY-MM-DD' string or null.
    const paymentDate = (e.payment_date && /^\d{4}-\d{2}-\d{2}/.test(e.payment_date)) ? e.payment_date.slice(0, 10) : null;
    db.prepare(`
      INSERT INTO expenses (
        id, category, category_id, description, quantity, unit_price, amount, date, notes,
        type, supplier_id, beneficiary_type, payment_method, receipt_path, is_recurring,
        status, approved_by, approved_at, rejection_reason, created_by, source_ref, payment_date,
        is_test
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      id, cat.key, cat.id, e.description||null, qty, unit, amt, date, e.notes||null,
      type, beneficiaryId, benType, pm, e.receipt_path || null, e.is_recurring ? 1 : 0,
      status,
      status === 'approved' ? (e.created_by || SUPER_ADMIN_FALLBACK) : null,
      status === 'approved' ? new Date().toISOString() : null,
      null,
      e.created_by || null,
      e.source_ref || null,
      paymentDate,
      e.is_test ? 1 : 0,
    );

    // Inbox routing — three mutually exclusive paths:
    //   1. budget overrun (highest precedence) → actionable inbox kind=expense_budget_overrun
    //   2. per-expense pending (no overrun)    → actionable inbox kind=expense_approval
    //   3. approved but crossed warning %      → info-only one-shot warning
    const requesterName = e.created_by_name || e.created_by || 'الإدارة';
    const catName = categoryDisplayName(cat.id, cat.key);
    if (budgetOverrun) {
      const overByPct = Math.round(budgetEval.newPct - 100);
      const extraReason = perExpensePending
        ? `\n(يتجاوز أيضاً حد الموافقة الفردية ${cfg.threshold.toLocaleString()} ج)`
        : '';
      sendMessage({
        from_user_id: e.created_by || null,
        from_user_name: requesterName,
        to_user_id: SUPER_ADMIN_FALLBACK,
        type: 'request',
        subject: `طلب موافقة — تجاوز ميزانية ${catName}`,
        body: `${requesterName} يطلب إضافة "${(e.description||'مصروف').slice(0,80)}" بقيمة ${amt.toLocaleString()} ج.\n`
            + `ميزانية الفئة ${budgetEval.budget.toLocaleString()} ج · المصروف الحالي ${Math.round(budgetEval.currentSpent).toLocaleString()} ج.\n`
            + `الإضافة ستجعل الإجمالي ${Math.round(budgetEval.newTotal).toLocaleString()} ج (+${overByPct}% فوق الميزانية).${extraReason}`,
        metadata: {
          kind: 'expense_budget_overrun', expense_id: id, amount: amt, category: cat.key, category_id: cat.id,
          requires_action: true,
          budget: budgetEval.budget, new_total: budgetEval.newTotal, current_spent: budgetEval.currentSpent,
          per_expense_pending: perExpensePending,
        },
      });
    } else if (status === 'pending') {
      sendMessage({
        from_user_id: e.created_by || null,
        from_user_name: requesterName,
        to_user_id: SUPER_ADMIN_FALLBACK,
        type: 'request',
        subject: `طلب موافقة على مصروف`,
        body: `${requesterName} طلب إضافة مصروف بقيمة ${amt.toLocaleString()} ج في فئة ${cat.key}\n— ${(e.description || '').slice(0, 120) || '—'}`,
        metadata: { kind: 'expense_approval', expense_id: id, amount: amt, category: cat.key, requires_action: true },
      });
    } else if (budgetEval && budgetEval.alertsEnabled && budgetEval.state === 'warning' && budgetEval.currentPct < budgetEval.threshold) {
      // One-shot warning per (category, month) — table unique constraint handles
      // dedup atomically even if two writers race.
      const firstThisMonth = tryLogBudgetWarning(cat.id, budgetEval.year_month);
      if (firstThisMonth) {
        const pct = Math.round(budgetEval.newPct);
        sendMessage({
          from_user_id: null,
          from_user_name: 'نظام الميزانية',
          to_user_id: SUPER_ADMIN_FALLBACK,
          type: 'info',
          subject: `تحذير — فئة ${catName} قاربت على الميزانية`,
          body: `وصلت الفئة إلى ${pct}% من ميزانية الشهر (${Math.round(budgetEval.newTotal).toLocaleString()} من ${budgetEval.budget.toLocaleString()} ج).\nتبقى ${Math.round(budgetEval.remaining).toLocaleString()} ج فقط.`,
          metadata: { kind: 'budget_warning_info', category: cat.key, category_id: cat.id, year_month: budgetEval.year_month, pct, requires_action: false },
        });
      }
    }

    res.json({ ok: true, id, amount: amt, status, supplier_id: beneficiaryId,
               budget_state: budgetEval ? budgetEval.state : null });
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

    // Resolve beneficiary the same way as POST so an edit can change the
    // beneficiary name (auto-creates if new) or clear it entirely.
    let supplierId = cur.supplier_id;
    let benType    = cur.beneficiary_type;
    if (e.supplier_id !== undefined || e.beneficiary_name !== undefined || e.beneficiary_type !== undefined) {
      benType = e.beneficiary_type || cur.beneficiary_type || 'supplier';
      if (e.supplier_id === null || e.beneficiary_name === '') {
        supplierId = null;
      } else {
        supplierId = resolveBeneficiary({
          supplier_id: e.supplier_id ?? cur.supplier_id,
          beneficiary_name: e.beneficiary_name,
          beneficiary_type: benType,
        });
      }
    }

    // payment_date — explicit. Three states the caller can express:
    //   key absent           → leave existing payment_date untouched
    //   value = null/''      → CLEAR (mark as unpaid)
    //   value = 'YYYY-MM-DD' → SET to that date (mark as paid then)
    // Implemented with a sentinel because the COALESCE pattern can't
    // distinguish "not provided" from "explicit null" in a single column.
    let paymentDateClause = '';
    const pdArgs = [];
    if (Object.prototype.hasOwnProperty.call(e, 'payment_date')) {
      const v = e.payment_date;
      if (v === null || v === '') {
        paymentDateClause = ', payment_date = NULL';
      } else if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) {
        paymentDateClause = ', payment_date = ?';
        pdArgs.push(v.slice(0, 10));
      }
    }

    db.prepare(`
      UPDATE expenses SET
        category         = ?,
        category_id      = ?,
        description      = COALESCE(?, description),
        quantity         = ?, unit_price = ?, amount = ?,
        date             = COALESCE(?, date),
        notes            = COALESCE(?, notes),
        type             = ?,
        supplier_id      = ?,
        beneficiary_type = ?,
        payment_method   = ?,
        receipt_path     = COALESCE(?, receipt_path),
        is_recurring     = COALESCE(?, is_recurring),
        updated_at       = datetime('now')
        ${paymentDateClause}
      WHERE id = ?
    `).run(
      catKey, catId,
      e.description ?? null, qty, unit, amt,
      e.date ?? null, e.notes ?? null,
      type, supplierId, benType, pm, e.receipt_path ?? null,
      e.is_recurring === undefined ? null : (e.is_recurring ? 1 : 0),
      ...pdArgs,
      req.params.id
    );

    // Re-evaluate budget after the edit. Only applies when the row is currently
    // 'approved' — pending/rejected/already-pending_budget_approval rows aren't
    // counted yet so the edit can't push the visible total over. The amount or
    // category may have changed, so re-run the same check the POST does.
    // We exclude THIS row from currentSpent and pass its new amount as the
    // delta so the result tells us whether keeping this row approved would
    // bust the budget.
    if (cur.status === 'approved') {
      const reEval = evaluateBudget({
        category_id: catId, additionalAmount: amt, dateRef: (e.date || cur.date),
        excludeExpenseId: req.params.id,
      });
      if (reEval && reEval.alertsEnabled) {
        if (reEval.state === 'overrun') {
          // Flip back to pending_budget_approval until a super admin re-approves.
          db.prepare("UPDATE expenses SET status = 'pending_budget_approval', approved_by = NULL, approved_at = NULL WHERE id = ?").run(req.params.id);
          const catName = categoryDisplayName(catId, catKey);
          const overByPct = Math.round(reEval.newPct - 100);
          const requesterName = e.actor_name || cur.created_by || 'الإدارة';
          sendMessage({
            from_user_id: e.actor || cur.created_by || null,
            from_user_name: requesterName,
            to_user_id: SUPER_ADMIN_FALLBACK,
            type: 'request',
            subject: `طلب موافقة — تجاوز ميزانية ${catName} (تعديل)`,
            body: `تم تعديل مصروف "${(e.description||cur.description||'').slice(0,80)}" إلى ${amt.toLocaleString()} ج.\n`
                + `ميزانية الفئة ${reEval.budget.toLocaleString()} ج · المصروف الحالي ${Math.round(reEval.currentSpent).toLocaleString()} ج.\n`
                + `بعد التعديل سيصبح الإجمالي ${Math.round(reEval.newTotal).toLocaleString()} ج (+${overByPct}% فوق الميزانية).`,
            metadata: {
              kind: 'expense_budget_overrun', expense_id: req.params.id, amount: amt, category: catKey, category_id: catId,
              requires_action: true, edit: true,
              budget: reEval.budget, new_total: reEval.newTotal, current_spent: reEval.currentSpent,
            },
          });
        } else if (reEval.state === 'warning' && reEval.currentPct < reEval.threshold) {
          const firstThisMonth = tryLogBudgetWarning(catId, reEval.year_month);
          if (firstThisMonth) {
            const catName = categoryDisplayName(catId, catKey);
            const pct = Math.round(reEval.newPct);
            sendMessage({
              from_user_id: null, from_user_name: 'نظام الميزانية',
              to_user_id: SUPER_ADMIN_FALLBACK, type: 'info',
              subject: `تحذير — فئة ${catName} قاربت على الميزانية`,
              body: `وصلت الفئة إلى ${pct}% من ميزانية الشهر (${Math.round(reEval.newTotal).toLocaleString()} من ${reEval.budget.toLocaleString()} ج).\nتبقى ${Math.round(reEval.remaining).toLocaleString()} ج فقط.`,
              metadata: { kind: 'budget_warning_info', category: catKey, category_id: catId, year_month: reEval.year_month, pct, requires_action: false },
            });
          }
        }
      }
    }

    // Re-fetch with the same JOIN as GET so the response includes supplier_name.
    const fresh = db.prepare(`
      SELECT e.*, s.name AS supplier_name FROM expenses e
      LEFT JOIN suppliers s ON s.id = e.supplier_id
      WHERE e.id = ?
    `).get(req.params.id);
    res.json(expenseRowOut(fresh));
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
    // Budget-overrun approvals require an audit-trail reason (min 5 chars).
    const wasOverrun = cur.status === 'pending_budget_approval';
    const overrideReason = (req.body && (req.body.override_reason || req.body.budget_override_reason) || '').trim();
    if (wasOverrun && overrideReason.length < 5) {
      return res.status(400).json({ error: 'override_reason required (min 5 chars) for budget overrun approval' });
    }
    db.prepare(`
      UPDATE expenses SET status = 'approved', approved_by = ?, approved_at = datetime('now'),
                          rejection_reason = NULL,
                          budget_override_reason = COALESCE(?, budget_override_reason)
      WHERE id = ?
    `).run(actor, overrideReason || null, req.params.id);
    if (cur.created_by) {
      sendMessage({
        from_user_id: actor, from_user_name: 'Super Admin',
        to_user_id: cur.created_by, type: 'approval',
        subject: wasOverrun ? 'تم الموافقة استثنائياً على المصروف' : 'تمت الموافقة على مصروف',
        body: `${cur.description || '—'} · ${(cur.amount||0).toLocaleString()} ج`
            + (wasOverrun ? `\nسبب الاستثناء: ${overrideReason}` : ''),
        metadata: { kind: wasOverrun ? 'expense_budget_overrun_approved' : 'expense_approved', expense_id: cur.id, override_reason: wasOverrun ? overrideReason : undefined },
      });
    }
    res.json({ ok: true, override_reason: wasOverrun ? overrideReason : null });
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
// ════════════════════════════════════════════════════════════════════════════
// ── Phase 1 Catalog/Stock refactor: WAC engine + landed-cost helpers ──────────
// ════════════════════════════════════════════════════════════════════════════
//
// WAC = Weighted Average Cost. After this refactor, products.weighted_average_cost
// is the SINGLE source of truth for unit cost, and it's never written to
// directly — it's derived from purchase_invoice_items.
//
// Three flows touch it:
//   1. New purchase invoice transitions to 'received' → applyPurchaseToProduct
//      runs per line item, incrementally bumping WAC by the textbook formula
//      ((qty_old × wac_old) + (qty_new × cost_new)) / (qty_old + qty_new)
//   2. Existing 'received' invoice is cancelled → reversePurchaseFromProduct
//      then recomputeWacByReplay rebuilds WAC from scratch for the affected
//      products. Replay is the safe answer when math gets ambiguous.
//   3. Opening Balance invoice — behaves exactly like a normal purchase
//      for WAC purposes, but bypasses Payables (no supplier owed) by setting
//      is_opening_balance = 1 and supplier_id = null.
//
// The legacy products.cost column is mirrored from WAC on every update so any
// legacy aggregation query that reads .cost stays correct until Phase 3.

// Distribute landed costs (shipping + customs + other) across line items
// proportionally by either VALUE (line_total share) or WEIGHT (qty × product.weight_kg).
// Returns the same items shape with allocated_landed_cost + effective_unit_cost set.
function distributeLandedCost(items, totals, basis = 'value') {
  const totalLanded = (Number(totals.shipping_cost) || 0)
                    + (Number(totals.customs_fees)  || 0)
                    + (Number(totals.other_costs)   || 0);
  if (totalLanded <= 0 || !items.length) {
    return items.map(it => ({
      ...it,
      allocated_landed_cost: 0,
      effective_unit_cost: Number(it.unit_cost) || 0,
    }));
  }
  // Compute the basis sum.
  let basisSum = 0;
  const enriched = items.map(it => {
    const qty = Number(it.quantity) || 0;
    const lineTotal = (Number(it.unit_cost) || 0) * qty;
    let basisValue;
    if (basis === 'weight') {
      // pull weight_kg from products; falls back to 0.3 default
      let w = 0.3;
      try {
        const p = db.prepare('SELECT weight_kg FROM products WHERE id = ?').get(String(it.product_id));
        if (p && Number.isFinite(Number(p.weight_kg))) w = Number(p.weight_kg);
      } catch {}
      basisValue = qty * w;
    } else {
      basisValue = lineTotal;
    }
    basisSum += basisValue;
    return { ...it, _line_total: lineTotal, _basis: basisValue };
  });
  if (basisSum <= 0) {
    // Falls back to even split when basis is zero (e.g. all weights 0).
    return enriched.map(it => {
      const share = totalLanded / enriched.length;
      const qty = Number(it.quantity) || 1;
      return {
        ...it,
        _line_total: undefined, _basis: undefined,
        allocated_landed_cost: share,
        effective_unit_cost: (Number(it.unit_cost) || 0) + (share / qty),
      };
    });
  }
  return enriched.map(it => {
    const share = totalLanded * (it._basis / basisSum);
    const qty = Number(it.quantity) || 1;
    return {
      ...it,
      _line_total: undefined, _basis: undefined,
      allocated_landed_cost: share,
      effective_unit_cost: (Number(it.unit_cost) || 0) + (share / qty),
    };
  });
}

// Apply a single received purchase line to its product: bump WAC + stock +
// last_purchase_* + total_purchased_qty, and record a stock_movement.
function applyPurchaseToProduct({ product_id, quantity, effective_unit_cost, invoice, item_id }) {
  const qty = Number(quantity) || 0;
  if (qty <= 0) return null;
  const cost = Number(effective_unit_cost) || 0;
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(String(product_id));
  if (!p) throw new Error(`product not found: ${product_id}`);

  const oldStock = Number(p.stock) || 0;
  const oldWac   = Number(p.weighted_average_cost) || 0;
  const newStock = oldStock + qty;
  // Standard WAC formula: weighted by quantity.
  const newWac = newStock > 0 ? ((oldStock * oldWac) + (qty * cost)) / newStock : 0;
  const newTotalPurchased = (Number(p.total_purchased_qty) || 0) + qty;

  db.prepare(`
    UPDATE products SET
      stock                 = ?,
      weighted_average_cost = ?,
      cost                  = ?,                              -- legacy mirror until Phase 3 lockdown
      last_purchase_date    = COALESCE(?, last_purchase_date),
      last_purchase_price   = ?,
      total_purchased_qty   = ?,
      updated_at            = datetime('now')
    WHERE id = ?
  `).run(
    newStock, newWac, newWac,
    invoice && invoice.received_date ? invoice.received_date : null,
    cost,
    newTotalPurchased,
    String(product_id),
  );

  recordMovement({
    product_id: String(product_id),
    product_name: p.name || null,
    type: 'purchase_in',
    quantity_delta: +qty,
    balance_after_available: newStock,
    balance_after_reserved:  Number(p.stock_reserved) || 0,
    balance_after_damaged:   Number(p.stock_damaged)  || 0,
    reason: invoice ? `وارد من فاتورة شراء ${invoice.invoice_number}` : 'وارد من فاتورة شراء',
    reference: invoice ? invoice.invoice_number : (item_id || null),
    unit_cost: cost,
    user_id:   invoice ? invoice.created_by : null,
    user_name: null,
  });

  return { product_id, old_wac: oldWac, new_wac: newWac, old_stock: oldStock, new_stock: newStock };
}

// Reverse one line item's stock contribution. WAC isn't backed-out inline
// here — recomputeWacByReplay does it cleanly afterward.
function reverseStockForPurchaseLine({ product_id, quantity, invoice }) {
  const qty = Number(quantity) || 0;
  if (qty <= 0) return null;
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(String(product_id));
  if (!p) return null;
  const newStock = Math.max(0, (Number(p.stock) || 0) - qty);
  const newTotalPurchased = Math.max(0, (Number(p.total_purchased_qty) || 0) - qty);
  db.prepare(`
    UPDATE products SET
      stock               = ?,
      total_purchased_qty = ?,
      updated_at          = datetime('now')
    WHERE id = ?
  `).run(newStock, newTotalPurchased, String(product_id));
  recordMovement({
    product_id: String(product_id),
    product_name: p.name || null,
    type: 'purchase_reverse',
    quantity_delta: -qty,
    balance_after_available: newStock,
    balance_after_reserved:  Number(p.stock_reserved) || 0,
    balance_after_damaged:   Number(p.stock_damaged)  || 0,
    reason: invoice ? `إلغاء فاتورة شراء ${invoice.invoice_number}` : 'إلغاء فاتورة شراء',
    reference: invoice ? invoice.invoice_number : null,
    unit_cost: Number(p.weighted_average_cost) || 0,
  });
  return { product_id, new_stock: newStock };
}

// Replay every non-cancelled purchase line for this product in chronological
// order. After cancel/delete this is how products.weighted_average_cost,
// last_purchase_*, total_purchased_qty get restated. Cheap — a single product
// has tens of purchase lines at most.
function recomputeWacByReplay(product_id) {
  const lines = db.prepare(`
    SELECT
      i.id,
      i.quantity,
      i.effective_unit_cost,
      pi.received_date,
      pi.invoice_date,
      pi.created_at
    FROM purchase_invoice_items i
    JOIN purchase_invoices pi ON pi.id = i.purchase_invoice_id
    WHERE i.product_id = ?
      AND pi.status != 'cancelled'
    ORDER BY
      COALESCE(pi.received_date, pi.invoice_date, pi.created_at) ASC,
      pi.created_at ASC,
      i.created_at  ASC
  `).all(String(product_id));

  let runningQty = 0;
  let runningWac = 0;
  let lastDate   = null;
  let lastPrice  = null;
  let totalPurchased = 0;
  for (const l of lines) {
    const q  = Number(l.quantity) || 0;
    const c  = Number(l.effective_unit_cost) || 0;
    const newQ = runningQty + q;
    runningWac = newQ > 0 ? ((runningQty * runningWac) + (q * c)) / newQ : 0;
    runningQty = newQ;
    totalPurchased += q;
    lastDate  = l.received_date || l.invoice_date || l.created_at || lastDate;
    lastPrice = c;
  }
  db.prepare(`
    UPDATE products SET
      weighted_average_cost = ?,
      cost                  = ?,
      last_purchase_date    = ?,
      last_purchase_price   = ?,
      total_purchased_qty   = ?,
      updated_at            = datetime('now')
    WHERE id = ?
  `).run(runningWac, runningWac, lastDate, lastPrice, totalPurchased, String(product_id));
  return { product_id, wac: runningWac, total_purchased: totalPurchased };
}

// Reconcile a purchase invoice's payment_status against its amount_paid + total.
function updateInvoicePaymentStatus(invoice_id) {
  const inv = db.prepare('SELECT total, amount_paid FROM purchase_invoices WHERE id = ?').get(String(invoice_id));
  if (!inv) return;
  const paid = Number(inv.amount_paid) || 0;
  const tot  = Number(inv.total) || 0;
  let status = 'unpaid';
  if (paid >= tot && tot > 0) status = 'paid';
  else if (paid > 0)         status = 'partial';
  db.prepare("UPDATE purchase_invoices SET payment_status = ?, updated_at = datetime('now') WHERE id = ?").run(status, String(invoice_id));
  return status;
}

// Append one audit row to purchase_activity_log.
function recordPurchaseActivity({ purchase_invoice_id, event, notes, actor_id, actor_name, metadata, is_test }) {
  const id = `pal_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
  try {
    db.prepare(`
      INSERT INTO purchase_activity_log
        (id, purchase_invoice_id, event, notes, actor_id, actor_name, metadata, is_test)
      VALUES (?,?,?,?,?,?,?,?)
    `).run(
      id, String(purchase_invoice_id), event, notes || null,
      actor_id || null, actor_name || null,
      metadata ? JSON.stringify(metadata) : null,
      is_test ? 1 : 0,
    );
  } catch (e) { console.warn('[nawra-api] recordPurchaseActivity skipped:', e.message); }
  return id;
}

// Resolve a purchase invoice by either internal id or PUR-XXXX number, and
// hydrate items + attachments + activity log + supplier in one return.
function hydratePurchaseInvoice(key) {
  const invRow = String(key || '').startsWith('PUR-')
    ? db.prepare('SELECT * FROM purchase_invoices WHERE invoice_number = ?').get(key)
    : db.prepare('SELECT * FROM purchase_invoices WHERE id = ?').get(key);
  if (!invRow) return null;
  const items = db.prepare(`
    SELECT i.*, p.name AS product_name, p.sku AS product_sku
    FROM purchase_invoice_items i
    LEFT JOIN products p ON p.id = i.product_id
    WHERE i.purchase_invoice_id = ?
    ORDER BY i.created_at ASC
  `).all(invRow.id);
  const attachments = db.prepare('SELECT * FROM purchase_attachments WHERE purchase_invoice_id = ? ORDER BY uploaded_at DESC').all(invRow.id);
  const activity = db.prepare('SELECT * FROM purchase_activity_log WHERE purchase_invoice_id = ? ORDER BY created_at ASC').all(invRow.id)
    .map(a => { try { a.metadata = a.metadata ? JSON.parse(a.metadata) : null; } catch { a.metadata = null; } return a; });
  const supplier = invRow.supplier_id
    ? db.prepare('SELECT * FROM suppliers WHERE id = ?').get(invRow.supplier_id)
    : null;
  return { ...invRow, items, attachments, activity, supplier };
}

app.get('/api/suppliers', (req, res) => {
  try {
    // ?all=1 includes inactive suppliers (admin page needs them);
    // default keeps the old behaviour (active only — used by dropdowns).
    const includeAll = req.query.all === '1';
    const sql = includeAll
      ? `SELECT s.*,
                (SELECT COUNT(*) FROM purchase_invoices pi
                  WHERE pi.supplier_id = s.id AND pi.status != 'cancelled'
                    AND (pi.is_test = 0 OR pi.is_test IS NULL)) AS invoice_count,
                (SELECT COALESCE(SUM(pi.total), 0) FROM purchase_invoices pi
                  WHERE pi.supplier_id = s.id AND pi.status != 'cancelled'
                    AND (pi.is_test = 0 OR pi.is_test IS NULL)) AS total_purchases,
                (SELECT COALESCE(SUM(pi.total - COALESCE(pi.amount_paid, 0)), 0) FROM purchase_invoices pi
                  WHERE pi.supplier_id = s.id AND pi.status = 'received' AND pi.payment_status != 'paid'
                    AND (pi.is_test = 0 OR pi.is_test IS NULL)) AS balance,
                (SELECT MAX(pi.invoice_date) FROM purchase_invoices pi
                  WHERE pi.supplier_id = s.id AND pi.status != 'cancelled'
                    AND (pi.is_test = 0 OR pi.is_test IS NULL)) AS last_invoice_date
         FROM suppliers s ORDER BY s.name`
      : 'SELECT * FROM suppliers WHERE active = 1 ORDER BY name';
    res.json(db.prepare(sql).all());
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

// ════════════════════════════════════════════════════════════════════════════
// ── Phase 1 Purchases endpoints ─────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
//
// POST   /api/purchases                 create (draft or received)
// GET    /api/purchases                 list with filters
// GET    /api/purchases/aggregates      KPI cards
// GET    /api/purchases/:key            details (id or PUR-XXXX), hydrated
// PATCH  /api/purchases/:key            update (status transitions, payment, items)
// DELETE /api/purchases/:key            hard-delete (draft only)
// POST   /api/purchases/opening-balance shorthand for is_opening_balance flow

// Status flow:
//   draft → received  → applies WAC + stock + activity
//   draft → cancelled → just status flip
//   received → cancelled → reverses stock + recomputes WAC by replay
//
// Permission: any admin can create/list/view. Cancel/delete require super_admin
// or inventory_admin role (مشرف مخزون). Body-level actor_role enforces this
// soft-check pattern consistent with the rest of the codebase.

const PUR_DESTRUCTIVE_ROLES = new Set(['super_admin', 'inventory_admin']);

// Helper used by POST + PATCH: take a body with items[] + landed-cost fields,
// recompute the invoice subtotal/total + each item's effective_unit_cost. The
// caller persists the result; this is pure math.
function computeInvoiceTotals({ items, shipping_cost, customs_fees, other_costs, landed_basis }) {
  const ship = Number(shipping_cost) || 0;
  const cust = Number(customs_fees)  || 0;
  const oth  = Number(other_costs)   || 0;
  const enriched = distributeLandedCost(items || [], { shipping_cost: ship, customs_fees: cust, other_costs: oth }, landed_basis || 'value');
  const subtotal = enriched.reduce((s, it) => s + ((Number(it.unit_cost) || 0) * (Number(it.quantity) || 0)), 0);
  return {
    items: enriched.map(it => ({
      ...it,
      line_total: (Number(it.unit_cost) || 0) * (Number(it.quantity) || 0),
    })),
    subtotal,
    shipping_cost: ship,
    customs_fees:  cust,
    other_costs:   oth,
    total: subtotal + ship + cust + oth,
  };
}

// Apply (or re-apply) every item in an invoice to its product — used when
// status transitions to 'received'. Runs inside a caller-provided transaction.
function applyInvoiceItems(invoice, items) {
  for (const it of items) {
    applyPurchaseToProduct({
      product_id:          it.product_id,
      quantity:            it.quantity,
      effective_unit_cost: it.effective_unit_cost,
      invoice,
      item_id:             it.id,
    });
  }
}

// POST /api/purchases — create a new purchase invoice
app.post('/api/purchases', (req, res) => {
  try {
    const b = req.body || {};
    const isOpening = !!b.is_opening_balance;
    if (!isOpening && !b.supplier_id) return res.status(400).json({ error: 'supplier_id required (or set is_opening_balance=1)' });
    const itemsIn = Array.isArray(b.items) ? b.items : [];
    if (!itemsIn.length) return res.status(400).json({ error: 'at least one item required' });
    for (const it of itemsIn) {
      if (!it.product_id) return res.status(400).json({ error: 'each item needs product_id' });
      if ((Number(it.quantity) || 0) <= 0) return res.status(400).json({ error: 'each item needs quantity > 0' });
      if ((Number(it.unit_cost) || 0) < 0) return res.status(400).json({ error: 'unit_cost cannot be negative' });
    }
    if (b.supplier_id && !isOpening) {
      const supExists = db.prepare('SELECT id FROM suppliers WHERE id = ?').get(b.supplier_id);
      if (!supExists) return res.status(400).json({ error: 'supplier not found' });
    }

    const computed = computeInvoiceTotals({
      items: itemsIn,
      shipping_cost: b.shipping_cost,
      customs_fees:  b.customs_fees,
      other_costs:   b.other_costs,
      landed_basis:  b.landed_basis || 'value',
    });

    const id = b.id || `pur_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
    const invoiceNumber = b.invoice_number || allocatePurchaseInvoiceNumber();
    const status = b.status === 'received' ? 'received' : 'draft';
    const today = new Date().toISOString().slice(0, 10);
    const invoiceDate  = b.invoice_date  || today;
    const receivedDate = status === 'received' ? (b.received_date || new Date().toISOString().slice(0, 19).replace('T', ' ')) : (b.received_date || null);
    const isTest = b.is_test ? 1 : 0;

    // Payment math. amount_paid arrives optionally; status follows.
    const amountPaid = Math.max(0, Number(b.amount_paid) || 0);
    const initialPayStatus = amountPaid <= 0 ? 'unpaid' : (amountPaid >= computed.total ? 'paid' : 'partial');

    const tx = db.transaction(() => {
      db.prepare(`
        INSERT INTO purchase_invoices
          (id, invoice_number, supplier_id, supplier_invoice_ref, is_opening_balance,
           invoice_date, received_date, due_date,
           subtotal, shipping_cost, customs_fees, other_costs, total, landed_basis,
           payment_method, payment_status, amount_paid,
           status, notes, internal_notes, is_test, created_by)
        VALUES (?,?,?,?,?, ?,?,?, ?,?,?,?,?,?, ?,?,?, ?,?,?,?,?)
      `).run(
        id, invoiceNumber, isOpening ? null : b.supplier_id, b.supplier_invoice_ref || null, isOpening ? 1 : 0,
        invoiceDate, receivedDate, b.due_date || null,
        computed.subtotal, computed.shipping_cost, computed.customs_fees, computed.other_costs, computed.total, b.landed_basis || 'value',
        b.payment_method || (isOpening ? 'opening_balance' : 'cash'),
        initialPayStatus, amountPaid,
        status, b.notes || null, b.internal_notes || null, isTest, b.created_by || null,
      );

      const itemsInserted = [];
      for (const it of computed.items) {
        const itemId = it.id || `pii_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}_${itemsInserted.length}`;
        db.prepare(`
          INSERT INTO purchase_invoice_items
            (id, purchase_invoice_id, product_id, quantity, unit_cost,
             allocated_landed_cost, effective_unit_cost, line_total, notes, is_test)
          VALUES (?,?,?,?,?,?,?,?,?,?)
        `).run(
          itemId, id, String(it.product_id),
          Number(it.quantity) || 0, Number(it.unit_cost) || 0,
          Number(it.allocated_landed_cost) || 0, Number(it.effective_unit_cost) || 0,
          Number(it.line_total) || 0, it.notes || null, isTest,
        );
        itemsInserted.push({ ...it, id: itemId });
      }

      recordPurchaseActivity({
        purchase_invoice_id: id,
        event: 'created',
        notes: isOpening ? 'فاتورة رصيد افتتاحي' : 'تم إنشاء الفاتورة',
        actor_id: b.actor_id || b.created_by || null,
        actor_name: b.actor_name || null,
        metadata: { invoice_number: invoiceNumber, supplier_id: b.supplier_id || null, total: computed.total, is_opening_balance: isOpening },
        is_test: isTest,
      });

      // If created directly as 'received' (or opening balance, which is
      // received-on-create by nature), apply WAC + stock now.
      if (status === 'received' || isOpening) {
        const invoiceForApply = {
          id, invoice_number: invoiceNumber, received_date: receivedDate || invoiceDate,
          created_by: b.created_by || null,
        };
        applyInvoiceItems(invoiceForApply, itemsInserted);
        if (status !== 'received') {
          // Opening balance: still mark as received state.
          db.prepare("UPDATE purchase_invoices SET status = 'received' WHERE id = ?").run(id);
        }
        recordPurchaseActivity({
          purchase_invoice_id: id,
          event: 'received',
          notes: 'تم استلام البضاعة وتحديث المخزون',
          actor_id: b.actor_id || null, actor_name: b.actor_name || null,
          metadata: { items_count: itemsInserted.length },
          is_test: isTest,
        });
      }
    });
    tx();

    const hydrated = hydratePurchaseInvoice(id);
    res.json({ ok: true, ...hydrated });
  } catch (e) { console.error('POST /api/purchases', e); res.status(500).json({ error: e.message }); }
});

// POST /api/purchases/opening-balance — shorthand for setting up initial stock
// with no associated supplier owed (cash-equivalent injection of inventory).
// Just delegates to POST /api/purchases with is_opening_balance=1.
app.post('/api/purchases/opening-balance', (req, res) => {
  try {
    const b = req.body || {};
    req.body = {
      ...b,
      is_opening_balance: 1,
      supplier_id: null,
      status: 'received',
      payment_method: 'opening_balance',
      amount_paid: 0,
      notes: b.notes || 'رصيد افتتاحي — تأسيس مخزون',
    };
    // Reuse the main POST handler.
    return app._router.handle({ ...req, url: '/api/purchases', method: 'POST' }, res, () => {});
  } catch (e) { console.error('POST /api/purchases/opening-balance', e); res.status(500).json({ error: e.message }); }
});

// GET /api/purchases — list with filters
app.get('/api/purchases', (req, res) => {
  try {
    const { q, supplier_id, status, payment_status, from, to, sort, page, perPage } = req.query;
    let sql = `
      SELECT pi.*, s.name AS supplier_name
      FROM purchase_invoices pi
      LEFT JOIN suppliers s ON s.id = pi.supplier_id
      WHERE 1=1`;
    const params = [];
    if (q) {
      sql += ` AND (pi.invoice_number LIKE ? OR s.name LIKE ? OR pi.supplier_invoice_ref LIKE ?
                  OR EXISTS (SELECT 1 FROM purchase_invoice_items i
                             LEFT JOIN products p ON p.id = i.product_id
                             WHERE i.purchase_invoice_id = pi.id AND p.name LIKE ?))`;
      const like = `%${q}%`;
      params.push(like, like, like, like);
    }
    if (supplier_id && supplier_id !== 'all') { sql += ' AND pi.supplier_id = ?'; params.push(supplier_id); }
    if (status && status !== 'all')           { sql += ' AND pi.status = ?'; params.push(status); }
    if (payment_status && payment_status !== 'all') { sql += ' AND pi.payment_status = ?'; params.push(payment_status); }
    if (from) { sql += ' AND pi.invoice_date >= ?'; params.push(from); }
    if (to)   { sql += ' AND pi.invoice_date <= ?'; params.push(to); }

    // Default newest first.
    if (sort === 'highest')     sql += ' ORDER BY pi.total DESC, pi.invoice_date DESC';
    else if (sort === 'due')    sql += ' ORDER BY pi.due_date ASC NULLS LAST, pi.invoice_date DESC';
    else                        sql += ' ORDER BY pi.invoice_date DESC, pi.created_at DESC';

    const totalRow = db.prepare(`SELECT COUNT(*) AS c FROM (${sql})`).get(...params);
    const totalRows = totalRow ? totalRow.c : 0;

    const perPg = Math.max(1, Math.min(100, Number(perPage) || 25));
    const pg    = Math.max(1, Number(page) || 1);
    sql += ' LIMIT ? OFFSET ?';
    params.push(perPg, (pg - 1) * perPg);

    const rows = db.prepare(sql).all(...params).map(r => {
      r.items_count = db.prepare('SELECT COUNT(*) AS n FROM purchase_invoice_items WHERE purchase_invoice_id = ?').get(r.id).n;
      return r;
    });
    res.json({ rows, total: totalRows, page: pg, perPage: perPg });
  } catch (e) { console.error('GET /api/purchases', e); res.status(500).json({ error: e.message }); }
});

// GET /api/purchases/aggregates — KPI cards (current month)
app.get('/api/purchases/aggregates', (_req, res) => {
  try {
    const ym = new Date().toISOString().slice(0, 7);
    const monthRows = db.prepare(`
      SELECT COALESCE(SUM(total), 0) AS sum_total, COUNT(*) AS cnt
      FROM purchase_invoices
      WHERE status != 'cancelled'
        AND (is_test = 0 OR is_test IS NULL)
        AND invoice_date >= ? AND invoice_date <= ?
    `).get(`${ym}-01`, `${ym}-31`);

    const unpaidRows = db.prepare(`
      SELECT COALESCE(SUM(total - COALESCE(amount_paid, 0)), 0) AS amount, COUNT(*) AS cnt
      FROM purchase_invoices
      WHERE status = 'received'
        AND payment_status != 'paid'
        AND (is_test = 0 OR is_test IS NULL)
    `).get();

    const topSupplier = db.prepare(`
      SELECT pi.supplier_id, s.name, COALESCE(SUM(pi.total), 0) AS total_value
      FROM purchase_invoices pi
      LEFT JOIN suppliers s ON s.id = pi.supplier_id
      WHERE pi.status != 'cancelled'
        AND pi.supplier_id IS NOT NULL
        AND (pi.is_test = 0 OR pi.is_test IS NULL)
        AND pi.invoice_date >= ? AND pi.invoice_date <= ?
      GROUP BY pi.supplier_id, s.name
      ORDER BY total_value DESC
      LIMIT 1
    `).get(`${ym}-01`, `${ym}-31`);

    const counts = {
      total:     db.prepare("SELECT COUNT(*) AS n FROM purchase_invoices WHERE (is_test = 0 OR is_test IS NULL)").get().n,
      draft:     db.prepare("SELECT COUNT(*) AS n FROM purchase_invoices WHERE status = 'draft'     AND (is_test = 0 OR is_test IS NULL)").get().n,
      received:  db.prepare("SELECT COUNT(*) AS n FROM purchase_invoices WHERE status = 'received'  AND (is_test = 0 OR is_test IS NULL)").get().n,
      cancelled: db.prepare("SELECT COUNT(*) AS n FROM purchase_invoices WHERE status = 'cancelled' AND (is_test = 0 OR is_test IS NULL)").get().n,
    };
    const avgInvoice = monthRows.cnt > 0 ? (Number(monthRows.sum_total) / monthRows.cnt) : 0;

    res.json({
      counts,
      total_month:        Number(monthRows.sum_total) || 0,
      count_month:        Number(monthRows.cnt)       || 0,
      avg_invoice_month:  Math.round(avgInvoice),
      unpaid_total:       Number(unpaidRows.amount)   || 0,
      unpaid_count:       Number(unpaidRows.cnt)      || 0,
      top_supplier:       topSupplier
        ? { id: topSupplier.supplier_id, name: topSupplier.name, total: Number(topSupplier.total_value) || 0 }
        : null,
    });
  } catch (e) { console.error('GET /api/purchases/aggregates', e); res.status(500).json({ error: e.message }); }
});

// GET /api/purchases/:key — details by id or PUR-XXXX
app.get('/api/purchases/:key', (req, res) => {
  try {
    const hydrated = hydratePurchaseInvoice(req.params.key);
    if (!hydrated) return res.status(404).json({ error: 'not found' });
    res.json(hydrated);
  } catch (e) { console.error('GET /api/purchases/:key', e); res.status(500).json({ error: e.message }); }
});

// PATCH /api/purchases/:key — update notes / payment / status / items
// Status transitions:
//   draft → received   : apply items to products
//   received → cancelled : reverse stock for each item, replay-recompute WAC
//   * → cancelled (from draft) : just flip
app.patch('/api/purchases/:key', (req, res) => {
  try {
    const cur = (String(req.params.key).startsWith('PUR-')
      ? db.prepare('SELECT * FROM purchase_invoices WHERE invoice_number = ?').get(req.params.key)
      : db.prepare('SELECT * FROM purchase_invoices WHERE id = ?').get(req.params.key));
    if (!cur) return res.status(404).json({ error: 'not found' });
    const b = req.body || {};
    const newStatus = b.status;
    const isCancel  = newStatus === 'cancelled' && cur.status !== 'cancelled';
    if (isCancel && !PUR_DESTRUCTIVE_ROLES.has(String(b.actor_role || '').toLowerCase())) {
      return res.status(403).json({ error: 'role not permitted to cancel a purchase invoice' });
    }

    const sets = [];
    const vals = [];

    // Editable scalars when status === 'draft' OR when only payment fields change.
    const isDraft = cur.status === 'draft';
    if (isDraft) {
      for (const f of ['supplier_id', 'supplier_invoice_ref', 'invoice_date', 'received_date', 'due_date',
                       'landed_basis', 'payment_method', 'notes', 'internal_notes']) {
        if (Object.prototype.hasOwnProperty.call(b, f)) { sets.push(`${f} = ?`); vals.push(b[f]); }
      }
    } else {
      // Post-received: only payment/notes editable.
      for (const f of ['payment_method', 'notes', 'internal_notes', 'due_date']) {
        if (Object.prototype.hasOwnProperty.call(b, f)) { sets.push(`${f} = ?`); vals.push(b[f]); }
      }
    }

    const tx = db.transaction(() => {
      // Replace items if provided (draft only).
      if (isDraft && Array.isArray(b.items)) {
        db.prepare('DELETE FROM purchase_invoice_items WHERE purchase_invoice_id = ?').run(cur.id);
        const computed = computeInvoiceTotals({
          items: b.items,
          shipping_cost: b.shipping_cost != null ? b.shipping_cost : cur.shipping_cost,
          customs_fees:  b.customs_fees  != null ? b.customs_fees  : cur.customs_fees,
          other_costs:   b.other_costs   != null ? b.other_costs   : cur.other_costs,
          landed_basis:  b.landed_basis  || cur.landed_basis,
        });
        for (const it of computed.items) {
          const itemId = `pii_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
          db.prepare(`
            INSERT INTO purchase_invoice_items
              (id, purchase_invoice_id, product_id, quantity, unit_cost,
               allocated_landed_cost, effective_unit_cost, line_total, notes, is_test)
            VALUES (?,?,?,?,?,?,?,?,?,?)
          `).run(itemId, cur.id, String(it.product_id), Number(it.quantity) || 0, Number(it.unit_cost) || 0,
                 Number(it.allocated_landed_cost) || 0, Number(it.effective_unit_cost) || 0,
                 Number(it.line_total) || 0, it.notes || null, cur.is_test ? 1 : 0);
        }
        sets.push('subtotal = ?', 'shipping_cost = ?', 'customs_fees = ?', 'other_costs = ?', 'total = ?');
        vals.push(computed.subtotal, computed.shipping_cost, computed.customs_fees, computed.other_costs, computed.total);
      }

      if (sets.length) {
        sets.push("updated_at = datetime('now')");
        vals.push(cur.id);
        db.prepare(`UPDATE purchase_invoices SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
        recordPurchaseActivity({
          purchase_invoice_id: cur.id, event: 'edited',
          notes: 'تم تعديل بيانات الفاتورة',
          actor_id: b.actor_id || null, actor_name: b.actor_name || null,
          is_test: cur.is_test,
        });
      }

      // Now handle status transitions.
      if (newStatus && newStatus !== cur.status) {
        if (cur.status === 'draft' && newStatus === 'received') {
          // Apply.
          const items = db.prepare('SELECT * FROM purchase_invoice_items WHERE purchase_invoice_id = ?').all(cur.id);
          const fresh = db.prepare('SELECT * FROM purchase_invoices WHERE id = ?').get(cur.id);
          const rec = b.received_date || new Date().toISOString().slice(0, 19).replace('T', ' ');
          db.prepare("UPDATE purchase_invoices SET status = 'received', received_date = COALESCE(?, received_date), updated_at = datetime('now') WHERE id = ?").run(rec, cur.id);
          applyInvoiceItems({ ...fresh, received_date: rec }, items);
          recordPurchaseActivity({
            purchase_invoice_id: cur.id, event: 'received',
            notes: 'تم استلام البضاعة وتحديث المخزون',
            actor_id: b.actor_id || null, actor_name: b.actor_name || null,
            metadata: { items_count: items.length },
            is_test: cur.is_test,
          });
        } else if (newStatus === 'cancelled') {
          // Reverse if previously received.
          const items = db.prepare('SELECT * FROM purchase_invoice_items WHERE purchase_invoice_id = ?').all(cur.id);
          if (cur.status === 'received') {
            const fresh = db.prepare('SELECT * FROM purchase_invoices WHERE id = ?').get(cur.id);
            for (const it of items) {
              reverseStockForPurchaseLine({
                product_id: it.product_id,
                quantity:   it.quantity,
                invoice:    fresh,
              });
            }
          }
          db.prepare("UPDATE purchase_invoices SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?").run(cur.id);
          // After cancel, recompute WAC for every affected product.
          const distinctProductIds = [...new Set(items.map(i => i.product_id))];
          for (const pid of distinctProductIds) recomputeWacByReplay(pid);
          recordPurchaseActivity({
            purchase_invoice_id: cur.id, event: 'cancelled',
            notes: b.cancel_reason || 'تم إلغاء الفاتورة',
            actor_id: b.actor_id || null, actor_name: b.actor_name || null,
            metadata: { affected_products: distinctProductIds.length },
            is_test: cur.is_test,
          });
        }
      }

      // Payment update (allow on any non-cancelled invoice).
      if (Object.prototype.hasOwnProperty.call(b, 'amount_paid')) {
        const amt = Math.max(0, Number(b.amount_paid) || 0);
        db.prepare('UPDATE purchase_invoices SET amount_paid = ? WHERE id = ?').run(amt, cur.id);
        updateInvoicePaymentStatus(cur.id);
        recordPurchaseActivity({
          purchase_invoice_id: cur.id, event: 'payment_recorded',
          notes: `تم تسجيل دفعة بقيمة ${amt.toLocaleString()} ج`,
          actor_id: b.actor_id || null, actor_name: b.actor_name || null,
          metadata: { amount_paid: amt },
          is_test: cur.is_test,
        });
      }
    });
    tx();

    const hydrated = hydratePurchaseInvoice(cur.id);
    res.json({ ok: true, ...hydrated });
  } catch (e) { console.error('PATCH /api/purchases/:key', e); res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════════════════════
// ── Phase 1 Supplier payments endpoints ─────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
//
// POST   /api/supplier-payments              create with allocations[]
// GET    /api/supplier-payments              list with filters
// GET    /api/supplier-payments/aggregates   KPI cards
// GET    /api/supplier-payments/:key         hydrated (id or PAY-XXXX)
// DELETE /api/supplier-payments/:key         reverses allocations, recomputes invoice status

const PAY_DESTRUCTIVE_ROLES = new Set(['super_admin', 'inventory_admin']);

// POST /api/supplier-payments — record a payment with explicit allocations.
// Body: { supplier_id, amount, payment_date, payment_method, reference_number,
//         notes, receipt_path, allocations: [{ purchase_invoice_id, amount_allocated }] }
// Validation: sum(allocations.amount_allocated) MUST equal amount. Each
// allocated invoice belongs to the same supplier and isn't fully paid yet
// (allocating more than (total - amount_paid) returns 400).
app.post('/api/supplier-payments', (req, res) => {
  try {
    const b = req.body || {};
    if (!b.supplier_id) return res.status(400).json({ error: 'supplier_id required' });
    const amount = Number(b.amount);
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'amount must be > 0' });
    const supExists = db.prepare('SELECT id FROM suppliers WHERE id = ?').get(b.supplier_id);
    if (!supExists) return res.status(400).json({ error: 'supplier not found' });

    const allocations = Array.isArray(b.allocations) ? b.allocations : [];
    if (!allocations.length) return res.status(400).json({ error: 'at least one allocation required' });

    // Validate each allocation referenced invoice belongs to the same supplier
    // and isn't fully paid.
    const enrichedAllocs = [];
    for (const a of allocations) {
      const allocAmt = Number(a.amount_allocated);
      if (!Number.isFinite(allocAmt) || allocAmt <= 0) {
        return res.status(400).json({ error: 'each allocation needs amount_allocated > 0' });
      }
      const inv = db.prepare('SELECT * FROM purchase_invoices WHERE id = ?').get(a.purchase_invoice_id);
      if (!inv) return res.status(400).json({ error: `invoice not found: ${a.purchase_invoice_id}` });
      if (inv.supplier_id !== b.supplier_id) {
        return res.status(400).json({ error: `invoice ${inv.invoice_number} belongs to a different supplier` });
      }
      if (inv.status === 'cancelled') {
        return res.status(400).json({ error: `invoice ${inv.invoice_number} is cancelled` });
      }
      const owed = (Number(inv.total) || 0) - (Number(inv.amount_paid) || 0);
      if (allocAmt > owed + 0.001) {
        return res.status(400).json({ error: `allocation ${allocAmt} exceeds remaining ${owed} on ${inv.invoice_number}` });
      }
      enrichedAllocs.push({ ...a, amount_allocated: allocAmt, invoice: inv });
    }

    // Sum-validate.
    const allocSum = enrichedAllocs.reduce((s, a) => s + a.amount_allocated, 0);
    if (Math.abs(allocSum - amount) > 0.01) {
      return res.status(400).json({ error: `allocation sum ${allocSum} != payment amount ${amount}` });
    }

    const id = b.id || `pay_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
    const paymentNumber = b.payment_number || allocateSupplierPaymentNumber();
    const payDate = b.payment_date || new Date().toISOString().slice(0, 10);
    const isTest  = b.is_test ? 1 : 0;

    const tx = db.transaction(() => {
      db.prepare(`
        INSERT INTO supplier_payments
          (id, payment_number, supplier_id, amount, payment_date, payment_method,
           reference_number, receipt_path, notes, is_test, created_by)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
      `).run(
        id, paymentNumber, b.supplier_id, amount, payDate,
        b.payment_method || 'cash', b.reference_number || null,
        b.receipt_path || null, b.notes || null, isTest, b.created_by || null,
      );

      for (let i = 0; i < enrichedAllocs.length; i++) {
        const a = enrichedAllocs[i];
        const allocId = `alc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}_${i}`;
        db.prepare(`
          INSERT INTO supplier_payment_allocations
            (id, supplier_payment_id, purchase_invoice_id, amount_allocated, is_test)
          VALUES (?,?,?,?,?)
        `).run(allocId, id, a.purchase_invoice_id, a.amount_allocated, isTest);
        // Bump the invoice's amount_paid + recompute payment_status.
        db.prepare('UPDATE purchase_invoices SET amount_paid = COALESCE(amount_paid, 0) + ? WHERE id = ?')
          .run(a.amount_allocated, a.purchase_invoice_id);
        updateInvoicePaymentStatus(a.purchase_invoice_id);
        recordPurchaseActivity({
          purchase_invoice_id: a.purchase_invoice_id,
          event: 'payment_recorded',
          notes: `دفعة ${paymentNumber} — ${a.amount_allocated.toLocaleString()} ج`,
          actor_id: b.actor_id || null, actor_name: b.actor_name || null,
          metadata: { payment_id: id, payment_number: paymentNumber, amount: a.amount_allocated },
          is_test: isTest,
        });
      }
    });
    tx();

    const out = db.prepare('SELECT * FROM supplier_payments WHERE id = ?').get(id);
    out.allocations = db.prepare(`
      SELECT a.*, pi.invoice_number, pi.total AS invoice_total
      FROM supplier_payment_allocations a
      LEFT JOIN purchase_invoices pi ON pi.id = a.purchase_invoice_id
      WHERE a.supplier_payment_id = ?
    `).all(id);
    res.json({ ok: true, ...out });
  } catch (e) { console.error('POST /api/supplier-payments', e); res.status(500).json({ error: e.message }); }
});

// GET /api/supplier-payments — list with filters
app.get('/api/supplier-payments', (req, res) => {
  try {
    const { supplier_id, from, to, page, perPage } = req.query;
    let sql = `
      SELECT sp.*, s.name AS supplier_name
      FROM supplier_payments sp
      LEFT JOIN suppliers s ON s.id = sp.supplier_id
      WHERE 1=1`;
    const params = [];
    if (supplier_id && supplier_id !== 'all') { sql += ' AND sp.supplier_id = ?'; params.push(supplier_id); }
    if (from) { sql += ' AND sp.payment_date >= ?'; params.push(from); }
    if (to)   { sql += ' AND sp.payment_date <= ?'; params.push(to); }
    sql += ' ORDER BY sp.payment_date DESC, sp.created_at DESC';

    const totalRow = db.prepare(`SELECT COUNT(*) AS c FROM (${sql})`).get(...params);
    const totalRows = totalRow ? totalRow.c : 0;
    const perPg = Math.max(1, Math.min(100, Number(perPage) || 25));
    const pg    = Math.max(1, Number(page) || 1);
    sql += ' LIMIT ? OFFSET ?';
    params.push(perPg, (pg - 1) * perPg);

    const rows = db.prepare(sql).all(...params).map(r => {
      const allocs = db.prepare('SELECT COUNT(*) AS n, COALESCE(SUM(amount_allocated), 0) AS sum_alloc FROM supplier_payment_allocations WHERE supplier_payment_id = ?').get(r.id);
      r.allocations_count = allocs.n;
      r.allocations_total = Number(allocs.sum_alloc) || 0;
      return r;
    });
    res.json({ rows, total: totalRows, page: pg, perPage: perPg });
  } catch (e) { console.error('GET /api/supplier-payments', e); res.status(500).json({ error: e.message }); }
});

// GET /api/supplier-payments/aggregates — KPI cards
app.get('/api/supplier-payments/aggregates', (_req, res) => {
  try {
    const ym = new Date().toISOString().slice(0, 7);
    const monthRows = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) AS sum_amount, COUNT(*) AS cnt
      FROM supplier_payments
      WHERE (is_test = 0 OR is_test IS NULL)
        AND payment_date >= ? AND payment_date <= ?
    `).get(`${ym}-01`, `${ym}-31`);
    const avgPayment = monthRows.cnt > 0 ? (Number(monthRows.sum_amount) / monthRows.cnt) : 0;
    res.json({
      total_month:   Number(monthRows.sum_amount) || 0,
      count_month:   Number(monthRows.cnt)        || 0,
      avg_payment:   Math.round(avgPayment),
    });
  } catch (e) { console.error('GET /api/supplier-payments/aggregates', e); res.status(500).json({ error: e.message }); }
});

// GET /api/supplier-payments/:key — by id or PAY-XXXX, hydrated with allocations
app.get('/api/supplier-payments/:key', (req, res) => {
  try {
    const row = String(req.params.key).startsWith('PAY-')
      ? db.prepare('SELECT * FROM supplier_payments WHERE payment_number = ?').get(req.params.key)
      : db.prepare('SELECT * FROM supplier_payments WHERE id = ?').get(req.params.key);
    if (!row) return res.status(404).json({ error: 'not found' });
    const sup = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(row.supplier_id);
    const allocs = db.prepare(`
      SELECT a.*, pi.invoice_number, pi.invoice_date, pi.total AS invoice_total,
             pi.amount_paid AS invoice_paid, pi.payment_status AS invoice_payment_status
      FROM supplier_payment_allocations a
      LEFT JOIN purchase_invoices pi ON pi.id = a.purchase_invoice_id
      WHERE a.supplier_payment_id = ?
    `).all(row.id);
    res.json({ ...row, supplier: sup, allocations: allocs });
  } catch (e) { console.error('GET /api/supplier-payments/:key', e); res.status(500).json({ error: e.message }); }
});

// DELETE /api/supplier-payments/:key — reverse allocations, recompute invoice statuses
app.delete('/api/supplier-payments/:key', (req, res) => {
  try {
    const cur = String(req.params.key).startsWith('PAY-')
      ? db.prepare('SELECT * FROM supplier_payments WHERE payment_number = ?').get(req.params.key)
      : db.prepare('SELECT * FROM supplier_payments WHERE id = ?').get(req.params.key);
    if (!cur) return res.status(404).json({ error: 'not found' });
    if (!PAY_DESTRUCTIVE_ROLES.has(String((req.body || {}).actor_role || '').toLowerCase())) {
      return res.status(403).json({ error: 'role not permitted to delete a supplier payment' });
    }

    const tx = db.transaction(() => {
      const allocs = db.prepare('SELECT * FROM supplier_payment_allocations WHERE supplier_payment_id = ?').all(cur.id);
      for (const a of allocs) {
        db.prepare('UPDATE purchase_invoices SET amount_paid = MAX(0, COALESCE(amount_paid, 0) - ?) WHERE id = ?')
          .run(a.amount_allocated, a.purchase_invoice_id);
        updateInvoicePaymentStatus(a.purchase_invoice_id);
        recordPurchaseActivity({
          purchase_invoice_id: a.purchase_invoice_id,
          event: 'payment_recorded',
          notes: `حذف دفعة ${cur.payment_number} — -${a.amount_allocated.toLocaleString()} ج`,
          actor_id: (req.body || {}).actor_id || null,
          actor_name: (req.body || {}).actor_name || null,
          metadata: { reversed_payment_id: cur.id, amount: -a.amount_allocated },
          is_test: cur.is_test || 0,
        });
      }
      db.prepare('DELETE FROM supplier_payment_allocations WHERE supplier_payment_id = ?').run(cur.id);
      db.prepare('DELETE FROM supplier_payments WHERE id = ?').run(cur.id);
    });
    tx();
    res.json({ ok: true });
  } catch (e) { console.error('DELETE /api/supplier-payments/:key', e); res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════════════════════
// ── Phase 1 Enhanced suppliers endpoints ────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
//
// The base CRUD /api/suppliers already exists. These additions feed the
// Suppliers list KPI cards and the per-supplier details page.

// GET /api/suppliers/aggregates — 4 KPI cards
app.get('/api/suppliers/aggregates', (_req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) AS n FROM suppliers').get().n;
    // Active = ≥1 received invoice in last 90 days
    const ninety = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
    const active = db.prepare(`
      SELECT COUNT(DISTINCT supplier_id) AS n
      FROM purchase_invoices
      WHERE status = 'received'
        AND (is_test = 0 OR is_test IS NULL)
        AND invoice_date >= ?
    `).get(ninety).n;
    // Total Payables = unpaid remainder across all received invoices
    const payables = db.prepare(`
      SELECT COALESCE(SUM(total - COALESCE(amount_paid, 0)), 0) AS amount
      FROM purchase_invoices
      WHERE status = 'received'
        AND payment_status != 'paid'
        AND supplier_id IS NOT NULL
        AND (is_test = 0 OR is_test IS NULL)
    `).get().amount;
    // Average days-to-settle: payment_date - received_date across fully paid invoices.
    // Cheap heuristic — uses the last payment per invoice.
    const settleRows = db.prepare(`
      SELECT pi.received_date, MAX(sp.payment_date) AS last_pay
      FROM purchase_invoices pi
      LEFT JOIN supplier_payment_allocations spa ON spa.purchase_invoice_id = pi.id
      LEFT JOIN supplier_payments sp ON sp.id = spa.supplier_payment_id
      WHERE pi.payment_status = 'paid'
        AND pi.received_date IS NOT NULL
        AND (pi.is_test = 0 OR pi.is_test IS NULL)
      GROUP BY pi.id
      HAVING last_pay IS NOT NULL
    `).all();
    let avgDays = null;
    if (settleRows.length) {
      const sum = settleRows.reduce((s, r) => {
        const d1 = new Date(r.received_date).getTime();
        const d2 = new Date(r.last_pay).getTime();
        return s + Math.max(0, (d2 - d1) / 86400000);
      }, 0);
      avgDays = Math.round((sum / settleRows.length) * 10) / 10;
    }
    res.json({
      total_suppliers: total,
      active_suppliers: active,
      total_payables: Number(payables) || 0,
      avg_payment_days: avgDays,
    });
  } catch (e) { console.error('GET /api/suppliers/aggregates', e); res.status(500).json({ error: e.message }); }
});

// GET /api/suppliers/:id/details — full account view for the supplier details page.
// Lifetime totals + invoice history + payment history + top products supplied.
app.get('/api/suppliers/:id/details', (req, res) => {
  try {
    const sup = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(req.params.id);
    if (!sup) return res.status(404).json({ error: 'not found' });

    // Lifetime aggregates (excluding test data).
    const purSummary = db.prepare(`
      SELECT
        COUNT(*) AS count,
        COALESCE(SUM(total), 0) AS sum_total,
        COALESCE(SUM(amount_paid), 0) AS sum_paid,
        MIN(invoice_date) AS first_invoice,
        MAX(invoice_date) AS last_invoice
      FROM purchase_invoices
      WHERE supplier_id = ?
        AND status != 'cancelled'
        AND (is_test = 0 OR is_test IS NULL)
    `).get(req.params.id);
    const paySummary = db.prepare(`
      SELECT
        COUNT(*) AS count,
        COALESCE(SUM(amount), 0) AS sum_amount,
        MAX(payment_date) AS last_payment
      FROM supplier_payments
      WHERE supplier_id = ?
        AND (is_test = 0 OR is_test IS NULL)
    `).get(req.params.id);
    const balance = (Number(purSummary.sum_total) || 0) - (Number(purSummary.sum_paid) || 0);
    const avgInvoice = purSummary.count > 0 ? (Number(purSummary.sum_total) / purSummary.count) : 0;

    // Invoice history (newest first).
    const invoices = db.prepare(`
      SELECT id, invoice_number, invoice_date, received_date, total, amount_paid, payment_status, status
      FROM purchase_invoices
      WHERE supplier_id = ?
      ORDER BY invoice_date DESC, created_at DESC
      LIMIT 100
    `).all(req.params.id);

    // Payment history.
    const payments = db.prepare(`
      SELECT id, payment_number, payment_date, amount, payment_method, reference_number
      FROM supplier_payments
      WHERE supplier_id = ?
      ORDER BY payment_date DESC, created_at DESC
      LIMIT 100
    `).all(req.params.id);

    // Top products supplied by this supplier.
    const topProducts = db.prepare(`
      SELECT
        p.id, p.name,
        SUM(pii.quantity) AS qty_total,
        AVG(pii.effective_unit_cost) AS avg_cost,
        MAX(pi.received_date) AS last_supplied,
        (SELECT pii2.effective_unit_cost FROM purchase_invoice_items pii2
         JOIN purchase_invoices pi2 ON pi2.id = pii2.purchase_invoice_id
         WHERE pii2.product_id = p.id AND pi2.supplier_id = ?
           AND pi2.status != 'cancelled'
         ORDER BY pi2.received_date DESC, pii2.created_at DESC LIMIT 1) AS last_cost
      FROM purchase_invoice_items pii
      JOIN purchase_invoices pi ON pi.id = pii.purchase_invoice_id
      JOIN products p           ON p.id = pii.product_id
      WHERE pi.supplier_id = ?
        AND pi.status != 'cancelled'
        AND (pi.is_test = 0 OR pi.is_test IS NULL)
      GROUP BY p.id, p.name
      ORDER BY qty_total DESC
      LIMIT 10
    `).all(req.params.id, req.params.id);

    res.json({
      ...sup,
      summary: {
        lifetime_purchases: Number(purSummary.sum_total) || 0,
        lifetime_payments:  Number(paySummary.sum_amount) || 0,
        balance,                                       // >0 = you owe him; <0 = he owes you
        avg_invoice_value:  Math.round(avgInvoice),
        invoice_count:      Number(purSummary.count) || 0,
        payment_count:      Number(paySummary.count) || 0,
        first_invoice:      purSummary.first_invoice,
        last_invoice:       purSummary.last_invoice,
        last_payment:       paySummary.last_payment,
      },
      invoices,
      payments,
      top_products: topProducts.map(p => ({
        id: p.id, name: p.name,
        qty_total: Number(p.qty_total) || 0,
        avg_cost:  Math.round((Number(p.avg_cost) || 0) * 100) / 100,
        last_cost: Math.round((Number(p.last_cost) || 0) * 100) / 100,
        last_supplied: p.last_supplied,
      })),
    });
  } catch (e) { console.error('GET /api/suppliers/:id/details', e); res.status(500).json({ error: e.message }); }
});

// DELETE /api/purchases/:key — hard-delete (draft only). For received invoices,
// you must cancel first (which reverses stock). Then deletion is allowed.
app.delete('/api/purchases/:key', (req, res) => {
  try {
    const cur = (String(req.params.key).startsWith('PUR-')
      ? db.prepare('SELECT * FROM purchase_invoices WHERE invoice_number = ?').get(req.params.key)
      : db.prepare('SELECT * FROM purchase_invoices WHERE id = ?').get(req.params.key));
    if (!cur) return res.status(404).json({ error: 'not found' });
    if (!PUR_DESTRUCTIVE_ROLES.has(String((req.body || {}).actor_role || '').toLowerCase())) {
      return res.status(403).json({ error: 'role not permitted to delete a purchase invoice' });
    }
    if (cur.status === 'received') {
      return res.status(409).json({ error: 'cancel before deleting; received invoices have side-effects on stock' });
    }
    const tx = db.transaction(() => {
      // Allocations should be detached first (rare for drafts but defensive).
      db.prepare('DELETE FROM supplier_payment_allocations WHERE purchase_invoice_id = ?').run(cur.id);
      db.prepare('DELETE FROM purchase_invoice_items       WHERE purchase_invoice_id = ?').run(cur.id);
      db.prepare('DELETE FROM purchase_attachments         WHERE purchase_invoice_id = ?').run(cur.id);
      db.prepare('DELETE FROM purchase_activity_log        WHERE purchase_invoice_id = ?').run(cur.id);
      db.prepare('DELETE FROM purchase_invoices            WHERE id = ?').run(cur.id);
    });
    tx();
    res.json({ ok: true });
  } catch (e) { console.error('DELETE /api/purchases/:key', e); res.status(500).json({ error: e.message }); }
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

// Ordinary least squares on a series of {x, y} pairs. Returns slope +
// intercept (y = slope*x + intercept) plus the predicted value at xNext.
// Used by the 3-scenario forecast on /api/finance/summary. Returns null
// when there are fewer than 3 points (spec: "Disable forecast if less
// than 3 months of data").
function linearRegression(series, xNext) {
  const pts = (series || []).filter(p => p && Number.isFinite(p.x) && Number.isFinite(p.y));
  if (pts.length < 3) return null;
  const n = pts.length;
  const sumX  = pts.reduce((s,p) => s + p.x,           0);
  const sumY  = pts.reduce((s,p) => s + p.y,           0);
  const sumXY = pts.reduce((s,p) => s + p.x * p.y,     0);
  const sumXX = pts.reduce((s,p) => s + p.x * p.x,     0);
  const denom = (n * sumXX) - (sumX * sumX);
  if (denom === 0) return null; // degenerate (all x identical)
  const slope     = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  const predicted = slope * xNext + intercept;
  return { slope, intercept, predicted, n };
}

function aggregateFinance(fromISO, toISO) {
  // is_test guard: every aggregation excludes synthetic test rows so
  // smoke runs cannot move real business numbers. Real rows have
  // is_test = 0 or NULL (legacy); synthetic rows are explicit is_test = 1.
  const orders   = db.prepare('SELECT * FROM orders WHERE (is_test = 0 OR is_test IS NULL)').all();
  const products = db.prepare('SELECT id, name, cost FROM products WHERE (is_test = 0 OR is_test IS NULL)').all();
  // Finance reporting only counts settled (approved) expenses. Pending,
  // rejected, and pending_budget_approval rows are excluded from KPIs/charts
  // until a super admin actions them.
  const expenses = db.prepare(
    "SELECT * FROM expenses WHERE (status = 'approved' OR status IS NULL) AND (is_test = 0 OR is_test IS NULL)"
    + (fromISO ? ' AND date >= ?' : '')
    + (toISO   ? ' AND date <= ?' : '')).all(...[fromISO, toISO].filter(Boolean));
  const returnsRows = db.prepare('SELECT * FROM returns WHERE status = ? AND (is_test = 0 OR is_test IS NULL)').all('refunded');

  // Indexes for resolving line items → product cost/category/image. Lookup
  // by name (legacy) + by id (new orders carry it on items[]).
  const costByName = new Map(products.map(p => [(p.name||'').trim().toLowerCase(), Number(p.cost)||0]));
  const findCost   = (name) => costByName.get(String(name||'').trim().toLowerCase()) || 0;
  const productByName = new Map(products.map(p => [(p.name||'').trim().toLowerCase(), p]));
  // Pull category + image + a richer product row for the per-product / per-category breakdowns.
  // Single SELECT shared across the iteration.
  const productMeta = db.prepare("SELECT id, name, category, cost, COALESCE((SELECT json_extract(images, '$[0]') FROM products p2 WHERE p2.id = products.id), '') AS first_image FROM products").all();
  const metaByName = new Map(productMeta.map(p => [(p.name||'').trim().toLowerCase(), p]));

  let revenue = 0, cogs = 0, refunds = 0, orderCount = 0;
  const productAgg = new Map();
  const categoryAgg = new Map();             // section 7 — profit by product category
  const soldZeroCost = new Set();            // section 4 warning banner: products with cost=0 that DID sell
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
      // Phase 3 COGS: prefer cost_snapshot (stamped at order-create from WAC),
      // fall back to live products.cost lookup for any pre-snapshot rows.
      // This keeps historical orders priced at their original cost even after
      // later purchases shift the product's WAC.
      const cost  = Number(it.cost_snapshot) > 0
        ? Number(it.cost_snapshot)
        : findCost(it.name);
      cogs += cost * qty;
      const key = (it.name || '').trim() || '—';
      const meta = metaByName.get(key.toLowerCase());
      if (qty > 0 && cost === 0 && key && key !== '—') soldZeroCost.add(key);
      const prev = productAgg.get(key) || { name: key, qty: 0, revenue: 0, cost: 0, image: (meta && meta.first_image) || it.img || null };
      prev.qty     += qty;
      prev.revenue += qty * price;
      prev.cost    += qty * cost;
      productAgg.set(key, prev);
      // Aggregate into product-category bucket too (section 7).
      const catKey = (meta && meta.category) || 'غير مصنف';
      const catCur = categoryAgg.get(catKey) || { category: catKey, qty: 0, revenue: 0, cost: 0 };
      catCur.qty     += qty;
      catCur.revenue += qty * price;
      catCur.cost    += qty * cost;
      categoryAgg.set(catKey, catCur);
    });
  });
  returnsRows.forEach(r => {
    if (!inRangeISO(r.created_at, fromISO, toISO)) return;
    refunds += Number(r.amount) || 0;
  });

  // Expenses by category in range.
  //
  // ACCOUNTING NOTE — the `purchases` category (مشتريات منتجات) is being
  // deprecated. Buying inventory is NOT an operating expense — it's
  // converting cash to an asset. Counting it inflates expense totals and
  // shows fake losses in Net Profit. So:
  //   · `expensesTotal` excludes purchases (drives Net Profit)
  //   · `expensesByCategory` excludes purchases too (drives the breakdown
  //     table on Finance Dashboard — keeps the table semantically clean)
  //   · `inventoryPurchasesTotal` tracked separately and surfaced in the
  //     summary response so the dashboard can show a side-note
  //   · The cash IS still tracked: computeCashFlow() already buckets
  //     purchases-with-payment-date under cash_out.purchases, so the
  //     out-of-business cash movement is accurately reflected.
  //
  // Historical purchases rows remain visible on the Expenses admin page
  // (with a deprecation warning banner) so the admin can review and
  // reclassify them. Future P3 work: build a proper Purchases/Inventory
  // module that records purchases as asset acquisitions.
  const expensesByCategory = {};
  let expensesTotal = 0;
  let inventoryPurchasesTotal = 0;
  expenses.forEach(x => {
    const amt = Number(x.amount) || 0;
    if (x.category === 'purchases') {
      inventoryPurchasesTotal += amt;
      return;
    }
    expensesByCategory[x.category] = (expensesByCategory[x.category] || 0) + amt;
    expensesTotal += amt;
  });

  const grossProfit = revenue - cogs;
  const netProfit   = grossProfit - expensesTotal - refunds;
  const margin      = revenue ? (netProfit / revenue) * 100 : 0;    // legacy: net margin
  const grossMargin = revenue ? (grossProfit / revenue) * 100 : 0;  // new: gross margin (spec card 4)
  const netMargin   = margin;                                       // alias for clarity

  // Two product rankings — by revenue (legacy) AND by profit (new, spec sec 6).
  const productList = Array.from(productAgg.values()).map(p => ({
    ...p,
    profit:     p.revenue - p.cost,
    margin_pct: p.revenue ? Math.round(((p.revenue - p.cost) / p.revenue) * 100) : 0,
  }));
  const topByRevenue = productList.slice().sort((a,b) => b.revenue - a.revenue).slice(0, 5);
  const topByProfit  = productList.slice().sort((a,b) => b.profit  - a.profit ).slice(0, 5);

  // Profit by product category — sorted by profit DESC for the horizontal bar
  // chart in section 7. Includes qty/revenue/cost so the frontend can show
  // multiple metrics in a tooltip.
  const profitByCategory = Array.from(categoryAgg.values())
    .map(c => ({ ...c, profit: c.revenue - c.cost,
                 margin_pct: c.revenue ? Math.round(((c.revenue - c.cost) / c.revenue) * 100) : 0 }))
    .sort((a,b) => b.profit - a.profit);

  return {
    revenue, cogs, grossProfit, expensesTotal, refunds, netProfit, margin,
    grossMargin, netMargin,
    orderCount, expensesByCategory,
    inventoryPurchasesTotal,             // deprecated category — surfaced for the dashboard note
    topProducts: topByRevenue,           // legacy field — kept for back-compat
    topByRevenue, topByProfit,
    profitByCategory,
    expensesRows: expenses,
    cogsWarningProducts: Array.from(soldZeroCost), // section 4 warning banner
  };
}

// Shared cash-flow helper — used by /summary and the dedicated /cash-flow
// endpoint so both numbers always agree.
//
// Cash In  = orders where payment_status='paid' AND status != 'ملغي',
//            grouped by payment_method, filtered by payment_settled_at.
// Cash Out = approved expenses with payment_date in range. Returns refunds
//            already auto-create an expense row (returns Phase 2), so
//            they're naturally included.
function computeCashFlow(fromISO, toISO) {
  // Cash In, broken down by payment_method
  // is_test guard: exclude synthetic test orders from Cash In so smoke
  // runs don't move the real cash position.
  let sql = `
    SELECT COALESCE(payment_method, 'cash') AS pm, COALESCE(SUM(total), 0) AS amount, COUNT(*) AS n
    FROM orders
    WHERE payment_status = 'paid' AND status != 'ملغي'
      AND (is_test = 0 OR is_test IS NULL)`;
  const params = [];
  if (fromISO) { sql += ' AND payment_settled_at >= ?'; params.push(fromISO); }
  if (toISO)   { sql += " AND payment_settled_at <= ?"; params.push(toISO + ' 23:59:59'); }
  sql += ' GROUP BY pm';
  const inByMethod = db.prepare(sql).all(...params);
  const cashInTotal = inByMethod.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const inByMap = { cash:0, transfer:0, wallet:0, visa:0, card:0 };
  inByMethod.forEach(r => { inByMap[r.pm] = Number(r.amount) || 0; });

  // Cash Out: expenses paid in range — also filtered by is_test.
  let outSql = `
    SELECT COALESCE(payment_method,'cash') AS pm, COALESCE(category,'general') AS cat,
           COALESCE(source_ref,'') AS src, COALESCE(SUM(amount),0) AS amount, COUNT(*) AS n
    FROM expenses
    WHERE status = 'approved' AND payment_date IS NOT NULL
      AND (is_test = 0 OR is_test IS NULL)`;
  const outParams = [];
  if (fromISO) { outSql += ' AND payment_date >= ?'; outParams.push(fromISO); }
  if (toISO)   { outSql += " AND payment_date <= ?"; outParams.push(toISO + ' 23:59:59'); }
  outSql += ' GROUP BY pm, cat, src';
  const outRows = db.prepare(outSql).all(...outParams);
  const cashOutTotal = outRows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  // Sub-totals for the spec's right-column breakdown.
  const refundOut    = outRows.filter(r => r.src && r.src.startsWith('return:')).reduce((s,r) => s + (Number(r.amount)||0), 0);
  const purchasesOut = outRows.filter(r => r.cat === 'purchases').reduce((s,r) => s + (Number(r.amount)||0), 0);
  const otherOut     = cashOutTotal - refundOut - purchasesOut;

  return {
    cash_in:  cashInTotal,
    cash_out: cashOutTotal,
    net_cash: cashInTotal - cashOutTotal,
    in_breakdown: {
      cash:     inByMap.cash || 0,
      transfer: inByMap.transfer || 0,
      wallet:   inByMap.wallet || 0,
      visa:     (inByMap.visa || 0) + (inByMap.card || 0),  // legacy column tagged as 'card'
    },
    out_breakdown: {
      expenses:  otherOut,
      refunds:   refundOut,
      purchases: purchasesOut,
    },
  };
}

app.get('/api/finance/summary', (req, res) => {
  try {
    const { from, to, comparison } = req.query;
    const cur = aggregateFinance(from || null, to || null);
    const cashCur = computeCashFlow(from || null, to || null);

    // Previous-period KPIs (for % change). Comparison modes:
    //   'period'  (default) → same-length window immediately before [from, to]
    //   'yoy'              → same calendar window one year earlier
    let prev = null;
    let prevCash = null;
    let comparisonMode = comparison === 'yoy' ? 'yoy' : 'period';
    if (from && to) {
      const f = new Date(from), t = new Date(to);
      let prevFromD, prevToD;
      if (comparisonMode === 'yoy') {
        prevFromD = new Date(f); prevFromD.setFullYear(prevFromD.getFullYear() - 1);
        prevToD   = new Date(t); prevToD.setFullYear(prevToD.getFullYear() - 1);
      } else {
        const days = Math.round((t - f) / 86400000) + 1;
        prevFromD = new Date(f); prevFromD.setDate(prevFromD.getDate() - days);
        prevToD   = new Date(f); prevToD.setDate(prevToD.getDate() - 1);
      }
      const pfISO = prevFromD.toISOString().slice(0,10);
      const ptISO = prevToD.toISOString().slice(0,10);
      prev     = aggregateFinance(pfISO, ptISO);
      prevCash = computeCashFlow(pfISO, ptISO);
    }

    // Forecast (linear regression on last 6 months' net profit). Disabled
    // automatically when fewer than 3 monthly data points exist — caller
    // sees `forecast: null` and renders the "need more data" message.
    let forecast = null;
    try {
      const end = to ? new Date(to) : new Date();
      const start = new Date(end.getFullYear(), end.getMonth() - 5, 1);
      const series = [];
      const cursor = new Date(start);
      let x = 0;
      while (cursor <= end) {
        const y = cursor.getFullYear(), m = cursor.getMonth();
        const mFrom = `${y}-${String(m+1).padStart(2,'0')}-01`;
        const last = new Date(y, m+1, 0);
        const mTo   = `${y}-${String(m+1).padStart(2,'0')}-${String(last.getDate()).padStart(2,'0')}`;
        const agg = aggregateFinance(mFrom, mTo);
        series.push({ x, y: agg.netProfit });
        cursor.setMonth(cursor.getMonth() + 1);
        x += 1;
      }
      const reg = linearRegression(series, series.length); // predict NEXT period
      if (reg) {
        forecast = {
          realistic:   Math.round(reg.predicted),
          optimistic:  Math.round(reg.predicted * 1.20),
          pessimistic: Math.round(reg.predicted * 0.80),
          slope:       Math.round(reg.slope * 100) / 100,
          history:     series.map(p => Math.round(p.y)),
          method:      'OLS (ordinary least squares) on last 6 months\' net profit; ±20% scenarios',
        };
      }
    } catch (e) { console.warn('[nawra-api] forecast skipped:', e.message); }

    const pct = (a, b) => b ? Math.round(((a - b) / Math.abs(b)) * 100) : (a ? 100 : 0);
    res.json({
      revenue:        cur.revenue,
      cogs:           cur.cogs,
      gross_profit:   cur.grossProfit,
      gross_margin_pct: Math.round(cur.grossMargin * 10) / 10,
      expenses_total: cur.expensesTotal,
      // Inventory purchases are EXCLUDED from expenses_total per the new
      // accounting model (deprecated category — buying inventory is asset
      // conversion, not an operating expense). Frontend renders a side-note
      // on the Cash Flow card when this is > 0 so the admin sees how much
      // cash went out as inventory acquisition vs operating spend.
      inventory_purchases_total: cur.inventoryPurchasesTotal || 0,
      net_profit:     cur.netProfit,
      margin_pct:     Math.round(cur.margin * 10) / 10,   // legacy alias
      net_margin_pct: Math.round(cur.netMargin * 10) / 10, // new (spec card 7)
      order_count:    cur.orderCount,
      refunds:        cur.refunds,
      // Cash flow KPI card (spec card 8) — net cash for the period.
      cash_flow:      cashCur.net_cash,
      cash_in:        cashCur.cash_in,
      cash_out:       cashCur.cash_out,
      cash_in_breakdown:  cashCur.in_breakdown,
      cash_out_breakdown: cashCur.out_breakdown,
      expenses_by_category: cur.expensesByCategory,
      top_products:    cur.topProducts,       // legacy field
      top_by_revenue:  cur.topByRevenue,
      top_by_profit:   cur.topByProfit,
      profit_by_category: cur.profitByCategory,
      // Phase 3: inventory value as asset (separate from expenses).
      // Sum of (stock_available × WAC) across all non-test products.
      inventory_asset_value: (() => {
        try {
          const row = db.prepare(`
            SELECT COALESCE(SUM(stock * COALESCE(weighted_average_cost, cost, 0)), 0) AS v
            FROM products WHERE (is_test = 0 OR is_test IS NULL)
          `).get();
          return Math.round(Number(row.v) || 0);
        } catch { return 0; }
      })(),
      // Data integrity warnings — frontend renders a banner if these are non-empty.
      cogs_warning_count:    cur.cogsWarningProducts.length,
      cogs_warning_products: cur.cogsWarningProducts.slice(0, 5),
      // Forecast (null when < 3 months of data).
      forecast,
      comparison_mode: comparisonMode,
      change: prev ? {
        revenue:        pct(cur.revenue,      prev.revenue),
        cogs:           pct(cur.cogs,         prev.cogs),
        gross_profit:   pct(cur.grossProfit,  prev.grossProfit),
        gross_margin_pct: Math.round((cur.grossMargin - prev.grossMargin) * 10) / 10,
        expenses_total: pct(cur.expensesTotal, prev.expensesTotal),
        net_profit:     pct(cur.netProfit,    prev.netProfit),
        margin_pct:     Math.round((cur.margin - prev.margin) * 10) / 10,
        net_margin_pct: Math.round((cur.netMargin - prev.netMargin) * 10) / 10,
        cash_flow:      prevCash ? pct(cashCur.net_cash, prevCash.net_cash) : null,
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

// ── Phase-1 finance: cash flow, receivables/payables, profit-by-category, ──
//    key metrics (AOV/ITO/CAC/CLV), break-even, on-demand backfill.
//    All endpoints read the same source-of-truth tables as the aggregate
//    helpers above so numbers always reconcile.

// /cash-flow — detailed cash in/out breakdown (spec section 2 + section 11).
app.get('/api/finance/cash-flow', (req, res) => {
  try {
    const { from, to } = req.query;
    res.json(computeCashFlow(from || null, to || null));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// /receivables — money owed TO the store: COD orders not yet delivered,
// online orders awaiting settlement. Spec section 3 card A.
app.get('/api/finance/receivables', (_req, res) => {
  try {
    // COD pending = cash orders that haven't been delivered yet (status is
    // anything except مكتمل or ملغي). Their cash is "expected".
    // is_test guard so smoke orders don't inflate AR.
    const codRows = db.prepare(`
      SELECT COALESCE(SUM(total),0) AS amount, COUNT(*) AS n
      FROM orders WHERE payment_method = 'cash'
        AND status NOT IN ('مكتمل','ملغي')
        AND (is_test = 0 OR is_test IS NULL)`).get();
    // Online pending = non-cash orders not yet marked paid.
    const onlineRows = db.prepare(`
      SELECT COALESCE(SUM(total),0) AS amount, COUNT(*) AS n
      FROM orders WHERE payment_method != 'cash' AND payment_method IS NOT NULL
        AND payment_status != 'paid' AND status != 'ملغي'
        AND (is_test = 0 OR is_test IS NULL)`).get();
    res.json({
      total: Number(codRows.amount) + Number(onlineRows.amount),
      cod_pending:    { amount: Number(codRows.amount)    || 0, count: Number(codRows.n)    || 0 },
      online_pending: { amount: Number(onlineRows.amount) || 0, count: Number(onlineRows.n) || 0 },
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// /payables — money the store owes: approved-but-unpaid expenses, plus
// (Phase 1 stub) scheduled-this-month placeholder. Spec section 3 card B.
app.get('/api/finance/payables', (_req, res) => {
  try {
    // Approved expenses with no payment_date set yet = invoice received but not paid.
    // is_test guard so smoke expenses don't inflate AP.
    const unpaidRows = db.prepare(`
      SELECT COALESCE(SUM(amount),0) AS amount, COUNT(*) AS n
      FROM expenses WHERE status = 'approved' AND payment_date IS NULL
        AND (is_test = 0 OR is_test IS NULL)`).get();
    // Scheduled-this-month: recurring expenses (is_recurring=1) whose date
    // is in the current month and status='pending'. Lightweight indicator.
    const ym = new Date().toISOString().slice(0,7);
    const scheduledRows = db.prepare(`
      SELECT COALESCE(SUM(amount),0) AS amount, COUNT(*) AS n
      FROM expenses WHERE is_recurring = 1 AND status = 'pending' AND date LIKE ?
        AND (is_test = 0 OR is_test IS NULL)`).get(`${ym}%`);
    res.json({
      total: Number(unpaidRows.amount) + Number(scheduledRows.amount),
      pending_invoices:     { amount: Number(unpaidRows.amount)    || 0, count: Number(unpaidRows.n)    || 0 },
      scheduled_this_month: { amount: Number(scheduledRows.amount) || 0, count: Number(scheduledRows.n) || 0 },
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// /profit-by-category — spec section 7. Returns sorted bars.
app.get('/api/finance/profit-by-category', (req, res) => {
  try {
    const { from, to } = req.query;
    const cur = aggregateFinance(from || null, to || null);
    res.json({ rows: cur.profitByCategory, revenue: cur.revenue, gross_profit: cur.grossProfit });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// /key-metrics — AOV, Inventory Turnover, CAC, CLV. Each comes with a
// 6-period sparkline (one number per month) so the frontend can render
// the trend without a second request. Spec section 9.
// GET /api/finance/balance-sheet — Phase 3 spec section G.5
// Lifetime snapshot of the simple balance sheet.
//   Assets      = Cash (running) + Inventory (WAC × stock) + Receivables
//   Liabilities = Payables (unpaid purchase invoices + unpaid expenses)
//   Equity      = Assets − Liabilities
// Cash is approximated as (lifetime cash_in − lifetime cash_out). Real
// stores would seed an opening cash balance via settings.store.opening_cash
// — supported here as an additive offset when set.
app.get('/api/finance/balance-sheet', (_req, res) => {
  try {
    const NOT_TEST = '(is_test = 0 OR is_test IS NULL)';

    // ── Assets ─────────────────────────────────────────────────────────
    // Cash position: lifetime cash_in (paid orders) − lifetime cash_out
    // (paid expenses + supplier_payments).
    const cashInRow = db.prepare(`
      SELECT COALESCE(SUM(total), 0) AS amount FROM orders
      WHERE payment_status = 'paid' AND status != 'ملغي' AND ${NOT_TEST}
    `).get();
    const expCashOutRow = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) AS amount FROM expenses
      WHERE status = 'approved' AND payment_date IS NOT NULL
        AND category != 'purchases' AND ${NOT_TEST}
    `).get();
    const suppPaidRow = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) AS amount FROM supplier_payments
      WHERE ${NOT_TEST}
    `).get();
    let openingCash = 0;
    try {
      const row = db.prepare("SELECT value FROM settings WHERE key = 'store'").get();
      const s = row ? JSON.parse(row.value || '{}') : {};
      openingCash = Number(s.opening_cash) || 0;
    } catch {}
    const cash = openingCash + Number(cashInRow.amount) - Number(expCashOutRow.amount) - Number(suppPaidRow.amount);

    // Inventory asset: stock × WAC across real products.
    const invRow = db.prepare(`
      SELECT COALESCE(SUM(stock * COALESCE(weighted_average_cost, cost, 0)), 0) AS v
      FROM products WHERE ${NOT_TEST}
    `).get();
    const inventory = Math.round(Number(invRow.v) || 0);

    // Receivables: unpaid COD + unpaid online orders not cancelled.
    const codPendingRow = db.prepare(`
      SELECT COALESCE(SUM(total),0) AS amount FROM orders
      WHERE payment_method = 'cash' AND status NOT IN ('مكتمل','ملغي') AND ${NOT_TEST}
    `).get();
    const onlinePendingRow = db.prepare(`
      SELECT COALESCE(SUM(total),0) AS amount FROM orders
      WHERE payment_method != 'cash' AND payment_method IS NOT NULL
        AND payment_status != 'paid' AND status != 'ملغي' AND ${NOT_TEST}
    `).get();
    const receivables = Number(codPendingRow.amount) + Number(onlinePendingRow.amount);

    // ── Liabilities ────────────────────────────────────────────────────
    // Purchase-invoice payables (received + not fully paid).
    const purInvPayRow = db.prepare(`
      SELECT COALESCE(SUM(total - COALESCE(amount_paid, 0)), 0) AS amount
      FROM purchase_invoices
      WHERE status = 'received' AND payment_status != 'paid'
        AND supplier_id IS NOT NULL AND ${NOT_TEST}
    `).get();
    const expensePayRow = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) AS amount FROM expenses
      WHERE status = 'approved' AND payment_date IS NULL AND ${NOT_TEST}
    `).get();
    const purchaseInvoicePayables = Number(purInvPayRow.amount) || 0;
    const expensePayables         = Number(expensePayRow.amount) || 0;
    const payables                = purchaseInvoicePayables + expensePayables;

    const totalAssets      = Math.round(cash + inventory + receivables);
    const totalLiabilities = Math.round(payables);
    const equity           = totalAssets - totalLiabilities;

    res.json({
      assets: {
        cash:        Math.round(cash),
        inventory,
        receivables: Math.round(receivables),
        total:       totalAssets,
      },
      liabilities: {
        supplier_payables: Math.round(purchaseInvoicePayables),
        expense_payables:  Math.round(expensePayables),
        total:             totalLiabilities,
      },
      equity,
      opening_cash:        Math.round(openingCash),
      // Diagnostic — lets the frontend annotate the Balance Sheet card.
      computed_at: new Date().toISOString(),
    });
  } catch (e) { console.error('GET /api/finance/balance-sheet', e); res.status(500).json({ error: e.message }); }
});

app.get('/api/finance/key-metrics', (req, res) => {
  try {
    const { from, to } = req.query;
    const cur = aggregateFinance(from || null, to || null);
    // AOV (current period)
    const aov = cur.orderCount ? cur.revenue / cur.orderCount : 0;
    // Inventory Turnover (annualized): COGS / average inventory value
    // Average inventory value approximated as current value at cost (single
    // snapshot — improved when stock_movements are factored in Phase 3).
    const invRow = db.prepare("SELECT COALESCE(SUM((COALESCE(stock,0)+COALESCE(stock_reserved,0)) * COALESCE(cost,0)), 0) AS inv FROM products WHERE (is_test = 0 OR is_test IS NULL)").get();
    const invValue = Number(invRow.inv) || 0;
    // Annualize the rate by extrapolating the period's COGS — if the period
    // is shorter than a year, multiply by (365 / days). Falls back to raw
    // ratio when the range isn't bounded.
    let inventoryTurnover = 0;
    if (invValue > 0) {
      let factor = 1;
      if (from && to) {
        const days = Math.max(1, Math.round((new Date(to) - new Date(from)) / 86400000) + 1);
        factor = 365 / days;
      }
      inventoryTurnover = Math.round((cur.cogs * factor / invValue) * 10) / 10;
    }
    // CAC = marketing expenses ÷ new customers in the period.
    // is_test guards so smoke expenses + users don't move CAC/CLV.
    const mkRow = db.prepare(`
      SELECT COALESCE(SUM(amount),0) AS amount FROM expenses
      WHERE status = 'approved' AND category = 'marketing'
        AND (is_test = 0 OR is_test IS NULL)`
      + (from ? ' AND date >= ?' : '')
      + (to   ? ' AND date <= ?' : '')).get(...[from, to].filter(Boolean));
    const newCustRow = db.prepare(`
      SELECT COUNT(*) AS n FROM users WHERE (is_test = 0 OR is_test IS NULL)`
      + (from ? ' AND COALESCE(registered_at, firstOrder) >= ?' : '')
      + (to   ? ' AND COALESCE(registered_at, firstOrder) <= ?' : '')).get(...[from, to].filter(Boolean));
    const newCount = Number(newCustRow.n) || 0;
    const marketing = Number(mkRow.amount) || 0;
    const cac = newCount > 0 ? Math.round(marketing / newCount) : 0;
    // CLV = average totalSpent per customer (all-time, simple version).
    const clvRow = db.prepare(`
      SELECT COALESCE(AVG(totalSpent), 0) AS clv, COUNT(*) AS n
      FROM users WHERE totalOrders > 0 AND (is_test = 0 OR is_test IS NULL)`).get();
    const clv = Math.round(Number(clvRow.clv) || 0);

    // 6-period sparklines: one value per month going back from `to` (or now).
    const end = to ? new Date(to) : new Date();
    const sparks = { aov: [], inventory_turnover: [], cac: [], clv: [] };
    for (let i = 5; i >= 0; i--) {
      const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
      const y = d.getFullYear(), m = d.getMonth();
      const mFrom = `${y}-${String(m+1).padStart(2,'0')}-01`;
      const last  = new Date(y, m+1, 0);
      const mTo   = `${y}-${String(m+1).padStart(2,'0')}-${String(last.getDate()).padStart(2,'0')}`;
      const agg = aggregateFinance(mFrom, mTo);
      sparks.aov.push(agg.orderCount ? Math.round(agg.revenue / agg.orderCount) : 0);
      // Cheap inventory-turnover proxy per-month: COGS / current inv value × 12 (months/yr).
      sparks.inventory_turnover.push(invValue > 0 ? Math.round((agg.cogs * 12 / invValue) * 10) / 10 : 0);
      const mMk = (agg.expensesByCategory && agg.expensesByCategory.marketing) || 0;
      const mNewRow = db.prepare(`
        SELECT COUNT(*) AS n FROM users WHERE (is_test = 0 OR is_test IS NULL)
          AND COALESCE(registered_at, firstOrder) >= ? AND COALESCE(registered_at, firstOrder) <= ?`).get(mFrom, mTo);
      const mNew = Number(mNewRow.n) || 0;
      sparks.cac.push(mNew > 0 ? Math.round(mMk / mNew) : 0);
      // CLV per month is stable (it's an all-time avg) — store same value
      // each cell so the sparkline at least renders a flat line.
      sparks.clv.push(clv);
    }

    res.json({
      aov:                { value: Math.round(aov), sparkline: sparks.aov },
      inventory_turnover: { value: inventoryTurnover, inv_value: Math.round(invValue), sparkline: sparks.inventory_turnover },
      cac:                { value: cac, marketing: Math.round(marketing), new_customers: newCount, sparkline: sparks.cac },
      clv:                { value: clv, customers: Number(clvRow.n) || 0, sparkline: sparks.clv },
    });
  } catch (e) { console.error('GET /api/finance/key-metrics error:', e); res.status(500).json({ error: e.message }); }
});

// /break-even — spec section 8.
//   fixed_monthly_expenses = sum of type='fixed' expenses for current month
//                            (approved status only)
//   gross_margin_pct       = period gross margin (from aggregateFinance)
//   break_even_revenue     = fixed / (gross_margin_pct / 100)
//   current_revenue        = revenue in current calendar month
//   projected_revenue      = current_revenue × (days_in_month / day_of_month)
app.get('/api/finance/break-even', (_req, res) => {
  try {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth();
    const mFrom = `${y}-${String(m+1).padStart(2,'0')}-01`;
    const lastDay = new Date(y, m+1, 0).getDate();
    const mTo   = `${y}-${String(m+1).padStart(2,'0')}-${String(lastDay).padStart(2,'0')}`;

    const fixedRow = db.prepare(`
      SELECT COALESCE(SUM(amount),0) AS amt FROM expenses
      WHERE type = 'fixed' AND status = 'approved' AND date >= ? AND date <= ?
        AND (is_test = 0 OR is_test IS NULL)`).get(mFrom, mTo);
    const fixed = Number(fixedRow.amt) || 0;

    const agg = aggregateFinance(mFrom, mTo);
    const grossMarginPct = agg.grossMargin;   // 0..100
    const breakEvenRevenue = grossMarginPct > 0 ? Math.round(fixed / (grossMarginPct / 100)) : null;
    const currentDay = now.getDate();
    const projected = currentDay > 0 ? Math.round(agg.revenue * (lastDay / currentDay)) : 0;
    const pct = breakEvenRevenue ? Math.round((agg.revenue / breakEvenRevenue) * 100) : null;
    const daysRemaining = lastDay - currentDay;

    res.json({
      year: y, month: m + 1,
      fixed_monthly_expenses: Math.round(fixed),
      gross_margin_pct:       Math.round(grossMarginPct * 10) / 10,
      break_even_revenue:     breakEvenRevenue,
      current_revenue:        Math.round(agg.revenue),
      projected_revenue:      projected,
      pct_of_break_even:      pct,        // null when margin <= 0
      days_remaining:         daysRemaining,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/finance/backfill — populate finance_monthly_summary on demand.
// Body: { from_year, to_year } OR { from: 'YYYY-MM', to: 'YYYY-MM' }.
// If both missing, defaults to ALL months that have any order or expense
// (intelligent default). Idempotent (UPSERT). Returns counts.
app.post('/api/finance/backfill', (req, res) => {
  try {
    const b = req.body || {};
    let startY, startM, endY, endM;
    if (b.from && b.to) {
      [startY, startM] = b.from.split('-').map(Number);
      [endY,   endM]   = b.to.split('-').map(Number);
    } else if (b.from_year && b.to_year) {
      startY = Number(b.from_year); startM = 1;
      endY   = Number(b.to_year);   endM   = 12;
    } else {
      // Smart default — scan min/max date across orders+expenses.
      const minRow = db.prepare(`
        SELECT MIN(d) AS d FROM (
          SELECT MIN(COALESCE(created_at, date)) AS d FROM orders
          UNION ALL SELECT MIN(date) AS d FROM expenses
        )`).get();
      const earliest = minRow && minRow.d ? new Date(String(minRow.d).slice(0,10)) : new Date();
      startY = earliest.getFullYear(); startM = earliest.getMonth() + 1;
      const now = new Date();
      endY = now.getFullYear(); endM = now.getMonth() + 1;
    }

    const upsert = db.prepare(`
      INSERT INTO finance_monthly_summary (
        id, year, month, revenue, cogs, gross_profit, total_expenses, net_profit,
        cash_in, cash_out, orders_count, customers_count, new_customers_count, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(year, month) DO UPDATE SET
        revenue             = excluded.revenue,
        cogs                = excluded.cogs,
        gross_profit        = excluded.gross_profit,
        total_expenses      = excluded.total_expenses,
        net_profit          = excluded.net_profit,
        cash_in             = excluded.cash_in,
        cash_out            = excluded.cash_out,
        orders_count        = excluded.orders_count,
        customers_count     = excluded.customers_count,
        new_customers_count = excluded.new_customers_count,
        updated_at          = datetime('now')
    `);

    let populated = 0;
    const cursor = new Date(startY, startM - 1, 1);
    const endDate = new Date(endY,   endM   - 1, 1);
    while (cursor <= endDate) {
      const y = cursor.getFullYear(), m = cursor.getMonth();
      const mFrom = `${y}-${String(m+1).padStart(2,'0')}-01`;
      const last  = new Date(y, m+1, 0);
      const mTo   = `${y}-${String(m+1).padStart(2,'0')}-${String(last.getDate()).padStart(2,'0')}`;
      const agg = aggregateFinance(mFrom, mTo);
      const cf  = computeCashFlow(mFrom, mTo);
      // customers active in the month = distinct userEmail across non-cancelled orders
      // is_test guards so synthetic smoke runs can't bump the monthly snapshot.
      const custRow = db.prepare(`
        SELECT COUNT(DISTINCT LOWER(userEmail)) AS n FROM orders
        WHERE status != 'ملغي' AND created_at >= ? AND created_at <= ?
          AND (is_test = 0 OR is_test IS NULL)`).get(mFrom, mTo + ' 23:59:59');
      const newCustRow = db.prepare(`
        SELECT COUNT(*) AS n FROM users
        WHERE (is_test = 0 OR is_test IS NULL)
          AND COALESCE(registered_at, firstOrder) >= ? AND COALESCE(registered_at, firstOrder) <= ?`).get(mFrom, mTo + ' 23:59:59');
      const id = `fms_${y}_${String(m+1).padStart(2,'0')}`;
      upsert.run(
        id, y, m + 1,
        Math.round(agg.revenue), Math.round(agg.cogs), Math.round(agg.grossProfit),
        Math.round(agg.expensesTotal), Math.round(agg.netProfit),
        Math.round(cf.cash_in), Math.round(cf.cash_out),
        agg.orderCount, Number(custRow.n) || 0, Number(newCustRow.n) || 0
      );
      populated += 1;
      cursor.setMonth(cursor.getMonth() + 1);
    }
    res.json({ ok: true, populated, from: `${startY}-${String(startM).padStart(2,'0')}`, to: `${endY}-${String(endM).padStart(2,'0')}` });
  } catch (e) { console.error('POST /api/finance/backfill', e); res.status(500).json({ error: e.message }); }
});

// GET /api/finance/monthly — read the cached monthly summaries (Phase 2
// frontend will use this for the long-range chart; backfill must be run
// first or the table will be empty for past months).
app.get('/api/finance/monthly', (req, res) => {
  try {
    const { from, to, limit } = req.query;
    let sql = "SELECT * FROM finance_monthly_summary WHERE 1=1";
    const params = [];
    if (from) { const [y,m] = from.split('-').map(Number); sql += " AND (year > ? OR (year = ? AND month >= ?))"; params.push(y, y, m); }
    if (to)   { const [y,m] = to.split('-').map(Number);   sql += " AND (year < ? OR (year = ? AND month <= ?))"; params.push(y, y, m); }
    sql += " ORDER BY year ASC, month ASC";
    if (limit) { sql += " LIMIT ?"; params.push(Number(limit)); }
    res.json(db.prepare(sql).all(...params));
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
        INSERT INTO expenses (id, category, description, quantity, unit_price, amount, date, notes, is_test)
        VALUES (?, 'general', ?, ?, ?, ?, date('now'), ?, ?)
      `).run(expId,
        `وارد — ${product.name}${b.supplier ? ' (' + b.supplier + ')' : ''}`,
        qty, unitCost, unitCost * qty, b.notes || `حركة #${mvId}`,
        product.is_test ? 1 : 0);
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
