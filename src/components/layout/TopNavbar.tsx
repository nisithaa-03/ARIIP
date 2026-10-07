import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Bell,
  Moon,
  Sun,
  ChevronDown,
  X,
  Clock,
  Sparkles,
  MapPin,
  Crosshair,
  Globe2,
  Check
} from 'lucide-react';
import { SystemNotification } from '../../types/infrastructure';
import {
  INDIAN_STATES,
  ALL_INDIAN_CITIES,
  CityInfo,
  findClosestIndianCity,
  getCitiesByState
} from '../../data/indianLocations';

interface TopNavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  notifications: SystemNotification[];
  onSelectIncident: (incidentId: string) => void;
  onMarkNotificationRead: (id: string) => void;
  onToggleFilterModal?: () => void;
  selectedCity: string;
  selectedState: string;
  onCityChange: (cityName: string, stateName: string) => void;
  isAllIndia: boolean;
  onToggleAllIndia: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  searchQuery,
  onSearchChange,
  notifications,
  onSelectIncident,
  onMarkNotificationRead,
  onToggleFilterModal,
  selectedCity,
  selectedState,
  onCityChange,
  isAllIndia,
  onToggleAllIndia,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [citySearchFilter, setCitySearchFilter] = useState('');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleAutoDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const nearest = findClosestIndianCity(pos.coords.latitude, pos.coords.longitude);
          onCityChange(nearest.name, nearest.state);
          setShowLocationPicker(false);
        },
        () => {
          // If denied, fallback to Bengaluru
          onCityChange('Bengaluru', 'Karnataka');
          setShowLocationPicker(false);
        }
      );
    }
  };

  const filteredCities = ALL_INDIAN_CITIES.filter((c) => {
    if (!citySearchFilter.trim()) return true;
    const q = citySearchFilter.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q);
  });

  return (
    <header className="h-16 px-6 py-3 flex items-center justify-between select-none bg-[#111827] relative z-40 border-b border-[#2A364A]">
      {/* Search Input Bar */}
      <div className="flex-1 max-w-2xl flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search hazard, complaint ID, road corridor, or area..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#1A2332] text-xs text-[#E5E7EB] placeholder:text-[#94A3B8] pl-10 pr-10 py-2.5 rounded-xl border border-[#2A364A] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Button */}
        <button
          onClick={onToggleFilterModal}
          className="w-10 h-10 rounded-xl bg-[#1A2332] border border-[#2A364A] flex items-center justify-center text-slate-300 hover:text-white hover:border-[#3B82F6] transition-colors shadow-sm"
          title="Filter Incidents"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Right Controls: Location Selector, Notifications, Theme */}
      <div className="flex items-center gap-3 ml-4">
        {/* Dynamic City & State Selector (Nationwide Architecture) */}
        <div className="relative">
          <button
            onClick={() => setShowLocationPicker(!showLocationPicker)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1A2332] border border-[#2A364A] hover:border-blue-500/50 text-xs text-white transition-all shadow-md cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold truncate max-w-[140px] sm:max-w-[180px]">
              {isAllIndia ? 'All India (Nationwide)' : `${selectedCity}, ${selectedState}`}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Location Picker Dropdown */}
          {showLocationPicker && (
            <div className="absolute right-0 mt-2 w-80 bg-[#1A2332] border border-[#2A364A] rounded-2xl shadow-2xl p-3 z-50 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#2A364A] text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Globe2 className="w-4 h-4 text-blue-400" />
                  Select City & State (All India)
                </span>
                <button
                  onClick={() => setShowLocationPicker(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Actions: Auto-Detect & Nationwide */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleAutoDetect}
                  className="p-2 rounded-xl bg-[#111827] border border-[#2A364A] hover:border-blue-500 text-blue-300 flex items-center justify-center gap-1.5 font-medium transition-colors"
                >
                  <Crosshair className="w-3.5 h-3.5 text-blue-400" />
                  <span>Auto-Detect</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onToggleAllIndia();
                    setShowLocationPicker(false);
                  }}
                  className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 font-medium transition-colors ${
                    isAllIndia
                      ? 'bg-blue-600 border-blue-500 text-white font-semibold'
                      : 'bg-[#111827] border-[#2A364A] hover:border-blue-500 text-slate-300'
                  }`}
                >
                  <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>All India</span>
                </button>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search city or state..."
                  value={citySearchFilter}
                  onChange={(e) => setCitySearchFilter(e.target.value)}
                  className="w-full bg-[#111827] text-white border border-[#2A364A] rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Cities list */}
              <div className="max-h-56 overflow-y-auto space-y-1 pr-1 text-xs">
                {filteredCities.map((city) => {
                  const isCurrent = !isAllIndia && selectedCity.toLowerCase() === city.name.toLowerCase();
                  return (
                    <button
                      key={`${city.state}-${city.name}`}
                      type="button"
                      onClick={() => {
                        onCityChange(city.name, city.state);
                        setShowLocationPicker(false);
                      }}
                      className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition-colors ${
                        isCurrent
                          ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300'
                          : 'hover:bg-[#111827] text-slate-300'
                      }`}
                    >
                      <div>
                        <span className="font-semibold text-white block">{city.name}</span>
                        <span className="text-[10px] text-slate-400">{city.state}</span>
                      </div>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bell with red badge */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-xl bg-[#1A2332] border border-[#2A364A] flex items-center justify-center text-slate-300 hover:text-white hover:border-[#3B82F6] transition-colors shadow-sm cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-[#111827]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#1A2332] border border-[#2A364A] rounded-2xl shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#2A364A] text-xs">
                <span className="font-semibold text-white">Notifications</span>
                <span className="text-[10px] bg-red-950 text-red-400 border border-red-800/40 px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} unread
                </span>
              </div>
              <div className="py-2 space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      onMarkNotificationRead(n.id);
                      if (n.incidentId) onSelectIncident(n.incidentId);
                      setShowNotifications(false);
                    }}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                      n.read
                        ? 'bg-[#111827]/40 border-transparent text-slate-400 hover:bg-[#111827]'
                        : 'bg-[#111827] border-blue-900/40 text-slate-200 hover:border-blue-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-white">{n.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="w-10 h-10 rounded-xl bg-[#1A2332] border border-[#2A364A] flex items-center justify-center text-slate-300 hover:text-white hover:border-[#3B82F6] transition-colors shadow-sm cursor-pointer"
          title="Theme Toggle"
        >
          {isDarkMode ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>
      </div>
    </header>
  );
};
