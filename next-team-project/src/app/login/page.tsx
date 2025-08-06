'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to login');
      return;
    }

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('email', data.user.email); 
    localStorage.setItem('username', data.user.name);

    router.push('/artworks');
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl mb-4">Login</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="bg-black text-white px-4 py-2 w-full">Login</button>

        <p className="mt-6 text-sm">
          {"Don't have an account?"}{" "}
          <span
            onClick={() => router.push('/sign-in')}
            className="ml-2 cursor-pointer text-blue-600 font-medium hover:text-orange-500 hover:underline transition-all duration-200"
          >
            Create one
          </span>
        </p>
      </form>
    </div>
  );
}