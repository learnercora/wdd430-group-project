export default function Home() {
  return (
    <>
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-4">Welcome to Our Artisan Marketplace</h1>
        <p className="text-lg text-gray-600 mb-6 text-center max-w-xl">
          Connect buyers and sellers of handmade products. Discover, rate, and purchase unique creations.
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          Browse Products
        </button>
      </main>
      <footer style={{
        backgroundColor: "#f5f5f5",
        padding: "1rem",
        textAlign: "center",
        fontSize: "1.1rem",
        color: "#000000ff",
        marginTop: "2rem"
      }}>
  <p>&copy; 2025 Artisan Marketplace. All rights reserved.</p>
  <p>
    <a href="/about" style={{ color: "#000000ff", textDecoration: "none", margin: "0 0.5rem" }}>About Us</a> |
    <a href="/contact" style={{ color: "#000000ff", textDecoration: "none", margin: "0 0.5rem" }}>Contact</a>
  </p>
</footer>
    </>
  );
}