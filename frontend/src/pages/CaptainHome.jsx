import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import axios from 'axios';
import LiveMap from '../components/LiveMap';
import { CaptainDataContext } from '../context/CaptainContext';
import SocketContext from '../context/SocketContext';

const CaptainHome = () => {
  const navigate = useNavigate();
  const socket   = useContext(SocketContext);
  const { captain } = useContext(CaptainDataContext);

  const [captainLocation, setCaptainLocation] = useState(null);
  const [incomingRide,    setIncomingRide]    = useState(null);
  const [accepting,       setAccepting]       = useState(false);
  const [earnings,        setEarnings]        = useState(0);
  const [ridesCount,      setRidesCount]      = useState(0);
  const [isOnline,        setIsOnline]        = useState(true);
  const [rideTimer,       setRideTimer]       = useState(30);
  const timerRef = useRef(null);

  const ridePopupRef = useRef(null);
  const overlayRef   = useRef(null);

  // GPS tracking
  useEffect(() => {
    const watchId = navigator.geolocation?.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCaptainLocation(loc);
        if (socket && captain?._id) {
          socket.emit('update-location-captain', { userId: captain._id, location: loc });
        }
      },
      () => setCaptainLocation({ lat: 28.6139, lng: 77.209 }),
      { enableHighAccuracy: true, maximumAge: 3000 }
    );
    return () => navigator.geolocation?.clearWatch(watchId);
  }, [socket, captain]);

  // Socket join + incoming ride
  useEffect(() => {
    if (!socket || !captain?._id) return;
    socket.emit('join', { userId: captain._id, userType: 'captain' });
    const onNewRide = (ride) => {
      if (!isOnline) return;
      setIncomingRide(ride);
      setRideTimer(30);
    };
    socket.on('new-ride', onNewRide);
    return () => socket.off('new-ride', onNewRide);
  }, [socket, captain, isOnline]);

  // Auto-decline timer
  useEffect(() => {
    if (!incomingRide) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setRideTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current); setIncomingRide(null); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [incomingRide]);

  // GSAP ride popup animation
  useGSAP(() => {
    gsap.to(ridePopupRef.current, {
      translateY: incomingRide ? '0%' : '110%',
      duration: 0.5,
      ease: 'back.out(1.4)',
    });
    gsap.to(overlayRef.current, {
      opacity: incomingRide ? 1 : 0,
      pointerEvents: incomingRide ? 'all' : 'none',
      duration: 0.3,
    });
  }, [incomingRide]);

  const handleAccept = async () => {
    if (!incomingRide) return;
    setAccepting(true);
    clearInterval(timerRef.current);
    try {
      const token = localStorage.getItem('captainToken');
      const res   = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/confirm`,
        { rideId: incomingRide._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRidesCount((c) => c + 1);
      navigate('/captain-riding', { state: { ride: res.data } });
    } catch (err) {
      alert(err.response?.data?.message || 'Could not accept ride');
    } finally {
      setAccepting(false);
      setIncomingRide(null);
    }
  };

  const handleDecline = () => {
    clearInterval(timerRef.current);
    setIncomingRide(null);
  };

  const handleToggleOnline = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    try {
      const token = localStorage.getItem('captainToken');
      await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/captains/status`,
        { status: newStatus ? 'active' : 'inactive' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch { /* Non-fatal */ }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('captainToken');
      await axios.get(`${import.meta.env.VITE_BASE_URL}/captains/logout`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
    localStorage.removeItem('captainToken');
    navigate('/captain-login');
  };

  const timerPct = (rideTimer / 30) * 100;

  return (
    <div className="relative h-screen overflow-hidden" style={{ background: '#080c10' }}>

      {/* Map */}
      <div className="absolute inset-0 z-0">
        <LiveMap userLocation={captainLocation} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#080c10]/90 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#080c10] to-transparent" />
      </div>

      {/* ── Top Bar ── */}
      <div className="absolute left-0 right-0 top-0 z-[1002] px-4 pt-5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl shadow-lg"
            style={{ background: 'linear-gradient(135deg, #00c853, #00897b)' }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            </svg>
          </div>
          <div>
            <p className="text-base font-black text-white leading-none tracking-tight">CAPTAIN</p>
            <p className="text-[9px] font-bold uppercase tracking-[3px]" style={{ color: '#00c853' }}>Driver Mode</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleOnline}
            className="rounded-full px-4 py-1.5 text-xs font-bold transition-all border"
            style={isOnline
              ? { background: 'rgba(0,200,83,0.15)', color: '#00c853', borderColor: 'rgba(0,200,83,0.3)' }
              : { background: 'rgba(255,255,255,0.05)', color: '#666', borderColor: '#2a2a2a' }
            }
          >
            {isOnline ? '● Online' : '○ Offline'}
          </button>
          <button
            onClick={handleLogout}
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:text-white transition border"
            style={{ background: 'rgba(255,255,255,0.05)', borderColor: '#2a2a2a' }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Bottom Panel ── */}
      <div
        className="absolute inset-x-0 bottom-0 z-[1000] px-4 pb-8 pt-5 rounded-t-3xl"
        style={{ background: 'rgba(10,14,18,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full" style={{ background: '#2a2a2a' }} />

        {/* Captain Info */}
        <div className="mb-5 flex items-center gap-4">
          <div
            className="relative flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
            style={{ background: 'linear-gradient(135deg,rgba(0,200,83,0.15),rgba(0,137,123,0.15))', border: '1px solid rgba(0,200,83,0.2)' }}
          >
            👨‍✈️
            {isOnline && (
              <span
                className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2"
                style={{ background: '#00c853', borderColor: '#080c10', animation: 'pulse 2s infinite' }}
              />
            )}
          </div>
          <div className="flex-1">
            <p className="font-bold text-white text-base leading-tight">
              {captain?.fullname?.firstname} {captain?.fullname?.lastname}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#555' }}>
              {captain?.vehicle?.vehicleType?.toUpperCase()} · {captain?.vehicle?.plate}
            </p>
            <div className="mt-1 flex items-center gap-1">
              {[1,2,3,4,5].map((s) => (
                <svg key={s} viewBox="0 0 24 24" className="w-3 h-3" style={{ fill: '#f59e0b' }}>
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
              ))}
              <span className="text-[10px] ml-1" style={{ color: '#555' }}>4.9</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#555' }}>Today</p>
            <p className="text-2xl font-black text-white">₹{earnings}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { label: 'Rides', value: ridesCount, icon: '🚗' },
            { label: 'Rating', value: '4.9', icon: '⭐' },
            { label: 'Hours', value: '0h', icon: '⏱' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl py-3 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="text-base mb-0.5">{s.icon}</p>
              <p className="text-lg font-black text-white">{s.value}</p>
              <p className="text-[9px] uppercase tracking-wider" style={{ color: '#555' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Status Banner */}
        <div
          className="rounded-2xl py-4 px-5 flex items-center gap-3"
          style={isOnline
            ? { background: 'rgba(0,200,83,0.08)', border: '1px solid rgba(0,200,83,0.2)' }
            : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }
          }
        >
          <div
            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
            style={isOnline
              ? { background: '#00c853', boxShadow: '0 0 8px #00c853', animation: 'pulse 2s infinite' }
              : { background: '#444' }
            }
          />
          <div>
            <p className="text-sm font-bold" style={{ color: isOnline ? '#00c853' : '#666' }}>
              {isOnline ? 'You are online' : 'You are offline'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#444' }}>
              {isOnline ? 'Looking for ride requests…' : 'Tap Online to start receiving rides'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Dim Overlay ── */}
      <div
        ref={overlayRef}
        className="absolute inset-0 z-[1003]"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)', opacity: 0, pointerEvents: 'none' }}
        onClick={handleDecline}
      />

      {/* ── Incoming Ride Popup ── */}
      <div
        ref={ridePopupRef}
        className="absolute inset-x-3 bottom-3 z-[1004] translate-y-[110%] rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(10,14,18,0.98)',
          border: '1px solid rgba(0,200,83,0.25)',
          boxShadow: '0 -8px 60px rgba(0,200,83,0.15), 0 0 0 1px rgba(0,200,83,0.1)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Green accent line */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, #00897b, #00c853, #00897b)' }} />

        {incomingRide && (
          <div className="px-5 py-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: '#00c853' }} />
                <p className="text-xs font-black uppercase tracking-[2px]" style={{ color: '#00c853' }}>
                  New Ride Request
                </p>
              </div>
              {/* Timer ring */}
              <div className="relative flex items-center justify-center" style={{ width: 44, height: 44 }}>
                <svg viewBox="0 0 36 36" className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
                  <circle
                    cx="18" cy="18" r="15" fill="none"
                    stroke={rideTimer > 10 ? '#00c853' : '#ef4444'}
                    strokeWidth="2.5"
                    strokeDasharray={`${2 * Math.PI * 15}`}
                    strokeDashoffset={`${2 * Math.PI * 15 * (1 - timerPct / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
                  />
                </svg>
                <span className="text-xs font-bold text-white">{rideTimer}s</span>
              </div>
            </div>

            {/* Fare + Distance */}
            <div className="flex gap-2 mb-4">
              <div
                className="flex-1 rounded-2xl py-3 text-center"
                style={{ background: 'rgba(0,200,83,0.08)', border: '1px solid rgba(0,200,83,0.2)' }}
              >
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#00c853' }}>Fare</p>
                <p className="text-xl font-black text-white">₹{incomingRide.fare}</p>
              </div>
              <div
                className="flex-1 rounded-2xl py-3 text-center"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#555' }}>Vehicle</p>
                <p className="text-sm font-bold text-white capitalize">{incomingRide.vehicleType || 'Car'}</p>
              </div>
            </div>

            {/* Rider */}
            <div
              className="mb-4 flex items-center gap-3 rounded-2xl p-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-xl flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.07)' }}
              >
                👤
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">
                  {incomingRide.user?.fullname?.firstname} {incomingRide.user?.fullname?.lastname}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#555' }}>⭐ 4.8 · Rider</p>
              </div>
              <div
                className="rounded-full px-3 py-1 text-[10px] font-bold"
                style={{ background: 'rgba(0,200,83,0.1)', color: '#00c853' }}
              >
                VERIFIED
              </div>
            </div>

            {/* Route */}
            <div
              className="mb-5 rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="relative flex flex-col gap-4 pl-5">
                <div
                  className="absolute left-[7px] top-2 w-px border-l border-dashed"
                  style={{ height: 'calc(100% - 16px)', borderColor: '#2a2a2a' }}
                />
                <div className="relative">
                  <span
                    className="absolute -left-5 top-[3px] h-2.5 w-2.5 rounded-full border-2"
                    style={{ background: '#00c853', borderColor: '#080c10' }}
                  />
                  <p className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: '#555' }}>Pickup</p>
                  <p className="text-sm text-white font-medium line-clamp-1">{incomingRide.pickup}</p>
                </div>
                <div className="relative">
                  <span
                    className="absolute -left-5 top-[3px] h-2.5 w-2.5 rounded-sm"
                    style={{ background: '#ef4444' }}
                  />
                  <p className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: '#555' }}>Drop-off</p>
                  <p className="text-sm text-white font-medium line-clamp-1">{incomingRide.destination}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleDecline}
                className="flex-1 rounded-2xl py-4 text-sm font-bold transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#888' }}
              >
                ✕ Decline
              </button>
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="flex-[2] rounded-2xl py-4 text-sm font-black text-white transition-all active:scale-[0.98] disabled:opacity-60"
                style={{
                  background: 'linear-gradient(135deg, #00c853, #00897b)',
                  boxShadow: '0 4px 24px rgba(0,200,83,0.35)',
                }}
              >
                {accepting ? 'Accepting...' : '✓ Accept Ride'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default CaptainHome;