import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Type for class→subjects mapping
type ClassSubjectMap = Record<string, string[]>;

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
      // Student sees: notifications addressed to students where their class+subjects match
      const classes: string[] = userClasses ? JSON.parse(userClasses) : [];
      const subjects: string[] = userSubjects ? JSON.parse(userSubjects) : [];

      if (classes.length === 0 || subjects.length === 0) {
        notifications = [];
      } else {
        // Get all STUDENT notifications and filter in-memory for precise matching
        const allStudentNotifs = await db.notification.findMany({
          where: { recipientType: 'STUDENT' },
          orderBy: { createdAt: 'desc' },
        });

        // Filter: student receives notif if their class is in targetData AND their subjects intersect
        notifications = allStudentNotifs.filter((notif) => {
          try {
            const targetData: ClassSubjectMap = JSON.parse(notif.targetData);
            const studentClass = classes[0]; // Student has single class
            const targetSubjects = targetData[studentClass];
            if (!targetSubjects) return false;
            // Check intersection between student subjects and target subjects
            return targetSubjects.some((s) => subjects.includes(s));
          } catch {
            return false;
          }
        });
      }
    } else {
      notifications = [];
    }

    // Parse targetData for each notification
    const parsed = notifications.map((n) => ({
      ...n,
      targetData: JSON.parse(n.targetData),
    }));

    return NextResponse.json({ notifications: parsed });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST /api/notifications - Create a new notification
export async function POST(req: NextRequest) {
  try {
    const { senderId, senderName, recipientType, targetData, topic, message, date } = await req.json();

    if (!senderId || !senderName || !recipientType || !topic || !message) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 });
    }

    if (recipientType === 'STUDENT') {
      if (!targetData || Object.keys(targetData).length === 0) {
        return NextResponse.json({ error: 'At least one class with subjects must be selected' }, { status: 400 });
      }
      // Validate at least one subject per class
      for (const [cls, subs] of Object.entries(targetData as ClassSubjectMap)) {
        if (!subs || subs.length === 0) {
          return NextResponse.json({ error: `At least one subject must be selected for ${cls}` }, { status: 400 });
        }
      }
    }

    const notification = await db.notification.create({
      data: {
        senderId,
        senderName,
        recipientType,
        targetData: JSON.stringify(targetData || {}),
        topic,
        message,
        date: date || new Date().toISOString().split('T')[0],
      },
    });

    return NextResponse.json({
      notification: {
        ...notification,
        targetData: JSON.parse(notification.targetData),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

// DELETE /api/notifications
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
