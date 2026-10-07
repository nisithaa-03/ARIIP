import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Landmark,
  ExternalLink,
  ArrowRight,
  Maximize2,
  CheckCircle2,
  Clock,
  Shield,
  Check,
  Camera,
  Navigation
} from 'lucide-react';
import { Incident } from '../../types/infrastructure';

interface IncidentDetailsPanelProps {
  incident: Incident | null;
  onClose: () => void;
  onTrackComplaint?: (incidentId: string) => void;
}

export const IncidentDetailsPanel: React.FC<IncidentDetailsPanelProps> = ({
  incident,
  onClose,
  onTrackComplaint,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'ai' | 'timeline'>('details');
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);
  const [zoomedImageSrc, setZoomedImageSrc] = useState<string>('');
  const [isTrackingActive, setIsTrackingActive] = useState(false);

  if (!incident) {
    return (
      <aside className="w-[410px] bg-[#111827] border-l border-[#2A364A] flex flex-col items-center justify-center p-6 text-center select-none text-slate-500 shrink-0">
        <MapPin className="w-8 h-8 text-blue-500/60 mb-2" />
        <p className="text-xs font-semibold text-slate-300">No Hazard Selected</p>
        <p className="text-[11px] text-[#94A3B8] mt-1 max-w-[220px]">
          Select any hazard pin on the live road map to inspect evidence photos and municipal workflow.
        </p>
      </aside>
    );
  }

  const handleTrackClick = () => {
    setIsTrackingActive(true);
    if (onTrackComplaint) {
      onTrackComplaint(incident.id);
    }
    setTimeout(() => setIsTrackingActive(false), 2500);
  };

  const handleOpenZoom = (imgSrc: string) => {
    setZoomedImageSrc(imgSrc);
    setIsPhotoZoomed(true);
  };

  const riskPercent = incident.accidentRiskPercentage || 91;

  return (
    <aside className="w-[410px] bg-[#111827] border-l border-[#2A364A] flex flex-col h-[calc(100vh-4rem)] select-none shrink-0 z-30 overflow-y-auto">
      <div className="p-5 space-y-4">
        {/* Top Header: Badge + Ticket Number + Close Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
              incident.severity === 'critical'
                ? 'bg-red-950/60 border border-red-800/60 text-red-400'
                : incident.severity === 'high'
                ? 'bg-amber-950/60 border border-amber-800/60 text-amber-400'
                : incident.severity === 'resolved'
                ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-400'
                : 'bg-blue-950/60 border border-blue-800/60 text-blue-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                incident.severity === 'critical' ? 'bg-red-500 animate-pulse' :
                incident.severity === 'high' ? 'bg-amber-500' :
                incident.severity === 'resolved' ? 'bg-emerald-500' : 'bg-blue-500'
              }`} />
              {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">
              {incident.ticketNumber}
            </span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title & Street Address */}
        <div>
          <h2 className="text-xl font-bold text-white leading-tight">
            {incident.title}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] mt-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">{incident.location.address}</span>
          </div>
        </div>

        {/* Real Complaint Photo Gallery Mosaic */}
        <div className="grid grid-cols-3 gap-2 h-44">
          {/* Main Large Photo (Span 2 cols) */}
          <div
            onClick={() => handleOpenZoom(incident.imageUrl)}
            className="col-span-2 relative rounded-xl overflow-hidden border border-[#2A364A] bg-[#1A2332] group cursor-pointer shadow-md"
          >
            <img
              src={incident.imageUrl}
              alt={incident.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[10px] text-white font-medium flex items-center gap-1.5 border border-white/20 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Google Street View
            </div>
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] text-blue-300 font-mono flex items-center gap-1">
              <Camera className="w-3 h-3 text-blue-400" />
              {incident.location.street} • Geo-Tagged
            </div>
          </div>

          {/* Right Thumbnails Column */}
          <div className="col-span-1 flex flex-col gap-2 h-full">
            {/* Top thumbnail */}
            <div
              onClick={() => handleOpenZoom(incident.galleryImages?.[1] || incident.imageUrl)}
              className="flex-1 relative rounded-xl overflow-hidden border border-[#2A364A] bg-[#1A2332] group cursor-pointer shadow-sm"
            >
              <img
                src={incident.galleryImages?.[1] || incident.imageUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Bottom thumbnail with +2 overlay */}
            <div
              onClick={() => handleOpenZoom(incident.galleryImages?.[2] || incident.imageUrl)}
              className="flex-1 relative rounded-xl overflow-hidden border border-[#2A364A] bg-[#1A2332] group cursor-pointer shadow-sm"
            >
              <img
                src={incident.galleryImages?.[2] || incident.imageUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover brightness-60"
              />
              <div className="absolute inset-0 bg-blue-950/40 flex items-center justify-center">
                <span className="text-white font-bold text-xs">+2 angles</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Column Status Box (Status, Severity, Department) */}
        <div className="grid grid-cols-3 rounded-xl bg-[#1A2332] border border-[#2A364A] p-3 text-xs divide-x divide-[#2A364A]">
          {/* Status */}
          <div className="px-2">
  <span className="text-[11px] text-[#94A3B8] block mb-1">
    Status
  </span>

  <select
    value={incident.status}
    onChange={async (e) => {
      const newStatus = e.target.value;

      try {
        await fetch(
          `http://127.0.0.1:8000/incidents/${incident.id}/status?status=${newStatus}`,
          {
            method: "PUT",
          }
        );

        window.location.reload();
      } catch (err) {
        console.error(err);
      }
    }}
    className="bg-[#1A2332] border border-[#334155] rounded px-2 py-1 text-sm"
  >
    <option value="created">Created</option>
    <option value="assigned">Assigned</option>
    <option value="repair_started">Repair Started</option>
    <option value="verification">Verification</option>
    <option value="resolved">Resolved</option>
  </select>
</div>
          {/* Severity */}
          <div className="px-2">
            <span className="text-[11px] text-[#94A3B8] block mb-1">Severity</span>
            <span className="flex items-center gap-1.5 font-medium text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              {incident.severity === 'critical'
                ? 'Critical'
                : incident.severity === 'high'
                ? 'High'
                : 'Medium'}
            </span>
          </div>

          {/* Department */}
          <div className="px-2">
            <span className="text-[11px] text-[#94A3B8] block mb-1">Department</span>
            <span className="flex items-center gap-1.5 font-medium text-blue-300 truncate">
              <Landmark className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">{incident.department}</span>
            </span>
          </div>
        </div>

        {/* Navigation Tabs (Details, AI Insights, Timeline) */}
        <div className="flex items-center border-b border-[#2A364A] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-2.5 px-3 transition-colors relative ${
              activeTab === 'details'
                ? 'text-white'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <span>Details</span>
            {activeTab === 'details' && (
              <span className="absolute bottom-0 inset-x-3 h-0.5 bg-[#3B82F6] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`pb-2.5 px-3 transition-colors relative ${
              activeTab === 'ai'
                ? 'text-white'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <span>AI Insights</span>
            {activeTab === 'ai' && (
              <span className="absolute bottom-0 inset-x-3 h-0.5 bg-[#3B82F6] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-2.5 px-3 transition-colors relative ${
              activeTab === 'timeline'
                ? 'text-white'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <span>Timeline</span>
            {activeTab === 'timeline' && (
              <span className="absolute bottom-0 inset-x-3 h-0.5 bg-[#3B82F6] rounded-full" />
            )}
          </button>
        </div>

        {/* Tab 1: Details */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            {/* Description */}
            <div>
              <span className="text-xs font-semibold text-[#94A3B8] block mb-1">
                Description
              </span>
              <p className="text-xs text-[#E5E7EB] leading-relaxed">
                {incident.description}
              </p>
            </div>

            {/* Two Side-by-Side Metric Cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Accident Risk (Circular Progress Ring) */}
              <div className="p-3.5 rounded-xl bg-[#1A2332] border border-[#2A364A] flex items-center gap-3">
                {/* SVG Progress Ring */}
                <div className="relative w-11 h-11 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    {/* Background track */}
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#2A364A"
                      strokeWidth="3.5"
                    />
                    {/* Active coral-red meter */}
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="3.5"
                      strokeDasharray="88"
                      strokeDashoffset={88 - (88 * riskPercent) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <span className="text-[11px] text-[#94A3B8] block">Accident Risk</span>
                  <span className="text-base font-bold text-red-400 font-mono">
                    {riskPercent}%
                  </span>
                </div>
              </div>

              {/* Reported Time Ago */}
              <div className="p-3.5 rounded-xl bg-[#1A2332] border border-[#2A364A] flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#111827] border border-[#2A364A] flex items-center justify-center text-[#94A3B8] shrink-0">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <span className="text-[11px] text-[#94A3B8] block">Reported</span>
                  <span className="text-xs font-bold text-[#E5E7EB]">
                    {incident.reportedTimeAgo || '2 hours ago'}
                  </span>
                </div>
              </div>
            </div>

            {/* Location block with Coordinates & "View on Map" Link */}
            <div className="flex items-center justify-between text-xs pt-1 p-3 rounded-xl bg-[#1A2332]/60 border border-[#2A364A]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[#94A3B8] text-[10px] block uppercase tracking-wider">Coordinates</span>
                  <span className="font-mono text-[#E5E7EB] text-xs">
                    {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}
                  </span>
                </div>
              </div>

              <a
                href={`https://www.google.com/maps?q=${incident.location.lat},${incident.location.lng}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors"
              >
                <span>Google Map</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Primary Action Button: Track This Complaint -> */}
            <div className="pt-2">
              <button
                onClick={handleTrackClick}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/40 text-sm"
              >
                <span>
                  {isTrackingActive ? 'Tracking Live Updates...' : 'Track This Complaint'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: AI Insights */}
        {activeTab === 'ai' && (
          <div className="space-y-3 text-xs bg-[#1A2332] p-4 rounded-xl border border-[#2A364A]">
            <div className="flex items-center justify-between py-1.5 border-b border-[#2A364A]">
              <span className="text-[#94A3B8]">Issue:</span>
              <span className="font-semibold text-white">{incident.aiInsights.issue}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#2A364A]">
              <span className="text-[#94A3B8]">Risk Assessment:</span>
              <span className="font-semibold text-red-400">{incident.aiInsights.risk} ({riskPercent}%)</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#2A364A]">
              <span className="text-[#94A3B8]">Department:</span>
              <span className="font-semibold text-blue-300">{incident.aiInsights.department}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#2A364A]">
              <span className="text-[#94A3B8]">Verification:</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" />
                {incident.aiInsights.verification}
              </span>
            </div>

            <div className="bg-[#111827] p-3 rounded-lg border border-[#2A364A] text-[11px] text-slate-300 leading-relaxed mt-2">
              <span className="text-blue-400 font-semibold block mb-0.5">Recommended Municipal Action:</span>
              {incident.aiInsights.recommendedAction}
            </div>
          </div>
        )}

        {/* Tab 3: Timeline */}
        {activeTab === 'timeline' && (
          <div className="space-y-3 pl-4 relative before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#2A364A] text-xs">
            {incident.timeline.map((entry) => (
              <div key={entry.id} className="relative group pl-3">
                <div
                  className={`absolute -left-[18px] top-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                    entry.completed
                      ? 'bg-blue-500 text-white font-bold'
                      : entry.current
                      ? 'bg-amber-400 text-slate-950 font-bold ring-2 ring-[#111827]'
                      : 'bg-[#2A364A] text-slate-500'
                  }`}
                >
                  {entry.completed ? '✓' : ''}
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`font-semibold ${
                      entry.completed
                        ? 'text-white'
                        : entry.current
                        ? 'text-amber-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {entry.label}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {entry.timestamp}
                  </span>
                </div>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">{entry.actor}</p>
                {entry.notes && (
                  <p className="text-[11px] text-slate-300 mt-1 bg-[#1A2332] p-2 rounded-lg border border-[#2A364A]">
                    {entry.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Photo Zoom Modal */}
      {isPhotoZoomed && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6"
          onClick={() => setIsPhotoZoomed(false)}
        >
          <div
            className="max-w-3xl w-full bg-[#1A2332] border border-[#2A364A] rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 border-b border-[#2A364A] flex items-center justify-between bg-[#111827]">
              <div>
                <span className="text-xs font-mono text-blue-400">{incident.ticketNumber}</span>
                <span className="text-xs font-semibold text-white ml-2">
                  {incident.title} · Inspection Evidence Photo
                </span>
              </div>
              <button
                onClick={() => setIsPhotoZoomed(false)}
                className="w-7 h-7 rounded text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-[#0B1220] flex items-center justify-center max-h-[65vh]">
              <img
                src={zoomedImageSrc || incident.imageUrl}
                alt=""
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-2xl"
              />
            </div>
            <div className="p-3 bg-[#111827] text-xs text-[#94A3B8] flex items-center justify-between font-mono border-t border-[#2A364A]">
              <span>Location: {incident.location.address}</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> GPS Verified
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
