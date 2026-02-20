'use client';

import { useEffect } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { toast } from '@/hooks/use-toast';
import { Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface NotificationToastProps {
  userId: string | undefined;
}

export function NotificationToast({ userId }: NotificationToastProps) {
  const { notifications, notifyProductUpdated } = useSocket(userId);

  useEffect(() => {
    // Show toast for new notifications
    if (notifications.length > 0) {
      const latest = notifications[0];

      const icon = latest.urgent ? AlertTriangle : latest.type === 'whatsapp-sent' ? CheckCircle : Info;
      const variant = latest.urgent ? 'destructive' : 'default';

      toast({
        title: latest.urgent ? '⚠️ Peringatan Penting' : '🔔 Notifikasi',
        description: latest.message,
        variant,
        icon: <icon className="h-5 w-5" />,
      });
    }
  }, [notifications]);

  return null;
}
