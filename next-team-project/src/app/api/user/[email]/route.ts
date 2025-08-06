// src/app/api/user/[email]/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(
  req: Request,
  { params }: { params: { email: string } }
) {
  try {
    const email = decodeURIComponent(params.email);

    const result = await sql`
      SELECT email, name, profile_image
      FROM users
      WHERE email = ${email}
      LIMIT 1;
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching user' }, { status: 500 });
  }
}