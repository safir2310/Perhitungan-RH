import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { calculateProductStatus } from '@/lib/rh-helper';
import { sendWarningNotification, sendExpiredNotification } from '@/lib/whatsapp';

// GET product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const product = await db.product.findFirst({
      where: {
        id: id,
        userId: session.userId,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data produk' },
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, expirationDate, quantity, rhDaysBefore, rhDate } = body;

    // Check if product exists and belongs to user
    const existingProduct = await db.product.findFirst({
      where: {
        id: id,
        userId: session.userId,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    // Parse and calculate dates
    let expDate = existingProduct.expirationDate;
    let calculatedRhDate = existingProduct.rhDate;
    let calculatedRhDaysBefore = existingProduct.rhDaysBefore;

    if (expirationDate) {
      expDate = new Date(expirationDate);
    }

    if (rhDaysBefore) {
      calculatedRhDaysBefore = parseInt(rhDaysBefore);
    }

    if (rhDate) {
      calculatedRhDate = new Date(rhDate);
    } else if (expirationDate || rhDaysBefore) {
      // Recalculate RH date if expiration date or rhDaysBefore changed
      const { calculateRHDate } = await import('@/lib/rh-helper');
      calculatedRhDate = calculateRHDate(expDate, calculatedRhDaysBefore);
    }

    // Calculate status
    const status = calculateProductStatus(calculatedRhDate, expDate);

    // Check if status changed to warning or expired
    const statusChanged = status !== existingProduct.status;
    const needsNotification = statusChanged && (status === 'warning' || status === 'expired');

    // Update product
    const product = await db.product.update({
      where: { id: id },
      data: {
        ...(name && { name }),
        expirationDate: expDate,
        rhDate: calculatedRhDate,
        ...(quantity !== undefined && { quantity: parseInt(quantity) }),
        rhDaysBefore: calculatedRhDaysBefore,
        status,
      },
    });

    // Send automatic WhatsApp notification if status changed to warning or expired
    if (needsNotification) {
      try {
        const user = await db.user.findUnique({
          where: { id: session.userId },
        });

        if (user) {
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

          if (status === 'warning') {
            await sendWarningNotification(notificationData);
          } else if (status === 'expired') {
            await sendExpiredNotification(notificationData);
          }
        }
      } catch (notifError) {
        console.error('Failed to send automatic notification:', notifError);
        // Continue with the response even if notification fails
      }
    }

    return NextResponse.json({
      message: 'Produk berhasil diperbarui',
      product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui produk' },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if product exists and belongs to user
    const existingProduct = await db.product.findFirst({
      where: {
        id: id,
        userId: session.userId,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    // Delete product
    await db.product.delete({
      where: { id: id },
    });

    return NextResponse.json({
      message: 'Produk berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus produk' },
      { status: 500 }
    );
  }
}
