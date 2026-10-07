import React, { useState } from 'react';
import {
  Search,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  MapPin,
  Calendar,
  ShieldCheck,
  RotateCcw,
  Globe2,
  Navigation
} from 'lucide-react';

import { useEffect } from "react";
interface VerificationQueueViewProps {
  selectedCity?: string;
  selectedState?: string;
  isAllIndia?: boolean;
}

export const VerificationQueueView: React.FC<VerificationQueueViewProps> = ({
  selectedCity = 'Bengaluru',
  selectedState = 'Karnataka',
  isAllIndia = false,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [search, setSearch] = useState('');
  const [verifiedModalItem, setVerifiedModalItem] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);

useEffect(() => {
  fetch("http://127.0.0.1:8000/incidents")
    .then((res) => res.json())
    .then((data) => {
      console.log("INCIDENTS:", data);
      setItems(data);
    })
    .catch((err) => console.error(err));
}, []);
  const handleAction = (
  id: number,
  newCategory: 'approved' | 'rejected'
) => {
  setItems((prev) =>
    prev.map((item) =>
      item.id === id
        ? {
            ...item,
            category: newCategory,
            status:
              newCategory === 'approved'
                ? 'Audit Approved'
                : 'Rework Ordered',
          }
        : item
    )
  );
};
  const cityFiltered = items;

  const displayed = cityFiltered.filter((item) => {
   const matchesTab =
  activeTab === "pending"
    ? item.status !== "approved" &&
      item.status !== "rejected"
    : item.status === activeTab;
    const matchesSearch =
  item.hazard_type?.toLowerCase().includes(search.toLowerCase()) ||
  item.incident_id?.toLowerCase().includes(search.toLowerCase()) ||
  item.department?.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });
  console.log("Items:", items.length);
console.log("Displayed:", displayed.length);

  return (
    <div className="flex-1 bg-[#0B1220] flex flex-col h-[calc(100vh-4rem)] overflow-y-auto select-none p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white tracking-tight">Photographic Verification Queue</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-950/60 border border-blue-800/40 text-blue-300 text-[11px] font-semibold flex items-center gap-1">
              <Globe2 className="w-3 h-3 text-emerald-400" />
              {isAllIndia ? 'All India (Nationwide Queue)' : `${selectedCity}, ${selectedState}`}
            </span>
          </div>
          <p className="text-xs text-[#94A3B8]">
            Quality assurance audit: Compare before-repair hazard evidence against completed field crew repair photos.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${selectedCity} audits...`}
            className="w-full bg-[#1A2332] text-white pl-9 pr-4 py-2 rounded-xl border border-[#2A364A] text-xs focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2A364A] pb-3">
        {(['pending', 'approved', 'rejected'] as const).map((tab) => {
          const count = cityFiltered.filter((i) => {
  if (tab === "pending") {
    return (
      i.status !== "approved" &&
      i.status !== "rejected"
    );
  }
  return i.status === tab;
}).length;
          
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
              <span className="capitalize">{tab}</span>
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

      {/* Verification Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayed.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-[#1A2332] border border-[#2A364A] hover:border-slate-500 transition-all flex flex-col justify-between shadow-lg space-y-4"
          >
            {/* Top Info */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-blue-400">{item.incident_id}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      item.category === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : item.category === 'rejected'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">{item.hazard_type}</h3>
                <p className="text-xs text-[#94A3B8] flex items-center gap-1 mt-0.5">
  <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
  <span>
    Department: {item.department}
  </span>
</p>
                <p className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                  <Navigation className="w-3 h-3" />
                  GPS: {item.latitude?.toFixed(4)}° N,
{item.longitude?.toFixed(4)}° E
                </p>
              </div>

              <span className="text-[11px] text-slate-400 font-mono">{item.department}</span>
            </div>

            {/* Before vs After Side-by-Side Photo Comparison */}
            <div className="grid grid-cols-2 gap-3">
              {/* Before Photo */}
              <div
                onClick={() => setVerifiedModalItem({ ...item, showImg: item.beforeImg, label: 'Before Repair (Initial Complaint)' })}
                className="relative rounded-xl overflow-hidden bg-[#0B1220] border border-[#2A364A] h-36 cursor-pointer group shadow-md"
              >
                <img
  src={`http://127.0.0.1:8000/${item.image_path.replace(/\\/g, "/")}`}
/>
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-red-400 border border-red-500/30">
                  Before (Hazard)
                </div>
                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-slate-300">
                  {item.reportedDate}
                </div>
              </div>

              {/* After Photo */}
              <div
                onClick={() => setVerifiedModalItem({ ...item, showImg: item.afterImg, label: 'After Repair (Completed Work)' })}
                className="relative rounded-xl overflow-hidden bg-[#0B1220] border border-[#2A364A] h-36 cursor-pointer group shadow-md"
              >
                <img
                  src={item.afterImg}
                  alt="After repair completion"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  After (Repaired)
                </div>
                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-slate-300">
                  {item.repairedDate}
                </div>
              </div>
            </div>

            {/* Crew Details & Verification Controls */}
            <div className="pt-2 border-t border-[#2A364A] flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium truncate max-w-[180px]">
                Crew: <strong className="text-slate-200">{item.crew}</strong>
              </span>

              {activeTab === 'pending' ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction(item.id, 'rejected')}
                    className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleAction(item.id, 'approved')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/40 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Close</span>
                  </button>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400 italic">Audit Status Logged</span>
              )}
            </div>
          </div>
        ))}

        {displayed.length === 0 && (
          <div className="col-span-full p-12 text-center text-[#94A3B8] rounded-2xl bg-[#1A2332] border border-[#2A364A]">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold text-white">No items in this queue</p>
            <p className="text-xs text-[#94A3B8] mt-1">
              All field repair submissions for {selectedCity} have been audited.
            </p>
          </div>
        )}
      </div>

      {/* Modal Zoom */}
      {verifiedModalItem && (
        <div
          onClick={() => setVerifiedModalItem(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden border border-white/20 bg-[#0B1220] shadow-2xl"
          >
            <button
              onClick={() => setVerifiedModalItem(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={verifiedModalItem.showImg}
              alt="Verification evidence"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            <div className="p-4 bg-[#111827] border-t border-[#2A364A] flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block">{verifiedModalItem.title}</span>
                <span className="text-slate-400">
                  {verifiedModalItem.label} • {verifiedModalItem.location} ({verifiedModalItem.city})
                </span>
              </div>
              <span className="font-mono text-emerald-400">
                {verifiedModalItem.lat.toFixed(5)}° N, {verifiedModalItem.lng.toFixed(5)}° E
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
