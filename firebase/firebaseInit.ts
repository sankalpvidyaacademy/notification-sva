/**
 * Firebase Initialization
 *
 * Handles both Client SDK and Admin SDK initialization.
 * Admin SDK is used for server-side API routes.
 * Client SDK can be used for frontend if needed.
 */

import * as admin from "firebase-admin";

// ─── Admin SDK Initialization (Server-side) ───

let adminApp: admin.app.App | null = null;
let adminDb: admin.firestore.Firestore | null = null;

export function getAdminApp(): admin.app.App | null {
  if (adminApp) return adminApp;

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
