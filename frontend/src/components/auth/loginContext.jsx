'use client';
import { useState, createContext, useContext, useEffect, useCallback, useMemo } from 'react';
import { postData } from '@/services/apiCalls';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { useWebSocketContext } from '@/components/websocket/websocketContext';

export const LoginContext = createContext(null);

export const LoginProvider = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  // State variables
  const [errors, setErrors] = useState({});
  const [isAuth, setIsAuth] = useState(() => JSON.parse(Cookies.get('isAuth') || 'false'));
  const [mounted, setMounted] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);

  // WebSocket context
  const { isConnected, sendMessage } = useWebSocketContext();

  // Authentication effect
  useEffect(() => {
    const isAuthValue = Cookies.get('isAuth');
    if (isAuthValue) {
      setIsAuth(JSON.parse(isAuthValue));
    } else {
      setIsAuth(false);
      Cookies.set('isAuth', 'false', { path: '/', sameSite: 'strict' });
      router.push('/login');
    }
    setMounted(true);
    return () => setMounted(false);
  }, [pathname, router]);

	// Authentication function with async/await for readability
	const AuthenticateTo = async (endpoint, formData) => {
		try {
			const res = await postData(endpoint, formData);
			if (res?.status === 200 || res?.status === 201) {
				if (res?.data?.totp) {
					// this means user has enabled 2fa
					// and we need to send totp code with credentials
					return {"totp":"send credentials with totp code", msg:res?.data?.msg};
				}
				setIsAuth(true);
				Cookies.set('isAuth', 'true', { path: '/', sameSite: 'strict' });

				// Send WebSocket message if connected
				if (isConnected)
					sendMessage(JSON.stringify({ online: 'online', user: res.data.username }));
				router.push('/profile');
			} else {
				handleError(res);
			}
		} catch (error) {
			console.error('Error during authentication:', error);
		}
		return {};
	};

  const handleError = res => {
    if (res?.response?.status === 500) {
      router.push('/500');
    }
    setErrors({
      first_name: res?.response?.data?.first_name,
      last_name: res?.response?.data?.last_name,
      username: res?.response?.data?.username,
      email: res?.response?.data?.email,
      password: res?.response?.data?.password,
      status: res?.response?.status,
      server_error: `${res?.response?.data} ${res?.response?.status}`,
      error: res?.response?.data?.Error,
    });
  };

  // Logout function with WebSocket notification
  const Logout = useCallback(() => {
    if (isConnected) {
      sendMessage(JSON.stringify({ logout: 'logout', user: profileData.username }));
    }
    setIsAuth(false);
    Cookies.remove('isAuth');
    postData('/logout').then(res => {
      if (res?.status === 205) {
        router.push('/login');
      }
    });
  }, [isConnected, profileData, router]);

  // Fetch profile data only if authenticated
  const fetchProfile = useCallback(async () => {
    try {
      const res = await postData('profile/data');
      if (res?.status === 200) {
        setProfileData(res.data.user);
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
    }
  }, []);

  useEffect(() => {
    if (isAuth) fetchProfile();
  }, [isAuth, fetchProfile]);

  // Redirect if authenticated and at a login or signup page
  useEffect(() => {
    setErrors({});
    if (isAuth && ['/login', '/signup', '/callback'].includes(pathname)) {
      router.push('/profile');
    }
  }, [isAuth, pathname, router]);

  // Memoized context value
  const contextValue = useMemo(
    () => ({
      errors,
      setErrors,
      AuthenticateTo,
      Logout,
      isAuth,
      setIsAuth,
      fetchProfile,
      profileData,
      setProfileData,
      selectedUser,
      setSelectedUser,
    }),
    [errors, AuthenticateTo, Logout, isAuth, profileData]
  );

  return <LoginContext.Provider value={contextValue}>{mounted && children}</LoginContext.Provider>;
};

// Custom hook for consuming context
export const useAuth = () => {
  const context = useContext(LoginContext);
  if (!context) {
    throw new Error('useAuth must be used within a LoginProvider');
  }
  return context;
};
