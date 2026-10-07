import React, { useState } from 'react';
import {
  Search,
  Plus,
  ChevronRight,
  Car,
  Landmark,
  Radio,
  Lightbulb,
  Building2,
  CheckCircle2,
  Truck,
  Clock,
  AlertTriangle,
  Camera,
  Globe2,
  MapPin
} from 'lucide-react';
import indianPotholeImg from '../../assets/images/indian_road_pothole_1790739714987.jpg';
import indianManholeImg from '../../assets/images/indian_open_manhole_1790739733586.jpg';
import indianWaterlogImg from '../../assets/images/indian_road_waterlog_1790739755508.jpg';
import indianSignalImg from '../../assets/images/indian_traffic_signal_1790739797320.jpg';
import indianDividerImg from '../../assets/images/indian_road_divider_1790740026519.jpg';
import indianOpenDrainImg from '../../assets/images/indian_open_drain_1790740040367.jpg';
import { Incident } from '@/src/types/infrastructure';

interface DepartmentsViewProps {
  incidents: Incident[];
  onSelectDepartment?: (deptName: string) => void;
  selectedCity?: string;
  selectedState?: string;
  isAllIndia?: boolean;
  municipalBody?: string;
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({
  incidents,
  onSelectDepartment,
  selectedCity = 'Bengaluru',
  selectedState = 'Karnataka',
  isAllIndia = false,
  municipalBody = 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
}) => {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  
  const currentJurisdiction = isAllIndia ? 'All India Municipal Grid' : municipalBody;
  const [customDepartments, setCustomDepartments] = useState<any[]>([]);
  const incidentDepartments = Object.values(
  incidents.reduce((acc: any, incident) => {

    const dept = incident.department || "Unknown Department";

    if (!acc[dept]) {
      acc[dept] = {
        id: dept.toLowerCase().replace(/\s+/g, "-"),
        name: dept,
        jurisdiction: `${selectedCity} Municipal Zone`,
        description: `Department handling ${dept} related complaints.`,
        icon: Building2,
        iconBg:
          "bg-blue-500/20 text-blue-400 border border-blue-500/30",

        open: 0,
        inProgress: 0,
        resolved: 0,

        activeCrews: 0,
        totalFleet: 0,

        activeHazardImg: incident.imageUrl,
        sampleIssue: incident.title,
        slaHours: "4 hrs",
      };
    }

    if (
      incident.status === "created" ||
      incident.status === "assigned"
    ) {
      acc[dept].open++;
    }
    else if (
      incident.status === "repair_started" ||
      incident.status === "verification"
    ) {
      acc[dept].inProgress++;
    }
    else if (
      incident.status === "resolved"
    ) {
      acc[dept].resolved++;
    }

    return acc;

  }, {})
);
  const departments = [
  ...customDepartments,
  ...incidentDepartments,
];
  const handleAddDept = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!newDeptName.trim()) return;

  try {
    const response = await fetch("http://localhost:8000/departments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newDeptName,
        description:
          newDeptDesc ||
          `Department handling civic infrastructure operations in ${selectedCity}.`,
        jurisdiction: `${selectedCity} Municipal Zone`,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create department");
    }

    const savedDept = await response.json();

    setCustomDepartments([
      {
        ...savedDept,
        icon: Building2,
        iconBg:
          "bg-blue-500/20 text-blue-400 border border-blue-500/30",
        open: 0,
        inProgress: 0,
        resolved: 0,
        activeCrews: 2,
        totalFleet: 3,
        activeHazardImg: indianOpenDrainImg,
        sampleIssue: "Operational Readiness Active",
        slaHours: "4.0 hrs",
      },
      ...customDepartments,
    ]);

    setNewDeptName("");
    setNewDeptDesc("");

    setAddSuccess(true);

    setTimeout(() => {
      setAddSuccess(false);
      setShowAddModal(false);
    }, 1200);

  } catch (error) {
    console.error("Error creating department:", error);
    alert("Failed to create department");
  }
};

  const filteredDepts = departments.filter((d) => {
    return (
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="flex-1 bg-[#0B1220] flex flex-col h-[calc(100vh-4rem)] overflow-y-auto select-none p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white tracking-tight">Municipal Routing & Departments</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-950/60 border border-blue-800/40 text-blue-300 text-[11px] font-semibold flex items-center gap-1">
              <Globe2 className="w-3 h-3 text-emerald-400" />
              {isAllIndia ? 'Nationwide Multi-City Grid' : `${selectedCity}, ${selectedState}`}
            </span>
          </div>
          <p className="text-xs text-[#94A3B8]">
            Authority: <span className="text-slate-200 font-semibold">{currentJurisdiction}</span> • Dynamic ticket routing & real-time crew fleet allocation.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-900/40 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${selectedCity} departments...`}
          className="w-full bg-[#1A2332] text-white pl-9 pr-4 py-2 rounded-xl border border-[#2A364A] text-xs focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepts.map((d) => {
          const Icon = d.icon;
          return (
            <div
              key={d.id}
              onClick={() => onSelectDepartment?.(d.name)}
              className="p-5 rounded-2xl bg-[#1A2332] border border-[#2A364A] hover:border-blue-500 transition-all flex flex-col justify-between group cursor-pointer shadow-lg space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${d.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                        {d.name}
                      </h3>
                      <span className="text-[10px] text-blue-400 font-mono block">{d.jurisdiction}</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-[#2A364A]">
                    SLA: {d.slaHours}
                  </span>
                </div>

                <p className="text-xs text-[#94A3B8] line-clamp-2 mb-3">{d.description}</p>

                {/* Real Indian Hazard Evidence Thumbnail */}
                <div className="p-2.5 rounded-xl bg-[#111827] border border-[#2A364A] flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#0B1220] shrink-0 border border-[#2A364A] relative">
                    <img
                      src={d.activeHazardImg}
                      alt="Active hazard snapshot"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-1 left-1 px-1 rounded bg-black/80 text-[8px] text-white">
                      Live
                    </div>
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[9px] text-red-400 font-semibold uppercase tracking-wider block">
                      Active Priority Incident
                    </span>
                    <p className="text-[11px] font-medium text-slate-200 truncate mt-0.5">
                      {d.sampleIssue}
                    </p>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Camera className="w-3 h-3 text-blue-400" />
                      Authentic Indian Street Evidence
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Footer */}
              <div className="pt-3 border-t border-[#2A364A] space-y-2">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-1.5 rounded-lg bg-[#111827]">
                    <span className="text-[10px] text-[#94A3B8] block">Open</span>
                    <span className="font-bold text-red-400 font-mono">{d.open}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-[#111827]">
                    <span className="text-[10px] text-[#94A3B8] block">In Progress</span>
                    <span className="font-bold text-amber-400 font-mono">{d.inProgress}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-[#111827]">
                    <span className="text-[10px] text-[#94A3B8] block">Resolved</span>
                    <span className="font-bold text-emerald-400 font-mono">{d.resolved}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Truck className="w-3.5 h-3.5 text-blue-400" />
                    Fleet: <strong className="text-white">{d.activeCrews}/{d.totalFleet} Active</strong>
                  </span>
                  <span className="text-blue-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform font-semibold">
                    View Live Corridors &rarr;
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Department Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-full max-w-md bg-[#1A2332] border border-[#2A364A] rounded-2xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-white">Add Municipal Department</h3>
            <p className="text-xs text-[#94A3B8]">
              Configure a new civic routing division for {selectedCity}, {selectedState}.
            </p>

            <form onSubmit={handleAddDept} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Department Name</label>
                <input
                  type="text"
                  required
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="e.g. Electrical & Street Lighting Wing"
                  className="w-full bg-[#111827] text-white p-2.5 rounded-xl border border-[#2A364A] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Description</label>
                <textarea
                  rows={3}
                  value={newDeptDesc}
                  onChange={(e) => setNewDeptDesc(e.target.value)}
                  placeholder="Describe municipal responsibilities, equipment, and jurisdiction..."
                  className="w-full bg-[#111827] text-white p-2.5 rounded-xl border border-[#2A364A] focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {addSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Department successfully integrated into {selectedCity} dispatch!
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#111827] text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
