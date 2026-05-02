/**
 * Firebase User Service Implementation
 * Uses Firestore for user operations
 *
 * Note: Queries sort in memory to avoid requiring composite indexes.
 * This is fine for school-scale data (hundreds of users, not millions).
 */

import { getFirestore } from "@/firebase/firebaseAdmin";
import type { IUserService, UserData, CreateUserInput, UpdateUserInput } from "./types";

const COLLECTION = "users";

function docToUserData(doc: FirebaseFirestore.DocumentSnapshot): UserData | null {
  if (!doc.exists) return null;
  const d = doc.data()!;
  return {
    id: doc.id,
    userId: d.userId || "",
    name: d.name || "",
    password: d.password || "",
    role: d.role || "STUDENT",
    classes: d.classes || [],
    subjects: d.subjects || (d.role === "STUDENT" ? [] : {}),
    createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : new Date(d.createdAt),
    updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate() : new Date(d.updatedAt),
  };
}

export class FirebaseUserService implements IUserService {
  private getCollection() {
    const db = getFirestore();
    if (!db) throw new Error("Firestore not initialized - check Firebase Admin SDK configuration");
    return db.collection(COLLECTION);
  }

  async findByUserId(userId: string): Promise<UserData | null> {
    const snapshot = await this.getCollection().where("userId", "==", userId).limit(1).get();
    if (snapshot.empty) return null;
    return docToUserData(snapshot.docs[0]);
  }

  async findById(id: string): Promise<UserData | null> {
    const doc = await this.getCollection().doc(id).get();
    return docToUserData(doc);
  }

  async findAll(role?: string): Promise<UserData[]> {
    // Use simple query and sort in memory to avoid composite index requirement
    let query = this.getCollection();
    if (role) {
      query = query.where("role", "==", role);
    }
    const snapshot = await query.get();
    const users = snapshot.docs.map(docToUserData).filter(Boolean) as UserData[];
    // Sort in memory by createdAt descending
    return users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async create(data: CreateUserInput): Promise<UserData> {
    const docRef = this.getCollection().doc();
    const now = new Date();

    const docData = {
      userId: data.userId,
      name: data.name,
      password: data.password,
      role: data.role,
      classes: data.classes || [],
      subjects: data.subjects || (data.role === "STUDENT" ? [] : {}),
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

  async update(id: string, data: UpdateUserInput): Promise<UserData> {
    const docRef = this.getCollection().doc(id);
    const existing = await docRef.get();
    if (!existing.exists) throw new Error("User not found");

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.userId !== undefined) updateData.userId = data.userId;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.password !== undefined) updateData.password = data.password;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.classes !== undefined) updateData.classes = data.classes;
    if (data.subjects !== undefined) updateData.subjects = data.subjects;

    await docRef.update(updateData);

    const updated = await docRef.get();
    return docToUserData(updated)!;
  }

  async delete(id: string): Promise<void> {
    await this.getCollection().doc(id).delete();
  }
}
