'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Reviews from '../../components/reviews';


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

      <Reviews productId={Number(product.id)} />     
      </div>
  );
}