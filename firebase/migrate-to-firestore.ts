/**
 * Data Migration Script: Prisma/SQLite → Firebase/Firestore
 *
 * This script migrates all existing data from the local SQLite database
 * to Firestore. Run it once when switching from Prisma to Firebase.
 *
 * Usage:
 *   1. Set USE_FIREBASE=true in .env
 *   2. Set all FIREBASE_* environment variables
 *   3. Run: bun run firebase/migrate-to-firestore.ts
 *
 * ⚠️ IMPORTANT:
 *   - Make sure Firebase is properly configured before running
 *   - This will NOT delete data from SQLite
 *   - Run this only once to avoid duplicate entries
 *   - Firestore uses auto-generated IDs, so re-running creates duplicates
 */

import { db } from "../src/lib/db";
import { getFirestore } from "./firebaseInit";

async function migrateUsers() {
  console.log("📦 Migrating users...");
  const firestore = getFirestore();
  if (!firestore) {
    console.error("❌ Firestore not initialized. Check your Firebase credentials.");
    return;
  }

  const users = await db.user.findMany();
  console.log(`   Found ${users.length} users`);

  const batch = firestore.batch();
  let count = 0;

  for (const user of users) {
    const docRef = firestore.collection("users").doc();
    batch.set(docRef, {
      userId: user.userId,
      name: user.name,
      password: user.password,
      role: user.role,
      classes: JSON.parse(user.classes),
      subjects: JSON.parse(user.subjects),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
    count++;
  }

  await batch.commit();
  console.log(`   ✅ Migrated ${count} users`);
}

async function migrateNotifications() {
  console.log("📦 Migrating notifications...");
  const firestore = getFirestore();
  if (!firestore) {
    console.error("❌ Firestore not initialized.");
    return;
  }

  const notifications = await db.notification.findMany();
  console.log(`   Found ${notifications.length} notifications`);

  const batch = firestore.batch();
  let count = 0;

  for (const notif of notifications) {
    const docRef = firestore.collection("notifications").doc();
    batch.set(docRef, {
      senderId: notif.senderId,
      senderName: notif.senderName,
      senderRole: notif.senderRole || "ADMIN",
      recipientType: notif.recipientType,
      targetData: JSON.parse(notif.targetData),
      topic: notif.topic,
      message: notif.message,
      date: notif.date,
      createdAt: notif.createdAt,
      updatedAt: notif.updatedAt,
    });
    count++;
  }

  await batch.commit();
  console.log(`   ✅ Migrated ${count} notifications`);
}

async function migrateMessages() {
  console.log("📦 Migrating messages...");
  const firestore = getFirestore();
  if (!firestore) {
    console.error("❌ Firestore not initialized.");
    return;
  }

  const messages = await db.message.findMany();
  console.log(`   Found ${messages.length} messages`);

  const batch = firestore.batch();
  let count = 0;

  for (const msg of messages) {
    const docRef = firestore.collection("messages").doc();
    batch.set(docRef, {
      senderId: msg.senderId,
      senderName: msg.senderName,
      senderRole: msg.senderRole,
      receiverId: msg.receiverId,
      receiverName: msg.receiverName,
      receiverRole: msg.receiverRole,
      topic: msg.topic,
      message: msg.message,
      parentMsgId: msg.parentMsgId,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
    });
    count++;
  }

  await batch.commit();
  console.log(`   ✅ Migrated ${count} messages`);
}

async function main() {
  console.log("🚀 Starting data migration: SQLite → Firestore\n");
  console.log("⚠️  Make sure USE_FIREBASE=true and Firebase credentials are set in .env\n");

  try {
    await migrateUsers();
    await migrateNotifications();
    await migrateMessages();
    console.log("\n🎉 Migration completed successfully!");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

main();
