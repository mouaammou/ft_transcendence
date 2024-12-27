'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getData } from '@/services/apiCalls';
import { useAuth } from '@/components/auth/loginContext';

const AuthCallback = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get('code');
    const { setIsAuth } = useAuth();
    const requestMade = useRef(false);

    const fetchTokens = async () => {
        if (requestMade.current) return;
        requestMade.current = true;

        try {
            let query = `code=${code}`;
            const response = await getData(`auth/callback/42?${query}`);
            
            if (response.status === 200 || response.status === 201) {
                if (response.data?.totp) {
                    router.push('/2fa');
                } else {
                    setIsAuth(true);
                    router.push('/profile');
                }
            }
        } catch (error) {
            router.push('/500');
        }
    };
    
    useEffect(() => {
        if (!code) return;
        fetchTokens();

        return () => {
            requestMade.current = false;
        };
    }, [code]);

    return <div>Loading...callback 42</div>;
};

export default AuthCallback;