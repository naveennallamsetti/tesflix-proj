'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';
import ShoppingSidebar from './ShoppingSidebar';
import TodoSidebar from './TodoSidebar';

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTodoOpen, setIsTodoOpen] = useState(false);

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <div className={styles.leftSection}>
            <Link href="/" className={styles.logo}>
              TESFLIX
            </Link>
            <div className={styles.navLinks}>
              <Link href="/" className={styles.link}>Home</Link>
              <Link href="/series" className={styles.link}>Series</Link>
              <Link href="/movies" className={styles.link}>Movies</Link>
              <button 
                className={styles.navButton} 
                onClick={() => setIsTodoOpen(true)}
              >
                My List
              </button>
            </div>
          </div>
          <div className={styles.links}>
            <button 
              className={styles.shopBtn} 
              onClick={() => setIsSidebarOpen(true)}
            >
              Shop Merch
            </button>
            <Link href="/upload" className={styles.uploadBtn}>Upload Video</Link>
          </div>
        </div>
      </nav>

      <ShoppingSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      <TodoSidebar 
        isOpen={isTodoOpen} 
        onClose={() => setIsTodoOpen(false)} 
      />
    </>
  );
}
