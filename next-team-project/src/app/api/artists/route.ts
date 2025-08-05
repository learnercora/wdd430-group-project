import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';

  let whereClause = '';
  const params: (string | number)[] = [];

  if (search) {
    whereClause = `WHERE artist_name ILIKE $1`;
    params.push(`%${search}%`);
  }

  const query = `
    SELECT artist_name, COUNT(*) as product_count
    FROM products
    ${whereClause}
    GROUP BY artist_name
    ORDER BY artist_name ASC
  `;

  const result = await sql.query(query, params);

  return NextResponse.json(result.rows);
}