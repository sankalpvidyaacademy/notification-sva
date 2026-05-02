/**
 * Application Adapter
 *
 * This is the central adapter that provides a unified interface
 * for the service layer. It automatically switches between
 * Prisma/SQLite and Firebase/Firestore based on the
 * USE_FIREBASE environment variable.
 *
 * Usage:
 *   - Set USE_FIREBASE=true + Firebase credentials → Uses Firestore
 *   - Set USE_FIREBASE=false or unset → Uses Prisma/SQLite (default)
 *
 * ⚠️ Firebase services use dynamic imports to prevent
 * firebase-admin from being bundled in the client.
 */

import { isFirebaseEnabled, isFirebaseConfigured } from "@/firebase/firebaseEnv";
import type { IUserService, IAuthService, INotificationService, IMessageService } from "../services/types";

// Prisma implementations (safe for both client & server)
import { PrismaUserService } from "../services/userService.prisma";
import { PrismaAuthService } from "../services/authService.prisma";
import { PrismaNotificationService } from "../services/notificationService.prisma";
import { PrismaMessageService } from "../services/messageService.prisma";

// ─── Singleton instances ───

let _userService: IUserService | null = null;
let _authService: IAuthService | null = null;
let _notificationService: INotificationService | null = null;
let _messageService: IMessageService | null = null;

function shouldUseFirebase(): boolean {
  return isFirebaseEnabled() && isFirebaseConfigured();
}

function getBackendType(): "firebase" | "prisma" {
  return shouldUseFirebase() ? "firebase" : "prisma";
}

// ─── Dynamic import helpers for Firebase (server-only) ───

async function getFirebaseUserService(): Promise<IUserService> {
  const { FirebaseUserService } = await import("../services/userService.firebase");
  return new FirebaseUserService();
}

async function getFirebaseAuthService(): Promise<IAuthService> {
  const { FirebaseAuthService } = await import("../services/authService.firebase");
  return new FirebaseAuthService();
}

async function getFirebaseNotificationService(): Promise<INotificationService> {
  const { FirebaseNotificationService } = await import("../services/notificationService.firebase");
  return new FirebaseNotificationService();
}

async function getFirebaseMessageService(): Promise<IMessageService> {
  const { FirebaseMessageService } = await import("../services/messageService.firebase");
  return new FirebaseMessageService();
}

// ─── Public API ───

export async function getUserService(): Promise<IUserService> {
  if (!_userService) {
    _userService = shouldUseFirebase()
      ? await getFirebaseUserService()
      : new PrismaUserService();
    console.log(`[Adapter] User Service → ${getBackendType().toUpperCase()}`);
  }
  return _userService;
}

export async function getAuthService(): Promise<IAuthService> {
  if (!_authService) {
    _authService = shouldUseFirebase()
      ? await getFirebaseAuthService()
      : new PrismaAuthService();
    console.log(`[Adapter] Auth Service → ${getBackendType().toUpperCase()}`);
  }
  return _authService;
}

export async function getNotificationService(): Promise<INotificationService> {
  if (!_notificationService) {
    _notificationService = shouldUseFirebase()
      ? await getFirebaseNotificationService()
      : new PrismaNotificationService();
    console.log(`[Adapter] Notification Service → ${getBackendType().toUpperCase()}`);
  }
  return _notificationService;
}

export async function getMessageService(): Promise<IMessageService> {
  if (!_messageService) {
    _messageService = shouldUseFirebase()
      ? await getFirebaseMessageService()
      : new PrismaMessageService();
    console.log(`[Adapter] Message Service → ${getBackendType().toUpperCase()}`);
  }
  return _messageService;
}

/**
 * Reset all service instances (useful for testing or switching backends)
 */
export function resetAdapter(): void {
  _userService = null;
  _authService = null;
  _notificationService = null;
  _messageService = null;
}

/**
 * Get current adapter status for debugging
 */
export function getAdapterStatus(): {
  backend: "firebase" | "prisma";
  firebaseEnabled: boolean;
  firebaseConfigured: boolean;
} {
  return {
    backend: getBackendType(),
    firebaseEnabled: isFirebaseEnabled(),
    firebaseConfigured: isFirebaseConfigured(),
  };
}
