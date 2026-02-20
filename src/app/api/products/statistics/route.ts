import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET products statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all products for the user
    const products = await db.product.findMany({
      where: { userId: session.userId },
    });

    // Calculate statistics
    const totalProducts = products.length;
    const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);

    const safeProducts = products.filter(p => p.status === 'safe');
    const warningProducts = products.filter(p => p.status === 'warning');
    const expiredProducts = products.filter(p => p.status === 'expired');

    const safeCount = safeProducts.length;
    const safeQuantity = safeProducts.reduce((sum, p) => sum + p.quantity, 0);

    const warningCount = warningProducts.length;
    const warningQuantity = warningProducts.reduce((sum, p) => sum + p.quantity, 0);

    const expiredCount = expiredProducts.length;
    const expiredQuantity = expiredProducts.reduce((sum, p) => sum + p.quantity, 0);

    // Get upcoming RH products (warning status)
    const upcomingRH = warningProducts
      .map(p => ({
        id: p.id,
        name: p.name,
        quantity: p.quantity,
        rhDate: p.rhDate,
        expirationDate: p.expirationDate,
      }))
      .sort((a, b) => new Date(a.rhDate).getTime() - new Date(b.rhDate).getTime())
      .slice(0, 10); // Top 10 upcoming

    // Get expired products
    const expiredList = expiredProducts
      .map(p => ({
        id: p.id,
        name: p.name,
        quantity: p.quantity,
        expirationDate: p.expirationDate,
      }))
      .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());

    return NextResponse.json({
      summary: {
        totalProducts,
        totalQuantity,
        safe: {
          count: safeCount,
          quantity: safeQuantity,
          percentage: totalProducts > 0 ? Math.round((safeCount / totalProducts) * 100) : 0,
        },
        warning: {
          count: warningCount,
          quantity: warningQuantity,
          percentage: totalProducts > 0 ? Math.round((warningCount / totalProducts) * 100) : 0,
        },
        expired: {
          count: expiredCount,
          quantity: expiredQuantity,
          percentage: totalProducts > 0 ? Math.round((expiredCount / totalProducts) * 100) : 0,
        },
      },
      upcomingRH,
      expiredList,
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data statistik' },
      { status: 500 }
    );
  }
}
