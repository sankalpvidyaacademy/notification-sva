import { NextRequest, NextResponse } from 'next/server';
import { getUserService } from '@/adapters/appAdapter';

// GET /api/users
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');

    const userService = getUserService();
    const users = await userService.findAll(role || undefined);

    // Remove passwords from response
    const sanitized = users.map(({ password: _, ...userWithoutPassword }) => userWithoutPassword);

    return NextResponse.json({ users: sanitized });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/users
export async function POST(req: NextRequest) {
  try {
    const { userId, name, password, role, classes, subjects } = await req.json();

    if (!userId || !name || !password || !role) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 });
    }

    const userService = getUserService();

    // Check if user already exists
    const existing = await userService.findByUserId(userId);
    if (existing) {
      return NextResponse.json({ error: 'User ID already exists' }, { status: 409 });
    }

    const user = await userService.create({
      userId,
      name,
      password,
      role,
      classes: classes || [],
      subjects: subjects || (role === 'STUDENT' ? [] : {}),
    });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

// PUT /api/users
export async function PUT(req: NextRequest) {
  try {
    const { id, userId, name, password, role, classes, subjects } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userService = getUserService();

    const existing = await userService.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = await userService.update(id, {
      userId,
      name,
      password,
      role,
      classes,
      subjects,
    });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/users
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userService = getUserService();
    await userService.delete(id);
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
