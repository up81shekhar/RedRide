import React, { createContext, useState, useEffect } from 'react';

export const CaptainDataContext = createContext();

const CaptainContext = ({ children }) => {
  const [captain, setCaptain] = useState(null);

  useEffect(() => {
    // Listen for logout from other tabs
    const handleStorageChange = (e) => {
      if (e.key === 'captainToken' && !e.newValue) {
        setCaptain(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <CaptainDataContext.Provider value={{ captain, setCaptain }}>
      {children}
    </CaptainDataContext.Provider>
  );
};

export default CaptainContext;