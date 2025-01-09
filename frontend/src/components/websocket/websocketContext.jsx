'use client';

import { getData } from '@/services/apiCalls';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { 
  useEffect, 
  useState, 
  useCallback, 
  createContext, 
  useContext, 
  useMemo 
} from 'react';
import useWebSocket from 'react-use-websocket';

export const WebSocketContext = createContext();

export const WebSocketProvider = ({ url, children }) => {
  const router = useRouter();
  const pathname = usePathname();
  
  // State management
  const [users, setUsers] = useState([]);
  const [friendStatusChange, setFriendStatusChange] = useState(false);
  const [delayedUrl, setDelayedUrl] = useState(null);

  // Path-based connection control
  const excludedPaths = useMemo(() => [
    '/login',
    '/signup',
    '/forget_password',
    '/reset_password'
  ], []);

  const shouldConnect = useMemo(() => (
    !excludedPaths.includes(pathname)
  ), [pathname, excludedPaths]);

  // Delay the connection by 2 seconds
  useEffect(() => {
    if (shouldConnect) {
      const timer = setTimeout(() => {
        setDelayedUrl(url);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setDelayedUrl(null);
    }
  }, [shouldConnect, url]);

  // WebSocket setup
  const {
    sendMessage,
    lastMessage,
    lastJsonMessage,
    readyState,
  } = useWebSocket(delayedUrl,  {
    shouldReconnect: () => true, // Automatically reconnect on disconnection
  });

  const isConnected = readyState === WebSocket.OPEN;

  // User status handling
  const handleOnlineStatus = useCallback(
    (message) => {
      if (!message || !isConnected) return;
      
      try {
        const data = JSON.parse(message.data);
        if (data.type === 'user_status_change') {
          setFriendStatusChange(true);
          setUsers(prevUsers =>
            prevUsers.map(user =>
              user.username === data.username 
                ? { ...user, status: data.status } 
                : user
            )
          );
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    },
    [isConnected]
  );

  // WebSocket message handler
  useEffect(() => {
    if (lastMessage) handleOnlineStatus(lastMessage);
  }, [lastMessage, handleOnlineStatus]);

  // Data fetching
  const fetchAllUsers = useCallback(
    async (pageNumber, endpoint) => {
      try {
        const response = await getData(`/${endpoint}?page=${pageNumber}`);
        
        if (response.status === 200) {
          setUsers(response.data.results);
          setPaginationState({
            prevPage: response.data.previous ? response.data.previous.split('page=')[1] : null,
            nextPage: response.data.next ? response.data.next.split('page=')[1] : null,
            pageNotFound: false
          });
        } else {
          setPaginationState(prev => ({ ...prev, pageNotFound: true }));
        }
        
        router.replace(`/${endpoint}?page=${pageNumber}`);
      } catch (error) {
        setPaginationState(prev => ({ ...prev, pageNotFound: true }));
      }
    },
    [router]
  );

  // Context value
  const contextValue = useMemo(
    () => ({
      // Connection state
      isConnected,
      sendMessage,
      lastMessage,
      lastJsonMessage,
      
      // User state
      users,
      setUsers,
      friendStatusChange,
      setFriendStatusChange,

      // Functions
      fetchAllUsers,

    }),
    [
      isConnected,
      sendMessage,
      lastMessage,
      lastJsonMessage,
      users,
      friendStatusChange,
      fetchAllUsers,
    ]
  );

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};