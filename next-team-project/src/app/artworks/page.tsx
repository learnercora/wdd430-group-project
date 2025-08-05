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
  const initialSort = searchParams.get('sort') || 'asc';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [sort, setSort] = useState(initialSort);
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch(`/api/products?page=${page}&sort=${sort}&search=${search}`);
      const data = await res.json();
      setProducts(data.products);
      setTotalPages(data.totalPages);
    };
    fetchProducts();
  }, [page, sort, search]);

  const handlePageChange = (newPage: number) => {
    router.push(`?page=${newPage}&sort=${sort}&search=${search}`);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    router.push(`?page=1&sort=${newSort}&search=${search}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    router.push(`?page=1&sort=${sort}&search=${value}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Artisans Products</h1>

      {/* search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by product or artist..."
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black w-full sm:w-1/3"
        />

        {/* filter */}
        <div className="flex items-center gap-3">
          <span className="text-lg font-medium">Filters:</span>
          <button
            onClick={() => handleSortChange(sort === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 hover:shadow-md transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 4h18M6 8h12M9 12h6m-3 4h0"
              />
            </svg>
            Price: {sort === 'asc' ? 'Low to High' : 'High to Low'}
          </button>
        </div>
      </div>

      {/* products */}
      <div className="grid gap-6 sm:gap-8 md:gap-10 grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))]">          
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* pages */}
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