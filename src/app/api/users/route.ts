import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/users - List users (optionally filter by role)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');

    const where = role ? { role } : {};

    const users = await db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Parse JSON fields and remove passwords
    const sanitized = users.map((u) => ({
      ...u,
      password: undefined,
      classes: JSON.parse(u.classes),
      subjects: JSON.parse(u.subjects),
    }));

    return NextResponse.json({ users: sanitized });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/users - Create a new user
export async function POST(req: NextRequest) {
  try {
    const { userId, name, password, role, classes, subjects } = await req.json();

    if (!userId || !name || !password || !role) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 });
    }

    // Check if userId already exists
    const existing = await db.user.findUnique({ where: { userId } });
    if (existing) {
      return NextResponse.json({ error: 'User ID already exists' }, { status: 409 });
    }

    const user = await db.user.create({
      data: {
        userId,
        name,
        password,
        role,
        classes: JSON.stringify(classes || []),
        subjects: JSON.stringify(subjects || []),
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({
      user: {
        ...userWithoutPassword,
        classes: JSON.parse(user.classes),
        subjects: JSON.parse(user.subjects),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

// PUT /api/users - Update a user
export async function PUT(req: NextRequest) {
  try {
    const { id, userId, name, password, role, classes, subjects } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (userId !== undefined) updateData.userId = userId;
    if (name !== undefined) updateData.name = name;
    if (password !== undefined) updateData.password = password;
    if (role !== undefined) updateData.role = role;
    if (classes !== undefined) updateData.classes = JSON.stringify(classes);
    if (subjects !== undefined) updateData.subjects = JSON.stringify(subjects);

    const user = await db.user.update({
      where: { id },
      data: updateData,
    });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({
      user: {
        ...userWithoutPassword,
        classes: JSON.parse(user.classes),
        subjects: JSON.parse(user.subjects),
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/users - Delete a user
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await db.user.delete({ where: { id } });
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
