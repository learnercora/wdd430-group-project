import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    const result = await sql`
      SELECT DISTINCT category
      FROM products
      WHERE category IS NOT NULL
      ORDER BY category ASC
    `;
    return NextResponse.json(result.rows.map(r => r.category));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Error fetching categories' }, { status: 500 });
  }
}