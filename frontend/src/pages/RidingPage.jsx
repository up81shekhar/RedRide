import React, { useContext, useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LiveMap from '../components/LiveMap';
import SocketContext from '../context/SocketContext';
import { UserDataContext } from '../context/UserContext';
import axios from 'axios';

const STATUS_STEPS = ['accepted', 'ongoing', 'completed'];
const STATUS_LABELS = {
  accepted: '🚗 Captain on the way',
  ongoing:  '⚡ Trip in progress',
  completed:'✅ Trip completed!',
};

const RidingPage = () => {
  const navigate     = useNavigate();
  const location     = useLocation();
  const socket       = useContext(SocketContext);
  const { user }     = useContext(UserDataContext);

  const ride         = location.state?.ride;

  const [status,          setStatus]          = useState(ride?.status || 'accepted');
  const [captainLocation, setCaptainLocation] = useState(null);
  const [userLocation,    setUserLocation]    = useState(null);
  const [pickupCoord,     setPickupCoord]     = useState(null);
  const [destCoord,       setDestCoord]       = useState(null);
  const [chatOpen,        setChatOpen]        = useState(false);
  const [chatMsg,         setChatMsg]         = useState('');
  const [messages,        setMessages]        = useState([]);

  // User GPS
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {}
    );
  }, []);

  // Socket events
  useEffect(() => {
    if (!socket) return;

    const onStarted = (updatedRide) => setStatus('ongoing');
    const onEnded   = (updatedRide) => {
      setStatus('completed');
      setTimeout(() => navigate('/home'), 3000);
    };
    const onCaptainLoc = (loc) => setCaptainLocation(loc);

    socket.on('ride-started',  onStarted);
    socket.on('ride-ended',    onEnded);

    if (ride?.captain?._id) {
      socket.on(`captain-location-${ride.captain._id}`, onCaptainLoc);
    }

    return () => {
      socket.off('ride-started',  onStarted);
      socket.off('ride-ended',    onEnded);
      if (ride?.captain?._id) {
        socket.off(`captain-location-${ride.captain._id}`, onCaptainLoc);
      }
    };
  }, [socket, ride, navigate]);

  // Geocode pickup/destination for route
  useEffect(() => {
    if (!ride) return;
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    const base    = import.meta.env.VITE_BASE_URL;

    axios.get(`${base}/maps/get-coordinates`, { params: { address: ride.pickup }, headers })
      .then(r => setPickupCoord(r.data)).catch(() => {});
    axios.get(`${base}/maps/get-coordinates`, { params: { address: ride.destination }, headers })
      .then(r => setDestCoord(r.data)).catch(() => {});
  }, [ride]);

  if (!ride) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0f]">
        <p className="text-white">No ride data. <span className="text-red-500 cursor-pointer" onClick={() => navigate('/Home')}>Go Home</span></p>
      </div>
    );
  }

  const captain = ride.captain;
  const stepIdx = STATUS_STEPS.indexOf(status);

  return (
    <div className="relative h-screen overflow-hidden bg-[#0a0a0f]">

      {/* Live Map */}
      <div className="absolute inset-0 z-0">
        <LiveMap
          userLocation={userLocation}
          captainLocation={captainLocation}
          pickupCoord={pickupCoord}
          destCoord={destCoord}
          showRoute={status === 'ongoing'}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-60 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0a0a0f]/60 to-transparent" />
      </div>

      {/* Top status bar */}
      <div className="absolute left-0 right-0 top-0 z-[1002] px-4 pt-4">
        <div className="rounded-2xl border border-[#1e1e2a] bg-[#0d0d13]/90 px-4 py-3 backdrop-blur-md">
          <p className="text-center text-sm font-bold text-white">
            {STATUS_LABELS[status] || 'Processing...'}
          </p>
          {/* Step indicator */}
          <div className="mt-2 flex items-center justify-center gap-1">
            {STATUS_STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div className={`h-1.5 w-8 rounded-full transition-all ${i <= stepIdx ? 'bg-red-500' : 'bg-zinc-700'}`} />
                {i < STATUS_STEPS.length - 1 && <div className="h-px w-2 bg-zinc-800" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom panel */}
      <div className="absolute inset-x-0 bottom-0 z-[1000] rounded-t-3xl bg-[#0d0d13] px-5 pb-8 pt-5 shadow-[0_-8px_40px_rgba(0,0,0,0.8)]">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-700" />

        {/* Captain info */}
        {captain && (
          <div className="mb-4 flex items-center gap-4 rounded-2xl border border-[#1e1e2a] bg-[#13131a] p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/20 text-2xl">
              👨‍✈️
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">
                {captain.fullname?.firstname} {captain.fullname?.lastname}
              </p>
              <p className="text-xs text-zinc-400">
                {captain.vehicle?.vehicleType?.toUpperCase()} · {captain.vehicle?.plate}
              </p>
              <p className="text-xs text-zinc-500">{captain.vehicle?.color}</p>
            </div>
            <a
              href={`tel:${captain.phone || ''}`}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600/20 text-xl"
            >
              📞
            </a>
          </div>
        )}

        {/* OTP badge */}
        {status === 'accepted' && (
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-red-500/30 bg-red-600/10 px-4 py-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">Share OTP with captain</p>
              <p className="mt-1 text-2xl font-black tracking-widest text-white">{ride.otp || '----'}</p>
            </div>
            <span className="text-3xl">🔑</span>
          </div>
        )}

        {/* Trip details */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-[#1e1e2a] bg-[#13131a] p-3">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Pickup</p>
            <p className="mt-1 text-xs text-white line-clamp-2">{ride.pickup}</p>
          </div>
          <div className="rounded-xl border border-[#1e1e2a] bg-[#13131a] p-3">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Drop-off</p>
            <p className="mt-1 text-xs text-white line-clamp-2">{ride.destination}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Fare</p>
            <p className="text-xl font-bold text-red-400">₹{ride.fare}</p>
          </div>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="flex items-center gap-2 rounded-xl border border-[#252535] bg-[#17171f] px-4 py-2 text-sm text-zinc-300 hover:text-white transition"
          >
            💬 Chat
          </button>
        </div>

        {/* Completed state */}
        {status === 'completed' && (
          <div className="mt-4 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 py-4 text-center">
            <p className="font-bold text-emerald-400 text-lg">🎉 Trip Completed!</p>
            <p className="text-sm text-zinc-400 mt-1">Redirecting to home...</p>
          </div>
        )}
      </div>

      {/* Chat overlay */}
      {chatOpen && (
        <div className="absolute inset-x-0 bottom-0 z-[1001] h-96 rounded-t-3xl bg-[#0d0d13] px-5 pt-5 pb-6 shadow-[0_-8px_40px_rgba(0,0,0,0.9)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">In-ride Chat</h3>
            <button onClick={() => setChatOpen(false)} className="text-zinc-500 hover:text-white">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto mb-3 space-y-2 max-h-48">
            {messages.length === 0 && (
              <p className="text-center text-xs text-zinc-600 py-6">No messages yet</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.self ? 'justify-end' : 'justify-start'}`}>
                <span className={`rounded-2xl px-3 py-2 text-sm max-w-[70%] ${m.self ? 'bg-red-600 text-white' : 'bg-[#1e1e2a] text-zinc-300'}`}>
                  {m.text}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={chatMsg}
              onChange={(e) => setChatMsg(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-xl border border-[#252535] bg-[#17171f] px-3 py-2.5 text-sm text-white outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && chatMsg.trim()) {
                  setMessages(prev => [...prev, { text: chatMsg.trim(), self: true }]);
                  setChatMsg('');
                }
              }}
            />
            <button
              onClick={() => {
                if (chatMsg.trim()) {
                  setMessages(prev => [...prev, { text: chatMsg.trim(), self: true }]);
                  setChatMsg('');
                }
              }}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RidingPage;
