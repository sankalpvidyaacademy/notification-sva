import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/notifications - List notifications based on user role
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');
    const userClasses = searchParams.get('classes');
    const userSubjects = searchParams.get('subjects');

    if (!userId || !role) {
      return NextResponse.json({ error: 'User ID and role are required' }, { status: 400 });
    }

    let notifications;

    if (role === 'ADMIN') {
      // Admin sees all notifications
      notifications = await db.notification.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } else if (role === 'TEACHER') {
      // Teacher sees: notifications they sent + notifications addressed to teachers
      const sender = await db.user.findUnique({ where: { id: userId } });
      const teacherUserId = sender?.userId || '';

      notifications = await db.notification.findMany({
        where: {
          OR: [
            { senderId: teacherUserId },
            { recipientType: 'TEACHER' },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (role === 'STUDENT') {
      // Student sees: notifications addressed to students in their class + subject
      const classes = userClasses ? JSON.parse(userClasses) : [];
      const subjects = userSubjects ? JSON.parse(userSubjects) : [];

      if (classes.length === 0 || subjects.length === 0) {
        notifications = [];
      } else {
        // Build OR conditions for each class-subject combination
        const orConditions = [];
        for (const cls of classes) {
          for (const sub of subjects) {
            orConditions.push({
              recipientType: 'STUDENT',
              targetClass: cls,
              targetSubject: sub,
            });
          }
        }

        notifications = await db.notification.findMany({
          where: { OR: orConditions },
          orderBy: { createdAt: 'desc' },
        });
      }
    } else {
      notifications = [];
    }

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST /api/notifications - Create a new notification
export async function POST(req: NextRequest) {
  try {
    const { senderId, senderName, recipientType, targetClass, targetSubject, topic, message, date } = await req.json();

    if (!senderId || !senderName || !recipientType || !topic || !message) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 });
    }

    if (recipientType === 'STUDENT' && (!targetClass || !targetSubject)) {
      return NextResponse.json({ error: 'Class and Subject are required for student notifications' }, { status: 400 });
    }

    const notification = await db.notification.create({
      data: {
        senderId,
        senderName,
        recipientType,
        targetClass: targetClass || '',
        targetSubject: targetSubject || '',
        topic,
        message,
        date: date || new Date().toISOString().split('T')[0],
      },
    });

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

// DELETE /api/notifications - Delete a notification
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    await db.notification.delete({ where: { id } });
    return NextResponse.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
}
