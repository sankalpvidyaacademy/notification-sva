import { NextRequest, NextResponse } from 'next/server';
import { getAuthService } from '@/adapters/appAdapter';

export async function POST(req: NextRequest) {
  try {
    const { userId, password, role } = await req.json();

    if (!userId || !password || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const authService = await getAuthService();
    const user = await authService.authenticate(userId, password, role);

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials or role mismatch' }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
