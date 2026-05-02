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
