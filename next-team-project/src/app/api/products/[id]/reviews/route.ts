import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const productId = Number(params.id);
  if (!Number.isFinite(productId)) {
    return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
  }

  try {
    const r = await sql`
      SELECT id, product_id, user_email, user_name, rating, comment, created_at
      FROM reviews
      WHERE product_id = ${productId}
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ reviews: r.rows });
  } catch (e) {
    console.error('reviews GET error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const productId = Number(params.id);
  if (!Number.isFinite(productId)) {
    return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
  }

  try {
    const { rating, comment, userEmail } = await req.json();

    if (!userEmail || !rating || !comment?.trim()) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const rNum = Number(rating);
    if (!(rNum >= 1 && rNum <= 5)) {
      return NextResponse.json({ error: 'Rating must be 1–5' }, { status: 400 });
    }

    const u = await sql`SELECT name FROM users WHERE email = ${userEmail} LIMIT 1`;
    if (!u.rows.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userName = u.rows[0].name as string;

    const ins = await sql`
      INSERT INTO reviews (product_id, user_email, user_name, rating, comment)
      VALUES (${productId}, ${userEmail}, ${userName}, ${rNum}, ${comment.trim()})
      RETURNING id, product_id, user_email, user_name, rating, comment, created_at
    `;

    return NextResponse.json({ review: ins.rows[0] }, { status: 201 });
  } catch (e) {
    console.error('reviews POST error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

