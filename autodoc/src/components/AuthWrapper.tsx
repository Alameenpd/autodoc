import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface AuthWrapperProps {
  children: ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return <>{children}</>;
}