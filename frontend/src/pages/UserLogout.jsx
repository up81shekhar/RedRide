import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserDataContext } from '../context/UserContext';

const UserLogout = () => {
  const { setUser } = useContext(UserDataContext);
  const navigate    = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/users/logout`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setUser(null);
        localStorage.removeItem('token');
        navigate('/login');
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/login');
      });
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-[#0a0a0f]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
        <p className="text-sm text-zinc-400">Logging out…</p>
      </div>
    </div>
  );
};

export default UserLogout;