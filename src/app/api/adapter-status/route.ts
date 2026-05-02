import { NextResponse } from 'next/server';
import { getAdapterStatus } from '@/adapters/appAdapter';

export async function GET() {
  const status = getAdapterStatus();
  return NextResponse.json({
    ...status,
    timestamp: new Date().toISOString(),
    message: status.backend === 'firebase'
      ? 'Using Firebase/Firestore as database backend'
      : 'Using Prisma/SQLite as database backend (default)',
  });
}
