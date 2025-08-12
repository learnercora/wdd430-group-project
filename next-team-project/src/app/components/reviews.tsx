'use client';

import { useEffect, useMemo, useState } from 'react';

type Review = {
  id: number;
  product_id: number;
  user_email: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

function Star({ filled, onClick }: { filled: boolean; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-xl leading-none" aria-label="star" title="rate">
      {filled ? '★' : '☆'}
    </button>
  );
}

export default function Reviews({ productId }: { productId: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true';
  const userEmail = typeof window !== 'undefined' ? localStorage.getItem('email') : null;

  const average = useMemo(() => {
    if (!reviews.length) return 0;
    return Math.round((reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) * 10) / 10;
  }, [reviews]);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`/api/products/${productId}/reviews`);
      const d = await r.json();
      setReviews(d.reviews || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function submitReview() {
    if (!isLoggedIn || !userEmail || !rating || !comment.trim()) return;
    setSubmitting(true);
    try {
      const r = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: comment.trim(), userEmail }),
      });
      if (r.ok) {
        setComment('');
        setRating(0);
        await load();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteReview(id: number) {
    if (!isLoggedIn || !userEmail) return;
    const ok = window.confirm('Delete this review?');
    if (!ok) return;
    const res = await fetch(
      `/api/products/${productId}/reviews/${id}?email=${encodeURIComponent(userEmail)}`,
      { method: 'DELETE' }
    );
    if (res.ok) {
      setReviews((cur) => cur.filter((r) => r.id !== id));
    }
  }

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-end gap-3">
        <h2 className="text-xl font-semibold">Reviews</h2>
        <span className="text-sm text-gray-600">
          {reviews.length} review{reviews.length !== 1 ? 's' : ''} {reviews.length > 0 && `• Avg ${average} ★`}
        </span>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500">No reviews yet.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((rev) => (
            <li key={rev.id} className="border rounded p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{rev.user_name}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(rev.created_at).toLocaleString()} • {rev.user_email}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-yellow-500 whitespace-nowrap">
                    {'★'.repeat(rev.rating)}
                    <span className="text-gray-300">{'☆'.repeat(5 - rev.rating)}</span>
                  </div>
                  {isLoggedIn && userEmail === rev.user_email && (
                    <button
                      onClick={() => handleDeleteReview(rev.id)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p className="text-gray-700 mt-2 whitespace-pre-wrap">{rev.comment}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <h3 className="font-medium mb-2">Leave a Review</h3>
        {!isLoggedIn ? (
          <p className="text-sm text-gray-600">You must be logged in to leave a comment and rating.</p>
        ) : (
          <>
            <div className="flex items-center gap-1 mb-3" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} onMouseEnter={() => setHover(i)} onClick={() => setRating(i)}>
                  <Star filled={(hover || rating) >= i} />
                </span>
              ))}
              <span className="ml-2 text-sm text-gray-600">{rating ? `${rating}/5` : 'Select a rating'}</span>
            </div>
            <textarea
              className="w-full border rounded p-3 mb-3"
              rows={3}
              placeholder="Write your comment…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button
              onClick={submitReview}
              disabled={submitting || !rating || !comment.trim()}
              className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </>
        )}
      </div>
    </section>
  );
}