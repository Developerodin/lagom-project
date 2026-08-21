# AWS deployment (Lagom webapp)

**Primary stack (this repo uses Next.js 16):** **ECS Fargate + ALB + Aurora Serverless v2 (MySQL)** + **Resend** (admin OTP email).

AWS Amplify Hosting officially supports Next.js through v15 only. Because this project runs **Next.js 16.2.9** with middleware and dynamic SSR, use the container path below. `amplify.yml` is kept as an optional reference if you downgrade Next.js or Amplify adds v16 support.

## Prerequisites

- AWS account (ECS, ECR, RDS, ALB, ACM)
- Docker locally for image builds
- Resend API key

## 1. Aurora Serverless v2 (MySQL)

1. Create an Aurora MySQL Serverless v2 cluster (dev: 0.5–2 ACU minimum).
2. Create a database user and database for the app.
3. Place ECS tasks in private subnets with a security group that can reach Aurora on port 3306.
4. Set `DATABASE_URL`:

```text
mysql://USER:PASSWORD@CLUSTER_ENDPOINT:3306/lagom?connection_limit=1&connect_timeout=10&pool_timeout=10
```

5. Run migrations:

```bash
npx prisma migrate deploy
```

## 2. ECS Fargate + ALB (recommended)

### Build and push

```bash
docker build \
  --build-arg SESSION_SECRET="your-32-char-or-longer-secret" \
  -t lagom-webapp .
```

Push to ECR and deploy as an ECS service behind an **HTTPS** ALB with an ACM certificate.

### Required environment variables

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Aurora connection string |
| `SESSION_SECRET` | Yes | ≥32 chars; pass as Docker build-arg **and** runtime env |
| `RESEND_API_KEY` | Yes | Admin OTP login |
| `EMAIL_FROM` | Yes | Resend sender |
| `UPLOAD_DIR` | Yes | Absolute path on a mounted EBS/EFS volume (e.g. `/var/lagom/uploads`). |

Ephemeral container disk is not suitable for durable uploads. Mount a volume and point `UPLOAD_DIR` at it. S3 is optional later; disk is the current path.

**Upload volume permissions:** the container runs as user `nextjs` (uid **1001**). The mounted `UPLOAD_DIR` must be writable by that user, or every admin upload returns 500.

**Task memory:** the example Fargate task uses **1024 MB**, which is enough because uploads are transcoded to WebP (≤1920px) before they are stored — originals are never kept on disk. 2GB is nicer under concurrent traffic but not required for this design.

**Leftover Vercel Blob URLs:** if any MySQL row still points at `*.blob.vercel-storage.com` (e.g. Whimsy Beauty gallery), re-upload that image in admin when convenient. The app renders those URLs unoptimized so the page does not crash, but the Blob host is no longer part of the stack.

### HTTPS

Production sets `secure: true` on session cookies. The site **must** be served over HTTPS or login will appear to succeed then immediately fail.

### Prisma on Amazon Linux

`prisma/schema.prisma` includes `binaryTargets = ["native", "rhel-openssl-3.0.x"]` for ECS images.

### Note on `output: "standalone"`

The Dockerfile ships the full `node_modules` and runs `npm start` (plain `next start`).
Standalone output is intentionally **not** enabled, because it requires manually
copying `.next/static` and `public/` and silently breaks CSS/JS/image serving if
either step is missed.

## 3. Amplify Hosting (optional / not recommended for Next 16)

See [`amplify.yml`](../amplify.yml). Only use if Amplify adds Next.js 16 SSR support or you pin Next.js to 15.

## 4. Admin login (OTP-only)

- Open `/admin` → **Email me a login code**
- Code is sent to `studiolagomdesign@gmail.com` only
- No password is stored; OTP expires in 5 minutes

## 5. Canonical auth tests

### Local dev

```bash
npm run dev
npm run test:auth-e2e
```

### Local production build

```bash
npm run build
NODE_ENV=production npm start
TEST_EXPECT_PRODUCTION=1 npm run test:auth-e2e
```

### Deployed (HTTPS)

```bash
TEST_BASE_URL=https://your-domain.com TEST_EXPECT_PRODUCTION=1 npm run test:auth-e2e
```

### Multi-instance (optional)

Start a second server on another port with the same `SESSION_SECRET`:

```bash
PORT=3001 npm start
TEST_SECOND_BASE_URL=http://localhost:3001 npm run test:auth-e2e
```

## Security checklist

- [ ] `SESSION_SECRET` set at **build** and runtime
- [ ] Site served over HTTPS in production
- [ ] `RESEND_API_KEY` set; OTP email deliverability verified
- [ ] Aurora not publicly accessible without IP/VPC restrictions
- [ ] `npm run test:auth-e2e` passes against production URL before client handoff
