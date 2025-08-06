import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 15;
  const offset = (page - 1) * limit;

  const sort = searchParams.get('sort') || 'desc';
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  let whereClause = '';
  const params: (string | number)[] = [];

  if (search) {
    params.push(`%${search}%`);
    whereClause += `WHERE name ILIKE $${params.length} OR artist_name ILIKE $${params.length}`;
  }

  if (category) {
    params.push(category);
    whereClause += `${whereClause ? ' AND' : 'WHERE'} category = $${params.length}`;
  }

  const productsQuery = `
    SELECT * FROM products
    ${whereClause}
    ORDER BY price ${sort.toUpperCase()}
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  params.push(limit, offset);

  const products = await sql.query(productsQuery, params);

  const totalQuery = `
    SELECT COUNT(*) FROM products
    ${whereClause}
  `;
  const total = await sql.query(totalQuery, params.slice(0, params.length - 2));

  return NextResponse.json({
    products: products.rows,
    totalPages: Math.ceil(parseInt(total.rows[0].count) / limit),
    currentPage: page,
  });
}


