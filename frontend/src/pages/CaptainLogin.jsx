import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { CaptainDataContext } from "../context/CaptainContext";

const CaptainLogin = () => {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const navigate = useNavigate();
  const { setCaptain } = useContext(CaptainDataContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/login`,
        { email, password }
      );
      if (response.status === 200) {
        setCaptain(response.data.captain);
        localStorage.setItem("captainToken", response.data.token);
        navigate("/captain-home");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Try again.");
    } finally {
      setLoading(false);
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #060d06 0%, #080c10 60%, #060d06 100%)' }}
    >
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,200,83,0.08) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,137,123,0.06) 0%, transparent 70%)' }}
        />
        {/* Grid pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(0,200,83,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,83,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 flex flex-col justify-center flex-1 px-6 py-10 max-w-sm mx-auto w-full">

        {/* Logo */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-8">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #00c853, #00897b)', boxShadow: '0 8px 32px rgba(0,200,83,0.25)' }}
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
              </svg>
            </div>
            <div>
              <p className="text-xl font-black text-white leading-none tracking-tight">CAPTAIN</p>
              <p className="text-[10px] font-bold uppercase tracking-[3px] mt-0.5" style={{ color: '#00c853' }}>Driver Portal</p>
            </div>
          </div>

          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-4"
            style={{ background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.2)' }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#00c853' }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#00c853' }}>Captain Login</span>
          </div>

          <h1 className="text-3xl font-black text-white leading-tight">Welcome<br />back, Captain</h1>
          <p className="mt-2 text-sm" style={{ color: '#555' }}>Sign in to start accepting rides</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#555' }}>
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                <svg viewBox="0 0 24 24" className="w-4 h-4" style={{ fill: '#444' }}>
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <input
                type="email"
                placeholder="captain@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl pl-10 pr-4 py-3.5 text-sm text-white outline-none transition"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  caretColor: '#00c853',
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(0,200,83,0.4)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#555' }}>
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                <svg viewBox="0 0 24 24" className="w-4 h-4" style={{ fill: '#444' }}>
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </div>
              <input
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl pl-10 pr-4 py-3.5 text-sm text-white outline-none transition"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  caretColor: '#00c853',
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(0,200,83,0.4)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>
          </div>

          {error && (
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
            >
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-4 font-black text-sm transition-all active:scale-[0.98] disabled:opacity-60 mt-2"
            style={{
              background: 'linear-gradient(135deg, #00c853, #00897b)',
              color: '#fff',
              boxShadow: '0 8px 32px rgba(0,200,83,0.3)',
            }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                Login as Captain
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <span className="text-xs" style={{ color: '#444' }}>or</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* Switch to user */}
        <Link
          to="/login"
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#888' }}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" style={{ fill: '#555' }}>
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
          Continue as Rider instead
        </Link>

        <p className="text-center text-xs mt-5" style={{ color: '#444' }}>
          New captain?{" "}
          <Link to="/captain-signup" style={{ color: '#00c853', fontWeight: 700 }}>Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default CaptainLogin;