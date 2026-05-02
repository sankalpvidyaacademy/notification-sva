/**
 * Prisma User Service Implementation
 * Wraps existing Prisma database calls for user operations
 */

import { db } from "@/lib/db";
import type { IUserService, UserData, CreateUserInput, UpdateUserInput } from "./types";

function parseUserSubjects(role: string, subjectsJson: string): Record<string, string[]> | string[] {
  try {
    const parsed = JSON.parse(subjectsJson);
    if (role === "STUDENT") {
      return Array.isArray(parsed) ? parsed : [];
    }
    return typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return role === "STUDENT" ? [] : {};
  }
}

function toUserData(raw: {
  id: string;
  userId: string;
  name: string;
  password: string;
  role: string;
  classes: string;
  subjects: string;
  createdAt: Date;
  updatedAt: Date;
}): UserData {
  return {
    ...raw,
    classes: JSON.parse(raw.classes),
    subjects: parseUserSubjects(raw.role, raw.subjects),
  };
}

export class PrismaUserService implements IUserService {
  async findByUserId(userId: string): Promise<UserData | null> {
    const user = await db.user.findUnique({ where: { userId } });
    return user ? toUserData(user) : null;
  }

  async findById(id: string): Promise<UserData | null> {
    const user = await db.user.findUnique({ where: { id } });
    return user ? toUserData(user) : null;
  }

  async findAll(role?: string): Promise<UserData[]> {
    const where = role ? { role } : {};
    const users = await db.user.findMany({ where, orderBy: { createdAt: "desc" } });
    return users.map(toUserData);
  }

  async create(data: CreateUserInput): Promise<UserData> {
    const user = await db.user.create({
      data: {
        userId: data.userId,
        name: data.name,
        password: data.password,
        role: data.role,
        classes: JSON.stringify(data.classes || []),
        subjects: JSON.stringify(data.subjects || (data.role === "STUDENT" ? [] : {})),
      },
    });
    return toUserData(user);
  }

  async update(id: string, data: UpdateUserInput): Promise<UserData> {
    const updateData: Record<string, unknown> = {};
    if (data.userId !== undefined) updateData.userId = data.userId;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.password !== undefined) updateData.password = data.password;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.classes !== undefined) updateData.classes = JSON.stringify(data.classes);
    if (data.subjects !== undefined) updateData.subjects = JSON.stringify(data.subjects);

    const user = await db.user.update({ where: { id }, data: updateData });
    return toUserData(user);
  }

  async delete(id: string): Promise<void> {
    await db.user.delete({ where: { id } });
  }
}
