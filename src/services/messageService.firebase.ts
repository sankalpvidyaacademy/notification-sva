/**
 * Firebase Message Service Implementation
 * Uses Firestore for message operations
 */

import { getFirestore } from "../../firebase/firebaseInit";
import type { IMessageService, MessageData, SendMessageInput } from "./types";

const COLLECTION = "messages";

function docToMessageData(doc: FirebaseFirestore.DocumentSnapshot): MessageData | null {
  if (!doc.exists) return null;
  const d = doc.data()!;
  return {
    id: doc.id,
    senderId: d.senderId || "",
    senderName: d.senderName || "",
    senderRole: d.senderRole || "",
    receiverId: d.receiverId || "",
    receiverName: d.receiverName || "",
    receiverRole: d.receiverRole || "",
    topic: d.topic || "",
    message: d.message || "",
    parentMsgId: d.parentMsgId || null,
    createdAt: d.createdAt?.toDate() || new Date(),
    updatedAt: d.updatedAt?.toDate() || new Date(),
  };
}

export class FirebaseMessageService implements IMessageService {
  private getCollection() {
    const db = getFirestore();
    if (!db) throw new Error("Firestore not initialized");
    return db.collection(COLLECTION);
  }

  async findByUserId(userId: string, role: string): Promise<MessageData[]> {
    if (role === "ADMIN") {
      return this.findAll();
    }

    // For non-admin: get messages where user is sender or receiver
    const [sentSnapshot, receivedSnapshot] = await Promise.all([
      this.getCollection().where("senderId", "==", userId).orderBy("createdAt", "desc").get(),
      this.getCollection().where("receiverId", "==", userId).orderBy("createdAt", "desc").get(),
    ]);

    const messages = new Map<string, MessageData>();

    for (const doc of sentSnapshot.docs) {
      const msg = docToMessageData(doc);
      if (msg) messages.set(msg.id, msg);
    }
    for (const doc of receivedSnapshot.docs) {
      const msg = docToMessageData(doc);
      if (msg) messages.set(msg.id, msg);
    }

    // Sort by createdAt descending
    return Array.from(messages.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async findAll(): Promise<MessageData[]> {
    const snapshot = await this.getCollection().orderBy("createdAt", "desc").get();
    return snapshot.docs.map(docToMessageData).filter(Boolean) as MessageData[];
  }

  async create(data: SendMessageInput): Promise<MessageData> {
    const docRef = this.getCollection().doc();
    const now = new Date();

    const docData = {
      senderId: data.senderId,
      senderName: data.senderName,
      senderRole: data.senderRole,
      receiverId: data.receiverId,
      receiverName: data.receiverName,
      receiverRole: data.receiverRole,
      topic: data.topic,
      message: data.message,
      parentMsgId: data.parentMsgId || null,
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
