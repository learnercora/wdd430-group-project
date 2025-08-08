import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(
  _req: Request,
  { params }: { params: { name: string } }
) {
  const name = decodeURIComponent(params.name);

  try {
    const r = await sql<{
      artist_name: string;
      artist_description: string | null;
      image_url: string | null;
      artist_id: number;
      product_count: string; 
    }>`
      SELECT
        a.name AS artist_name,
        COALESCE(u.description, a.artist_description) AS artist_description,
        COALESCE(u.profile_image, a.image_url)       AS image_url,
        a.id                                         AS artist_id,
        (SELECT COUNT(*) FROM products p WHERE p.artist_id = a.id) AS product_count
      FROM artists a
      LEFT JOIN users u
        ON u.id = a.user_id
        OR LOWER(u.name) = LOWER(a.name)
      WHERE LOWER(a.name) = LOWER(${name})
      LIMIT 1;
    `;

    if (r.rows.length === 0) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    const row = r.rows[0];
    return NextResponse.json({
      artist_name: row.artist_name,
      artist_description: row.artist_description ?? '',
      image_url: row.image_url,
      product_count: Number(row.product_count),
    });
  } catch (e) {
    console.error('artist detail error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}