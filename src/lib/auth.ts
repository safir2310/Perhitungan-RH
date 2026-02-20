import { cookies } from 'next/headers';

// Simple password hashing using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'rh_system_salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify password
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hashedPassword;
}

// Validate WhatsApp number
function validateWhatsApp(whatsapp: string): boolean {
  // Remove all non-digit characters
  const cleaned = whatsapp.replace(/\D/g, '');
  // Check if it's a valid Indonesian number (starts with 628 or 08, 10-13 digits)
  const pattern = /^(62|0)8[1-9][0-9]{6,10}$/;
  return pattern.test(cleaned);
}

// Format WhatsApp number to standard format (62...)
function formatWhatsApp(whatsapp: string): string {
  let cleaned = whatsapp.replace(/\D/g, '');

  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }

  return cleaned;
}

// Session management
const SESSION_COOKIE_NAME = 'rh_session';

interface SessionData {
  userId: string;
  username: string;
  role: string;
  whatsapp: string;
}

async function createSession(data: SessionData): Promise<void> {
  const cookieStore = await cookies();
  const sessionData = JSON.stringify(data);
  const encoded = Buffer.from(sessionData).toString('base64');

  cookieStore.set(SESSION_COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    return null;
  }

  try {
    const decoded = Buffer.from(sessionCookie.value, 'base64').toString('utf-8');
    return JSON.parse(decoded) as SessionData;
  } catch {
    return null;
  }
}

async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export {
  hashPassword,
  verifyPassword,
  validateWhatsApp,
  formatWhatsApp,
  createSession,
  getSession,
  clearSession,
};
