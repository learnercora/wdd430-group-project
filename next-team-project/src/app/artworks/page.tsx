'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ArtworkPage() {
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="p-6">
      <h1 className="text-2xl">Jorge! Welcome to the Artwork Page</h1>
    </div>
  );
}
