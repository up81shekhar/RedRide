import React from "react";

const LocationSearchPanel = (promps) => {
  console.log(promps);
  
  const locations = [
    "Kunwar Nagar Colony, Aligarh",
    "Noida Airport Terminal 1",
    "Kunwar Nagar Colony, Aligarh",
    "Greater Noida West",
  ];

  return (
    <div onClick={() => {
      promps.setVehiclePanel(true)
      promps.setPanelOpen(false)
      }} className="w-full px-3 py-2  text-white max-h-[50vh] overflow-y-auto">

      {locations.map((element, index) => (
        <div
          key={index}
          className="flex active:border-2 items-center gap-3 
          px-3 py-2 
          rounded-xl cursor-pointer
          hover:bg-zinc-800/60 
          transition mb-2"
        >

          {/* Icon */}
          <div className="flex items-center justify-center 
          w-9 h-9 rounded-lg 
          bg-zinc-800 text-zinc-300">
            <i className="fa-solid fa-location-dot text-sm"></i>
          </div>

          {/* Text */}
          <div className="flex flex-col leading-tight">
            <p className="text-xs text-zinc-500">
              Suggested
            </p>
            <h4 className="text-sm font-medium">
              {element}
            </h4>
          </div>

        </div>
      ))}

    </div>
  );
};

export default LocationSearchPanel;