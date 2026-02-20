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
      title: 'Total Produk',
      value: summary.totalProducts,
      quantity: summary.totalQuantity,
      icon: Package,
      color: 'text-primary',
      bgClass: 'bg-primary/10',
      description: 'Jumlah item',
    },
    {
      title: 'Aman',
      value: summary.safe.count,
      quantity: summary.safe.quantity,
      percentage: summary.safe.percentage,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgClass: 'bg-green-100 dark:bg-green-900/20',
      description: 'Produk aman',
    },
    {
      title: 'Wajib Retur',
      value: summary.warning.count,
      quantity: summary.warning.quantity,
      percentage: summary.warning.percentage,
      icon: AlertTriangle,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgClass: 'bg-yellow-100 dark:bg-yellow-900/20',
      description: 'Perlu retur segera',
    },
    {
      title: 'Jatuh RH',
      value: summary.expired.count,
      quantity: summary.expired.quantity,
      percentage: summary.expired.percentage,
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgClass: 'bg-red-100 dark:bg-red-900/20',
      description: 'Sudah kadaluarsa',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgClass}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.quantity} item {card.description}
                {card.percentage !== undefined && (
                  <span className="ml-2">({card.percentage}%)</span>
                )}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
