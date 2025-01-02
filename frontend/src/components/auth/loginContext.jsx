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
      // Clear previous errors
      setErrors({});
      
      const res = await postData(endpoint, formData);
      if (res?.status === 200 || res?.status === 201) {
        if (res?.data?.totp) {
          return {"totp":"send credentials with totp code", msg:res?.data?.msg};
        }
        setIsAuth(true);
        Cookies.set('isAuth', 'true', { path: '/', sameSite: 'strict' });
        
        if (isConnected) {
          sendMessage(JSON.stringify({ online: 'online', user: res.data.username }));
        }
        router.push('/profile');
        return res;
      } else {
        handleError(res);
        return res;
      }
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  // Updated error handling
  const handleError = (res) => {
    if (res?.response?.status === 500) {
      router.push('/500');
      return;
    }
    
    // Clear previous errors first
    setErrors({});
    
    const errorData = {
      first_name: res?.response?.data?.first_name,
      last_name: res?.response?.data?.last_name,
      username: res?.response?.data?.username,
      email: res?.response?.data?.email,
      password: res?.response?.data?.password,
      status: res?.response?.status,
      server_error: res?.response?.data ? `${res.response.data} ${res.response.status}` : 'An error occurred',
      error: res?.response?.data?.Error,
    };

    // Only set errors that actually have values
    const filteredErrors = Object.fromEntries(
      Object.entries(errorData).filter(([_, value]) => value != null)
    );
    
    setErrors(filteredErrors);
  };

  // Logout function with WebSocket notification
  const Logout = useCallback(async () => {
    try {
      // First, clear the auth state and cookie
      setIsAuth(false);
      Cookies.remove('isAuth');
      
      // Send websocket message if connected
      if (isConnected) {
        sendMessage(JSON.stringify({ logout: 'logout', user: profileData.username }));
      }
  
      // Clear profile data
      setProfileData({});
      
      // Redirect to login immediately
      router.push('/login');
  
      // Then call the logout endpoint
      const res = await postData('/logout');
      
      // If logout fails for some reason, ensure we're still on login page
      if (res?.status !== 205) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Ensure we're on login page even if there's an error
      router.push('/login');
    }
  }, [isConnected, profileData, router, sendMessage]);

  // Fetch profile data only if authenticated
  const fetchProfile = useCallback(async () => {
    try {
      const res = await postData('profile/data');
      if (res?.status === 200) {
        setProfileData(res.data.user);
      } else {
        // Handle non-200 responses
        console.error('Failed to fetch profile:', res);
        setProfileData({}); // Reset profile data on error
        if (res?.status === 401) {
          // Handle unauthorized access
          setIsAuth(false);
          Cookies.remove('isAuth');
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Don't reset auth state here, just set empty profile data
      setProfileData({});
    }
  }, [router]);

  // Modified useEffect for profile fetching
  useEffect(() => {
    if (isAuth) {
      fetchProfile();
    } else {
      setProfileData({}); // Reset profile data when not authenticated
    }
  }, [isAuth, fetchProfile]);

  // Redirect if authenticated and at a login or signup page
  // useEffect(() => {
  //   setErrors({});
  //   if (!isAuth && !['/login', '/signup', '/callback'].includes(pathname)) {
  //     router.replace('/login');
  //   } else if (isAuth && ['/login', '/signup', '/callback'].includes(pathname)) {
  //     router.replace('/profile');
  //   }
  // }, [isAuth, pathname, router]);

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
