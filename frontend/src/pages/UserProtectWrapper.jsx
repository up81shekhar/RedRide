import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserDataContext } from '../context/UserContext';

const UserProtectWrapper = ({ children }) => {
  const { setUser }  = useContext(UserDataContext);
  const navigate     = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/login');
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
          <p className="text-sm text-zinc-400">Loading RedRide…</p>
        </div>
      </div>
    );
  }

  return children;
};

export default UserProtectWrapper;