// src/app/api/artists/[name]/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(
  req: Request,
  { params }: { params: { name: string } }
) {
  try {
    const name = decodeURIComponent(params.name);

    const result = await sql`
      SELECT a.name AS artist_name,
             a.image_url,
             a.artist_description,
             COUNT(p.id) AS product_count
      FROM artists a
      LEFT JOIN products p ON p.artist_name = a.name
      WHERE a.name = ${name}
      GROUP BY a.name, a.image_url, a.artist_description
      LIMIT 1;
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching artist' }, { status: 500 });
  }
}