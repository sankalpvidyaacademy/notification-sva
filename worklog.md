---
Task ID: 1
Agent: Main Agent
Task: Firebase Migration (PRD v4) - Production Safe Adapter Pattern

Work Log:
- Installed firebase@12.12.1 and firebase-admin@13.8.0
- Created /firebase/firebaseConfig.ts - Client SDK config with env vars
- Created /firebase/firebaseInit.ts - Admin SDK init, Firestore getter, enabled/configured checks
- Created /src/services/types.ts - Shared interfaces (IUserService, IAuthService, INotificationService, IMessageService)
- Created Prisma service implementations: userService.prisma, authService.prisma, notificationService.prisma, messageService.prisma
- Created Firebase service implementations: userService.firebase, authService.firebase, notificationService.firebase, messageService.firebase
- Created /src/adapters/appAdapter.ts - Central adapter that switches between Prisma/Firebase based on USE_FIREBASE env var
- Updated all API routes to use adapter instead of direct Prisma calls:
  - /api/auth/route.ts → getAuthService()
  - /api/users/route.ts → getUserService()
  - /api/notifications/route.ts → getNotificationService() + getUserService()
  - /api/messages/route.ts → getMessageService()
  - /api/seed/route.ts → getUserService()
- Created /api/adapter-status endpoint for debugging
- Created /firestore-rules/firestore.rules.phase1 - Open rules for development
- Created /firestore-rules/firestore.rules.phase2 - Role-based rules for production
- Created /firestore-rules/README.md - Rules application guide
- Created /firebase/migrate-to-firestore.ts - Data migration script (SQLite → Firestore)
- Updated .env with Firebase configuration variables
- All APIs tested successfully with Prisma fallback
- Lint passes cleanly

Stage Summary:
- Complete Firebase migration infrastructure with production-safe adapter pattern
- App continues working with Prisma/SQLite (USE_FIREBASE=false, default)
- When Firebase credentials are set + USE_FIREBASE=true, automatically switches to Firestore
- No UI changes required - all changes are in the backend service layer
- Adapter provides unified interface: getUserService(), getAuthService(), getNotificationService(), getMessageService()
- Firestore security rules provided in two phases (development + production)
- Data migration script available for moving existing SQLite data to Firestore

---
Task ID: 2
Agent: Main Agent
Task: PRD v5 - Deployment + Production Security (Vercel + Firebase)

Work Log:
- Updated .env with comprehensive Firebase environment variables (NEXT_PUBLIC_ for client SDK, FIREBASE_ for Admin SDK, USE_FIREBASE switch)
- Created /vercel.json - Next.js deployment config with security headers, bun install, asia-south1 region
- Created /.vercelignore - Deployment exclusions (node_modules, .env, db, prisma, examples, etc.)
- Updated /firestore-rules/firestore.rules.phase2 - Rewritten to match PRD v5 spec with proper role-based rules (users read/create for auth, admin-only notification delete, sender/receiver message access, default deny)
- Created /firestore.rules - Root-level rules file for Firebase CLI deployment (Phase 1 by default)
- Created /firebase.json - Firebase CLI config pointing to firestore.rules
- Created /DEPLOYMENT.md - Comprehensive deployment guide covering:
  - Phase 1: Firebase Project Setup (Firestore, Web App, Service Account, Custom Claims)
  - Phase 2: GitHub Repository Setup
  - Phase 3: Vercel Deployment (import, build config, env vars, deploy, verify)
  - Phase 4: Apply Firestore Security Rules (Phase 1 → Phase 2)
  - Phase 5: Data Migration from SQLite to Firestore
  - Post-Deployment Configuration (custom domain, monitoring, backup)
  - Troubleshooting guide
  - Rollback plan
- Updated /firestore-rules/README.md - Added Vercel deployment notes, Admin SDK security explanation, custom claims setup, rules comparison table
- Lint passes cleanly
- All APIs tested and working (auth, notifications, messages, adapter-status)
- App continues to work with Prisma/SQLite backend (USE_FIREBASE=false)

Stage Summary:
- Complete Vercel deployment infrastructure ready
- No modifications to existing project logic or UI code
- All deployment configuration files created as new files
- Phase 2 security rules updated to match PRD v5 specification with:
  - Users: auth required for read/create, self-only update/delete
  - Notifications: auth required for read, ADMIN/TEACHER create, ADMIN-only delete
  - Messages: sender/receiver read, auth create, sender-only update/delete
  - Default deny for unmatched paths
- Rollback plan: Change USE_FIREBASE=false in Vercel to instantly revert to Prisma
- Firebase CLI configuration ready for rules deployment

---
Task ID: 3
Agent: Main Agent
Task: Apply Phase 2 Firestore Security Rules

Work Log:
- Replaced /firestore.rules contents with Phase 2 production security rules
- Phase 2 rules now enforce:
  - Users: authenticated read/create, self-only update/delete (Admin override via Admin SDK)
  - Notifications: authenticated read, ADMIN/TEACHER-only create, ADMIN-only delete, no updates
  - Messages: sender/receiver read, ADMIN full read, authenticated create (senderId must match token), sender-only update/delete
  - Default deny: any collection not explicitly listed is blocked
- Verified all API endpoints still work correctly (Admin SDK bypasses rules)
- Tested: /api/adapter-status, /api/auth, /api/users, /api/notifications, /api/messages — all return 200
- Lint passes cleanly
- No existing project files modified — only firestore.rules updated

Stage Summary:
- Phase 2 security rules are now the active rules in /firestore.rules
- To deploy to Firebase: `firebase deploy --only firestore:rules`
- Architecture note: Admin SDK (used in API routes) bypasses all Firestore rules, so server-side operations are unaffected
- Phase 2 rules provide defense-in-depth for any potential direct client-side Firestore access
- Custom claims (role, userId) must be set on Firebase Auth users for Phase 2 rules to work with client-side access

---
Task ID: 4
Agent: Main Agent
Task: Fix "Module not found: Can't resolve ../../firebase/firebaseInit" error

Work Log:
- Root cause: firebase/ directory was outside src/ and Next.js webpack couldn't resolve imports from outside the source tree
- Created /src/firebase/firebaseConfig.ts - Moved from /firebase/firebaseConfig.ts (canonical location inside src/)
- Created /src/firebase/firebaseInit.ts - Moved from /firebase/firebaseInit.ts (canonical location inside src/)
- Updated import in /src/adapters/appAdapter.ts: `../../firebase/firebaseInit` → `@/firebase/firebaseInit`
- Updated import in /src/services/userService.firebase.ts: `../../firebase/firebaseInit` → `@/firebase/firebaseInit`
- Updated import in /src/services/notificationService.firebase.ts: `../../firebase/firebaseInit` → `@/firebase/firebaseInit`
- Updated import in /src/services/messageService.firebase.ts: `../../firebase/firebaseInit` → `@/firebase/firebaseInit`
- Updated /firebase/migrate-to-firestore.ts: import path `./firebaseInit` → `../src/firebase/firebaseInit`
- Converted /firebase/firebaseConfig.ts and /firebase/firebaseInit.ts to re-export stubs pointing to canonical src/ locations (backward compat for standalone scripts)
- All API endpoints tested: auth, users, notifications, messages, adapter-status — all return 200
- Lint passes cleanly
- No module resolution errors in dev server logs

Stage Summary:
- Firebase config/init files moved inside src/firebase/ for proper webpack resolution
- All service and adapter imports use @/firebase/ alias path
- Old /firebase/ files converted to re-export stubs for backward compatibility
- Migration script updated to use canonical path
- App fully functional with no module errors

---
Task ID: 5
Agent: Main Agent
Task: Fix "Module not found" — firebase-admin client bundle issue

Work Log:
- Root cause: `import * as admin from "firebase-admin"` in firebaseInit.ts was a top-level import, causing Next.js to try bundling firebase-admin for the browser client bundle (which fails because firebase-admin is Node.js-only)
- Split /src/firebase/firebaseInit.ts into two modules:
  - /src/firebase/firebaseEnv.ts — Pure env checks (isFirebaseEnabled, isFirebaseConfigured), NO firebase-admin import, safe for client & server
  - /src/firebase/firebaseAdmin.ts — Admin SDK init + Firestore getters, uses dynamic require() for firebase-admin (server-only)
- /src/firebase/firebaseInit.ts converted to re-export hub from both modules
- Updated /src/adapters/appAdapter.ts:
  - Import env checks from @/firebase/firebaseEnv (no admin SDK)
  - Use dynamic imports for Firebase service classes (await import("../services/xxx.firebase"))
  - All service getters now return Promises (async)
- Updated all API routes to await the service getters:
  - /api/auth/route.ts → `await getAuthService()`
  - /api/users/route.ts → `await getUserService()` (4 occurrences)
  - /api/notifications/route.ts → `await getNotificationService()` + `await getUserService()`
  - /api/messages/route.ts → `await getMessageService()` (3 occurrences)
  - /api/seed/route.ts → `await getUserService()`
- Added `serverExternalPackages: ["firebase-admin"]` to next.config.ts to prevent bundling
- Added eslint-disable for intentional require() in firebaseAdmin.ts
- Updated /firebase/firebaseInit.ts re-export stub to use new paths
- Updated /firebase/migrate-to-firestore.ts to import from ../src/firebase/firebaseAdmin
- All APIs tested and working (auth, users, notifications, messages, adapter-status)
- Lint passes cleanly

Stage Summary:
- Firebase code properly split into client-safe (firebaseEnv) and server-only (firebaseAdmin) modules
- Dynamic imports in adapter prevent firebase-admin from ever reaching the client bundle
- serverExternalPackages in next.config.ts adds extra protection
- All API routes now use async service getters (await)
- App fully functional with no module resolution or bundling errors
