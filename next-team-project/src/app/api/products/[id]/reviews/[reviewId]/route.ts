import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function DELETE(
    req: Request,
    { params }: { params: { id: string; reviewId: string } }
  ) {
    try {
      const reviewId = Number(params.reviewId);
      const { searchParams } = new URL(req.url);
      const email = searchParams.get('email');
  
      if (!email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const result = await sql`
        SELECT 1 FROM reviews WHERE id = ${reviewId} AND user_email = ${email}
      `;
  
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Not found or no permission' }, { status: 403 });
      }
  
      await sql`DELETE FROM reviews WHERE id = ${reviewId}`;
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
  }