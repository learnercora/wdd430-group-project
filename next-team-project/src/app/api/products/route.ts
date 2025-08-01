import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 15;
    const offset = (page - 1) * limit;
  
    const products = await sql.query(`
      SELECT * FROM products
      ORDER BY id
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
  
    const total = await sql.query(`SELECT COUNT(*) FROM products`);
    const totalCount = parseInt(total.rows[0].count);
  
    return NextResponse.json({
      products: products.rows,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  }