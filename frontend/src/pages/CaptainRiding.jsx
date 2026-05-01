import React, { useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import axios from 'axios';
import LiveMap from '../components/LiveMap';
import SocketContext from '../context/SocketContext';
import { CaptainDataContext } from '../context/CaptainContext';

const CaptainRiding = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const socket    = useContext(SocketContext);
  const { captain } = useContext(CaptainDataContext);

  const ride       = location.state?.ride;
  const [phase,    setPhase]    = useState('arriving'); // arriving | verifying | ongoing
  const [otp,      setOtp]      = useState('');
  const [otpError, setOtpError] = useState('');
  const [ending,   setEnding]   = useState(false);

  const [captainLoc,   setCaptainLoc]   = useState(null);
  const [pickupCoord,  setPickupCoord]  = useState(null);
  const [destCoord,    setDestCoord]    = useState(null);
  const [elapsedTime,  setElapsedTime]  = useState(0);

  const otpPanelRef   = useRef(null);
  const otpInputRefs  = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [otpDigits,   setOtpDigits]    = useState(['', '', '', '']);
  const timerRef = useRef(null);

  // GPS watch
  useEffect(() => {
    const id = navigator.geolocation?.watchPosition(
      (p) => {
        const loc = { lat: p.coords.latitude, lng: p.coords.longitude };
        setCaptainLoc(loc);
        if (socket && captain?._id) {
          socket.emit('update-location-captain', { userId: captain._id, location: loc });
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 3000 }
    );
    return () => navigator.geolocation?.clearWatch(id);
  }, [socket, captain]);

  // Geocode addresses
  useEffect(() => {
    if (!ride) return;
    const token = localStorage.getItem('captainToken');
    const h = { Authorization: `Bearer ${token}` };
    const base = import.meta.env.VITE_BASE_URL;
    axios.get(`${base}/maps/get-coordinates-captain`, { params: { address: ride.pickup }, headers: h })
      .then(r => setPickupCoord(r.data)).catch(() => {});
    axios.get(`${base}/maps/get-coordinates-captain`, { params: { address: ride.destination }, headers: h })
      .then(r => setDestCoord(r.data)).catch(() => {});
  }, [ride]);

  // Trip timer when ongoing
  useEffect(() => {
    if (phase === 'ongoing') {
      timerRef.current = setInterval(() => setElapsedTime((t) => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // Combine OTP digits
  useEffect(() => {
    setOtp(otpDigits.join(''));
  }, [otpDigits]);

  // GSAP OTP panel
  useGSAP(() => {
    gsap.to(otpPanelRef.current, {
      translateY: phase === 'verifying' ? '0%' : '110%',
      duration: 0.45,
      ease: 'power2.out',
    });
  }, [phase]);

  const handleOtpDigit = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otpDigits];
    next[i] = val;
    setOtpDigits(next);
    setOtpError('');
    if (val && i < 3) otpInputRefs[i + 1].current?.focus();
    if (!val && i > 0) otpInputRefs[i - 1].current?.focus();
  };

  const handleStartRide = async () => {
    setOtpError('');
    try {
      const token = localStorage.getItem('captainToken');
      await axios.get(
        `${import.meta.env.VITE_BASE_URL}/rides/start-ride`,
        {
          params: { rideId: ride._id, otp },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPhase('ongoing');
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Wrong OTP. Try again.');
    }
  };

  const handleEndRide = async () => {
    setEnding(true);
    try {
      const token = localStorage.getItem('captainToken');
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/end-ride`,
        { rideId: ride._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/captain-home');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not end ride.');
    } finally {
      setEnding(false);
    }
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (!ride) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: '#080c10' }}>
        <div className="text-center">
          <p className="text-4xl mb-4">🚗</p>
          <p className="text-white font-semibold mb-2">No active ride</p>
          <button
            onClick={() => navigate('/captain-home')}
            className="text-sm font-bold px-6 py-2 rounded-full"
            style={{ background: 'rgba(0,200,83,0.15)', color: '#00c853', border: '1px solid rgba(0,200,83,0.3)' }}
          >
            ← Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const PHASE_CONFIG = {
    arriving:  { label: 'Heading to Pickup', color: '#3b82f6', icon: '🚗' },
    verifying: { label: 'Verify OTP',        color: '#f59e0b', icon: '🔑' },
    ongoing:   { label: 'Trip in Progress',  color: '#00c853', icon: '⚡' },
  };
  const pc = PHASE_CONFIG[phase];

  return (
    <div className="relative h-screen overflow-hidden" style={{ background: '#080c10' }}>

      {/* Map */}
      <div className="absolute inset-0 z-0">
        <LiveMap
          userLocation={captainLoc}
          pickupCoord={phase !== 'ongoing' ? pickupCoord : null}
          destCoord={phase === 'ongoing'   ? destCoord   : null}
          showRoute
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#080c10]/90 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-60 bg-gradient-to-t from-[#080c10] to-transparent" />
      </div>

      {/* Top: Brand + Phase pill */}
      <div className="absolute left-0 right-0 top-0 z-[1002] flex items-center justify-between px-4 pt-5">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{ background: 'linear-gradient(135deg, #00c853, #00897b)' }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            </svg>
          </div>
          <div>
            <p className="text-base font-black text-white leading-none">CAPTAIN</p>
            <p className="text-[9px] font-bold uppercase tracking-[3px]" style={{ color: '#00c853' }}>Active Trip</p>
          </div>
        </div>

        <div
          className="flex items-center gap-1.5 rounded-full px-4 py-2"
          style={{ background: 'rgba(10,14,18,0.9)', border: `1px solid ${pc.color}40`, backdropFilter: 'blur(12px)' }}
        >
          <span className="text-sm">{pc.icon}</span>
          <span className="text-xs font-bold" style={{ color: pc.color }}>{pc.label}</span>
          {phase === 'ongoing' && (
            <span className="text-xs font-mono ml-2 text-white">{formatTime(elapsedTime)}</span>
          )}
        </div>
      </div>

      {/* ── Bottom Panel ── */}
      <div
        className="absolute inset-x-0 bottom-0 z-[1000] rounded-t-3xl px-4 pb-8 pt-5"
        style={{ background: 'rgba(10,14,18,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full" style={{ background: '#2a2a2a' }} />

        {/* Rider info row */}
        <div
          className="mb-3 flex items-center gap-3 rounded-2xl p-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full text-xl" style={{ background: 'rgba(0,200,83,0.1)' }}>
            👤
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm truncate">
              {ride.user?.fullname?.firstname} {ride.user?.fullname?.lastname}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#555' }}>
              {phase === 'arriving' ? 'Waiting at pickup' : phase === 'verifying' ? 'Verifying OTP' : 'On board'}
            </p>
          </div>
          <div>
            <p className="text-lg font-black" style={{ color: '#00c853' }}>₹{ride.fare}</p>
            <p className="text-[10px] text-right" style={{ color: '#555' }}>{ride.paymentMethod || 'Cash'}</p>
          </div>
        </div>

        {/* Route */}
        <div
          className="mb-4 rounded-2xl p-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="relative flex flex-col gap-4 pl-5">
            <div
              className="absolute left-[7px] top-2 w-px border-l border-dashed"
              style={{ height: 'calc(100% - 16px)', borderColor: '#2a2a2a' }}
            />
            <div className="relative">
              <span className="absolute -left-5 top-[3px] h-2.5 w-2.5 rounded-full border-2" style={{ background: '#00c853', borderColor: '#080c10' }} />
              <p className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: '#555' }}>Pickup</p>
              <p className="text-sm font-medium text-white line-clamp-1">{ride.pickup}</p>
            </div>
            <div className="relative">
              <span className="absolute -left-5 top-[3px] h-2.5 w-2.5 rounded-sm" style={{ background: '#ef4444' }} />
              <p className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: '#555' }}>Drop-off</p>
              <p className="text-sm font-medium text-white line-clamp-1">{ride.destination}</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {phase === 'arriving' && (
          <button
            onClick={() => { setPhase('verifying'); setTimeout(() => otpInputRefs[0].current?.focus(), 500); }}
            className="w-full rounded-2xl py-4 text-[15px] font-black text-white transition active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 4px 24px rgba(59,130,246,0.35)' }}
          >
            🔑 Arrived — Verify Rider OTP
          </button>
        )}

        {phase === 'ongoing' && (
          <button
            onClick={handleEndRide}
            disabled={ending}
            className="w-full rounded-2xl py-4 text-[15px] font-black text-white transition active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #00c853, #00897b)', boxShadow: '0 4px 24px rgba(0,200,83,0.35)' }}
          >
            {ending ? 'Ending ride…' : '✅ Complete Trip'}
          </button>
        )}
      </div>

      {/* ── OTP Panel (slides up) ── */}
      <div
        ref={otpPanelRef}
        className="absolute inset-x-0 bottom-0 z-[1001] translate-y-[110%] rounded-t-3xl px-5 pb-10 pt-6"
        style={{ background: 'rgba(8,12,16,0.99)', backdropFilter: 'blur(24px)', borderTop: '1px solid rgba(251,191,36,0.2)' }}
      >
        {/* yellow accent line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)', borderRadius: '12px 12px 0 0' }} />
        <div className="mx-auto mb-6 h-1 w-10 rounded-full mt-3" style={{ background: '#2a2a2a' }} />

        <div className="text-center mb-7">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
            style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}
          >
            🔑
          </div>
          <h3 className="text-2xl font-black text-white">Enter Rider OTP</h3>
          <p className="mt-1.5 text-sm" style={{ color: '#555' }}>Ask the rider for their 4-digit code</p>
        </div>

        {/* 4 separate digit boxes */}
        <div className="flex gap-3 justify-center mb-3">
          {otpDigits.map((d, i) => (
            <input
              key={i}
              ref={otpInputRefs[i]}
              type="tel"
              maxLength={1}
              value={d}
              onChange={(e) => handleOtpDigit(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !d && i > 0) otpInputRefs[i - 1].current?.focus();
              }}
              className="w-16 h-16 rounded-2xl text-center text-3xl font-black text-white outline-none transition"
              style={{
                background: d ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.04)',
                border: d ? '2px solid rgba(251,191,36,0.5)' : '1px solid rgba(255,255,255,0.08)',
                color: '#fbbf24',
              }}
            />
          ))}
        </div>

        {otpError && (
          <p className="mb-3 text-center text-sm" style={{ color: '#ef4444' }}>{otpError}</p>
        )}

        <div className="flex gap-3 mt-5">
          <button
            onClick={() => { setPhase('arriving'); setOtpDigits(['','','','']); setOtpError(''); }}
            className="flex-1 rounded-2xl py-4 text-sm font-bold transition"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#666' }}
          >
            ← Back
          </button>
          <button
            onClick={handleStartRide}
            disabled={otp.length < 4}
            className="flex-[2] rounded-2xl py-4 text-sm font-black text-white transition disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: '#000', boxShadow: '0 4px 24px rgba(251,191,36,0.3)' }}
          >
            Start Trip →
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaptainRiding;
