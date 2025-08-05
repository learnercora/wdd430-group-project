'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Artist {
  artist_name: string;
  product_count: number;
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchArtists = async () => {
      const res = await fetch(`/api/artists?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setArtists(data);
    };
    fetchArtists();
  }, [search]);

  const handleArtistClick = (name: string) => {
    router.push(`/artworks?page=1&sort=desc&search=${encodeURIComponent(name)}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Artists</h1>

      {/* search */}
      <input
        type="text"
        placeholder="Search artist..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 mb-6 w-full sm:w-1/2"
      />

      {/* artists list */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {artists.map((artist, index) => (
          <div
            key={index}
            onClick={() => handleArtistClick(artist.artist_name)}
            className="flex items-center px-6 py-4 hover:bg-gray-100 cursor-pointer border-b"
          >
            {/* artists img */}
            <Image
              src="/artist-img.jpg"
              alt={artist.artist_name}
              width={40}
              height={40}
              className="rounded-full object-cover mr-4"
            />

            {/* artists name and products number */}
            <div>
              <p className="font-semibold">{artist.artist_name}</p>
              <p className="text-gray-500 text-sm">{artist.product_count} products</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}