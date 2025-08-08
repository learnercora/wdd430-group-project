import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();
    const newName = String(name || '').trim();
    if (!email || !newName) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const u = await sql<{
      id: number;
      old_name: string | null;
      profile_image: string | null;
      description: string | null;
    }>`
      SELECT id, name AS old_name, profile_image, description
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `;
    if (u.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userId = u.rows[0].id;
    const oldName = (u.rows[0].old_name || '').trim();
    const profileImage = u.rows[0].profile_image;
    const artistDesc = u.rows[0].description;

    await sql`UPDATE users SET name = ${newName} WHERE id = ${userId}`;

    const updByUser = await sql`
      UPDATE artists
      SET name = ${newName}
      WHERE user_id = ${userId}
      RETURNING id
    `;

    let artistId: number | null = updByUser.rows[0]?.id ?? null;

    if (!artistId) {
      const claimOld = await sql`
        UPDATE artists
        SET
          name = ${newName},
          user_id = ${userId},
          image_url = COALESCE(image_url, ${profileImage}),
          artist_description = COALESCE(artist_description, ${artistDesc})
        WHERE user_id IS NULL AND name = ${oldName}
        RETURNING id
      `;
      artistId = claimOld.rows[0]?.id ?? null;

      if (!artistId) {
        const ins = await sql`
          INSERT INTO artists (user_id, name, image_url, artist_description)
          VALUES (${userId}, ${newName}, ${profileImage}, ${artistDesc})
          RETURNING id
        `;
        artistId = ins.rows[0].id;
      }
    }

    await sql`DELETE FROM artists WHERE user_id IS NULL AND name = ${oldName}`;

    if (artistId) {
      await sql`
        UPDATE products
        SET artist_name = ${newName}
        WHERE artist_id = ${artistId} OR artist_name = ${oldName}
      `;
    } else {
      await sql`
        UPDATE products
        SET artist_name = ${newName}
        WHERE artist_name = ${oldName}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('update-name error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}