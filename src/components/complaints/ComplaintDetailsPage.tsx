import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  Shield,
  Check,
  X,
  Camera,
  ExternalLink,
  Navigation,
  Globe2
} from 'lucide-react';
import { Incident } from '../../types/infrastructure';

interface ComplaintDetailsPageProps {
  incidentId: string;
  onBack: () => void;
  selectedIncident?: Incident | null;
}

export const ComplaintDetailsPage: React.FC<ComplaintDetailsPageProps> = ({
  incidentId,
  onBack,
  selectedIncident,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'details' | 'ai'>('timeline');
  const [currentStatus, setCurrentStatus] = useState(
  selectedIncident?.status || "created"
);
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);

  const mainImage = selectedIncident?.imageUrl || "";

const secondaryImage =
  selectedIncident?.galleryImages?.[1] ||
  selectedIncident?.imageUrl ||
  "";

const tertiaryImage =
  selectedIncident?.galleryImages?.[2] ||
  selectedIncident?.imageUrl ||
  "";
  const [zoomedImg, setZoomedImg] = useState<string>(mainImage);

  const handleOpenZoom = (img: string) => {
    setZoomedImg(img);
    setIsPhotoZoomed(true);
  };

  const loc = selectedIncident?.location || {
  address: "Location unavailable",
  street: "Unknown",
  district: "Unknown",
  city: "Unknown",
  state: "Unknown",
  country: "India",
  lat: 0,
  lng: 0,
  lane: "Unknown",

};
  const workflowSteps = [
  {
    key: "created",
    title: "Complaint Created",
    description: "Citizen reported hazard and AI classified it."
  },
  {
    key: "assigned",
    title: "Assigned to Department",
    description: "Incident assigned to responsible department."
  },
  {
    key: "in_progress",
    title: "Work In Progress",
    description: "Field crew dispatched and repair started."
  },
  {
    key: "verification",
    title: "Verification",
    description: "Repair completed and awaiting inspection."
  },
  {
    key: "resolved",
    title: "Resolved",
    description: "Issue verified and closed."
  }
];
const timelineSteps = [
  "created",
  "assigned",
  "in_progress",
  "verification",
  "resolved",
];

const updateStatus = async (
  incidentId: string,
  newStatus:  | "created"
    | "assigned"
    | "repair_started"
    | "verification"
    | "resolved"
) => {
  await fetch(
    `http://127.0.0.1:8000/incidents/${incidentId}/status?status=${newStatus}`,
    {
      method: "PUT",
    }
  );

  setCurrentStatus(newStatus);
};

const currentIndex = timelineSteps.indexOf(currentStatus);
  return (
    <div className="flex-1 bg-[#0B1220] flex flex-col h-[calc(100vh-4rem)] overflow-y-auto select-none p-6 lg:p-8 space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Complaints</span>
      </button>

      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-white tracking-tight">Complaint Evidence & Municipal Tracking</h1>
        <span className="text-xs font-mono text-blue-400 bg-blue-950/60 border border-blue-800/60 px-2.5 py-1 rounded-full">
          {incidentId || selectedIncident?.ticketNumber || 'ARIIP-2026-0143'}
        </span>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Real Indian Road Hazard Photo Gallery */}
        <div className="grid grid-cols-3 gap-3 h-80">
          {/* Main Large Photo */}
          <div
            onClick={() => handleOpenZoom(mainImage)}
            className="col-span-2 relative rounded-2xl overflow-hidden border border-[#2A364A] bg-[#1A2332] group cursor-pointer shadow-xl"
          >
            <img
              src={mainImage}
              alt="Indian Road Hazard Evidence"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-sm text-[11px] text-white font-medium flex items-center gap-1.5 border border-white/20 shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Verified Road Hazard Evidence
            </div>
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-sm text-[11px] text-blue-300 font-mono flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-blue-400" />
              Primary Inspection Angle • {loc.street}, {loc.city}
            </div>
          </div>

          {/* Right Column Thumbnails */}
          <div className="col-span-1 flex flex-col gap-3 h-full">
            <div
              onClick={() => handleOpenZoom(secondaryImage)}
              className="flex-1 relative rounded-2xl overflow-hidden border border-[#2A364A] bg-[#1A2332] group cursor-pointer shadow-md"
            >
              <img
                src={secondaryImage}
                alt="Second angle"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-slate-300">
                Pavement Angle #2
              </div>
            </div>

            <div
              onClick={() => handleOpenZoom(tertiaryImage)}
              className="flex-1 relative rounded-2xl overflow-hidden border border-[#2A364A] bg-[#1A2332] group cursor-pointer shadow-md"
            >
              <img
                src={tertiaryImage}
                alt="Macro texture view"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-slate-300">
                Macro Surface Detail
              </div>
            </div>
          </div>
        </div>

        {/* Right: Complaint Info Card & Coordinates */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold uppercase tracking-wider">
  {selectedIncident?.severity || "UNKNOWN"} Hazard
</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-semibold flex items-center gap-1">
                  <Globe2 className="w-3 h-3" />
                  {loc.city}, {loc.state}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {selectedIncident?.title || "Unknown Hazard"}
              </h2>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-[#94A3B8] block">Priority Score</span>
              <span className="text-lg font-bold font-mono text-red-400">
                {selectedIncident?.priorityScore ?? 0}/100
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#1A2332] border border-[#2A364A] space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-red-400 shrink-0" />
              <span className="font-semibold text-white">{loc.street}, {loc.district}</span>
            </div>
            <div className="text-slate-400 pl-6 space-y-0.5">
              <p>{loc.address}</p>
              <p className="flex items-center gap-2 font-mono text-emerald-400 text-[11px] pt-1">
                <Navigation className="w-3.5 h-3.5" />
                Latitude: {loc.lat.toFixed(5)}° N, Longitude: {loc.lng.toFixed(5)}° E ({loc.country})
              </p>
            </div>
            <div className="flex items-center gap-4 text-[#94A3B8] pt-2 border-t border-[#2A364A]">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-400" />
                {selectedIncident?.department || 'Unknown Department'}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {selectedIncident?.reportedTimeAgo || 'Recently'}
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-[#2A364A] pt-2">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`pb-2 text-xs font-semibold transition-colors cursor-pointer border-b-2 ${
                activeTab === 'timeline'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-[#94A3B8] hover:text-white'
              }`}
            >
              Timeline & Crew Status
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`pb-2 text-xs font-semibold transition-colors cursor-pointer border-b-2 ${
                activeTab === 'ai'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-[#94A3B8] hover:text-white'
              }`}
            >
              AI Diagnostics
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-2 text-xs font-semibold transition-colors cursor-pointer border-b-2 ${
                activeTab === 'details'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-[#94A3B8] hover:text-white'
              }`}
            >
              Hardware Details
            </button>
          </div>
            
          {/* Tab 1: Timeline */}
          {activeTab === "timeline" && (
  <div className="space-y-4 pt-2">

    <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#2A364A]">

      {workflowSteps.map((step, index) => {
        const currentIndex = workflowSteps.findIndex(
          s => s.key === currentStatus
        );

        const completed = index < currentIndex;
        const active = index === currentIndex;

        return (
          <div key={step.key} className="relative">
            {/* Existing timeline code */}
          </div>
        );
      })}

    </div>

    {/* STATUS ACTION BUTTONS */}
    <div className="flex flex-wrap gap-2 mt-6">

      <button
        onClick={() => {
  if (!selectedIncident?.id) return;
  updateStatus(selectedIncident.id, "assigned");
}}
        className="px-3 py-2 bg-blue-600 rounded-lg text-white text-sm"
      >
        Assign
      </button>

      <button
        onClick={() => {
  if (!selectedIncident?.id) return;
  updateStatus(selectedIncident.id, "repair_started");
}}
        className="px-3 py-2 bg-yellow-600 rounded-lg text-white text-sm"
      >
        Start Work
      </button>

      <button
      onClick={() => {
  if (!selectedIncident?.id) return;
  updateStatus(selectedIncident.id, "verification");
}}
        
        className="px-3 py-2 bg-purple-600 rounded-lg text-white text-sm"
      >
        Verification
      </button>

      <button
        onClick={() => {
  if (!selectedIncident?.id) return;
  updateStatus(selectedIncident.id, "resolved");
}}
        className="px-3 py-2 bg-green-600 rounded-lg text-white text-sm"
      >
        Resolve
      </button>

    </div>

  </div>
)}


          {/* Tab 2: AI Diagnostics */}
          {activeTab === 'ai' && (
            <div className="p-4 rounded-xl bg-[#1A2332] border border-[#2A364A] space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Hazard Classification</span>
                <span className="text-white font-bold">
                  {selectedIncident?.title || 'Hazard Detected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Accident Risk Probability</span>
                <span className="text-red-400 font-bold font-mono">
                  {selectedIncident?.priorityScore || 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Recommended Action</span>
                <span className="text-slate-300 font-medium text-right max-w-[240px]">
                  {selectedIncident?.aiInsights?.recommendedAction ||
                    'Repair action to be assigned by department.'}
                </span>
              </div>
            </div>
          )}

          {/* Tab 3: Hardware Details */}
          {activeTab === 'details' && (
            <div className="p-4 rounded-xl bg-[#1A2332] border border-[#2A364A] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Capture Device</span>
                <span className="text-slate-200">Municipal LiDAR & Optical Inspector</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Resolution</span>
                <span className="text-slate-200 font-mono">4032 x 3024 HDR</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Carriageway Lane</span>
                <span className="text-slate-200">{loc.lane || 'Main Carriageway'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox / Zoom Modal */}
      {isPhotoZoomed && (
        <div
          onClick={() => setIsPhotoZoomed(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden border border-white/20 bg-[#0B1220] shadow-2xl"
          >
            <button
              onClick={() => setIsPhotoZoomed(false)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={zoomedImg}
              alt="High-resolution evidence"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            <div className="p-4 bg-[#111827] border-t border-[#2A364A] flex items-center justify-between text-xs">
              <span className="text-white font-medium">
                High-Resolution Street-Level Evidence Photo • {loc.city}, {loc.state}
              </span>
              <span className="font-mono text-emerald-400">
                {loc.lat.toFixed(5)}° N, {loc.lng.toFixed(5)}° E
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
