import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { checkAndSendNotifications } from '@/lib/whatsapp';

// POST check and send notifications
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check and send notifications
    const result = await checkAndSendNotifications(session.userId);

    return NextResponse.json({
      message: 'Notifikasi diperiksa dan dikirim',
      ...result,
    });
  } catch (error) {
    console.error('Check notifications error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memeriksa notifikasi' },
      { status: 500 }
    );
  }
}
