/**
 * Firebase Notification Service Implementation
 * Uses Firestore for notification operations
 */

import { getFirestore } from "../../firebase/firebaseInit";
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
    createdAt: d.createdAt?.toDate() || new Date(),
    updatedAt: d.updatedAt?.toDate() || new Date(),
  };
}

export class FirebaseNotificationService implements INotificationService {
  private getCollection() {
    const db = getFirestore();
    if (!db) throw new Error("Firestore not initialized");
    return db.collection(COLLECTION);
  }

  async findAll(): Promise<NotificationData[]> {
    const snapshot = await this.getCollection().orderBy("createdAt", "desc").get();
    return snapshot.docs.map(docToNotificationData).filter(Boolean) as NotificationData[];
  }

  async findBySender(senderId: string): Promise<NotificationData[]> {
    const snapshot = await this.getCollection()
      .where("senderId", "==", senderId)
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map(docToNotificationData).filter(Boolean) as NotificationData[];
  }

  async findByRecipientType(recipientType: string): Promise<NotificationData[]> {
    const snapshot = await this.getCollection()
      .where("recipientType", "==", recipientType)
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map(docToNotificationData).filter(Boolean) as NotificationData[];
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
