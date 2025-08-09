import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = Number(params.id);
    if (!Number.isFinite(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const result = await sql`
      SELECT * FROM products WHERE id = ${productId} LIMIT 1
    `;
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Error fetching product' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = Number(params.id);
    if (!Number.isFinite(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const { name, price, description, category, image_url, email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }
    if (!name || typeof price === 'undefined') {
      return NextResponse.json({ error: 'Missing name or price' }, { status: 400 });
    }

    const userRes = await sql`
      SELECT name FROM users WHERE email = ${email} LIMIT 1
    `;
    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userName = userRes.rows[0].name as string;

    if (category) {
      const catRes = await sql`
        SELECT 1 FROM products WHERE category = ${category} LIMIT 1
      `;
      if (catRes.rows.length === 0) {
        return NextResponse.json({ error: 'Category not allowed' }, { status: 400 });
      }
    }

    const upd = await sql`
      UPDATE products
      SET
        name = ${name},
        price = ${Number(price)},
        description = ${description || null},
        category = ${category || null},
        image_url = ${image_url || null},
        artist_name = ${userName}
      WHERE id = ${productId}
      RETURNING *
    `;

    if (upd.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product: upd.rows[0] });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Error updating product' }, { status: 500 });
  }
}


export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = Number(params.id);
    if (!Number.isFinite(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const check = await sql`
      SELECT id FROM products WHERE id = ${productId} LIMIT 1
    `;
    if (check.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await sql`
      DELETE FROM products WHERE id = ${productId}
    `;

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Error deleting product' }, { status: 500 });
  }
}
