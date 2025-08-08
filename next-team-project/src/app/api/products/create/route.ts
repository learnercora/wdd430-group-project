// src/app/api/products/create/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      price,
      category,
      description,
      imageUrl,
      userEmail,
      artistName,
    } = body ?? {};

    if (!name || price === undefined || price === null || !category || !userEmail || !artistName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
    }

    // usuario
    const u = await sql`
      SELECT id, name, profile_image, description
      FROM users
      WHERE email = ${userEmail}
      LIMIT 1
    `;
    if (!u.rows.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const user = u.rows[0] as {
      id: number;
      name: string;
      profile_image: string | null;
      description: string | null;
    };

    //artist por user id
    await sql`
      INSERT INTO artists (user_id, name, image_url, artist_description)
      VALUES (${user.id}, ${artistName}, ${user.profile_image || null}, ${user.description || null})
      ON CONFLICT (user_id) DO UPDATE
      SET
        name = EXCLUDED.name,  -- si cambiaste el nombre que guardas como artista
        image_url = COALESCE(artists.image_url, EXCLUDED.image_url),
        artist_description = COALESCE(artists.artist_description, EXCLUDED.artist_description)
    `;

    // 3) get artist_id
    const a = await sql`SELECT id FROM artists WHERE user_id = ${user.id} LIMIT 1`;
    const artistId = a.rows[0].id as number;

    // 4) create product
    const inserted = await sql`
      INSERT INTO products (name, price, category, description, image_url, artist_id, artist_name)
      VALUES (${name}, ${numericPrice}, ${category}, ${description || null}, ${imageUrl || null}, ${artistId}, ${user.name})
      RETURNING *
    `;

    return NextResponse.json({ success: true, product: inserted.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Error creating product' }, { status: 500 });
  }
}