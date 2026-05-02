/**
 * Firebase Auth Service Implementation
 * Uses Firestore for authentication (custom auth, not Firebase Auth)
 */

import type { IAuthService, UserData } from "./types";
import { FirebaseUserService } from "./userService.firebase";

export class FirebaseAuthService implements IAuthService {
  private userService = new FirebaseUserService();

  async authenticate(userId: string, password: string, role: string): Promise<Omit<UserData, "password"> | null> {
    const user = await this.userService.findByUserId(userId);

    if (!user) return null;
    if (user.password !== password) return null;
    if (user.role !== role) return null;

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
