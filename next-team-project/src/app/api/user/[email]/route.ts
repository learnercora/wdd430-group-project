import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(
  _req: Request,
  { params }: { params: { email: string } }
) {
  try {
    const email = decodeURIComponent(params.email);
    const r = await sql`
      SELECT email, name, profile_image, description
      FROM users
      WHERE email = ${email}
      LIMIT 1;
    `;
    if (r.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(r.rows[0]);
  } catch {
    return NextResponse.json({ error: 'Error fetching user' }, { status: 500 });
  }
}