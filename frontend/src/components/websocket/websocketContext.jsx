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
  const [connectionEstablished, setConnectionEstablished] = useState(false);
  const [paginationState, setPaginationState] = useState({
    nextPage: null,
    prevPage: null,
    pageNotFound: false
  });
  const [friendStatusChange, setFriendStatusChange] = useState(false);

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

  // WebSocket setup
  const {
    sendMessage,
    lastMessage,
    lastJsonMessage,
    readyState,
    getWebSocket
  } = useWebSocket(shouldConnect ? url : null, {
    shouldReconnect: (closeEvent) => shouldConnect,
    reconnectInterval: 1000,
    share: true,
    retryOnError: true,
    onOpen: () => {

      setConnectionEstablished(true);
    },
    onClose: () => {

      setConnectionEstablished(false);
    },
    onError: (error) => {
      setConnectionEstablished(false);
    }
  });

  const isConnected = readyState === WebSocket.OPEN;

  // Connection status monitoring
  useEffect(() => {
    if (readyState === WebSocket.OPEN) {

      setConnectionEstablished(true);
    } else if (readyState === WebSocket.CLOSED) {
      setConnectionEstablished(false);
    }
  }, [readyState, pathname]);

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
        console.error('Error fetching users:', error);
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
      connectionEstablished,
      sendMessage,
      lastMessage,
      lastJsonMessage,
      
      // User state
      users,
      setUsers,
      friendStatusChange,
      setFriendStatusChange,
      
      // Pagination state
      ...paginationState,
      setPaginationState,
      
      // Functions
      fetchAllUsers,
      
      // WebSocket instance (if needed)
      getWebSocket
    }),
    [
      isConnected,
      connectionEstablished,
      sendMessage,
      lastMessage,
      lastJsonMessage,
      users,
      friendStatusChange,
      paginationState,
      fetchAllUsers,
      getWebSocket
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