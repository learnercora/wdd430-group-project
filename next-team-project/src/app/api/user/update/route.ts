import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(req: Request) {
  try {
    const { email, name, profileImage } = await req.json();

    if (!email || !name || !profileImage) {
      return NextResponse.json({ error: 'Missing fields', received: { email, name, profileImage } }, { status: 400 });
    }

    // actualizar en users
    await sql`
      UPDATE users
      SET profile_image = ${profileImage}
      WHERE email = ${email};
    `;

    // insertar en artists si no existe
    await sql`
      INSERT INTO artists (artist_name, artist_image)
      SELECT ${name}, ${profileImage}
      WHERE NOT EXISTS (
        SELECT 1 FROM artists WHERE artist_name = ${name}
      );
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Error updating profile', details: String(error) }, { status: 500 });
  }
}