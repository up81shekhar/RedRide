import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CaptainLogin = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [CaptainData, setCaptainData] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setCaptainData({ email, password });
    console.log(CaptainData);
    setEmail('');
    setPassword('');
  };

  const handleUserLogin = () => {
    console.log('User Login Clicked');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Red Ride Captain</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Email */}
          <div>
            
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              className="w-full px-4 py-4 bg-gray-100 border-none rounded-lg text-base placeholder:text-gray-500 focus:outline-none focus:bg-white transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              required
              className="w-full px-4 py-4 bg-gray-100 border-none rounded-lg text-base placeholder:text-gray-500 focus:outline-none focus:bg-white transition-colors"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-4 rounded-lg text-base transition-colors"
          >
            Login as Captain
          </button>

        </form>

        {/* New here */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Want join a fleet?{' '}
          <Link to={'/captain-signup'} className="text-blue-600 font-medium hover:underline">
            Register as Captain
          </Link>
        </p>

        {/* User Button */}
        <Link
          to="/login"
          type="button"
          onClick={handleUserLogin}
          className="w-full mt-8 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-4 rounded-lg text-base transition-colors flex items-center justify-center gap-2"
        >
          Sign in as User
        </Link>

      </div>
    </div>
  );
};

export default CaptainLogin;