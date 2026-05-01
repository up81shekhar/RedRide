import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = io(import.meta.env.VITE_BASE_URL || 'http://localhost:4000', {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current = s;

    s.on('connect', () => {
      console.log('[Socket] connected:', s.id);
      setSocket(s); // trigger re-render so consumers get the live socket
    });

    s.on('disconnect', () => {
      console.log('[Socket] disconnected');
      setSocket(null);
    });

    s.on('connect_error', (err) => {
      console.error('[Socket] connection error:', err.message);
    });

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
