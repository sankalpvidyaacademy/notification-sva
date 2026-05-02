import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/messages - List messages based on user role
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    if (!userId || !role) {
      return NextResponse.json({ error: 'User ID and role are required' }, { status: 400 });
    }

    let messages;

    if (role === 'ADMIN') {
      // Admin sees ALL messages (full monitoring)
      messages = await db.message.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } else if (role === 'TEACHER') {
      // Teacher sees: messages they sent + messages received from students
      messages = await db.message.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Student sees: messages they sent + messages received (replies)
      messages = await db.message.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST /api/messages - Send a new message or reply
export async function POST(req: NextRequest) {
  try {
    const { senderId, senderName, senderRole, receiverId, receiverName, receiverRole, topic, message, parentMsgId } = await req.json();

    if (!senderId || !senderName || !senderRole || !receiverId || !receiverName || !receiverRole || !topic || !message) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 });
    }

    const msg = await db.message.create({
      data: {
        senderId,
        senderName,
        senderRole,
        receiverId,
        receiverName,
        receiverRole,
        topic,
        message,
        parentMsgId: parentMsgId || null,
      },
    });

    return NextResponse.json({ message: msg }, { status: 201 });
  } catch (error) {
    console.error('Create message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

// DELETE /api/messages
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    await db.message.delete({ where: { id } });
    return NextResponse.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
