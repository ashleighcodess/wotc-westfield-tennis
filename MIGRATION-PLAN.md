# Database Migration Plan: KV → Cloudflare D1 + R2

## Overview
Migrate from Cloudflare Workers KV (JSON blobs with inline base64 images) to Cloudflare D1 (SQLite relational database) + R2 (object storage for images). This gives production-grade durability, proper queries, and efficient image handling.

---

## Current Architecture
- **Data**: All items stored as JSON arrays in KV, one key per collection (`events`, `programs`, `posts`, `announcements`, `products`)
- **Images**: Base64 data URLs stored inline in JSON objects
- **Auth**: Simple password check → JWT token in sessionStorage
- **API**: `functions/api/data.js` (CRUD) + `functions/api/auth.js` (login)
- **Client**: `dashboard/js/data.js` (optimistic updates + API sync)

## Target Architecture
- **Data**: D1 SQLite database with proper tables and columns
- **Images**: Files in R2 bucket, URLs stored in D1
- **Auth**: Same JWT approach (can upgrade to Cloudflare Access later)
- **API**: Updated Workers functions using D1 bindings + R2 bindings

---

## Phase 1: Setup Infrastructure

### 1.1 Create D1 Database
```bash
npx wrangler d1 create wotc-tennis-db
```

### 1.2 Create R2 Bucket
```bash
npx wrangler r2 bucket create wotc-tennis-images
```

### 1.3 Update `wrangler.toml`
```toml
[[d1_databases]]
binding = "DB"
database_name = "wotc-tennis-db"
database_id = "<id-from-step-1>"

[[r2_buckets]]
binding = "IMAGES"
bucket_name = "wotc-tennis-images"
```

---

## Phase 2: Database Schema

Create `schema.sql`:

```sql
CREATE TABLE events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    category TEXT DEFAULT 'social',
    price REAL DEFAULT 0,
    description TEXT,
    image_url TEXT,
    stripe_link TEXT,
    visible INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE programs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    schedule TEXT,
    time TEXT,
    level TEXT DEFAULT 'all',
    price REAL DEFAULT 0,
    price_type TEXT DEFAULT 'per session',
    description TEXT,
    image_url TEXT,
    stripe_link TEXT,
    visible INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT DEFAULT 'announcement',
    content TEXT,
    image_url TEXT,
    video_url TEXT,
    visible INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE affiliate_links (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    image_url TEXT,
    visible INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    price REAL NOT NULL,
    sale_price REAL,
    category TEXT DEFAULT 'apparel',
    description TEXT,
    image_url TEXT,
    stripe_link TEXT,
    visible INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
```

Apply schema:
```bash
npx wrangler d1 execute wotc-tennis-db --file=./schema.sql
```

---

## Phase 3: Image Upload → R2

### 3.1 New API Endpoint: `functions/api/upload.js`

Accepts image file via FormData, stores in R2, returns public URL.

```
POST /api/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

Response: { "url": "https://images.westfieldindoortennis.com/events/abc123.jpg" }
```

Key details:
- Keep the client-side Canvas compression (saves bandwidth on mobile upload)
- Convert base64 data URL to binary blob before sending
- Store in R2 with path like `{collection}/{id}.jpg`
- Return the R2 public URL to store in D1

### 3.2 R2 Public Access

Option A: Enable R2 public bucket access via custom domain
Option B: Create a Worker route that serves images from R2

---

## Phase 4: Update API Functions

### 4.1 Replace `functions/api/data.js`

Change from:
```js
const items = JSON.parse(await env.WOTC_KV.get(type)) || [];
```

To D1 queries:
```js
const { results } = await env.DB.prepare('SELECT * FROM events WHERE visible = 1 ORDER BY date DESC').all();
```

### 4.2 CRUD Operations Pattern

```js
// CREATE
await env.DB.prepare('INSERT INTO events (id, title, date, ...) VALUES (?, ?, ?, ...)')
    .bind(id, title, date, ...).run();

// READ
const { results } = await env.DB.prepare('SELECT * FROM events').all();

// UPDATE
await env.DB.prepare('UPDATE events SET title = ?, date = ? WHERE id = ?')
    .bind(title, date, id).run();

// DELETE
await env.DB.prepare('DELETE FROM events WHERE id = ?').bind(id).run();

// TOGGLE VISIBILITY
await env.DB.prepare('UPDATE events SET visible = NOT visible WHERE id = ?').bind(id).run();
```

---

## Phase 5: Update Dashboard Client

### 5.1 Image Upload Flow Change

Current: File → Canvas compress → base64 data URL → JSON body → KV
New: File → Canvas compress → base64 → convert to Blob → FormData POST to /api/upload → get URL back → save URL with item data

### 5.2 Update `dashboard/js/data.js`

- Add `uploadImage(file)` method that POSTs to `/api/upload`
- Update `create()` and `update()` to handle image URLs instead of data URLs
- API responses stay the same shape (arrays of objects) so render functions need minimal changes

### 5.3 Update `dashboard/admin.html`

- `ImageUpload.compress()` stays the same
- Add step after compression: upload blob to R2 via API, get URL back
- Store URL (not base64) in the hidden input
- Preview still uses the local data URL for instant feedback

---

## Phase 6: Data Migration Script

One-time script to move existing KV data into D1 + R2:

```js
// For each collection type:
// 1. Read JSON array from KV
// 2. For each item with a base64 image:
//    a. Decode base64 to binary
//    b. Upload to R2
//    c. Get R2 URL
// 3. Insert item into D1 with image_url instead of image data
```

Run via: `npx wrangler d1 execute` or a temporary Worker script.

---

## Phase 7: Public Site Updates

Update frontend templates to use image URLs instead of base64 data URLs:

- `public/events.html` — already renders `event.image` in `<img src="">`, will work with URLs
- `public/programs.html` — add image rendering if not present
- `public/shop.html` — add product image rendering
- `club/` pages — update if they reference images

Since `<img src="">` works with both base64 data URLs and regular URLs, the public pages may need zero changes if the field name stays `image`.

---

## Phase 8: Security Hardening (Production)

- [ ] Move auth secret to Cloudflare environment variable (not in code)
- [ ] Add rate limiting to auth endpoint
- [ ] Consider Cloudflare Access for dashboard (SSO/email-based login)
- [ ] Set CORS headers to restrict API access to your domain
- [ ] Enable R2 access controls (signed URLs if images should be private)
- [ ] Set up D1 automatic backups
- [ ] Add CSP headers to prevent XSS

---

## Estimated Costs (Cloudflare Free Tier)

| Service | Free Tier | Expected Usage |
|---------|-----------|---------------|
| D1 | 5GB storage, 5M reads/day | Well under limits |
| R2 | 10GB storage, 10M reads/month | ~50-100 images = <100MB |
| Workers | 100K requests/day | Well under limits |
| Pages | Unlimited sites, 500 builds/month | Well under limits |

**Total estimated cost: $0/month** for a tennis club site of this scale.

---

## File Changes Summary

| File | Change |
|------|--------|
| `wrangler.toml` | Add D1 + R2 bindings |
| `schema.sql` | New file — database schema |
| `functions/api/data.js` | Rewrite KV → D1 queries |
| `functions/api/upload.js` | New file — R2 image upload endpoint |
| `functions/api/seed.js` | Update to seed D1 instead of KV |
| `dashboard/js/data.js` | Add image upload method, same API shape |
| `dashboard/admin.html` | Update ImageUpload to POST files to R2 |
| `public/*.html` | Minimal or no changes (URLs work in img src) |
