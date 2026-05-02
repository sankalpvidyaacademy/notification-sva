/**
 * Prisma Notification Service Implementation
 * Wraps existing Prisma database calls for notification operations
 */

import { db } from "@/lib/db";
import type { INotificationService, NotificationData, CreateNotificationInput } from "./types";

function toNotificationData(raw: {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientType: string;
  targetData: string;
  topic: string;
  message: string;
  date: string;
  createdAt: Date;
  updatedAt: Date;
}): NotificationData {
  return {
    ...raw,
    targetData: JSON.parse(raw.targetData),
  };
}

export class PrismaNotificationService implements INotificationService {
  async findAll(): Promise<NotificationData[]> {
    const notifs = await db.notification.findMany({ orderBy: { createdAt: "desc" } });
    return notifs.map(toNotificationData);
  }

  async findBySender(senderId: string): Promise<NotificationData[]> {
    const notifs = await db.notification.findMany({
      where: { senderId },
      orderBy: { createdAt: "desc" },
    });
    return notifs.map(toNotificationData);
  }

  async findByRecipientType(recipientType: string): Promise<NotificationData[]> {
    const notifs = await db.notification.findMany({
      where: { recipientType },
      orderBy: { createdAt: "desc" },
    });
    return notifs.map(toNotificationData);
  }

  async findById(id: string): Promise<NotificationData | null> {
    const notif = await db.notification.findUnique({ where: { id } });
    return notif ? toNotificationData(notif) : null;
  }

  async create(data: CreateNotificationInput): Promise<NotificationData> {
    const notif = await db.notification.create({
      data: {
        senderId: data.senderId,
        senderName: data.senderName,
        senderRole: data.senderRole || "ADMIN",
        recipientType: data.recipientType,
        targetData: JSON.stringify(data.targetData || {}),
        topic: data.topic,
        message: data.message,
        date: data.date || new Date().toISOString().split("T")[0],
      },
    });
    return toNotificationData(notif);
  }

  async delete(id: string): Promise<void> {
    await db.notification.delete({ where: { id } });
  }
}
