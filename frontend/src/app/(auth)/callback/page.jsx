'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getData } from '@/services/apiCalls';
import { useAuth } from '@/components/auth/loginContext';
import { toast } from 'react-hot-toast';

const AuthCallback = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get('code');
    const { setIsAuth } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const requestMade = useRef(false);

    useEffect(() => {
        const controller = new AbortController();

        const fetchTokens = async () => {
            if (!code || requestMade.current) {
                return;
            }

            requestMade.current = true;
            setIsLoading(true);

            try {
                const query = `code=${encodeURIComponent(code)}`;
                const response = await getData('auth/callback/42?' + query);

                if (response?.status === 200 || response?.status === 201) {
                    if (response.data?.totp) {
                        router.replace('/2fa');
                    } else {
                        setIsAuth(true);
                        router.replace('/profile');
                    }
                } else {
                    throw new Error(response?.data?.Error || 'Authentication failed');
                }
            } catch (error) {
                router.replace('/login');
            } finally {
                setIsLoading(false);
            }
        };

        if (!code) {
            router.replace('/login');
            return;
        }

        fetchTokens();

        return () => {
            controller.abort();
            requestMade.current = false;
        };
    }, [code, router, setIsAuth]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-lg text-white">Authenticating with 42...</p>
                </div>
            </div>
        );
    }

    return null;
};

export default AuthCallback;