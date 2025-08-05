import Image from 'next/image';

export default function ArtistCard({ name, productCount }: { name: string; productCount: number }) {
  return (
    <div className="flex items-center p-4 border rounded-lg shadow-sm bg-white">
      <Image
        src="/artist-img.jpg"
        alt={name}
        width={50}
        height={50}
        className="rounded-full object-cover"
      />
      <div className="ml-4">
        <h3 className="font-semibold">{name}</h3>
        <p className="text-sm text-gray-500">{productCount} products</p>
      </div>
    </div>
  );
}