import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  try {
    const u = await sql`SELECT id, name FROM users WHERE email = ${email} LIMIT 1`;
    if (!u.rows.length) return NextResponse.json({ products: [] });

    const userName = u.rows[0].name as string;

    const a = await sql`SELECT id FROM artists WHERE name = ${userName} LIMIT 1`;
    if (!a.rows.length) return NextResponse.json({ products: [] });

    const artistId = a.rows[0].id as number;

    const p = await sql`
      SELECT id, name, description, price, image_url, category, artist_id
      FROM products
      WHERE artist_id = ${artistId}
      ORDER BY id DESC
    `;

    return NextResponse.json({ products: p.rows });
  } catch (e) {
    console.error('mine error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}