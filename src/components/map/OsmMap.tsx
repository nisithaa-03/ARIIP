import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Crosshair,
  Plus,
  Minus,
  Droplet,
  Radio,
  Lightbulb,
  Building,
  Target,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  MoreHorizontal,
  Map as MapIcon,
  Layers,
  Compass
} from 'lucide-react';
import { Incident } from '../../types/infrastructure';
import { CityInfo, DEFAULT_INDIAN_CITY } from '../../data/indianLocations';

interface OsmMapProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  openIssuesCount?: number;
  criticalCount?: number;
  inProgressCount?: number;
  resolvedCount?: number;
  currentCityInfo?: CityInfo;
  isAllIndia?: boolean;
}

export type MapStyleType = 'dark-blue' | 'google-roads' | 'satellite' | 'osm';

export const OsmMap: React.FC<OsmMapProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  activeCategory,
  onSelectCategory,
  openIssuesCount = 24,
  criticalCount = 6,
  inProgressCount = 12,
  resolvedCount = 18,
  currentCityInfo = DEFAULT_INDIAN_CITY,
  isAllIndia = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [mapStyle, setMapStyle] = useState<MapStyleType>('dark-blue');
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Initialize Map centered on Bengaluru Urban Corridor
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Center map on currently selected city or all-India
    const initialCenter: [number, number] = isAllIndia
      ? [22.5, 79.5]
      : [currentCityInfo.lat, currentCityInfo.lng];
    const initialZoom = isAllIndia ? 5 : (currentCityInfo.zoom || 12.8);

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomSnap: 0.1,
      zoomDelta: 0.5,
      minZoom: 4,
      maxZoom: 20,
      zoomControl: false,
      attributionControl: false,
    });

    // Default tile layer: Google Maps Roadmap with Dark Blue filter
    const initialTiles = L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 20,
        className: 'leaflet-tile-google-dark',
      }
    );
    initialTiles.addTo(map);
    tileLayerRef.current = initialTiles;

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;
    setMapReady(true);

    // ResizeObserver ensures map expands to 100% dimensions when layout renders
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    // Initial size invalidations to handle fast transitions
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 400);
    const t3 = setTimeout(() => map.invalidateSize(), 1000);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Layer Style Changes (Dark Blue, Google Roads, Google Satellite, OpenStreetMap)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    let className = 'leaflet-tile-osm-dark';
    let maxZoom = 19;

    if (mapStyle === 'google-roads') {
      url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      className = 'leaflet-tile-google-roads';
      maxZoom = 20;
    } else if (mapStyle === 'satellite') {
      url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      className = 'leaflet-tile-google-satellite';
      maxZoom = 20;
    } else if (mapStyle === 'osm') {
      url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      className = 'leaflet-tile-osm-dark';
      maxZoom = 19;
    } else {
      // Default: Google Maps in Dark Blue Mode
      url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      className = 'leaflet-tile-osm-dark';
      maxZoom = 19;
    }

    const newTiles = L.tileLayer(url, {
      maxZoom,
      className,
    });
    newTiles.addTo(map);
    tileLayerRef.current = newTiles;
  }, [mapStyle]);

  // Handle City or Nationwide Switch with smooth flyTo
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (isAllIndia) {
      map.flyTo([22.5, 79.5], 5.0, { duration: 1.2 });
    } else if (currentCityInfo) {
      map.flyTo([currentCityInfo.lat, currentCityInfo.lng], currentCityInfo.zoom || 12.8, {
        duration: 1.0,
      });
    }
  }, [currentCityInfo?.name, isAllIndia]);

  // Update Markers matching the screenshot pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // 1. Render Current User Location Radar at City Center
    const blueRadarHtml = `
      <div class="relative flex items-center justify-center" style="width: 70px; height: 70px;">
        <div class="absolute w-16 h-16 rounded-full bg-blue-500/20 radar-ring"></div>
        <div class="absolute w-12 h-12 rounded-full bg-blue-500/30 border border-blue-400/50"></div>
        <div class="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center">
          <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
        </div>
      </div>
    `;
    const radarIcon = L.divIcon({
      className: 'city-radar',
      html: blueRadarHtml,
      iconSize: [70, 70],
      iconAnchor: [35, 35],
    });
    L.marker([currentCityInfo.lat, currentCityInfo.lng], {
      icon: radarIcon,
      interactive: false,
    }).addTo(markersGroup);

    // 2. Filter incidents based on category pill
    const filtered = incidents.filter((inc) => {
      if (activeCategory === 'All') return true;
      if (activeCategory === 'Pothole') return inc.type === 'pothole';
      if (activeCategory === 'Manhole') return inc.type === 'manhole';
      if (activeCategory === 'Waterlogging') return inc.type === 'waterlogging';
      if (activeCategory === 'Signal') return inc.type === 'signal';
      if (activeCategory === 'Streetlight') return inc.type === 'streetlight';
      return true;
    });

    // 3. Render Drop Pins with realistic hazard indicators
    filtered.forEach((incident) => {
      const isSelected = selectedIncident?.id === incident.id;

      // Color scheme for pins
      let pinColor = '#EF4444'; // Red default
      let iconType: 'exclamation' | 'check' | 'landmark' = 'exclamation';

      if (incident.severity === 'critical') {
        pinColor = '#EF4444'; // Red
      } else if (incident.severity === 'high') {
        pinColor = '#F97316'; // Orange
        if (incident.type === 'manhole' && incident.location.district.includes('Whitefield')) {
          pinColor = '#8B5CF6'; // Purple for the Whitefield manhole
          iconType = 'landmark';
        }
      } else if (incident.severity === 'medium') {
        pinColor = '#EAB308'; // Yellow
      } else if (incident.severity === 'resolved') {
        pinColor = '#10B981'; // Green
        iconType = 'check';
      }

      // Teardrop shape matching screenshot
      const markerHtml = `
        <div class="relative flex flex-col items-center justify-center cursor-pointer transition-transform duration-200 ${
          isSelected ? 'scale-125 z-50 pulse-critical' : 'hover:scale-110 z-20'
        }" style="width: 38px; height: 46px;">
          <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 10px rgba(0,0,0,0.7));">
            <path d="M18 42C18 42 34 26 34 17C34 7.6 26.8 0 18 0C9.2 0 2 7.6 2 17C2 26 18 42 18 42Z" fill="${pinColor}" stroke="${
        isSelected ? '#FFFFFF' : 'rgba(0,0,0,0.3)'
      }" stroke-width="${isSelected ? '2.5' : '1'}"/>
            <circle cx="18" cy="17" r="13" fill="${pinColor}" />
          </svg>
          <div class="absolute top-[8px] flex items-center justify-center text-white font-bold text-xs pointer-events-none">
            ${
              iconType === 'check'
                ? `<svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
                : iconType === 'landmark'
                ? `<svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M4 18h16M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 3L2 9h20L12 3z"></path></svg>`
                : `<span style="font-size: 15px; font-weight: 800; font-family: sans-serif; line-height: 1;">!</span>`
            }
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'ariip-pin-marker',
        html: markerHtml,
        iconSize: [38, 46],
        iconAnchor: [19, 44],
      });

      const marker = L.marker([incident.location.lat, incident.location.lng], {
        icon: customIcon,
        title: `${incident.title} - ${incident.location.street}`,
      });

      // Interactive popup with real Google Street View hazard preview
      const popupHtml = `
        <div style="width: 220px; font-family: Inter, -apple-system, sans-serif; background: #111827; border: 1px solid #2A364A; border-radius: 12px; overflow: hidden; box-shadow: 0 12px 28px rgba(0,0,0,0.8);">
          <div style="height: 105px; position: relative; overflow: hidden; background: #0B1220;">
            <img src="${incident.imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="" />
            <div style="position: absolute; top: 6px; left: 6px; padding: 2px 6px; border-radius: 4px; background: rgba(0,0,0,0.8); font-size: 9px; color: #fff; font-weight: 600; display: flex; align-items: center; gap: 4px; border: 1px solid rgba(255,255,255,0.2);">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: #34d399;"></span>
              Google Street View
            </div>
            <div style="position: absolute; bottom: 6px; right: 6px; padding: 2px 6px; border-radius: 4px; background: rgba(0,0,0,0.85); font-size: 9px; color: ${pinColor}; font-weight: 700; text-transform: uppercase;">
              ${incident.severity}
            </div>
          </div>
          <div style="padding: 10px;">
            <div style="font-weight: 700; color: #fff; font-size: 12px; margin-bottom: 2px;">${incident.title}</div>
            <div style="color: #94a3b8; font-size: 11px; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${incident.location.address}</div>
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: #60a5fa; font-weight: 600; border-top: 1px solid #1f293d; padding-top: 6px;">
              <span style="font-family: monospace; color: #94a3b8;">${incident.ticketNumber}</span>
              <span style="color: #3b82f6;">Inspect &rarr;</span>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: false,
        className: 'ariip-map-popup',
        offset: [0, -36],
      });

      marker.on('click', () => {
        onSelectIncident(incident);
      });

      marker.addTo(markersGroup);
    });
  }, [incidents, selectedIncident, activeCategory, onSelectIncident]);

  // Smooth pan to selected incident
  useEffect(() => {
    if (!selectedIncident || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(
      [selectedIncident.location.lat, selectedIncident.location.lng],
      13.8,
      { duration: 0.8 }
    );
  }, [selectedIncident?.id]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleLocateMe = () => {
    mapInstanceRef.current?.flyTo(
      [currentCityInfo.lat, currentCityInfo.lng],
      currentCityInfo.zoom || 13.0,
      { duration: 0.8 }
    );
  };

  const categories = [
    { id: 'All', label: 'All', icon: null },
    { id: 'Pothole', label: 'Pothole', icon: Target, iconColor: 'text-red-400' },
    { id: 'Manhole', label: 'Manhole', icon: Building, iconColor: 'text-purple-400' },
    { id: 'Waterlogging', label: 'Waterlogging', icon: Droplet, iconColor: 'text-blue-400' },
    { id: 'Signal', label: 'Signal', icon: Radio, iconColor: 'text-amber-400' },
    { id: 'Streetlight', label: 'Streetlight', icon: Lightbulb, iconColor: 'text-yellow-400' },
    { id: 'Others', label: 'Others', icon: MoreHorizontal, iconColor: 'text-slate-400' },
  ];

  return (
    <div className="relative w-full h-full min-h-[400px] bg-[#0B1220] overflow-hidden select-none">
      {/* Absolute Leaflet Map Canvas */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full z-0"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Floating Top Category Filter Bar */}
      <div className="absolute top-4 left-5 right-5 flex items-center gap-2 overflow-x-auto no-scrollbar pointer-events-auto z-20">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          const Icon = cat.icon;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shadow-md shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-blue-900/40 ring-1 ring-blue-400/50'
                  : 'bg-[#111827]/90 hover:bg-[#1A2332] text-slate-300 border border-[#2A364A] backdrop-blur-md'
              }`}
            >
              {Icon && <Icon className={`w-3.5 h-3.5 ${cat.iconColor || ''}`} />}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Map Zoom & Locate Controls */}
      <div className="absolute right-5 top-20 flex flex-col gap-3 pointer-events-auto z-20">
        {/* Zoom In/Out vertical pill */}
        <div className="bg-[#111827]/90 backdrop-blur-md border border-[#2A364A] rounded-xl flex flex-col shadow-xl overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#1A2332] transition-colors border-b border-[#2A364A]"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#1A2332] transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Locate Button */}
        <button
          onClick={handleLocateMe}
          className="w-9 h-9 rounded-xl bg-[#111827]/90 backdrop-blur-md border border-[#2A364A] flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#1A2332] transition-colors shadow-xl"
          title="Center on Bengaluru Road Network"
        >
          <Crosshair className="w-4 h-4 text-blue-400" />
        </button>
      </div>

      {/* Bottom Left Map Style Switcher (Dark Blue, Google Roads, Satellite, OpenStreetMap) */}
      <div className="absolute bottom-5 left-5 flex items-center gap-2 pointer-events-auto z-20">
        <button
          onClick={() => setMapStyle('dark-blue')}
          className={`px-3 py-1.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all bg-[#111827]/90 backdrop-blur-md shadow-xl ${
            mapStyle === 'dark-blue'
              ? 'border-blue-500 ring-2 ring-blue-500/40 text-white'
              : 'border-[#2A364A] text-slate-400 hover:text-slate-200'
          }`}
          title="Google Maps Dark Blue Theme"
        >
          <div className="w-10 h-7 rounded bg-[#0B1220] mb-1 overflow-hidden flex items-center justify-center border border-blue-900/60">
            <div className="w-full h-full bg-gradient-to-br from-blue-950 to-slate-900 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            </div>
          </div>
          <span className="text-[10px] font-semibold">Dark Blue</span>
        </button>

        <button
          onClick={() => setMapStyle('google-roads')}
          className={`px-3 py-1.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all bg-[#111827]/90 backdrop-blur-md shadow-xl ${
            mapStyle === 'google-roads'
              ? 'border-blue-500 ring-2 ring-blue-500/40 text-white'
              : 'border-[#2A364A] text-slate-400 hover:text-slate-200'
          }`}
          title="Google Roadmap Full Colors"
        >
          <div className="w-10 h-7 rounded bg-[#1A2332] mb-1 overflow-hidden flex items-center justify-center border border-slate-700/60">
            <div className="w-full h-full bg-gradient-to-br from-emerald-900/60 to-slate-900" />
          </div>
          <span className="text-[10px] font-semibold">Roads</span>
        </button>

        <button
          onClick={() => setMapStyle('satellite')}
          className={`px-3 py-1.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all bg-[#111827]/90 backdrop-blur-md shadow-xl ${
            mapStyle === 'satellite'
              ? 'border-blue-500 ring-2 ring-blue-500/40 text-white'
              : 'border-[#2A364A] text-slate-400 hover:text-slate-200'
          }`}
          title="Google Satellite & Street Hybrid"
        >
          <div className="w-10 h-7 rounded bg-[#1A2332] mb-1 overflow-hidden flex items-center justify-center border border-slate-700/60">
            <div className="w-full h-full bg-gradient-to-br from-sky-900/60 to-slate-950" />
          </div>
          <span className="text-[10px] font-semibold">Satellite</span>
        </button>

        <button
          onClick={() => setMapStyle('osm')}
          className={`px-3 py-1.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all bg-[#111827]/90 backdrop-blur-md shadow-xl ${
            mapStyle === 'osm'
              ? 'border-blue-500 ring-2 ring-blue-500/40 text-white'
              : 'border-[#2A364A] text-slate-400 hover:text-slate-200'
          }`}
          title="OpenStreetMap Dark Cartography"
        >
          <div className="w-10 h-7 rounded bg-[#1A2332] mb-1 overflow-hidden flex items-center justify-center border border-slate-700/60">
            <div className="w-full h-full bg-gradient-to-br from-indigo-900/60 to-slate-950" />
          </div>
          <span className="text-[10px] font-semibold">OSM</span>
        </button>
      </div>

      {/* Bottom Center Floating Summary Stats Bar */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-auto z-20 hidden md:block">
        <div className="bg-[#111827]/90 backdrop-blur-md border border-[#2A364A] rounded-2xl px-6 py-2.5 shadow-2xl flex items-center gap-7">
          {/* Stat 1: Open Issues */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-950/40 border border-red-800/40 flex items-center justify-center text-red-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-white font-mono leading-none">{openIssuesCount}</p>
              <p className="text-[10px] text-slate-400 leading-none mt-1">Open Issues</p>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-[#2A364A]" />

          {/* Stat 2: Critical */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-950/40 border border-red-800/40 flex items-center justify-center text-red-500">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-white font-mono leading-none">{criticalCount}</p>
              <p className="text-[10px] text-slate-400 leading-none mt-1">Critical</p>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-[#2A364A]" />

          {/* Stat 3: In Progress */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-950/40 border border-amber-800/40 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-white font-mono leading-none">{inProgressCount}</p>
              <p className="text-[10px] text-slate-400 leading-none mt-1">In Progress</p>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-[#2A364A]" />

          {/* Stat 4: Resolved */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-white font-mono leading-none">{resolvedCount}</p>
              <p className="text-[10px] text-slate-400 leading-none mt-1">Resolved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
