import { Server } from 'socket.io';

const PORT = 3002;

const io = new Server(PORT, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

console.log(`🔔 Notification Service running on port ${PORT}`);

// Store connected clients by userId
const clients = new Map<string, Set<string>>();

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Register user
  socket.on('register', (userId: string) => {
    console.log(`User ${userId} registered with socket ${socket.id}`);

    if (!clients.has(userId)) {
      clients.set(userId, new Set());
    }
    clients.get(userId)!.add(socket.id);

    // Join user-specific room
    socket.join(`user:${userId}`);

    socket.emit('registered', { success: true, userId });
  });

  // Listen for new product notifications
  socket.on('new-product', (data) => {
    const { userId, product } = data;

    // Notify user about new product
    io.to(`user:${userId}`).emit('notification', {
      type: 'new-product',
      message: `Produk baru "${product.name}" ditambahkan`,
      product,
      timestamp: new Date().toISOString(),
    });
  });

  // Listen for product update notifications
  socket.on('product-updated', (data) => {
    const { userId, product } = data;

    // Check if product needs attention
    if (product.status === 'warning' || product.status === 'expired') {
      io.to(`user:${userId}`).emit('notification', {
        type: 'product-alert',
        message: product.status === 'warning'
          ? `Produk "${product.name}" wajib retur!`
          : `Produk "${product.name}" jatuh RH!`,
        product,
        timestamp: new Date().toISOString(),
        urgent: true,
      });
    }
  });

  // Listen for WhatsApp notification sent
  socket.on('whatsapp-sent', (data) => {
    const { userId, notification } = data;

    io.to(`user:${userId}`).emit('notification', {
      type: 'whatsapp-sent',
      message: `Notifikasi WhatsApp dikirim untuk ${notification.productName}`,
      notification,
      timestamp: new Date().toISOString(),
    });
  });

  // Listen for system-wide notifications
  socket.on('broadcast', (data) => {
    const { message, type = 'info' } = data;

    io.emit('notification', {
      type: 'broadcast',
      message,
      notificationType: type,
      timestamp: new Date().toISOString(),
    });
  });

  // Send notification to specific user (called from server)
  socket.on('send-notification', (data) => {
    const { userId, notification } = data;
    io.to(`user:${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString(),
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);

    // Remove socket from all users
    for (const [userId, sockets] of clients.entries()) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        clients.delete(userId);
      }
    }
  });

  // Error handling
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

// Heartbeat to keep connections alive
setInterval(() => {
  io.emit('ping', { timestamp: new Date().toISOString() });
}, 30000);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing notification service...');
  io.close(() => {
    console.log('Notification service closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing notification service...');
  io.close(() => {
    console.log('Notification service closed');
    process.exit(0);
  });
});
