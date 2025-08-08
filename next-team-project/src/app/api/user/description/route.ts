import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(req: Request) {
  try {
    const { email, description } = await req.json();
    if (!email || typeof description !== 'string') {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const r = await sql`
      UPDATE users
      SET description = ${description}
      WHERE email = ${email}
      RETURNING description;
    `;
    if (r.rowCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ description: r.rows[0].description });
  } catch {
    return NextResponse.json({ error: 'Error saving bio' }, { status: 500 });
  }
}