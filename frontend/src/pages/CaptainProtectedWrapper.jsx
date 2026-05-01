import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CaptainDataContext } from '../context/CaptainContext';

const CaptainProtectWrapper = ({ children }) => {
  const { setCaptain } = useContext(CaptainDataContext);
  const navigate       = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('captainToken');
    if (!token) {
      navigate('/captain-login');
      return;
    }
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/captains/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCaptain(res.data.captain);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('captainToken');
        navigate('/captain-login');
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
          <p className="text-sm text-zinc-400">Loading Captain Portal…</p>
        </div>
      </div>
    );
  }

  return children;
};

export default CaptainProtectWrapper;