/**
 * Prisma Message Service Implementation
 * Wraps existing Prisma database calls for message operations
 */

import { db } from "@/lib/db";
import type { IMessageService, MessageData, SendMessageInput } from "./types";

function toMessageData(raw: {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string;
  receiverName: string;
  receiverRole: string;
  topic: string;
  message: string;
  parentMsgId: string | null;
  createdAt: Date;
  updatedAt: Date;
}): MessageData {
  return { ...raw };
}

export class PrismaMessageService implements IMessageService {
  async findByUserId(userId: string, role: string): Promise<MessageData[]> {
    if (role === "ADMIN") {
      const msgs = await db.message.findMany({ orderBy: { createdAt: "desc" } });
      return msgs.map(toMessageData);
    }

    const msgs = await db.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: "desc" },
    });
    return msgs.map(toMessageData);
  }

  async findAll(): Promise<MessageData[]> {
    const msgs = await db.message.findMany({ orderBy: { createdAt: "desc" } });
    return msgs.map(toMessageData);
  }

  async create(data: SendMessageInput): Promise<MessageData> {
    const msg = await db.message.create({
      data: {
        senderId: data.senderId,
        senderName: data.senderName,
        senderRole: data.senderRole,
        receiverId: data.receiverId,
        receiverName: data.receiverName,
        receiverRole: data.receiverRole,
        topic: data.topic,
        message: data.message,
        parentMsgId: data.parentMsgId || null,
      },
    });
    return toMessageData(msg);
  }

  async delete(id: string): Promise<void> {
    await db.message.delete({ where: { id } });
  }
}
