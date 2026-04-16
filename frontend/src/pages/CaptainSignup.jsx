import React, { useState } from "react";
import { Link } from "react-router-dom";

const CaptainSignup = () => {
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [vehicle, setVehicle] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ firstName, lastName, email, password, vehicle });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">

        <h1 className="text-3xl font-bold mb-8">Red Ride Captain</h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="flex gap-3">
            <input className="input" placeholder="First name" onChange={(e)=>setFirst(e.target.value)} />
            <input className="input" placeholder="Last name" onChange={(e)=>setLast(e.target.value)} />
          </div>

          <input className="input" placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />
          <input className="input" placeholder="Password" type="password" onChange={(e)=>setPassword(e.target.value)} />
          <input className="input" placeholder="Vehicle details" onChange={(e)=>setVehicle(e.target.value)} />

          <button className="btn-black">Register as Captain</button>
        </form>

        <p className="mt-4 text-sm">
          Already have account? <Link to="/captain-login">Login</Link>
        </p>

      </div>
    </div>
  );
};

export default CaptainSignup;