import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import axios from 'axios';
import LiveMap from '../components/LiveMap';
import { UserDataContext } from '../context/UserContext';
import SocketContext from '../context/SocketContext';

// ─── Vehicle configs ──────────────────────────────────────────────────────────
const VEHICLE_META = {
  car:        { name: 'RedGo',  seats: 4, desc: 'Comfortable sedan', emoji: '🚗' },
  motorcycle: { name: 'Moto',   seats: 1, desc: 'Bike ride',         emoji: '🏍️' },
  auto:       { name: 'Auto',   seats: 2, desc: 'Auto rickshaw',      emoji: '🛺' },
};

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash',  icon: '💵' },
  { id: 'upi',  label: 'UPI',   icon: '📱' },
  { id: 'card', label: 'Card',  icon: '💳' },
];

// ─── Home ─────────────────────────────────────────────────────────────────────
const Home = () => {
  const navigate    = useNavigate();
  const socket      = useContext(SocketContext);
  const { user }    = useContext(UserDataContext);

  // Location
  const [userLocation, setUserLocation] = useState(null);
  const [pickup,       setPickup]       = useState('');
  const [destination,  setDestination]  = useState('');
  const [activeField,  setActiveField]  = useState(null); // 'pickup'|'destination'

  // Suggestions
  const [suggestions,  setSuggestions]  = useState([]);
  const [sugLoading,   setSugLoading]   = useState(false);
  const sugDebounce = useRef(null);

  // Fare + vehicles
  const [fares,        setFares]        = useState(null);
  const [fareDistance, setFareDistance] = useState(null);
  const [fareDuration, setFareDuration] = useState(null);
  const [fareLoading,  setFareLoading]  = useState(false);

  // Panels
  const [panelOpen,    setPanelOpen]    = useState(false);
  const [vehiclePanel, setVehiclePanel] = useState(false);
  const [confirmPanel, setConfirmPanel] = useState(false);
  const [waitingPanel, setWaitingPanel] = useState(false);

  // Selections
  const [selectedType,    setSelectedType]    = useState('car');
  const [selectedPayment, setSelectedPayment] = useState('cash');

  // Ride
  const [rideData, setRideData] = useState(null);

  // Coords for route
  const [pickupCoord, setPickupCoord] = useState(null);
  const [destCoord,   setDestCoord]   = useState(null);

  // Refs for GSAP
  const panelRef        = useRef(null);
  const vehiclePanelRef = useRef(null);
  const confirmPanelRef = useRef(null);
  const waitingPanelRef = useRef(null);

  // ── Get user GPS ────────────────────────────────────────────────────────────
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLocation({ lat: 28.6139, lng: 77.209 }) // Delhi fallback
    );
  }, []);

  // ── Socket join ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (socket && user?._id) {
      socket.emit('join', { userId: user._id, userType: 'user' });
    }
  }, [socket, user]);

  // ── Socket: ride confirmed ──────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const onConfirmed = (ride) => {
      setRideData(ride);
      setWaitingPanel(false);
      navigate('/riding', { state: { ride } });
    };
    socket.on('ride-confirmed', onConfirmed);
    return () => socket.off('ride-confirmed', onConfirmed);
  }, [socket, navigate]);

  // ── GSAP panel animations ───────────────────────────────────────────────────
  useGSAP(() => {
    gsap.to(panelRef.current, {
      height: panelOpen ? '65%' : '0%',
      duration: 0.35,
      ease: 'power2.out',
    });
  }, [panelOpen]);

  useGSAP(() => {
    gsap.to(vehiclePanelRef.current, {
      translateY: vehiclePanel ? '0%' : '100%',
      duration: 0.4,
      ease: 'power2.out',
    });
  }, [vehiclePanel]);

  useGSAP(() => {
    gsap.to(confirmPanelRef.current, {
      translateY: confirmPanel ? '0%' : '100%',
      duration: 0.4,
      ease: 'power2.out',
    });
  }, [confirmPanel]);

  useGSAP(() => {
    gsap.to(waitingPanelRef.current, {
      translateY: waitingPanel ? '0%' : '100%',
      duration: 0.4,
      ease: 'power2.out',
    });
  }, [waitingPanel]);

  // ── Autocomplete debounce ───────────────────────────────────────────────────
  const fetchSuggestions = useCallback(async (query) => {
    if (query.length < 2) { setSuggestions([]); return; }
    setSugLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res   = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`,
        { params: { input: query }, headers: { Authorization: `Bearer ${token}` } }
      );
      setSuggestions(res.data || []);
    } catch (err) {
      console.error('[Suggestions] error:', err.response?.data || err.message);
      setSuggestions([]);
    } finally {
      setSugLoading(false);
    }
  }, []);

  const handleInputChange = (field, value) => {
    if (field === 'pickup')      setPickup(value);
    else                         setDestination(value);
    clearTimeout(sugDebounce.current);
    sugDebounce.current = setTimeout(() => fetchSuggestions(value), 500);
  };

  const handleSuggestionSelect = (suggestion) => {
    if (activeField === 'pickup') {
      setPickup(suggestion.description);
      setPickupCoord({ lat: suggestion.lat, lng: suggestion.lng });
    } else {
      setDestination(suggestion.description);
      setDestCoord({ lat: suggestion.lat, lng: suggestion.lng });
    }
    setSuggestions([]);
    setPanelOpen(false);
  };

  // ── Fetch fare ───────────────────────────────────────────────────────────────
  const handleFindTrip = async () => {
    if (!pickup || !destination) return;
    setFareLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res   = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/rides/get-fare`,
        { params: { pickup, destination }, headers: { Authorization: `Bearer ${token}` } }
      );
      setFares(res.data.fares);
      setFareDistance(res.data.distance?.text);
      setFareDuration(res.data.duration?.text);
      setPanelOpen(false);
      setVehiclePanel(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not calculate fare. Try again.');
    } finally {
      setFareLoading(false);
    }
  };

  // ── Book ride ────────────────────────────────────────────────────────────────
  const handleConfirmRide = async () => {
    try {
      const token = localStorage.getItem('token');
      const res   = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/create`,
        { pickup, destination, vehicleType: selectedType, paymentMethod: selectedPayment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRideData(res.data);
      setConfirmPanel(false);
      setVehiclePanel(false);
      setTimeout(() => setWaitingPanel(true), 200);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not book ride.');
    }
  };

  const selectedMeta  = VEHICLE_META[selectedType];
  const selectedFare  = fares ? `₹${fares[selectedType]}` : '—';

  return (
    <div className="relative h-screen overflow-hidden bg-[#0a0a0f]">

      {/* ── Live Map ── */}
      <div className="absolute inset-0 z-0">
        <LiveMap
          userLocation={userLocation}
          pickupCoord={pickupCoord}
          destCoord={destCoord}
          showRoute={!!(pickupCoord && destCoord)}
        />
        {/* Dark overlay gradient for readability */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
      </div>

      {/* ── Top logo ── */}
      <div className="absolute left-4 top-4 z-[1002] flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 shadow-[0_0_16px_rgba(220,38,38,0.6)]">
          <span className="text-sm">🚗</span>
        </div>
        <span className="text-xl font-extrabold tracking-tight text-white drop-shadow-lg">
          Red<span className="text-red-500">Ride</span>
        </span>
      </div>

      {/* ── Bottom sheet ── */}
      <div className="absolute inset-0 flex flex-col justify-end pointer-events-none z-[1000]">

        {/* Search form */}
        <div className="pointer-events-auto rounded-t-3xl bg-[#0d0d13] px-5 pb-4 pt-5 shadow-[0_-8px_40px_rgba(0,0,0,0.7)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">Where to?</p>
              <h4 className="text-xl font-bold text-white">Find a trip</h4>
            </div>
            <button
              onClick={() => setPanelOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e1e2a] text-zinc-400 transition hover:text-white"
            >
              <span className="text-sm">{panelOpen ? '▼' : '▲'}</span>
            </button>
          </div>

          <div className="relative flex flex-col gap-2">
            {/* Connector line */}
            <div className="absolute left-[13px] top-10 h-6 w-px bg-zinc-700 z-10" />

            <div className="relative">
              <span className="absolute left-[9px] top-1/2 z-10 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-[#0d0d13] bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              <input
                type="text"
                placeholder="Add pickup location"
                value={pickup}
                onFocus={() => { setActiveField('pickup'); setPanelOpen(true); }}
                onChange={(e) => handleInputChange('pickup', e.target.value)}
                className="w-full rounded-xl border border-[#252535] bg-[#17171f] py-3 pl-9 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-emerald-500/50 focus:bg-[#1c1c28]"
              />
            </div>

            <div className="relative">
              <span className="absolute left-[9px] top-1/2 z-10 h-3 w-3 -translate-y-1/2 rounded-sm bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              <input
                type="text"
                placeholder="Enter destination"
                value={destination}
                onFocus={() => { setActiveField('destination'); setPanelOpen(true); }}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                className="w-full rounded-xl border border-[#252535] bg-[#17171f] py-3 pl-9 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-red-500/50 focus:bg-[#1c1c28]"
              />
            </div>
          </div>

          {pickup && destination && (
            <button
              onClick={handleFindTrip}
              disabled={fareLoading}
              className="mt-3 w-full rounded-2xl bg-red-600 py-3.5 text-sm font-bold text-white shadow-[0_4px_20px_rgba(220,38,38,0.35)] transition hover:bg-red-500 active:scale-[0.98] disabled:opacity-60"
            >
              {fareLoading ? 'Calculating...' : 'Find Trip →'}
            </button>
          )}
        </div>

        {/* Suggestions panel */}
        <div ref={panelRef} className="pointer-events-auto h-0 overflow-y-auto bg-[#0d0d13]">
          <div className="px-5 pb-4 pt-2">
            {sugLoading && (
              <p className="py-4 text-center text-xs text-zinc-500">Searching...</p>
            )}
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionSelect(s)}
                className="flex w-full items-start gap-3 border-b border-[#1e1e2a] py-3 text-left transition hover:bg-[#1a1a24] px-2 rounded-xl"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1e1e2a] text-sm">📍</span>
                <span className="text-sm text-zinc-300 line-clamp-2">{s.description}</span>
              </button>
            ))}
            {!sugLoading && suggestions.length === 0 && (activeField) && (
              <div className="py-6 text-center">
                <p className="text-xs text-zinc-500">
                  {(activeField === 'pickup' ? pickup : destination).length < 2
                    ? 'Start typing to search locations…'
                    : 'No places found — try a shorter or different name'}
                </p>
                {(activeField === 'pickup' ? pickup : destination).length >= 2 && (
                  <p className="text-[10px] text-zinc-700 mt-1">
                    Try: "Aligarh", "New Delhi", "Connaught Place"
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Vehicle Panel ── */}
        <div
          ref={vehiclePanelRef}
          className="pointer-events-auto absolute inset-x-0 bottom-0 translate-y-full rounded-t-3xl bg-[#0d0d13] px-5 pb-8 pt-5 shadow-[0_-8px_40px_rgba(0,0,0,0.8)]"
        >
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-700" />
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Choose a vehicle</h3>
            <button onClick={() => setVehiclePanel(false)} className="text-zinc-500 hover:text-white text-lg">✕</button>
          </div>
          {fareDistance && (
            <p className="mb-4 text-xs text-zinc-500">
              {fareDistance} · {fareDuration}
            </p>
          )}

          <div className="space-y-2.5">
            {Object.entries(VEHICLE_META).map(([type, meta]) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`flex w-full cursor-pointer items-center gap-4 rounded-2xl border p-3.5 transition-all text-left ${
                  selectedType === type
                    ? 'border-red-500 bg-[#1c1218] shadow-[0_0_0_1px_rgba(239,68,68,0.2)]'
                    : 'border-[#222232] bg-[#13131a] hover:border-red-500/30'
                }`}
              >
                <span className="text-3xl">{meta.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{meta.name}</span>
                    <span className="rounded-full bg-[#1e1e2a] px-2 py-0.5 text-[11px] text-zinc-400">👤 {meta.seats}</span>
                  </div>
                  <p className="text-xs text-zinc-500">{meta.desc}</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-white">
                    {fares ? `₹${fares[type]}` : '—'}
                  </p>
                  {selectedType === type && (
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="my-4 border-t border-[#1e1e2a]" />
          <button
            onClick={() => { setVehiclePanel(false); setTimeout(() => setConfirmPanel(true), 220); }}
            className="w-full rounded-2xl bg-red-600 py-4 text-[15px] font-bold text-white shadow-[0_4px_20px_rgba(220,38,38,0.35)] transition hover:bg-red-500 active:scale-[0.98]"
          >
            Book {selectedMeta.name} · {selectedFare}
          </button>
        </div>

        {/* ── Confirm Panel ── */}
        <div
          ref={confirmPanelRef}
          className="pointer-events-auto absolute inset-x-0 bottom-0 translate-y-full rounded-t-3xl bg-[#0d0d13] px-5 pb-8 pt-5 shadow-[0_-8px_40px_rgba(0,0,0,0.9)]"
        >
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-zinc-700" />

          {/* Header */}
          <div className="mb-5 flex items-center gap-3">
            <button
              onClick={() => { setConfirmPanel(false); setTimeout(() => setVehiclePanel(true), 220); }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e1e2a] text-zinc-400 hover:text-white"
            >
              ←
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">Almost there</p>
              <h3 className="text-xl font-bold text-white">Confirm your ride</h3>
            </div>
          </div>

          {/* Vehicle summary */}
          <div className="mb-3 flex items-center gap-4 rounded-2xl border border-[#1e1e2a] bg-[#13131a] p-4">
            <span className="text-4xl">{selectedMeta.emoji}</span>
            <div className="flex-1">
              <h4 className="font-semibold text-white">{selectedMeta.name}</h4>
              <p className="text-xs text-zinc-500">{selectedMeta.desc} · {selectedMeta.seats} seat(s)</p>
            </div>
            <p className="text-lg font-bold text-white">{selectedFare}</p>
          </div>

          {/* Route */}
          <div className="mb-3 rounded-2xl border border-[#1e1e2a] bg-[#13131a] p-4">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Trip Route</p>
            <div className="relative flex flex-col gap-4 pl-5">
              <div className="absolute left-[7px] top-2 h-[calc(100%-16px)] w-px border-l border-dashed border-zinc-700" />
              <div className="relative">
                <span className="absolute -left-5 top-[3px] h-2.5 w-2.5 rounded-full border-2 border-[#13131a] bg-emerald-400" />
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">Pickup</p>
                <p className="mt-0.5 truncate text-sm font-medium text-white">{pickup || 'Current location'}</p>
              </div>
              <div className="relative">
                <span className="absolute -left-5 top-[3px] h-2.5 w-2.5 rounded-sm bg-red-500" />
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">Drop-off</p>
                <p className="mt-0.5 truncate text-sm font-medium text-white">{destination || 'Destination'}</p>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="mb-4 rounded-2xl border border-[#1e1e2a] bg-[#13131a] p-4">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Payment Method</p>
            <div className="flex gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedPayment(m.id)}
                  className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border py-3 transition-all ${
                    selectedPayment === m.id
                      ? 'border-red-500 bg-[#1c1218] shadow-[0_0_0_1px_rgba(239,68,68,0.2)]'
                      : 'border-[#252535] bg-[#17171f] hover:border-red-500/30'
                  }`}
                >
                  <span className="text-lg">{m.icon}</span>
                  <span className={`text-xs font-medium ${selectedPayment === m.id ? 'text-white' : 'text-zinc-500'}`}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleConfirmRide}
            className="w-full rounded-2xl bg-red-600 py-4 text-[15px] font-bold text-white shadow-[0_4px_24px_rgba(220,38,38,0.4)] transition hover:bg-red-500 active:scale-[0.98]"
          >
            ✓ Confirm {selectedMeta.name}
          </button>
        </div>

        {/* ── Waiting for Driver Panel ── */}
        <div
          ref={waitingPanelRef}
          className="pointer-events-auto absolute inset-x-0 bottom-0 translate-y-full rounded-t-3xl bg-[#0d0d13] px-5 pb-8 pt-5 shadow-[0_-8px_40px_rgba(0,0,0,0.9)]"
        >
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-zinc-700" />
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-600/20 text-5xl animate-pulse">
              🚗
            </div>
            <h3 className="text-2xl font-bold text-white">Finding your captain…</h3>
            <p className="mt-2 text-sm text-zinc-400">Connecting you with a nearby driver</p>
            {rideData && (
              <div className="mt-4 rounded-2xl border border-[#1e1e2a] bg-[#13131a] p-4 text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Your ride</p>
                <p className="text-sm text-white truncate">📍 {rideData.pickup}</p>
                <p className="text-sm text-zinc-400 truncate mt-1">🏁 {rideData.destination}</p>
                <p className="mt-2 text-base font-bold text-red-400">₹{rideData.fare}</p>
              </div>
            )}
            <button
              onClick={() => setWaitingPanel(false)}
              className="mt-6 w-full rounded-2xl border border-[#2a2a38] bg-[#13131a] py-3 text-sm text-zinc-400 hover:text-white transition"
            >
              Cancel
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;