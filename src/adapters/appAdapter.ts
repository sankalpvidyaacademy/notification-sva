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
 * This ensures zero-code-change in UI components.
 * API routes use this adapter instead of direct database calls.
 */

import { isFirebaseEnabled, isFirebaseConfigured } from "../../firebase/firebaseInit";
import type { IUserService, IAuthService, INotificationService, IMessageService } from "../services/types";

// Prisma implementations
import { PrismaUserService } from "../services/userService.prisma";
import { PrismaAuthService } from "../services/authService.prisma";
import { PrismaNotificationService } from "../services/notificationService.prisma";
import { PrismaMessageService } from "../services/messageService.prisma";

// Firebase implementations
import { FirebaseUserService } from "../services/userService.firebase";
import { FirebaseAuthService } from "../services/authService.firebase";
import { FirebaseNotificationService } from "../services/notificationService.firebase";
import { FirebaseMessageService } from "../services/messageService.firebase";

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

// ─── Public API ───

export function getUserService(): IUserService {
  if (!_userService) {
    _userService = shouldUseFirebase() ? new FirebaseUserService() : new PrismaUserService();
    console.log(`[Adapter] User Service → ${getBackendType().toUpperCase()}`);
  }
  return _userService;
}

export function getAuthService(): IAuthService {
  if (!_authService) {
    _authService = shouldUseFirebase() ? new FirebaseAuthService() : new PrismaAuthService();
    console.log(`[Adapter] Auth Service → ${getBackendType().toUpperCase()}`);
  }
  return _authService;
}

export function getNotificationService(): INotificationService {
  if (!_notificationService) {
    _notificationService = shouldUseFirebase() ? new FirebaseNotificationService() : new PrismaNotificationService();
    console.log(`[Adapter] Notification Service → ${getBackendType().toUpperCase()}`);
  }
  return _notificationService;
}

export function getMessageService(): IMessageService {
  if (!_messageService) {
    _messageService = shouldUseFirebase() ? new FirebaseMessageService() : new PrismaMessageService();
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
