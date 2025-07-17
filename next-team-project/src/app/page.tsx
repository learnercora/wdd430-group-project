import styles from './ui/page.module.css';

export default function Home() {
  return (
    <>
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.textContainer}>
            <h1 className={styles.title}>Crafted with Care</h1>
            <p className={styles.subtitle}>Support artisanal products with a heart.</p>
            <button className={styles.button}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 
                  0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM7.82 
                  14h8.96c.75 0 1.41-.41 1.75-1.03l3.58-6.49a.998.998 0 
                  0 0-.88-1.48H5.21L4.27 2H1v2h2l3.6 
                  7.59-1.35 2.44C4.52 14.37 5.48 16 7 
                  16h12v-2H7.82z"/>
              </svg>
              <span>Shop Products</span>
            </button>
          </div>
        </section>
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