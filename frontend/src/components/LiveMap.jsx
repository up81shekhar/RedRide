import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon paths (broken in bundlers)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const redIcon = L.divIcon({
  html: `<div style="
    width:16px;height:16px;border-radius:50%;
    background:#ef4444;
    border:3px solid #fff;
    box-shadow:0 0 0 2px #ef4444,0 2px 8px rgba(0,0,0,0.4);
  "></div>`,
  className: '',
  iconAnchor: [8, 8],
});

const greenIcon = L.divIcon({
  html: `<div style="
    width:16px;height:16px;border-radius:50%;
    background:#10b981;
    border:3px solid #fff;
    box-shadow:0 0 0 2px #10b981,0 2px 8px rgba(0,0,0,0.4);
  "></div>`,
  className: '',
  iconAnchor: [8, 8],
});

const captainIcon = L.divIcon({
  html: `<div style="
    background:#dc2626;border-radius:50%;width:32px;height:32px;
    display:flex;align-items:center;justify-content:center;
    border:3px solid #fff;
    box-shadow:0 0 0 3px rgba(220,38,38,0.4),0 4px 12px rgba(0,0,0,0.5);
    font-size:16px;
  ">🚗</div>`,
  className: '',
  iconAnchor: [16, 16],
});

/**
 * LiveMap — a vanilla-Leaflet map component (no react-leaflet dependency issues)
 *
 * Props:
 *   userLocation   : { lat, lng }
 *   captainLocation: { lat, lng } | null
 *   pickupCoord    : { lat, lng } | null
 *   destCoord      : { lat, lng } | null
 *   showRoute      : boolean
 *   style          : object (CSS)
 */
const LiveMap = ({
  userLocation,
  captainLocation,
  pickupCoord,
  destCoord,
  showRoute = false,
  style = {},
}) => {
  const containerRef  = useRef(null);
  const mapRef        = useRef(null);
  const userMarkerRef    = useRef(null);
  const captainMarkerRef = useRef(null);
  const pickupMarkerRef  = useRef(null);
  const destMarkerRef    = useRef(null);
  const routeLineRef     = useRef(null);

  // Initialise map once
  useEffect(() => {
    if (mapRef.current) return;
    const center = userLocation
      ? [userLocation.lat, userLocation.lng]
      : [20.5937, 78.9629]; // India fallback

    mapRef.current = L.map(containerRef.current, {
      center,
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(mapRef.current);

    // Small attribution
    L.control.attribution({ prefix: '© OSM' }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Update user marker
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: greenIcon })
        .addTo(mapRef.current)
        .bindPopup('Your location');
      mapRef.current.setView([userLocation.lat, userLocation.lng], 14);
    }
  }, [userLocation]);

  // Update captain marker
  useEffect(() => {
    if (!mapRef.current) return;
    if (!captainLocation) {
      captainMarkerRef.current?.remove();
      captainMarkerRef.current = null;
      return;
    }
    if (captainMarkerRef.current) {
      captainMarkerRef.current.setLatLng([captainLocation.lat, captainLocation.lng]);
    } else {
      captainMarkerRef.current = L.marker([captainLocation.lat, captainLocation.lng], {
        icon: captainIcon,
      }).addTo(mapRef.current).bindPopup('Captain');
    }
  }, [captainLocation]);

  // Pickup / destination markers
  useEffect(() => {
    if (!mapRef.current) return;
    pickupMarkerRef.current?.remove();
    if (pickupCoord) {
      pickupMarkerRef.current = L.marker([pickupCoord.lat, pickupCoord.lng], { icon: greenIcon })
        .addTo(mapRef.current)
        .bindPopup('Pickup');
    }
  }, [pickupCoord]);

  useEffect(() => {
    if (!mapRef.current) return;
    destMarkerRef.current?.remove();
    if (destCoord) {
      destMarkerRef.current = L.marker([destCoord.lat, destCoord.lng], { icon: redIcon })
        .addTo(mapRef.current)
        .bindPopup('Destination');
    }
  }, [destCoord]);

  // Draw route between pickup and destination
  useEffect(() => {
    if (!mapRef.current) return;
    routeLineRef.current?.remove();
    routeLineRef.current = null;

    if (!showRoute || !pickupCoord || !destCoord) return;

    // Fetch route from OSRM
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${pickupCoord.lng},${pickupCoord.lat};${destCoord.lng},${destCoord.lat}` +
      `?overview=full&geometries=geojson`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (!mapRef.current || data.code !== 'Ok') return;
        const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        routeLineRef.current = L.polyline(coords, {
          color: '#ef4444',
          weight: 4,
          opacity: 0.85,
          dashArray: '8 4',
        }).addTo(mapRef.current);

        mapRef.current.fitBounds(routeLineRef.current.getBounds(), { padding: [40, 40] });
      })
      .catch(() => {});
  }, [showRoute, pickupCoord, destCoord]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 'inherit',
        ...style,
      }}
    />
  );
};

export default LiveMap;
