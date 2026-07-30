# Lagom Design — Website & CMS

A Next.js (App Router) marketing site for Lagom Design with a lightweight,
self-hosted CMS for managing portfolio work and contact enquiries.

## Features

- Public site: home, about, services, contact, and a dynamic `/work` portfolio.
- Each project has its own page at `/work/[slug]` with a full-viewport hero
  (no site header), a description, and a stack of full-width gallery images.
- Password-protected admin at `/admin` to create, edit, delete and reorder
  client work, upload images, and review contact form enquiries. Password is
  stored in the database (changeable in Settings) with email OTP recovery at
  `/admin/forgot-password`.
- Contact form submissions are stored in the database, emailed to
  `studiolagomdesign@gmail.com`, and managed from `/admin/submissions`.

## Tech stack

- Next.js 16 (App Router) + React 19
- Prisma ORM with MySQL
- `iron-session` for admin authentication
- Filesystem image uploads served via `/api/uploads/[...path]`

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template and fill in the values:

```bash
cp .env.example .env
```

- `DATABASE_URL` — your MySQL connection string.
- `ADMIN_PASSWORD_HASH` — **optional bootstrap only.** bcrypt hash of the initial
  admin password. On first login the app copies it into the database `Setting`
  table; after that the DB is the only source of truth (change password in
  `/admin/settings`, or use Forgot password). Generate with:

```bash
node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
```

  In `.env`, escape every `$` as `\$` (Next.js expands `$` in quoted values). Example:

```bash
ADMIN_PASSWORD_HASH="\$2b\$10\$..."
```

  Prefer skipping a fragile env hash on Hostinger: set `RESEND_API_KEY`, deploy,
  open `/admin/forgot-password`, send OTP to `studiolagomdesign@gmail.com`, and
  set the password there.
- `SESSION_SECRET` — a random string of at least 32 characters. Generate with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

- `UPLOAD_DIR` — absolute path to a writable, persistent directory for uploaded
  images. Defaults to `./uploads`.
- `RESEND_API_KEY` — API key from [Resend](https://resend.com) for contact form
  notifications and admin password-recovery OTPs (always sent to
  `studiolagomdesign@gmail.com` only).
- `EMAIL_FROM` — sender address. Until your domain is verified in Resend, use:

```bash
EMAIL_FROM=Lagom Design <onboarding@resend.dev>
```

  The app also auto-falls back to `onboarding@resend.dev` if a custom domain
  is rejected. Note: your Resend domain `studiolagomdesign.com` must show
  **verified** (not failed) before custom From addresses work. After verifying:

  `Lagom Design <noreply@studiolagomdesign.com>`.

3. Create the database tables:

```bash
npm run prisma:push
```

4. (Optional) Seed the six placeholder projects from the original design:

```bash
npm run db:seed
```

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the site and
[http://localhost:3000/admin](http://localhost:3000/admin) for the admin login.

## Useful scripts

- `npm run dev` — start the dev server.
- `npm run build` — generate the Prisma client and build for production.
- `npm start` — start the production server (reads `PORT` from the environment).
- `npm run prisma:push` — sync the schema to the database (local dev shortcut).
- `npm run prisma:migrate` — create and apply a migration in development.
- `npm run prisma:migrate:deploy` — apply pending migrations in production.
- `npm run db:seed` — seed placeholder portfolio entries.

## Deploying on Hostinger (Node.js hosting)

This app requires **Hostinger Web Hosting with Node.js support**. It does not run on PHP-only shared hosting.

### Where to find settings in hPanel

| What you need | Where in Hostinger hPanel |
|---------------|---------------------------|
| Node.js app (build/start commands) | **Websites** → your domain → **Manage** → **Node.js** (or **Advanced** → **Node.js**) |
| Environment variables | Same Node.js section → **Environment variables** |
| MySQL `DATABASE_URL` | **Databases** → **MySQL Databases** → create database + user |
| `UPLOAD_DIR` path | **Files** → **File Manager** → note home path (e.g. `/home/<user>/`) |
| SSL (required for admin cookies) | **Security** → **SSL** |

### Recommended hPanel settings

| Setting | Value |
|---------|-------|
| Node.js version | 20.x or 22.x |
| Build command | `npm run build` |
| Start command | `npm start` |
| Application root | folder containing `package.json` |

### Production environment variables

Set these in the Node.js **Environment variables** section:

```bash
DATABASE_URL=mysql://USER:PASS@HOST:3306/DBNAME
SESSION_SECRET=<64-char hex string>
ADMIN_PASSWORD_HASH=<optional bootstrap bcrypt hash — escape every $ as \$>
UPLOAD_DIR=/home/<user>/lagom-uploads
RESEND_API_KEY=<your Resend API key>
EMAIL_FROM=Lagom Design <onboarding@resend.dev>
NODE_ENV=production
```

Until `studiolagomdesign.com` is **verified** in Resend (yours currently shows
failed — re-add DNS records and verify), keep `EMAIL_FROM` as
`onboarding@resend.dev`. The app falls back to that address automatically if a
custom From is rejected. `onboarding@resend.dev` can only deliver to the email
on your Resend account (here: `studiolagomdesign@gmail.com`).

`ADMIN_PASSWORD_HASH` is only used once to seed the database. Day-to-day login
reads the hash from the `Setting` table. If the env hash is wrong or missing,
use `/admin/forgot-password` to set a new password via OTP.

Generate values locally:

```bash
# SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# ADMIN_PASSWORD_HASH (optional bootstrap — prefer Forgot password OTP on Hostinger)
node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
```

### Admin password

- Login uses the password hash stored in the database (`Setting.admin_password_hash`).
- Change it anytime while signed in at `/admin/settings`.
- If locked out, open `/admin/forgot-password`, click **Send OTP**, enter the code
  emailed to `studiolagomdesign@gmail.com`, and set a new password. No other email
  or phone can be used.

### First-deploy checklist

1. Create a MySQL database and user in hPanel; build `DATABASE_URL` from the credentials shown there.
2. In File Manager, create a folder **outside** the app deploy directory, e.g. `/home/<user>/lagom-uploads`, with write permissions.
3. Set all production environment variables listed above in the Node.js panel.
4. Enable SSL for your domain.
5. Deploy the code (Git or file upload) so Hostinger runs `npm run build`.
6. Open Hostinger **Terminal** (or SSH) in the application root and run migrations once:

```bash
npm run prisma:migrate:deploy
```

7. (Optional) Seed placeholder portfolio entries:

```bash
npm run db:seed
```

8. Verify the deployment:
   - `https://yourdomain.com/api/health` → `{ "status": "ok", "database": "connected" }`
   - `https://yourdomain.com/admin` → login page
   - If you cannot log in, use `/admin/forgot-password` to set a password via email OTP
   - Upload a test image in admin and confirm it persists after a redeploy

### Upload persistence

Uploaded images are stored on disk at `UPLOAD_DIR`, not in the database. If `UPLOAD_DIR` points inside the deploy folder, images will be **deleted on every redeploy**. Always use an absolute path outside the application directory.

### Redeploys

After the first deploy, subsequent deploys only need `npm run build` (handled by Hostinger). Run `npm run prisma:migrate:deploy` again only when the Prisma schema changes.
