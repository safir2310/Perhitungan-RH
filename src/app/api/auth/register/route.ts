import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, validateWhatsApp, formatWhatsApp, createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, whatsapp, password, role = 'staff' } = body;

    // Validate required fields
    if (!username || !whatsapp || !password) {
      return NextResponse.json(
        { error: 'Username, WhatsApp, dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Validate WhatsApp
    if (!validateWhatsApp(whatsapp)) {
      return NextResponse.json(
        { error: 'Nomor WhatsApp tidak valid' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await db.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username sudah digunakan' },
        { status: 409 }
      );
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await db.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: 'Email sudah digunakan' },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Format WhatsApp number
    const formattedWhatsapp = formatWhatsApp(whatsapp);

    // Create user
    const user = await db.user.create({
      data: {
        username,
        email: email || null,
        whatsapp: formattedWhatsapp,
        password: hashedPassword,
        role: role === 'admin' ? 'admin' : 'staff',
      },
      select: {
        id: true,
        username: true,
        email: true,
        whatsapp: true,
        role: true,
        createdAt: true,
      },
    });

    // Create session
    await createSession({
      userId: user.id,
      username: user.username,
      role: user.role,
      whatsapp: user.whatsapp,
    });

    return NextResponse.json({
      message: 'Pendaftaran berhasil',
      user,
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mendaftar' },
      { status: 500 }
    );
  }
}
