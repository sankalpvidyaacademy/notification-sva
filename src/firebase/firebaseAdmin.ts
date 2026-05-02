/**
 * Firebase Admin SDK Initialization (SERVER-ONLY)
 *
 * This file MUST only be imported from server-side code
 * (API routes, server actions, server components).
 *
 * It uses firebase-admin which requires Node.js and cannot
 * be bundled for the browser.
 */

import type * as admin from "firebase-admin";

// ─── Admin SDK Initialization (Server-side) ───

let adminApp: admin.app.App | null = null;
let adminDb: admin.firestore.Firestore | null = null;

export function getAdminApp(): admin.app.App | null {
  if (adminApp) return adminApp;

  // Dynamic require of firebase-admin at runtime (server only)
  // This prevents Next.js from trying to bundle it for the client
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const admin = require("firebase-admin") as typeof import("firebase-admin");

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.log("[Firebase] Admin SDK not configured - missing environment variables");
    return null;
  }

  try {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log("[Firebase] Admin SDK initialized successfully");
    return adminApp;
  } catch (error) {
    // If app already exists, get it
    if (error instanceof Error && error.message.includes("already exists")) {
      adminApp = admin.app();
      return adminApp;
    }
    console.error("[Firebase] Admin SDK initialization failed:", error);
    return null;
  }
}

export function getFirestore(): admin.firestore.Firestore | null {
  if (adminDb) return adminDb;

  const app = getAdminApp();
  if (!app) return null;

  try {
    adminDb = app.firestore();
    return adminDb;
  } catch (error) {
    console.error("[Firebase] Firestore initialization failed:", error);
    return null;
  }
}
