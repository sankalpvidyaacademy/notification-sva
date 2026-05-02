/**
 * Firebase Notification Service Implementation
 * Uses Firestore for notification operations
 *
 * Note: Queries sort in memory to avoid requiring composite indexes.
 */

import { getFirestore } from "@/firebase/firebaseAdmin";
import type { INotificationService, NotificationData, CreateNotificationInput } from "./types";

const COLLECTION = "notifications";

function docToNotificationData(doc: FirebaseFirestore.DocumentSnapshot): NotificationData | null {
  if (!doc.exists) return null;
  const d = doc.data()!;
  return {
    id: doc.id,
    senderId: d.senderId || "",
    senderName: d.senderName || "",
    senderRole: d.senderRole || "ADMIN",
    recipientType: d.recipientType || "",
    targetData: d.targetData || {},
    topic: d.topic || "",
    message: d.message || "",
    date: d.date || "",
    createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : new Date(d.createdAt),
    updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate() : new Date(d.updatedAt),
  };
}

export class FirebaseNotificationService implements INotificationService {
  private getCollection() {
    const db = getFirestore();
    if (!db) throw new Error("Firestore not initialized - check Firebase Admin SDK configuration");
    return db.collection(COLLECTION);
  }

  async findAll(): Promise<NotificationData[]> {
    const snapshot = await this.getCollection().orderBy("createdAt", "desc").get();
    return snapshot.docs.map(docToNotificationData).filter(Boolean) as NotificationData[];
  }

  async findBySender(senderId: string): Promise<NotificationData[]> {
    // Simple query + in-memory sort to avoid composite index
    const snapshot = await this.getCollection().where("senderId", "==", senderId).get();
    const results = snapshot.docs.map(docToNotificationData).filter(Boolean) as NotificationData[];
    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findByRecipientType(recipientType: string): Promise<NotificationData[]> {
    // Simple query + in-memory sort to avoid composite index
    const snapshot = await this.getCollection().where("recipientType", "==", recipientType).get();
    const results = snapshot.docs.map(docToNotificationData).filter(Boolean) as NotificationData[];
    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findById(id: string): Promise<NotificationData | null> {
    const doc = await this.getCollection().doc(id).get();
    return docToNotificationData(doc);
  }

  async create(data: CreateNotificationInput): Promise<NotificationData> {
    const docRef = this.getCollection().doc();
    const now = new Date();

    const docData = {
      senderId: data.senderId,
      senderName: data.senderName,
      senderRole: data.senderRole || "ADMIN",
      recipientType: data.recipientType,
      targetData: data.targetData || {},
      topic: data.topic,
      message: data.message,
      date: data.date || new Date().toISOString().split("T")[0],
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(docData);

    return {
      id: docRef.id,
      ...docData,
      createdAt: now,
      updatedAt: now,
    };
  }

  async delete(id: string): Promise<void> {
    await this.getCollection().doc(id).delete();
  }
}
