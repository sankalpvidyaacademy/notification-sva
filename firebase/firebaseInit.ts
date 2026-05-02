/**
 * DEPRECATED: This file is kept for backward compatibility.
 * The canonical location is now: src/firebase/firebaseEnv.ts + src/firebase/firebaseAdmin.ts
 *
 * This file re-exports from the new locations.
 */

export { isFirebaseEnabled, isFirebaseConfigured } from "../src/firebase/firebaseEnv";
export { getAdminApp, getFirestore } from "../src/firebase/firebaseAdmin";
