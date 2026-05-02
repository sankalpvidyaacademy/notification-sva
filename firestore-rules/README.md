# Firestore Security Rules Guide

## Quick Start

### Phase 1 (USE FIRST — During Development)

This is the permissive ruleset that allows all authenticated users to read/write.
Use this to avoid permission errors while integrating Firebase.

**To apply:**
1. Go to Firebase Console → Firestore Database → Rules
2. Copy the contents of `firestore.rules.phase1`
3. Paste and publish

### Phase 2 (APPLY LAST — After Full Testing)

This enforces proper role-based access control.
Apply ONLY after all features are tested and working.

**To apply:**
1. Ensure all features work with Phase 1 rules
2. Go to Firebase Console → Firestore Database → Rules
3. Copy the contents of `firestore.rules.phase2`
4. Paste and publish
5. Test again to make sure nothing breaks

## Important Notes

- ⚠️ Do NOT skip Phase 1 and go directly to Phase 2
- ⚠️ Phase 2 requires `request.auth.token.role` custom claims to be set
- ⚠️ If you apply Phase 2 too early, the app may break with permission denied errors
- ✅ Always test thoroughly after applying Phase 2 rules
