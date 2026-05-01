import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserDataContext } from "../context/UserContext";

const UserSignup = () => {
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { setUser } = React.useContext(UserDataContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newUser = {
      fullname: { firstname: firstName, lastname: lastName },
      email,
      password,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/register`,
        newUser
      );
      if (response.status === 201) {
        setUser(response.data.user);
        localStorage.setItem("token", response.data.token); // ✅ was data.token (bug fix)
        navigate("/home");
      }
    } catch (error) {
      console.log(error.response?.data);
    }

    setEmail("");
    setFirst("");
    setLast("");
    setPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5"
      style={{ background: "linear-gradient(160deg, #1a0505 0%, #0d0d0d 100%)" }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-7">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "#e02020" }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">RedRide</p>
            <p className="text-xs font-semibold tracking-widest mt-0.5"
              style={{ color: "#e02020", fontSize: "9px" }}>USER PORTAL</p>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-1">Create Account</h1>
        <p className="text-sm mb-6" style={{ color: "#888" }}>
          Join the ride & move smarter today
        </p>

        <form onSubmit={handleSubmit}>
          {/* Personal Info card */}
          <div className="rounded-2xl p-4 mb-4"
            style={{ background: "#161616", border: "0.5px solid #2c2c2c" }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full" style={{ background: "#e02020" }} />
              <span className="text-xs font-bold tracking-widest"
                style={{ color: "#e02020", letterSpacing: "1.8px" }}>PERSONAL INFO</span>
            </div>

            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#888" }}>
                  First Name
                </label>
                <input
                  className="w-full rounded-xl px-3 py-2.5 text-sm"
                  style={{ background: "#1f1f1f", border: "0.5px solid #333", color: "#ccc", outline: "none" }}
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirst(e.target.value)}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#888" }}>
                  Last Name
                </label>
                <input
                  className="w-full rounded-xl px-3 py-2.5 text-sm"
                  style={{ background: "#1f1f1f", border: "0.5px solid #333", color: "#ccc", outline: "none" }}
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLast(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#888" }}>
                Email Address
              </label>
              <input
                className="w-full rounded-xl px-3 py-2.5 text-sm"
                style={{ background: "#1f1f1f", border: "0.5px solid #333", color: "#ccc", outline: "none" }}
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#888" }}>
                Password
              </label>
              <input
                className="w-full rounded-xl px-3 py-2.5 text-sm"
                style={{ background: "#1f1f1f", border: "0.5px solid #333", color: "#ccc", outline: "none" }}
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-xl py-4 font-bold text-white text-sm mt-2"
            style={{ background: "#e02020" }}>
            Create Account
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
              style={{ background: "rgba(255,255,255,0.2)" }}>→</span>
          </button>
        </form>

        <p className="text-center text-xs mt-5" style={{ color: "#555" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#e02020", fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default UserSignup;