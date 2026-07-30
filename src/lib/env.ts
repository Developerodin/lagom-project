const DEV_SESSION_SECRET =
  "dev_only_insecure_session_secret_change_me_min_32_chars";

const isProduction = process.env.NODE_ENV === "production";

function requireEnv(name: string, value: string | undefined): string {
  if (!value || value.trim().length === 0) {
    throw new Error(
      `[env] ${name} is required in production. Set it in your Hostinger environment variables.`,
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

function getUploadDir(): string {
  const value = process.env.UPLOAD_DIR?.trim();

  if (isProduction) {
    const dir = requireEnv("UPLOAD_DIR", value);
    if (!dir.startsWith("/")) {
      throw new Error(
        "[env] UPLOAD_DIR must be an absolute path in production (e.g. /home/<user>/lagom-uploads).",
      );
    }
    return dir;
  }

  return value || "./uploads";
}

export const env = {
  isProduction,
  sessionSecret: getSessionSecret(),
  databaseUrl: getDatabaseUrl(),
  adminPasswordHash: getAdminPasswordHash(),
  uploadDir: getUploadDir(),
};
