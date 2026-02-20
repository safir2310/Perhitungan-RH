'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { Statistics } from '@/hooks/use-products';

interface StatisticsCardsProps {
  statistics: Statistics;
}

export function StatisticsCards({ statistics }: StatisticsCardsProps) {
  const { summary } = statistics;

  const cards = [
    {
      title: 'Total',
      value: summary.totalProducts,
      quantity: summary.totalQuantity,
      icon: Package,
      color: 'text-primary',
      bgClass: 'bg-primary/10',
      description: 'produk',
      badgeBg: 'bg-primary',
    },
    {
      title: 'Aman',
      value: summary.safe.count,
      quantity: summary.safe.quantity,
      percentage: summary.safe.percentage,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgClass: 'bg-green-100 dark:bg-green-900/20',
      description: 'produk',
      badgeBg: 'bg-green-600',
    },
    {
      title: 'Wajib Retur',
      value: summary.warning.count,
      quantity: summary.warning.quantity,
      percentage: summary.warning.percentage,
      icon: AlertTriangle,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgClass: 'bg-yellow-100 dark:bg-yellow-900/20',
      description: 'produk',
      badgeBg: 'bg-yellow-600',
    },
    {
      title: 'Jatuh RH',
      value: summary.expired.count,
      quantity: summary.expired.quantity,
      percentage: summary.expired.percentage,
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgClass: 'bg-red-100 dark:bg-red-900/20',
      description: 'produk',
      badgeBg: 'bg-red-600',
    },
  ];

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-1.5 sm:p-2 rounded-lg ${card.bgClass}`}>
                <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl sm:text-3xl font-bold">{card.value}</div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-muted-foreground">
                  {card.quantity} item {card.description}
                </p>
                {card.percentage !== undefined && (
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded text-white ${card.badgeBg}`}>
                    {card.percentage}%
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
