import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    let whereClause = '';
    const params: string[] = [];

    if (search) {
      whereClause = `WHERE a.name ILIKE $1`;
      params.push(`%${search}%`);
    }

    const query = `
      SELECT a.name AS artist_name, a.artist_description, COUNT(p.id) as product_count
      FROM artists a
      LEFT JOIN products p ON p.artist_name = a.name
      ${whereClause}
      GROUP BY a.name, a.artist_description
      ORDER BY a.name ASC
    `;

    const result = await sql.query(query, params);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching artists' }, { status: 500 });
  }
}