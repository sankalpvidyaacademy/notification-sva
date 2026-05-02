import { NextRequest, NextResponse } from 'next/server';
import { getAuthService, getUserService } from '@/adapters/appAdapter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, password, role } = body;

    if (!userId || !password || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Auto-seed admin user if not found (helps on first deploy)
    if (userId === 'shobhit' && role === 'ADMIN') {
      try {
        const userService = await getUserService();
        const existing = await userService.findByUserId('shobhit');
        if (!existing) {
          await userService.create({
            userId: 'shobhit',
            name: 'Admin',
            password: 'Shobhit@1502',
            role: 'ADMIN',
            classes: [],
            subjects: {},
          });
          console.log('[Auth] Auto-seeded admin user');
        }
      } catch (seedError) {
        console.error('[Auth] Auto-seed failed:', seedError);
      }
    }

    const authService = await getAuthService();
    const user = await authService.authenticate(userId, password, role);

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials or role mismatch' }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Login error:', error);
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ error: `Login failed: ${message}` }, { status: 500 });
  }
}
