import React, { useState } from 'react';
import {

  Plus,
  Eye,
  ChevronRight,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Navigation,
  Globe2
} from 'lucide-react';
import indianManholeImg from '../../assets/images/indian_open_manhole_1790739733586.jpg';
import indianPotholeImg from '../../assets/images/indian_road_pothole_1790739714987.jpg';
import indianWaterlogImg from '../../assets/images/indian_road_waterlog_1790739755508.jpg';
import indianCrackImg from '../../assets/images/indian_road_crack_1790739780245.jpg';
import indianSignalImg from '../../assets/images/indian_traffic_signal_1790739797320.jpg';
import indianDividerImg from '../../assets/images/indian_road_divider_1790740026519.jpg';
import indianOpenDrainImg from '../../assets/images/indian_open_drain_1790740040367.jpg';
import { Incident } from '@/src/types/infrastructure';

interface MyComplaintsViewProps {
  incidents: Incident[];
  onViewComplaint: (complaintId: string) => void;
  onNewComplaint: () => void;
  selectedCity: string;
  selectedState: string;
  isAllIndia: boolean;
}

export const MyComplaintsView: React.FC<MyComplaintsViewProps> = ({
  incidents,
  onViewComplaint,
  onNewComplaint,
  selectedCity = 'Bengaluru',
  selectedState = 'Karnataka',
  isAllIndia = false,
}) => {
  console.log("MyComplaints incidents:", incidents);
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'progress' | 'resolved'>('all');

  // Storing country, state, city, lat, and lng for every complaint
  const allComplaints = (incidents || []).map((incident) => ({
  id: incident.ticketNumber,
  image: incident.imageUrl,

  issueType: incident.title,

  street: incident.location.address,
  district: incident.location.district,

  city: incident.location.city,
  state: incident.location.state,
  country: "India",

  status: incident.status,

  statusColor:
    incident.status === "resolved"
      ? "text-emerald-400 bg-emerald-400/10 border-emerald-500/30"
      : incident.status === "verification"
      ? "text-purple-400 bg-purple-400/10 border-purple-500/30"
      : incident.status === "assigned"
      ? "text-amber-400 bg-amber-400/10 border-amber-500/30"
      : "text-blue-400 bg-blue-400/10 border-blue-500/30",

  category:
    incident.status === "resolved"
      ? "resolved"
      : incident.status === "assigned"
      ? "open"
      : "progress",

  priority: incident.severity,

  department: incident.department,

  lat: incident.location.lat,
  lng: incident.location.lng,

  date: "Recently Reported",
}));
console.log("incidents prop =", incidents);
console.log("allComplaints =", allComplaints);
  // Location filter: nationwide or current city
  const cityComplaints = allComplaints;
  console.log("incidents prop:", incidents);
  console.log("allComplaints", allComplaints);
console.log("selectedCity", selectedCity);
console.log("selectedState", selectedState);
console.log("cityComplaints", cityComplaints);
  
  console.log("MyComplaints incidents:", incidents);
  console.log("All complaints:", allComplaints);
console.log("Selected city:", selectedCity);
console.log("Selected state:", selectedState);
console.log("cityComplaints", cityComplaints);

  const filtered = cityComplaints.filter((c) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'open') return c.category === 'open';
    if (activeTab === 'progress') return c.category === 'progress';
    if (activeTab === 'resolved') return c.category === 'resolved';
    return true;
  });

  return (
    <div className="flex-1 bg-[#0B1220] flex flex-col h-[calc(100vh-4rem)] overflow-y-auto select-none p-6 lg:p-8 space-y-6">
      {/* Header with Location indicator */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white tracking-tight">My Hazard Complaints</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-950/60 border border-blue-800/40 text-blue-300 text-[11px] font-semibold flex items-center gap-1">
              <Globe2 className="w-3 h-3 text-emerald-400" />
              {isAllIndia ? 'All India (Nationwide)' : `${selectedCity}, ${selectedState}`}
            </span>
          </div>
          <p className="text-xs text-[#94A3B8]">
            Track municipal inspection, crew assignment, and repair status with authentic Indian road hazard evidence and GPS coordinates.
          </p>
        </div>

        <button
          onClick={onNewComplaint}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-900/40 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Hazard</span>
        </button>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-[#2A364A] pb-3">
        {(['all', 'open', 'progress', 'resolved'] as const).map((tab) => {
          const count =
            tab === 'all'
              ? cityComplaints.length
              : cityComplaints.filter((c) => c.category === tab).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === tab
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/30'
                  : 'bg-[#1A2332] text-[#94A3B8] hover:text-white border border-[#2A364A]'
              }`}
            >
              <span className="capitalize">{tab === 'progress' ? 'In Progress' : tab}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab ? 'bg-blue-700 text-white' : 'bg-[#111827] text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Complaints List Cards */}
      <div className="space-y-3">
        {filtered.map((c) => (
          <div
            key={c.id}
            onClick={() => onViewComplaint(c.id)}
            className="p-4 rounded-2xl bg-[#1A2332] border border-[#2A364A] hover:border-[#3B82F6] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group shadow-lg"
          >
            {/* Left: Real Indian Hazard Photo + Info */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#0B1220] border border-[#2A364A] relative shrink-0">
                <img
                  src={c.image}
                  alt={c.issueType}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] text-white font-mono">
                  {c.priority}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-400">{c.id}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${c.statusColor}`}>
                    {c.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                  {c.issueType}
                </h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#94A3B8]">
                  <span className="flex items-center gap-1 text-slate-300 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    {c.street}, {c.district}
                  </span>
                  <span className="text-blue-400 font-semibold">
                    {c.city}, {c.state} ({c.country})
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                    <Navigation className="w-3 h-3 text-emerald-400" />
                    {c.lat.toFixed(4)}, {c.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Date, Department, and Action */}
            <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#2A364A]">
              <div className="text-left sm:text-right text-xs">
                <span className="text-[#94A3B8] block">{c.department}</span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 sm:justify-end mt-0.5">
                  <Clock className="w-3 h-3" />
                  {c.date}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewComplaint(c.id);
                }}
                className="w-9 h-9 rounded-xl bg-[#111827] border border-[#2A364A] text-slate-300 group-hover:text-white group-hover:border-blue-500 group-hover:bg-blue-600/20 flex items-center justify-center transition-all shrink-0"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-12 text-center text-[#94A3B8] rounded-2xl bg-[#1A2332] border border-[#2A364A]">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold text-white">No complaints in this category</p>
            <p className="text-xs text-[#94A3B8] mt-1">
              Select another tab or report a new hazard in {selectedCity}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
