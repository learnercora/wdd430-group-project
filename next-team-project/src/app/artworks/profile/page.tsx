'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  const email = typeof window !== 'undefined' ? localStorage.getItem('email') : null;
  const name = typeof window !== 'undefined' ? localStorage.getItem('username') : null;

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);

    if (!loggedIn) {
      router.push('/login');
    } else if (email) {
      fetch(`/api/user/${encodeURIComponent(email)}`)
        .then(res => res.json())
        .then(data => {
          if (data.profile_image) setImageUrl(data.profile_image);
          if (data.name) setUserName(data.name);
          if (data.email) setUserEmail(data.email);
        })
        .catch(console.error);
    }
  }, [router, email]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !email || !name) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'profile_pics');

      const res = await fetch(`https://api.cloudinary.com/v1_1/dzubudaum/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!data.secure_url) throw new Error('Cloudinary upload failed');

      setImageUrl(data.secure_url);

      await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, profileImage: data.secure_url }),
      });
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  if (isLoggedIn === null) return <p>Checking...</p>;
  if (!isLoggedIn) return null;

  return (
    <div className="p-6 flex flex-col items-center text-center">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      
      {/* Foto de perfil */}
      <div className="mb-4">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Profile"
            width={150}
            height={150}
            className="rounded-full border-4 border-gray-300 object-cover"
          />
        ) : (
          <div className="w-[150px] h-[150px] rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}
      </div>

      {/* Nombre y correo */}
      <p className="text-lg font-semibold">{userName || name}</p>
      <p className="text-gray-500">{userEmail || email}</p>

      {/* Subir imagen */}
      <div className="mt-4">
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </div>
    </div>
  );
}