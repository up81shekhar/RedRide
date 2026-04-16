import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden">

      <img
        src="https://i.pinimg.com/736x/ab/6b/88/ab6b881ddfb5ddfbdfef82860d636fa9.jpg"
        className="absolute w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-red-900/50 to-black"></div>

      <div className="relative z-10 flex flex-col justify-between h-full p-6">

        {/* Logo */}
        <div>
          <h1 className="text-red-500 text-3xl font-bold">Red</h1>
          <h2 className="text-5xl text-white opacity-80 -mt-2 font-extrabold">
            Ride
          </h2>
        </div>

        {/* Bottom Card */}
        <div className="mb-6 backdrop-blur-md bg-black/30 p-5 rounded-2xl border border-white/10">
          <h2 className="text-3xl font-semibold text-white">
            Get started <br />
            with <span className="text-red-500 font-bold">Red Ride</span>
          </h2>

          <Link
            to="/login"
            className="mt-6 w-full flex items-center justify-center 
            bg-red-600 hover:bg-red-700 active:scale-95 
            text-white py-3 rounded-xl text-lg font-semibold 
            shadow-[0_8px_30px_rgba(255,0,0,0.3)] 
            transition-all"
          >
            Continue →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;