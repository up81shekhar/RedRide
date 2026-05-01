import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";
import axios from "axios";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useContext(UserDataContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/login`,
        { email, password }
      );
      if (response.status === 200) {
        setUser(response.data.user);
        localStorage.setItem("token", response.data.token);
        navigate("/home");
      }
    } catch (error) {
      console.log(error.response?.data);
    }
    setEmail("");
    setPassword("");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5"
      style={{ background: "#0d0d0d" }}
    >
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-7">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#e02020" }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">RedRide</p>
            <p className="font-bold tracking-widest mt-0.5" style={{ color: "#e02020", fontSize: "9px" }}>
              USER PORTAL
            </p>
          </div>
        </div>

        {/* Role badge */}
        <span className="inline-block font-bold tracking-widest uppercase rounded px-2 py-1 mb-3"
          style={{ color: "#e02020", background: "rgba(224,32,32,0.12)", fontSize: "10px", letterSpacing: "1px" }}>
          Rider
        </span>

        <h1 className="text-3xl font-bold text-white mb-1">Welcome back</h1>
        <p className="text-sm mb-6" style={{ color: "#777" }}>Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#666" }}>Email Address</label>
            <input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl px-3 py-3 text-sm"
              style={{ background: "#1f1f1f", border: "0.5px solid #333", color: "#ccc", outline: "none" }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#666" }}>Password</label>
            <input
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl px-3 py-3 text-sm"
              style={{ background: "#1f1f1f", border: "0.5px solid #333", color: "#ccc", outline: "none" }}
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-white text-sm mt-2"
            style={{ background: "#e02020" }}
          >
            Login
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
              style={{ background: "rgba(255,255,255,0.2)" }}>→</span>
          </button>
        </form>

        {/* Switch to Captain */}
        <Link
          to="/captain-login"
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold mt-3"
          style={{ background: "#1a1a1a", border: "0.5px solid #333", color: "#bbb" }}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" style={{ fill: "#888" }}>
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
          Sign in as Captain
        </Link>

        <p className="text-center text-xs mt-5" style={{ color: "#555" }}>
          New here?{" "}
          <Link to="/signup" style={{ color: "#e02020", fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default UserLogin;