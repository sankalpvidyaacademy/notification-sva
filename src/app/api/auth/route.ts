import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId, password, role } = await req.json();

    if (!userId || !password || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { userId } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.password !== password) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    if (user.role !== role) {
      return NextResponse.json({ error: `This account does not have ${role} role` }, { status: 403 });
    }

    // Parse subjects based on role
    let subjects;
    try {
      const parsed = JSON.parse(user.subjects);
      if (user.role === 'STUDENT') {
        // Student: subjects is a flat array
        subjects = Array.isArray(parsed) ? parsed : [];
      } else {
        // Teacher/Admin: subjects is a class→subjects map
        subjects = typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
      }
    } catch {
      subjects = user.role === 'STUDENT' ? [] : {};
    }

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({
      user: {
        ...userWithoutPassword,
        classes: JSON.parse(user.classes),
        subjects,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
