'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      router.replace('/dashboard/events');
    } else {
      router.replace('/login');
    }
  }, [router]);
  return null;
}
