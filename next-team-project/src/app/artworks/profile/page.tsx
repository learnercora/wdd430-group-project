'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type MyProduct = {
  id: number;
  name: string;
  price: number;
  description: string | null;
  category: string | null;
  image_url: string | null;
  artist_id: number;
};

export default function ProfilePage() {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [bioInput, setBioInput] = useState('');
  const [savingBio, setSavingBio] = useState(false);

  const [categories, setCategories] = useState<string[]>([]);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [productId, setProductId] = useState<number | null>(null);
  const [uploadingProductImage, setUploadingProductImage] = useState(false);

  const [myProducts, setMyProducts] = useState<MyProduct[]>([]);

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
        .then(d => {
          if (!d) return;
          if (d.profile_image) setImageUrl(d.profile_image);
          if (d.name) setUserName(d.name);
          if (d.email) setUserEmail(d.email);
          setBio(typeof d.description === 'string' ? d.description : '');
        })
        .catch(() => {});
      fetch(`/api/products/mine?email=${encodeURIComponent(email)}`)
        .then(r => r.json())
        .then(d => setMyProducts(d.products || []))
        .catch(() => {});
    }
    fetch('/api/products/categories')
      .then(r => r.json())
      .then(setCategories)
      .catch(() => {});
  }, [router, email]);

  const refreshMine = async () => {
    if (!email) return;
    const r = await fetch(`/api/products/mine?email=${encodeURIComponent(email)}`);
    const d = await r.json();
    setMyProducts(d.products || []);
  };

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
    } catch {}
  };

  const handleProductImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingProductImage(true);
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', 'profile_pics');
      const up = await fetch('https://api.cloudinary.com/v1_1/dzubudaum/image/upload', {
        method: 'POST',
        body: fd,
      });
      const data = await up.json();
      if (!data.secure_url) throw new Error('cloudinary upload failed');
      setProductImage(data.secure_url);
    } catch {
    } finally {
      setUploadingProductImage(false);
    }
  };

  const handleSaveBio = async () => {
    if (!email || !bioInput.trim()) return;
    try {
      setSavingBio(true);
      const res = await fetch('/api/user/description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, description: bioInput.trim() }),
      });
      if (!res.ok) throw new Error('');
      setBio(bioInput.trim());
      setBioInput('');
    } catch {
    } finally {
      setSavingBio(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!productName.trim() || !productPrice.trim() || !productCategory || !email || !name) return;
    if (uploadingProductImage) return;
    if (!productId && !productImage) return;

    const payload = {
      name: productName.trim(),
      price: parseFloat(productPrice),
      category: productCategory,
      description: productDescription.trim(),
      imageUrl: productImage,
      userEmail: email,
      artistName: name,
    };

    const isEdit = Boolean(productId);
    const url = isEdit ? `/api/products/${productId}/update` : '/api/products/create';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return;

    setProductName('');
    setProductPrice('');
    setProductCategory('');
    setProductDescription('');
    setProductImage(null);
    setProductId(null);

    await refreshMine();
  };

  if (isLoggedIn === null) return <p>checking…</p>;
  if (!isLoggedIn) return null;

  return (
    <div className="p-6 flex flex-col items-center text-center">
      <h1 className="text-2xl font-bold mb-5">My profile</h1>

      <div className="mb-4 rounded-full overflow-hidden border-4 border-gray-300 w-[150px] h-[150px]">
        {imageUrl ? (
          <Image src={imageUrl} alt="profile" width={150} height={150} className="w-[150px] h-[150px] object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">no image</div>
        )}
      </div>

      <p className="text-lg font-semibold">{userName || name}</p>
      <p className="text-gray-500">{userEmail || email}</p>

      <div className="mt-4">
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </div>

      <div className="w-full max-w-xl mt-8">
        <p className="text-sm text-gray-500 mb-2">About Me</p>
        <div className="border rounded px-4 py-3 min-h-[48px] whitespace-pre-wrap mb-3">{bio || '—'}</div>
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

      <div className="w-full max-w-xl mt-8 text-left">
        <h2 className="text-lg font-semibold mb-4">{productId ? 'Edit Product' : 'Create Product'}</h2>
        <input
          type="text"
          placeholder="Product name"
          className="w-full border rounded p-3 mb-3"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Price"
          className="w-full border rounded p-3 mb-3"
          value={productPrice}
          onChange={(e) => setProductPrice(e.target.value)}
        />
        <select
          className="w-full border rounded p-3 mb-3"
          value={productCategory}
          onChange={(e) => setProductCategory(e.target.value)}
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <textarea
          placeholder="Product description..."
          className="w-full border rounded p-3 mb-3"
          rows={3}
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
        />
        <input type="file" accept="image/*" onChange={handleProductImageChange} className="mb-3" />
        {productImage && (
          <div className="mb-3">
            <Image src={productImage} alt="product" width={150} height={150} className="object-cover rounded" />
          </div>
        )}
        <button
          onClick={handleSaveProduct}
          disabled={
            uploadingProductImage ||
            !productName.trim() ||
            !productPrice.trim() ||
            !productCategory ||
            (!productId && !productImage)
          }
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {uploadingProductImage ? 'Uploading image…' : productId ? 'Update Product' : 'Create Product'}
        </button>
      </div>

      <div className="w-full max-w-xl mt-10 text-left">
        <h3 className="text-lg font-semibold mb-3">My products</h3>
        {myProducts.length === 0 ? (
          <p className="text-gray-500">No products yet</p>
        ) : (
          <ul className="space-y-3">
            {myProducts.map((p) => (
              <li key={p.id} className="border rounded p-3 flex items-center gap-3">
                <Image
                  src={p.image_url || '/default-img.jpg'}
                  alt={p.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.name}</p>
                  <p className="text-sm text-gray-500">${Number(p.price).toFixed(2)}</p>
                </div>
                <button
                  className="px-3 py-1 rounded border hover:bg-gray-50"
                  onClick={() => {
                    setProductId(p.id);
                    setProductName(p.name);
                    setProductPrice(String(p.price));
                    setProductCategory(p.category || '');
                    setProductDescription(p.description || '');
                    setProductImage(p.image_url || null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}