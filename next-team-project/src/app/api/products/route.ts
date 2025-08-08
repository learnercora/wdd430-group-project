import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 15;
  const offset = (page - 1) * limit;

  const sort = (searchParams.get('sort') || 'desc').toUpperCase();
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  let whereClause = '';
  const params: (string | number)[] = [];

  if (search) {
    params.push(`%${search}%`);
    // same placeholder used for name and artist_name
    whereClause += `WHERE name ILIKE $${params.length} OR artist_name ILIKE $${params.length}`;
  }

  if (category) {
    params.push(category);
    whereClause += `${whereClause ? ' AND' : 'WHERE'} category = $${params.length}`;
  }

  const productsQuery = `
    SELECT * FROM products
    ${whereClause}
    ORDER BY price ${sort === 'ASC' ? 'ASC' : 'DESC'}
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

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      price,
      description = '',
      category,
      image_url = '',
      email,
      userName, 
    } = body || {};

    if (!name || typeof price === 'undefined' || !category || !email) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 });
    }

    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json({ error: 'invalid price' }, { status: 400 });
    }

    //  validar categoria en bd
    const cat = await sql`
      SELECT 1 FROM products WHERE category = ${category} LIMIT 1
    `;
    if (cat.rowCount === 0) {
      return NextResponse.json({ error: 'category not allowed' }, { status: 400 });
    }

    const userRow = await sql`
      INSERT INTO users (email, name)
      VALUES (${email}, ${userName || email})
      ON CONFLICT (email) DO UPDATE
      SET name = COALESCE(EXCLUDED.name, users.name)
      RETURNING id, name, profile_image
    `;
    const resolvedUserName: string = userRow.rows[0]?.name;

    await sql`
      INSERT INTO artists (name, image_url)
      VALUES (${resolvedUserName}, ${userRow.rows[0]?.profile_image || null})
      ON CONFLICT (name) DO UPDATE
      SET image_url = COALESCE(artists.image_url, EXCLUDED.image_url)
    `;

    const ins = await sql`
      INSERT INTO products (name, price, description, category, image_url, artist_name)
      VALUES (${name}, ${priceNum}, ${description}, ${category}, ${image_url}, ${resolvedUserName})
      RETURNING *
    `;

    return NextResponse.json({ product: ins.rows[0] }, { status: 201 });
  } catch (err) {
    console.error('products POST error:', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}