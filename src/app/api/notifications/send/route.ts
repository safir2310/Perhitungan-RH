import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendWarningNotification, sendExpiredNotification } from '@/lib/whatsapp';

// POST send manual notification
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, type } = body;

    if (!productId || !type) {
      return NextResponse.json(
        { error: 'ProductId dan type wajib diisi' },
        { status: 400 }
      );
    }

    // Get product
    const product = await db.product.findFirst({
      where: {
        id: productId,
        userId: session.userId,
      },
      include: {
        user: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get admin and staff users
    const users = await db.user.findMany({
      where: {
        OR: [
          { role: 'admin' },
          { role: 'staff' },
        ],
      },
    });

    let sentCount = 0;
    const errors: string[] = [];

    for (const user of users) {
      const notificationData = {
        productId: product.id,
        productName: product.name,
        quantity: product.quantity,
        expirationDate: product.expirationDate,
        rhDate: product.rhDate,
        status: product.status,
        whatsappNumber: user.whatsapp,
        userId: user.id,
      };

      let sent = false;
      if (type === 'warning') {
        sent = await sendWarningNotification(notificationData);
      } else if (type === 'expired') {
        sent = await sendExpiredNotification(notificationData);
      } else {
        errors.push(`Type tidak valid: ${type}`);
        continue;
      }

      if (sent) {
        sentCount++;
      } else {
        errors.push(`Gagal mengirim ke ${user.username} (${user.whatsapp})`);
      }
    }

    return NextResponse.json({
      message: `Notifikasi dikirim ke ${sentCount} user`,
      sentCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Send notification error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengirim notifikasi' },
      { status: 500 }
    );
  }
}
