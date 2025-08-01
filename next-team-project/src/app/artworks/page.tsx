'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '../components/productCard';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  artist_name: string;
}

export default function ArtworkPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams.get('page') || '1');

  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch(`/api/products?page=${page}`);
      const data = await res.json();
      setProducts(data.products);
      setTotalPages(data.totalPages);
    };
    fetchProducts();
  }, [page]);

  const handlePageChange = (newPage: number) => {
    router.push(`?page=${newPage}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Artisans Products</h1>
      <div className="grid gap-6 sm:gap-8 md:gap-10 grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))]">          
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="flex justify-center mt-8 gap-2">
        {[...Array(totalPages)].map((_, i) => {
          const pageNum = i + 1;
          return (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-3 py-1 border rounded ${
                pageNum === page ? 'bg-black text-white' : 'bg-white'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>
    </div>
  );
}