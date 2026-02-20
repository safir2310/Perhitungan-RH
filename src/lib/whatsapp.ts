import { db } from '@/lib/db';
import { formatDate } from './rh-helper';

interface NotificationData {
  productId: string;
  productName: string;
  quantity: number;
  expirationDate: Date;
  rhDate: Date;
  status: string;
  whatsappNumber: string;
  userId: string;
}

// Generate WhatsApp message for warning (wajib retur)
function generateWarningMessage(data: NotificationData): string {
  const { productName, quantity, expirationDate, rhDate } = data;

  return `⚠️ NOTIFIKASI RH

Produk: ${productName}
Jumlah: ${quantity} item
Tanggal Kadaluarsa: ${formatDate(expirationDate)}
Tanggal RH: ${formatDate(rhDate)}
Status: WAJIB RETUR (H-14)

Segera lakukan retur sebelum tanggal kadaluarsa.`;
}

// Generate WhatsApp message for expired (jatuh RH)
function generateExpiredMessage(data: NotificationData): string {
  const { productName, quantity, expirationDate } = data;

  return `🚨 PERINGATAN RH

Produk: ${productName}
Jumlah: ${quantity} item
Tanggal Kadaluarsa: ${formatDate(expirationDate)}
Status: JATUH RH (KADALUARSA)

Produk tidak boleh dijual. Segera lakukan penarikan dari rak.`;
}

// Send WhatsApp notification (simulated - in production, use WhatsApp Business API)
async function sendWhatsAppNotification(phoneNumber: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // SIMULATION: In production, integrate with WhatsApp Business API
    // Example using WhatsApp Business API:
    // const response = await fetch('https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     messaging_product: 'whatsapp',
    //     to: phoneNumber,
    //     type: 'text',
    //     text: { body: message },
    //   }),
    // });

    // For demo purposes, we'll simulate a successful send
    console.log(`[WhatsApp Demo] Sending to ${phoneNumber}:`);
    console.log(message);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  } catch (error) {
    console.error('Send WhatsApp notification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Send warning notification and log it
export async function sendWarningNotification(data: NotificationData): Promise<boolean> {
  const message = generateWarningMessage(data);
  const result = await sendWhatsAppNotification(data.whatsappNumber, message);

  if (result.success) {
    // Log the notification
    await db.notificationLog.create({
      data: {
        type: 'warning_rh',
        productId: data.productId,
        productName: data.productName,
        quantity: data.quantity,
        expirationDate: data.expirationDate,
        rhDate: data.rhDate,
        status: data.status,
        whatsappNumber: data.whatsappNumber,
        message,
        userId: data.userId,
      },
    });

    return true;
  }

  return false;
}

// Send expired notification and log it
export async function sendExpiredNotification(data: NotificationData): Promise<boolean> {
  const message = generateExpiredMessage(data);
  const result = await sendWhatsAppNotification(data.whatsappNumber, message);

  if (result.success) {
    // Log the notification
    await db.notificationLog.create({
      data: {
        type: 'expired_rh',
        productId: data.productId,
        productName: data.productName,
        quantity: data.quantity,
        expirationDate: data.expirationDate,
        rhDate: data.rhDate,
        status: data.status,
        whatsappNumber: data.whatsappNumber,
        message,
        userId: data.userId,
      },
    });

    return true;
  }

  return false;
}

// Check and send notifications for products that need attention
export async function checkAndSendNotifications(userId: string): Promise<{
  warningSent: number;
  expiredSent: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let warningSent = 0;
  let expiredSent = 0;

  try {
    // Get user
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get products that need notification
    const products = await db.product.findMany({
      where: {
        userId,
        status: {
          in: ['warning', 'expired'],
        },
      },
      include: {
        user: true,
      },
    });

    for (const product of products) {
      // Check if notification was already sent today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingNotification = await db.notificationLog.findFirst({
        where: {
          productId: product.id,
          type: product.status === 'warning' ? 'warning_rh' : 'expired_rh',
          sentAt: {
            gte: today,
          },
        },
      });

      if (existingNotification) {
        continue; // Already sent today
      }

      const notificationData: NotificationData = {
        productId: product.id,
        productName: product.name,
        quantity: product.quantity,
        expirationDate: product.expirationDate,
        rhDate: product.rhDate,
        status: product.status,
        whatsappNumber: user.whatsapp,
        userId: user.id,
      };

      if (product.status === 'warning') {
        const sent = await sendWarningNotification(notificationData);
        if (sent) {
          warningSent++;
        } else {
          errors.push(`Gagal mengirim notifikasi untuk produk: ${product.name}`);
        }
      } else if (product.status === 'expired') {
        const sent = await sendExpiredNotification(notificationData);
        if (sent) {
          expiredSent++;
        } else {
          errors.push(`Gagal mengirim notifikasi untuk produk: ${product.name}`);
        }
      }
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error');
  }

  return {
    warningSent,
    expiredSent,
    errors,
  };
}
