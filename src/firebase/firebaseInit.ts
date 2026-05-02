/**
 * Firebase Initialization
 *
 * Re-exports from the split modules.
 *
 * ⚠️ IMPORTANT: Only import this from server-side code (API routes, etc.)
 * - isFirebaseEnabled / isFirebaseConfigured are safe for client code
 *   → Import those directly from "@/firebase/firebaseEnv" instead
 * - getAdminApp / getFirestore require firebase-admin (server-only)
 */

export { isFirebaseEnabled, isFirebaseConfigured } from "./firebaseEnv";
export { getAdminApp, getFirestore } from "./firebaseAdmin";
