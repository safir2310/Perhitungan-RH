import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { calculateRHDate, calculateProductStatus } from '@/lib/rh-helper';
import { sendWarningNotification, sendExpiredNotification } from '@/lib/whatsapp';

// GET all products
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: any = { userId: session.userId };

    if (status && ['safe', 'warning', 'expired'].includes(status)) {
      where.status = status;
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy: [
          { status: 'asc' },
          { expirationDate: 'asc' },
        ],
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data produk' },
      { status: 500 }
    );
  }
}

// POST create new product
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
    const { name, expirationDate, quantity, rhDaysBefore = 14, rhDate } = body;

    // Validate required fields
    if (!name || !expirationDate || !quantity) {
      return NextResponse.json(
        { error: 'Nama, tanggal kadaluarsa, dan jumlah wajib diisi' },
        { status: 400 }
      );
    }

    // Parse dates
    const expDate = new Date(expirationDate);
    let calculatedRhDate: Date;

    if (rhDate) {
      calculatedRhDate = new Date(rhDate);
    } else {
      calculatedRhDate = calculateRHDate(expDate, rhDaysBefore);
    }

    // Calculate status
    const status = calculateProductStatus(calculatedRhDate, expDate);

    // Create product
    const product = await db.product.create({
      data: {
        name,
        expirationDate: expDate,
        rhDate: calculatedRhDate,
        quantity: parseInt(quantity),
        rhDaysBefore: parseInt(rhDaysBefore),
        status,
        userId: session.userId,
      },
    });

    // Send automatic WhatsApp notification if product needs attention
    if (status === 'warning' || status === 'expired') {
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
      message: 'Produk berhasil ditambahkan',
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menambahkan produk' },
      { status: 500 }
    );
  }
}
