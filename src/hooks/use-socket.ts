'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface Notification {
  type: string;
  message: string;
  product?: any;
  notification?: any;
  timestamp: string;
  urgent?: boolean;
}

export function useSocket(userId: string | undefined) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!userId) return;

    // Connect to notification service
    const socketInstance = io('/?XTransformPort=3002', {
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('Connected to notification service');
      setConnected(true);

      // Register user
      socketInstance.emit('register', userId);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from notification service');
      setConnected(false);
    });

    socketInstance.on('registered', (data) => {
      console.log('Registered with notification service:', data);
    });

    socketInstance.on('notification', (notification: Notification) => {
      console.log('Received notification:', notification);
      setNotifications((prev) => [notification, ...prev].slice(0, 50)); // Keep last 50
    });

    socketInstance.on('ping', (data) => {
      // Heartbeat response
      socketInstance.emit('pong', data);
    });

    setSocket(socketInstance);

    // Cleanup
    return () => {
      socketInstance.disconnect();
    };
  }, [userId]);

  const sendNotification = useCallback((data: any) => {
    if (socket && connected) {
      socket.emit('send-notification', data);
    }
  }, [socket, connected]);

  const broadcast = useCallback((message: string, type: string = 'info') => {
    if (socket && connected) {
      socket.emit('broadcast', { message, type });
    }
  }, [socket, connected]);

  const notifyNewProduct = useCallback((product: any) => {
    if (socket && connected && userId) {
      socket.emit('new-product', { userId, product });
    }
  }, [socket, connected, userId]);

  const notifyProductUpdated = useCallback((product: any) => {
    if (socket && connected && userId) {
      socket.emit('product-updated', { userId, product });
    }
  }, [socket, connected, userId]);

  const notifyWhatsappSent = useCallback((notification: any) => {
    if (socket && connected && userId) {
      socket.emit('whatsapp-sent', { userId, notification });
    }
  }, [socket, connected, userId]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    connected,
    notifications,
    sendNotification,
    broadcast,
    notifyNewProduct,
    notifyProductUpdated,
    notifyWhatsappSent,
    clearNotifications,
  };
}
