import cron from 'node-cron';

const AUTO_CHECK_URL = 'http://localhost:3000/api/auto-check';
const CRON_SECRET = process.env.CRON_SECRET || 'auto-check-secret';
const CHECK_INTERVAL = process.env.CHECK_INTERVAL || '0 * * * *'; // Every hour by default

console.log('🕐 Cron Service started');
console.log(`📋 Auto-check URL: ${AUTO_CHECK_URL}`);
console.log(`⏰ Check interval: ${CHECK_INTERVAL} (Every hour)`);
console.log(`🔑 Secret: ${CRON_SECRET}`);

// Function to run auto-check
async function runAutoCheck() {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] 🔄 Starting auto-check...`);

  try {
    const response = await fetch(AUTO_CHECK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ secret: CRON_SECRET }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Auto-check completed successfully`);
      console.log(`   - Status updated: ${data.results.statusUpdated}`);
      console.log(`   - Warning notifications: ${data.results.warningSent}`);
      console.log(`   - Expired notifications: ${data.results.expiredSent}`);
      console.log(`   - Total notifications: ${data.results.totalNotifications}`);

      if (data.errors && data.errors.length > 0) {
        console.log(`   - Errors: ${data.errors.length}`);
        data.errors.forEach((err: string, i: number) => {
          console.log(`     ${i + 1}. ${err}`);
        });
      }
    } else {
      const error = await response.json();
      console.error(`❌ Auto-check failed: ${error.error}`);
    }
  } catch (error) {
    console.error(`❌ Auto-check error:`, error);
  }

  console.log(`[${new Date().toISOString()}] ✨ Auto-check cycle complete\n`);
}

// Schedule cron job
const task = cron.schedule(CHECK_INTERVAL, runAutoCheck, {
  scheduled: true,
  timezone: 'Asia/Jakarta',
});

// Run immediately on start
runAutoCheck();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, stopping cron service...');
  task.stop();
  console.log('Cron service stopped');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, stopping cron service...');
  task.stop();
  console.log('Cron service stopped');
  process.exit(0);
});
