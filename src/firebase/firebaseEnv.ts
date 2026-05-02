/**
 * Firebase Environment Configuration
 *
 * Pure environment variable checks — NO firebase-admin imports.
 * Safe to import from both client and server code.
 */

// ─── Check if Firebase is enabled ───

export function isFirebaseEnabled(): boolean {
  return process.env.USE_FIREBASE === "true";
}

export function isFirebaseConfigured(): boolean {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  return !!(projectId && clientEmail && privateKey);
}
