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

function getUploadDir(): string {
  const value = process.env.UPLOAD_DIR?.trim();

  // Local + AWS ECS: persistent disk. Absolute path in production.
  if (isProduction) {
    const dir = value || "./uploads";
    if (dir !== "./uploads" && !dir.startsWith("/")) {
      throw new Error(
        "[env] UPLOAD_DIR must be an absolute path in production (e.g. /var/lagom/uploads on ECS).",
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
  get uploadDir() {
    return getUploadDir();
  },
};
