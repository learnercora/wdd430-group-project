'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ProfilePage() {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // bio 
  const [bio, setBio] = useState('');        
  const [bioInput, setBioInput] = useState(''); 
  const [savingBio, setSavingBio] = useState(false);

  const email = typeof window !== 'undefined' ? localStorage.getItem('email') : null;
  const name = typeof window !== 'undefined' ? localStorage.getItem('username') : null;

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
    if (!loggedIn) {
      router.push('/login');
      return;
    }
    if (email) {
      fetch(`/api/user/${encodeURIComponent(email)}`)
        .then(r => r.ok ? r.json() : null)
        .then((d) => {
          if (d.profile_image) setImageUrl(d.profile_image);
          if (d.name) setUserName(d.name);
          if (d.email) setUserEmail(d.email);
          setBio(typeof d.description === 'string' ? d.description : '');
          setBioInput('');
        })
        .catch(() => {});
    }
  }, [router, email]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !email || !name) return;
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', 'profile_pics');
      const up = await fetch(`https://api.cloudinary.com/v1_1/dzubudaum/image/upload`, {
        method: 'POST',
        body: fd,
      });
      const data = await up.json();
      if (!data.secure_url) throw new Error('cloudinary upload failed');
      setImageUrl(data.secure_url);
      await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, profileImage: data.secure_url }),
      });
    } catch {
    }
  };

  // save bio
  const handleSaveBio = async () => {
    if (!email || !bioInput.trim()) return;
    try {
      setSavingBio(true);
      const res = await fetch('/api/user/description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, description: bioInput.trim() }),
      });
      if (!res.ok) throw new Error();
      setBio(bioInput.trim());  
      setBioInput('');          
    } catch {
    } finally {
      setSavingBio(false);
    }
  };

  if (isLoggedIn === null) return <p>checking…</p>;
  if (!isLoggedIn) return null;

  return (
    <div className="p-6 flex flex-col items-center text-center">
      <h1 className="text-2xl font-bold mb-5">My profile</h1>

      {/* circular */}
      <div className="mb-4 rounded-full overflow-hidden border-4 border-gray-300 w-[150px] h-[150px]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="profile"
            width={150}
            height={150}
            className="w-[150px] h-[150px] object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
            no image
          </div>
        )}
      </div>

      <p className="text-lg font-semibold">{userName || name}</p>
      <p className="text-gray-500">{userEmail || email}</p>

      <div className="mt-4">
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </div>

      {/* about me */}
      <div className="w-full max-w-xl mt-8">
        <p className="text-sm text-gray-500 mb-2">About Me</p>

        {/* shown bio */}
        <div className="border rounded px-4 py-3 min-h-[48px] whitespace-pre-wrap mb-3">
          {bio || '—'}
        </div>

        {/* editor */}
        <textarea
          placeholder="Write your description..."
          className="w-full border rounded p-3 mb-3"
          rows={4}
          value={bioInput}
          onChange={(e) => setBioInput(e.target.value)}
        />
        <button
          onClick={handleSaveBio}
          disabled={savingBio || !bioInput.trim()}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {savingBio ? 'saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}