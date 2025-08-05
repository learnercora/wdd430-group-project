import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get('page') || '1');
  const sort = searchParams.get('sort') || 'asc';  //filter
  const search = searchParams.get('search') || ''; //search

  const limit = 15;
  const offset = (page - 1) * limit;

  let whereClause = '';
  let params: (string | number)[] = [];
  let countParams: (string | number)[] = [];

  if (search) {
    whereClause = `WHERE name ILIKE $1 OR artist_name ILIKE $1`;
    params = [`%${search}%`, limit, offset];
    countParams = [`%${search}%`];
  } else {
    params = [limit, offset];
  }

  const productsQuery = `
    SELECT *
    FROM products
    ${whereClause}
    ORDER BY price ${sort.toUpperCase()}
    LIMIT ${search ? '$2' : '$1'} OFFSET ${search ? '$3' : '$2'}
  `;

  const products = await sql.query(productsQuery, params);

  const countQuery = `
    SELECT COUNT(*)
    FROM products
    ${whereClause}
  `;

  const total = await sql.query(countQuery, countParams);
  const totalCount = parseInt(total.rows[0].count);

  return NextResponse.json({
    products: products.rows,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  });
}