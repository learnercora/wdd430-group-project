'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const router = useRouter();

  const email = typeof window !== 'undefined' ? localStorage.getItem('email') : null;
  const name = typeof window !== 'undefined' ? localStorage.getItem('username') : null;

  // obtener imagen de perfil al cargar
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);

    if (!loggedIn) {
      router.push('/login');
    } else if (email) {
      fetch(`/api/user/${encodeURIComponent(email)}`)
        .then(res => res.json())
        .then(data => {
          if (data.profile_image) {
            setImageUrl(data.profile_image);
          }
        })
        .catch(console.error);
    }
  }, [router, email]);

  // subir nueva imagen
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.error('No file selected');
      return;
    }
    if (!email || !name) {
      console.error('Missing email or name in localStorage');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'profile_pics'); // tu preset en Cloudinary

      // subir a cloudinary
      const res = await fetch(`https://api.cloudinary.com/v1_1/dzubudaum/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!data.secure_url) throw new Error('Cloudinary upload failed');

      setImageUrl(data.secure_url);

      // guardar en DB
      const resUpdate = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          profileImage: data.secure_url,
        }),
      });

      const updateData = await resUpdate.json();
      console.log('Update response:', updateData);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  if (isLoggedIn === null) return <p>Checking...</p>;
  if (!isLoggedIn) return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <p>Welcome! Here you can manage your products.</p>

      {/* input para subir archivo */}
      <div className="mt-4">
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </div>

      {/* mostrar imagen */}
      {imageUrl && (
        <div className="mt-4">
          <p className="mb-2">Uploaded Image:</p>
          <Image
            src={imageUrl}
            alt="Profile"
            width={150}
            height={150}
            className="rounded-full border"
          />
        </div>
      )}
    </div>
  );
}