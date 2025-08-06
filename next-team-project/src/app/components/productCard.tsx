import Link from 'next/link';
import Image from 'next/image';

import { productCardWrapper, productCardContent } from './styles/productCardStyles'; 

type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  description: string;
  artist_name: string;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className={productCardWrapper}>
      <Link href={`/artworks/${product.id}`}>
        <Image
          src={product.image_url?.startsWith('http') ? product.image_url : '/default-img.jpg'}
          alt={product.name}
          width={300}
          height={200}
          className="object-cover w-full h-[150px]"
          style={{ objectFit: 'cover', width: '100%', height: '160px' }}
        />
      </Link>
      
      <div className={productCardContent}>
        <Link href={`/artworks/${product.id}`}>
          <h2 className="text-sm font-semibold leading-snug">{product.name}</h2>
        </Link>
        <p className="text-xs text-gray-500">{product.artist_name}</p>
        <p className="text-gray-600">${Number(product.price).toFixed(2)}</p>
        <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
      </div>
    </div>
  );
}