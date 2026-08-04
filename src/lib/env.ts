const DEV_SESSION_SECRET =
  "dev_only_insecure_session_secret_change_me_min_32_chars";

const isProduction = process.env.NODE_ENV === "production";

function requireEnv(name: string, value: string | undefined): string {
  if (!value || value.trim().length === 0) {
    throw new Error(
      `[env] ${name} is required in production. Set it in your deployment environment variables.`,
    );
  }
  return value.trim();
}

function getSessionSecret(): string {
  const value = process.env.SESSION_SECRET?.trim();

  if (isProduction) {
    const secret = requireEnv("SESSION_SECRET", value);
    if (secret.length < 32) {
      throw new Error(
        "[env] SESSION_SECRET must be at least 32 characters in production.",
      );
    }
    return secret;
  }

  return value && value.length >= 32 ? value : DEV_SESSION_SECRET;
}

function getDatabaseUrl(): string | undefined {
  const value = process.env.DATABASE_URL?.trim();

  if (isProduction) {
    return requireEnv("DATABASE_URL", value);
  }

  if (!value) {
    console.warn(
      "[env] DATABASE_URL is not set. Database features will not work.",
    );
  }

  return value;
}

/**
 * Normalize bcrypt hashes from env panels that escape `$` as `\$`.
 * Without this, Hostinger/dotenv can seed a broken hash and login always fails.
 */
export function normalizeBcryptHash(value: string): string {
  return value.replace(/\\\$/g, "$").trim();
}

function getAdminPasswordHash(): string | undefined {
  // Bootstrap only — after first seed/OTP reset, the DB Setting is the source of truth.
  const value = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (!value) {
    return undefined;
  }
  return normalizeBcryptHash(value);
}

function getBlobReadWriteToken(): string | undefined {
  const value = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  const hasUploadDir = Boolean(process.env.UPLOAD_DIR?.trim());

  // Vercel: prefer Blob. Hostinger/local disk: UPLOAD_DIR alone is enough.
  if (isProduction && !value && !hasUploadDir) {
    throw new Error(
      "[env] BLOB_READ_WRITE_TOKEN is required on Vercel (or set UPLOAD_DIR for a persistent disk host).",
    );
  }

  return value || undefined;
}

function getUploadDir(): string {
  const value = process.env.UPLOAD_DIR?.trim();
  const hasBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());

  if (isProduction && !hasBlob) {
    const dir = requireEnv("UPLOAD_DIR", value);
    if (!dir.startsWith("/")) {
      throw new Error(
        "[env] UPLOAD_DIR must be an absolute path when not using Vercel Blob (e.g. /home/<user>/lagom-uploads).",
      );
    }
    return dir;
  }

  return value || "./uploads";
}

/**
 * Lazy getters so importing this module during `next build` page-data
 * collection does not throw before runtime env is actually needed.
 */
export const env = {
  get isProduction() {
    return isProduction;
  },
  get sessionSecret() {
    return getSessionSecret();
  },
  get databaseUrl() {
    return getDatabaseUrl();
  },
  get adminPasswordHash() {
    return getAdminPasswordHash();
  },
  get blobReadWriteToken() {
    return getBlobReadWriteToken();
  },
  get uploadDir() {
    return getUploadDir();
  },
};
