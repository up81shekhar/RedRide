import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CaptainDataContext } from '../context/CaptainContext';

const CaptainLogout = () => {
  const { setCaptain } = useContext(CaptainDataContext);
  const navigate       = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('captainToken');
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/captains/logout`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setCaptain(null);
        localStorage.removeItem('captainToken');
        navigate('/captain-login');
      })
      .catch(() => {
        localStorage.removeItem('captainToken');
        navigate('/captain-login');
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

export default CaptainLogout;