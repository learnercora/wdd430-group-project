'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  artist_name: string;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <p className="p-6">Loading product...</p>;
  if (!product) return <p className="p-6">Product not found</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* imagen grande */}
      <div className="mb-6">
        <Image
        src={product.image_url?.startsWith('http') ? product.image_url : '/default-img.jpg'}
        alt={product.name}
        width={500}
        height={400}
        className="rounded-lg object-cover"
        />
      </div>

      {/* info del producto */}
      <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
      <p className="text-2xl font-bold">${Number(product.price).toFixed(2)}</p>
      <p className="mb-4 text-gray-700">{product.description}</p>
      <p className="mb-8 text-gray-500">
        By <span className="font-medium">{product.artist_name}</span>
      </p>

      {/* comentarios y rating */}
      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">Leave a Review</h2>
        <p className="mb-4 text-gray-500">
          You must be logged in to leave a comment and rating.
        </p>

        {/* estrellas vacías */}
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.911c.969 0 1.371 1.24.588 1.81l-3.977 2.888a1 1 0 00-.364 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.977-2.888a1 1 0 00-1.176 0l-3.977 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.982 10.1c-.783-.57-.38-1.81.588-1.81h4.911a1 1 0 00.95-.69l1.518-4.674z"
              />
            </svg>
          ))}
        </div>

        <textarea
          placeholder="Write your comment..."
          disabled
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 bg-gray-100"
        ></textarea>
        <button
          disabled
          className="px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed"
        >
          Submit Review
        </button>
      </div>
    </div>
  );
}