import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { CaptainDataContext } from "../context/CaptainContext";

const VEHICLE_TYPES = [
  { value: 'car',        emoji: '🚗', label: 'Car',  seats: '4 seats' },
  { value: 'motorcycle', emoji: '🏍️', label: 'Bike', seats: '1 seat'  },
  { value: 'auto',       emoji: '🛺', label: 'Auto', seats: '2 seats' },
];

const CaptainSignup = () => {
  const navigate = useNavigate();
  const { setCaptain } = useContext(CaptainDataContext);

  const [firstName,       setFirst]           = useState("");
  const [lastName,        setLast]            = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [vehicleColor,    setVehicleColor]    = useState("");
  const [vehiclePlate,    setVehiclePlate]    = useState("");
  const [vehicleCapacity, setVehicleCapacity] = useState("");
  const [vehicleType,     setVehicleType]     = useState("");
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState("");
  const [step,            setStep]            = useState(1); // 1: personal, 2: vehicle

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const captainData = {
      fullname: { firstname: firstName, lastname: lastName },
      email, password,
      vehicle: { color: vehicleColor, plate: vehiclePlate, capacity: vehicleCapacity, vehicleType },
    };
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/register`,
        captainData
      );
      if (response.status === 201 || response.status === 200) {
        const data = response.data;
        if (data.token) localStorage.setItem("captainToken", data.token);
        setCaptain(data.captain);
        navigate("/captain-home");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: '13px 14px',
    color: '#fff',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
    caretColor: '#00c853',
  };

  const handleInputFocus = (e) => { e.target.style.borderColor = 'rgba(0,200,83,0.4)'; };
  const handleInputBlur  = (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; };

  return (
    <div style={{ minHeight: '100dvh', background: 'linear-gradient(160deg, #060d06 0%, #080c10 60%, #060d06 100%)', fontFamily: "'Inter', sans-serif" }}>
      {/* BG Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div style={{ position: 'absolute', top: -100, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,200,83,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,137,123,0.06) 0%, transparent 70%)' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(0,200,83,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,83,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 440, margin: '0 auto', padding: '0 20px 60px' }}>

        {/* Header */}
        <div style={{ paddingTop: 48, paddingBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #00c853, #00897b)', boxShadow: '0 8px 32px rgba(0,200,83,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1, margin: 0 }}>CAPTAIN</p>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '3px', color: '#00c853', textTransform: 'uppercase', margin: '3px 0 0' }}>Driver Portal</p>
            </div>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 99, padding: '4px 12px', background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.2)', marginBottom: 12 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00c853', display: 'inline-block' }} />
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: '#00c853', textTransform: 'uppercase' }}>New Registration</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>Join as Captain</h1>
          <p style={{ fontSize: 13, color: '#555', marginTop: 6 }}>Start earning with your vehicle today</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['Personal Info', 'Vehicle Details'].map((label, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{ height: 3, borderRadius: 99, background: step > i ? 'linear-gradient(90deg, #00c853, #00897b)' : step === i + 1 ? 'linear-gradient(90deg, #00c853, #00897b)' : 'rgba(255,255,255,0.08)', marginBottom: 6, transition: 'background 0.3s' }} />
              <p style={{ fontSize: 10, color: step === i + 1 ? '#00c853' : '#444', fontWeight: 600 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* ── Step 1: Personal ── */}
        {step === 1 && (
          <div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '20px 18px', marginBottom: 12 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', color: '#00c853', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00c853', display: 'inline-block' }} />
                Personal Info
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#555', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>First Name</label>
                  <input
                    placeholder="John" value={firstName}
                    onChange={(e) => setFirst(e.target.value)}
                    onFocus={handleInputFocus} onBlur={handleInputBlur}
                    style={inputStyle} required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#555', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Last Name</label>
                  <input
                    placeholder="Doe" value={lastName}
                    onChange={(e) => setLast(e.target.value)}
                    onFocus={handleInputFocus} onBlur={handleInputBlur}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#555', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
                <input
                  type="email" placeholder="captain@example.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={handleInputFocus} onBlur={handleInputBlur}
                  style={inputStyle} required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#555', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
                <input
                  type="password" placeholder="Min. 8 characters" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={handleInputFocus} onBlur={handleInputBlur}
                  style={inputStyle} required
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (!firstName || !email || !password) { setError('Please fill personal details'); return; }
                setError('');
                setStep(2);
              }}
              style={{ width: '100%', padding: '15px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #00c853, #00897b)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,200,83,0.3)' }}
            >
              Continue to Vehicle Details →
            </button>
          </div>
        )}

        {/* ── Step 2: Vehicle ── */}
        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '20px 18px', marginBottom: 12 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', color: '#00c853', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00c853', display: 'inline-block' }} />
                Vehicle Details
              </p>

              {/* Vehicle type selector */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#555', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vehicle Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {VEHICLE_TYPES.map((vt) => (
                    <button
                      key={vt.value}
                      type="button"
                      onClick={() => setVehicleType(vt.value)}
                      style={{
                        padding: '12px 8px',
                        borderRadius: 12,
                        border: vehicleType === vt.value ? '2px solid rgba(0,200,83,0.6)' : '1px solid rgba(255,255,255,0.08)',
                        background: vehicleType === vt.value ? 'rgba(0,200,83,0.1)' : 'rgba(255,255,255,0.03)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: 22, marginBottom: 4 }}>{vt.emoji}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: vehicleType === vt.value ? '#00c853' : '#888' }}>{vt.label}</div>
                      <div style={{ fontSize: 9, color: '#555' }}>{vt.seats}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#555', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Color</label>
                  <input
                    placeholder="Pearl White" value={vehicleColor}
                    onChange={(e) => setVehicleColor(e.target.value)}
                    onFocus={handleInputFocus} onBlur={handleInputBlur}
                    style={inputStyle} required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#555', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Plate No.</label>
                  <input
                    placeholder="UP80 AB 1234" value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                    onFocus={handleInputFocus} onBlur={handleInputBlur}
                    style={{ ...inputStyle, textTransform: 'uppercase' }} required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#555', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Seat Capacity</label>
                <input
                  type="number" placeholder="4" min="1" value={vehicleCapacity}
                  onChange={(e) => setVehicleCapacity(e.target.value)}
                  onFocus={handleInputFocus} onBlur={handleInputBlur}
                  style={inputStyle} required
                />
              </div>
            </div>

            {error && (
              <div style={{ borderRadius: 12, padding: '12px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 13, marginBottom: 12 }}>
                ⚠ {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ flex: 1, padding: '15px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#888', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading || !vehicleType}
                style={{ flex: 2, padding: '15px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #00c853, #00897b)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading || !vehicleType ? 0.7 : 1, boxShadow: '0 8px 32px rgba(0,200,83,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {loading ? (
                  <>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
                    Registering…
                  </>
                ) : 'Register as Captain →'}
              </button>
            </div>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#444' }}>
          Already have an account?{' '}
          <Link to="/captain-login" style={{ color: '#00c853', fontWeight: 700, textDecoration: 'none' }}>Log in</Link>
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #080c10 inset !important;
          -webkit-text-fill-color: #fff !important;
        }
      `}</style>
    </div>
  );
};

export default CaptainSignup;