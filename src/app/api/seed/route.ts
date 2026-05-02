import { NextResponse } from 'next/server';
import { getUserService } from '@/adapters/appAdapter';

export async function POST() {
  try {
    const userService = getUserService();

    const existing = await userService.findByUserId('shobhit');
    if (existing) {
      return NextResponse.json({ message: 'Admin already exists' }, { status: 200 });
    }

    await userService.create({
      userId: 'shobhit',
      name: 'Admin',
      password: 'Shobhit@1502',
      role: 'ADMIN',
      classes: [],
      subjects: {},
    });

    return NextResponse.json({ message: 'Admin user seeded successfully' }, { status: 201 });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed admin user' }, { status: 500 });
  }
}
