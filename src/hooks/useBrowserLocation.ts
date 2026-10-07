import { useCallback, useEffect, useState } from 'react';
import { findClosestIndianCity } from '../data/indianLocations';

export interface BrowserLocation {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  area: string;
}

const geolocationOptions: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 15000,
};

const resolveLocationLocally = (lat: number, lng: number): BrowserLocation => {
  const nearestCity = findClosestIndianCity(lat, lng);
  return {
    lat,
    lng,
    address: `GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    city: nearestCity.name,
    state: nearestCity.state,
    area: '',
  };
};

export const useBrowserLocation = () => {
  const [location, setLocation] = useState<BrowserLocation | null>(null);
  const [gpsStatus, setGpsStatus] = useState('Waiting for GPS...');

  const publishCoordinates = useCallback((lat: number, lng: number) => {
    const nextLocation = resolveLocationLocally(lat, lng);
    setLocation(nextLocation);
    setGpsStatus('GPS available');
    console.log('GPS RECEIVED:', lat, lng);
  }, []);

  const refreshLocation = useCallback((): Promise<BrowserLocation> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          publishCoordinates(lat, lng);
          resolve(resolveLocationLocally(lat, lng));
        },
        (error) => {
          setLocation(null);
          setGpsStatus(`GPS unavailable: ${error.message}`);
          reject(error);
        },
        geolocationOptions
      );
    });
  }, [publishCoordinates]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('GPS unavailable: geolocation is not supported');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        publishCoordinates(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        setLocation(null);
        setGpsStatus(`GPS unavailable: ${error.message}`);
        console.warn('GPS watch error:', error);
      },
      geolocationOptions
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [publishCoordinates]);

  return { location, gpsStatus, refreshLocation };
};
