# Firestore Security Rules Guide

## Quick Start

### Phase 1 (USE FIRST — During Development)

This is the permissive ruleset that allows all authenticated users to read/write.
Use this to avoid permission errors while integrating Firebase.

**To apply:**
1. Go to Firebase Console → Firestore Database → Rules
2. Copy the contents of `firestore.rules.phase1`
3. Paste and publish

**OR use Firebase CLI:**
```bash
# Phase 1 is already the default in firestore.rules
firebase deploy --only firestore:rules
```

### Phase 2 (APPLY LAST — After Full Testing)

This enforces proper role-based access control.
Apply ONLY after all features are tested and working.

**To apply:**
1. Ensure all features work with Phase 1 rules
2. Copy Phase 2 rules to the active file:
   ```bash
   cp firestore-rules/firestore.rules.phase2 firestore.rules
   ```
3. Deploy:
   ```bash
   firebase deploy --only firestore:rules
   ```
4. Test again to make sure nothing breaks

---

## Vercel Deployment Notes

### How Security Rules Work with Vercel

Our app uses the **Firebase Admin SDK** in server-side API routes (Next.js API routes).
The Admin SDK **bypasses all Firestore security rules** because it uses service account credentials.

This means:
- ✅ Phase 1 rules are sufficient for our current architecture
- ✅ Security is enforced at the API route level (role checks in route handlers)
- ✅ Phase 2 rules add defense-in-depth for potential future client-side access

### When Phase 2 Rules Matter

Phase 2 rules become critical if:
1. You add direct client-side Firestore access (bypassing API routes)
2. You enable Firebase Authentication for frontend login
3. You want defense-in-depth even with server-side routes

### Custom Claims Setup (Required for Phase 2)

Phase 2 rules require `request.auth.token.role` and `request.auth.token.userId`.
These are set via Firebase Admin SDK custom claims:

```javascript
const admin = require('firebase-admin');
admin.initializeApp();

// Set claims for admin user
await admin.auth().setCustomUserClaims(uid, {
  role: 'ADMIN',
  userId: 'shobhit'
});

// Set claims for teacher
await admin.auth().setCustomUserClaims(uid, {
  role: 'TEACHER',
  userId: 'teacher001'
});

// Set claims for student
await admin.auth().setCustomUserClaims(uid, {
  role: 'STUDENT',
  userId: 'student001'
});
```

---

## Important Notes

- ⚠️ Do NOT skip Phase 1 and go directly to Phase 2
- ⚠️ Phase 2 requires `request.auth.token.role` custom claims to be set
- ⚠️ If you apply Phase 2 too early, the app may break with permission denied errors
- ✅ Always test thoroughly after applying Phase 2 rules
- ✅ With Admin SDK (server-side), security rules are automatically bypassed
- ✅ API routes handle their own authorization (role-based checks in route handlers)

## Rules Comparison

| Feature | Phase 1 | Phase 2 |
|---------|---------|---------|
| Authentication required | ✅ | ✅ |
| Role-based access | ❌ | ✅ |
| Document ownership checks | ❌ | ✅ |
| Admin-only delete | ❌ | ✅ |
| Sender-only message edit | ❌ | ✅ |
| Default deny | ❌ | ✅ |
| Custom claims required | ❌ | ✅ |
