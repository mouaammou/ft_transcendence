'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getData } from '@/services/apiCalls';
import { useAuth } from '@/components/auth/loginContext';

const AuthCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const { setIsAuth } = useAuth();

  useEffect(() => {
    const fetchTokens = async () => {
      await getData(`auth/callback/42?code=${code}`)
        .then(response => {
          if (response.status == 200 || response.status == 201) {
            setIsAuth(true);
            router.push('/profile');
          }
        })
        .catch(error => {
          router.push('/500');
        });
    };
    fetchTokens();
  }, []);

  return <div>Loading...callback 42</div>;
};

export default AuthCallback;
