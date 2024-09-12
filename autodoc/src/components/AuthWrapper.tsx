'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface AuthWrapperProps {
  children: ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'authenticated') {
    return <>{children}</>;
  }

  return null;
}