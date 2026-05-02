/**
 * Shared types for the service layer
 * Both Prisma and Firebase implementations use these interfaces
 */

// ─── User Types ───

export interface UserData {
  id: string;
  userId: string;
  name: string;
  password: string;
  role: string; // ADMIN, TEACHER, STUDENT
  classes: string[]; // JSON array of class names
  subjects: Record<string, string[]> | string[]; // Teacher: class→subjects map; Student: flat array
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  userId: string;
  name: string;
  password: string;
  role: string;
  classes: string[];
  subjects: Record<string, string[]> | string[];
}

export interface UpdateUserInput {
  userId?: string;
  name?: string;
  password?: string;
  role?: string;
  classes?: string[];
  subjects?: Record<string, string[]> | string[];
}

// ─── Notification Types ───

export interface NotificationData {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientType: string; // ADMIN, TEACHER, STUDENT
  targetData: Record<string, string[]>; // JSON: { "Class 9 CBSE": ["Mathematics"] }
  topic: string;
  message: string;
  date: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationInput {
  senderId: string;
  senderName: string;
  recipientType: string;
  targetData: Record<string, string[]>;
  topic: string;
  message: string;
  date: string;
}

// ─── Message Types ───

export interface MessageData {
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
}

export interface SendMessageInput {
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string;
  receiverName: string;
  receiverRole: string;
  topic: string;
  message: string;
  parentMsgId?: string | null;
}

// ─── Service Interfaces ───

export interface IUserService {
  findByUserId(userId: string): Promise<UserData | null>;
  findById(id: string): Promise<UserData | null>;
  findAll(role?: string): Promise<UserData[]>;
  create(data: CreateUserInput): Promise<UserData>;
  update(id: string, data: UpdateUserInput): Promise<UserData>;
  delete(id: string): Promise<void>;
}

export interface IAuthService {
  authenticate(userId: string, password: string, role: string): Promise<Omit<UserData, "password"> | null>;
}

export interface INotificationService {
  findAll(): Promise<NotificationData[]>;
  findBySender(senderId: string): Promise<NotificationData[]>;
  findByRecipientType(recipientType: string): Promise<NotificationData[]>;
  findById(id: string): Promise<NotificationData | null>;
  create(data: CreateNotificationInput): Promise<NotificationData>;
  delete(id: string): Promise<void>;
}

export interface IMessageService {
  findByUserId(userId: string, role: string): Promise<MessageData[]>;
  findAll(): Promise<MessageData[]>;
  create(data: SendMessageInput): Promise<MessageData>;
  delete(id: string): Promise<void>;
}
