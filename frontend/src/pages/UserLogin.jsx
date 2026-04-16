import React, { useState } from "react";
import { Link } from "react-router-dom";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white">
      <div className="w-full max-w-sm">

        <h1 className="text-3xl font-bold mb-8">Red Ride User</h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          <input
            type="email"
            placeholder="Email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn-black">Login</button>
        </form>

        <p className="mt-4 text-sm">
          New here? <Link to="/signup" className="text-blue-500">Signup</Link>
        </p>

        <Link to="/captain-login" className="btn-yellow mt-6">
          Sign in as Captain
        </Link>

      </div>
    </div>
  );
};

export default UserLogin;