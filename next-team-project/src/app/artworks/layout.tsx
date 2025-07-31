import SideNav from '@/app/ui/artworks/sidenav';

// export default function Layout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
//       <aside className="w-56 md:w-56 bg-white shadow-md p-1">
//         <SideNav />
//       </aside>
//       <main className="flex-1 p-6">{children}</main>
//     </div>
//   );
// }

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-56 bg-white shadow-md p-1">
        <SideNav />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}