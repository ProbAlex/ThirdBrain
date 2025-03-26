'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the chat page after a short delay
    const redirectTimer = setTimeout(() => {
      router.push('/chat');
    }, 500);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <main className={styles.main}>
      <div className={styles.center}>
        <div className={styles.logo}>
          <span className={styles.emoji}>🧠</span>
          <h1 className={styles.title}>3rd Brain</h1>
        </div>
        <p className={styles.description}>Loading your AI chat experience...</p>
      </div>
    </main>
  );
}
