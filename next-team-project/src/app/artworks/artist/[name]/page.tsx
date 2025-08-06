'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

interface Artist {
  artist_name: string;
  artist_description: string;
  product_count: number;
  image_url?: string; // ahora puede venir desde la BD
}

export default function ArtistDetailPage() {
  const { name } = useParams();
  const router = useRouter();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        const res = await fetch(`/api/artists/${encodeURIComponent(name as string)}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setArtist(data);
      } catch (error) {
        console.error("Error fetching artist:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArtistData();
  }, [name]);

  if (loading) return <p>Loading artist data...</p>;
  if (!artist) return <p>No artist found</p>;

  return (
    <div className="p-6 flex flex-col items-start gap-4">
      <Image
        src={artist.image_url || '/artist-img.jpg'} 
        alt={artist.artist_name}
        width={150}
        height={150}
        className="rounded-full object-cover"
      />
      <h1 className="text-2xl font-bold">{artist.artist_name}</h1>
      <p className="text-gray-600">{artist.artist_description}</p>
      <p className="text-gray-500">{artist.product_count} products</p>
      <div className="mt-2">
        <button
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          onClick={() =>
            router.push(
              `/artworks?page=1&sort=desc&search=${encodeURIComponent(artist.artist_name)}&category=`
            )
          }
        >
          View Products
        </button>
      </div>
    </div>
  );
}