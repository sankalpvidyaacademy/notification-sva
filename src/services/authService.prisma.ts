/**
 * Prisma Auth Service Implementation
 * Wraps existing Prisma database calls for authentication
 */

import type { IAuthService, UserData } from "./types";
import { PrismaUserService } from "./userService.prisma";

export class PrismaAuthService implements IAuthService {
  private userService = new PrismaUserService();

  async authenticate(userId: string, password: string, role: string): Promise<Omit<UserData, "password"> | null> {
    const user = await this.userService.findByUserId(userId);

    if (!user) return null;
    if (user.password !== password) return null;
    if (user.role !== role) return null;

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
