import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const existing = await db.user.findUnique({ where: { userId: 'shobhit' } });
    if (existing) {
      return NextResponse.json({ message: 'Admin already exists' }, { status: 200 });
    }

    await db.user.create({
      data: {
        userId: 'shobhit',
        name: 'Admin',
        password: 'Shobhit@1502',
        role: 'ADMIN',
        classes: '[]',
        subjects: '{}',
      },
    });

    return NextResponse.json({ message: 'Admin user seeded successfully' }, { status: 201 });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed admin user' }, { status: 500 });
  }
}
