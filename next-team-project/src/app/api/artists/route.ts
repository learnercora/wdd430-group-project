// src/app/api/artists/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';

  try {
    const result = await sql`
      SELECT a.name AS artist_name,
             a.image_url,
             COUNT(p.id) AS product_count
      FROM artists a
      LEFT JOIN products p ON p.artist_name = a.name
      WHERE a.name ILIKE ${'%' + search + '%'}
      GROUP BY a.name, a.image_url
      ORDER BY a.name ASC;
    `;

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching artists' }, { status: 500 });
  }
}