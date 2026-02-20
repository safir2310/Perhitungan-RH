import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateProductStatus } from '@/lib/rh-helper';
import { sendWarningNotification, sendExpiredNotification } from '@/lib/whatsapp';

// POST auto-check and send notifications for products that need attention
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret } = body;

    // Simple secret verification for cron job security
    const cronSecret = process.env.CRON_SECRET || 'auto-check-secret';

    if (secret !== cronSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all products
    const allProducts = await db.product.findMany({
      include: {
        user: true,
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let warningSent = 0;
    let expiredSent = 0;
    let statusUpdated = 0;
    const errors: string[] = [];

    for (const product of allProducts) {
      // Recalculate status based on current dates
      const newStatus = calculateProductStatus(
        new Date(product.rhDate),
        new Date(product.expirationDate)
      );

      // Update status if it has changed
      if (newStatus !== product.status) {
        await db.product.update({
          where: { id: product.id },
          data: { status: newStatus },
        });
        statusUpdated++;
      }

      // Only send notification for warning or expired products
      if (newStatus === 'warning' || newStatus === 'expired') {
        // Check if notification was already sent today
        const existingNotification = await db.notificationLog.findFirst({
          where: {
            productId: product.id,
            type: newStatus === 'warning' ? 'warning_rh' : 'expired_rh',
            sentAt: {
              gte: today,
            },
          },
        });

        if (!existingNotification) {
          try {
            const notificationData = {
              productId: product.id,
              productName: product.name,
              quantity: product.quantity,
              expirationDate: product.expirationDate,
              rhDate: product.rhDate,
              status: newStatus,
              whatsappNumber: product.user.whatsapp,
              userId: product.user.id,
            };

            if (newStatus === 'warning') {
              const sent = await sendWarningNotification(notificationData);
              if (sent) {
                warningSent++;
              } else {
                errors.push(`Gagal mengirim notifikasi untuk produk: ${product.name}`);
              }
            } else if (newStatus === 'expired') {
              const sent = await sendExpiredNotification(notificationData);
              if (sent) {
                expiredSent++;
              } else {
                errors.push(`Gagal mengirim notifikasi untuk produk: ${product.name}`);
              }
            }
          } catch (notifError) {
            console.error(`Failed to send notification for ${product.name}:`, notifError);
            errors.push(`Error untuk produk ${product.name}: ${notifError}`);
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Auto-check selesai',
      results: {
        statusUpdated,
        warningSent,
        expiredSent,
        totalNotifications: warningSent + expiredSent,
      },
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Auto-check error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat auto-check' },
      { status: 500 }
    );
  }
}

// GET to check status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    const cronSecret = process.env.CRON_SECRET || 'auto-check-secret';

    if (secret !== cronSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get statistics
    const warningCount = await db.product.count({
      where: { status: 'warning' },
    });

    const expiredCount = await db.product.count({
      where: { status: 'expired' },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const notificationsSentToday = await db.notificationLog.count({
      where: {
        sentAt: {
          gte: today,
        },
      },
    });

    return NextResponse.json({
      status: 'ok',
      statistics: {
        warningProducts: warningCount,
        expiredProducts: expiredCount,
        notificationsSentToday,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Auto-check status error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memeriksa status' },
      { status: 500 }
    );
  }
}
