'use client';

import NavLinks from '@/app/ui/artworks/nav-links';
import { PowerIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function SideNav() {
  const router = useRouter();

  const handleSignOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // prevent reload
    localStorage.removeItem('isLoggedIn'); // clear login flag
    localStorage.removeItem('username'); // clear username
    router.push('/artworks'); // go home
    window.location.reload(); // recargar la página
  };

  return (
    <div className="flex h-full flex-col px-3 py-2 md:px-2">
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md md:block"></div>
        <button
          onClick={handleSignOut}
          className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium transition-colors md:flex-none md:justify-start md:p-2 md:px-3 hover:bg-[var(--accent-hover)] text-[var(--accent)] hover:text-white"
        >
          <PowerIcon className="w-6" />
          <div className="hidden md:block">Sign Out</div>
        </button>
      </div>
    </div>
  );
}