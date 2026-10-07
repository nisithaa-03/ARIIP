import React, { useState } from 'react';
import {
  User,
  Bell,
  MapPin,
  Shield,
  HelpCircle,
  Edit2,
  CheckCircle2,
  Save,
  Radio,
  Sliders,
  Layers
} from 'lucide-react';
import avatarImg from '../../assets/images/avatar_nisithaa_1790737494378.jpg';

export const SettingsView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'notifications' | 'map' | 'privacy' | 'help'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('Nisithaa S');
  const [email, setEmail] = useState('nisithaa@ariip.gov.in');
  const [role, setRole] = useState('Citizen Road Inspector & Field Auditor');
  const [department, setDepartment] = useState('Municipal Road Safety Command');
  const [phone, setPhone] = useState('+91 98765 43210');

  const [potholeThreshold, setPotholeThreshold] = useState('5.0');
  const [autoRouting, setAutoRouting] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const navItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'map', label: 'Map & GIS Layers', icon: MapPin },
    { id: 'privacy', label: 'Security & Access', icon: Shield },
    { id: 'help', label: 'Help & Municipal SOP', icon: HelpCircle },
  ];

  return (
    <div className="flex-1 bg-[#0B1220] flex flex-col h-[calc(100vh-4rem)] overflow-y-auto select-none p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Platform Configuration & Profile</h1>
        <p className="text-xs text-[#94A3B8] mt-1">
          Manage system thresholds, GIS base layers, municipal routing preferences, and inspector credentials
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Configuration preferences saved successfully to ARIIP system registry.</span>
        </div>
      )}

      {/* Main Grid: Left Sub-Nav + Right Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sub-Nav (Span 3 cols) */}
        <div className="lg:col-span-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSubTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                  isActive
                    ? 'bg-[#1A2332] text-blue-400 border border-blue-500/40 shadow-md'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#1A2332]/60 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content Card (Span 9 cols) */}
        <div className="lg:col-span-9 rounded-2xl bg-[#1A2332] border border-[#2A364A] p-6 shadow-xl space-y-6">
          {activeSubTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#2A364A]">
                <div className="flex items-center gap-4">
                  <img
                    src={avatarImg}
                    alt="Nisithaa S"
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-500/50 shadow-md ring-2 ring-blue-500/20"
                  />
                  <div>
                    <h2 className="text-base font-bold text-white">{fullName}</h2>
                    <p className="text-xs text-blue-400 font-medium">{role}</p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">{department}</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 rounded-xl border border-[#2A364A] bg-[#111827] text-xs font-semibold text-white hover:bg-[#1f2b3e] transition-colors flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Credentials'}</span>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[#94A3B8] mb-1 font-medium">Full Name</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#111827] text-white disabled:text-slate-400 border border-[#2A364A] rounded-xl p-2.5 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[#94A3B8] mb-1 font-medium">Official Email</label>
                    <input
                      type="email"
                      disabled={!isEditing}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#111827] text-white disabled:text-slate-400 border border-[#2A364A] rounded-xl p-2.5 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[#94A3B8] mb-1 font-medium">Field Designation</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-[#111827] text-white disabled:text-slate-400 border border-[#2A364A] rounded-xl p-2.5 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[#94A3B8] mb-1 font-medium">Phone</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#111827] text-white disabled:text-slate-400 border border-[#2A364A] rounded-xl p-2.5 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end pt-3">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-900/40"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {activeSubTab === 'map' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white">GIS Map Engine & Coordinate Systems</h3>
              <p className="text-[#94A3B8]">
                ARIIP combines Google Maps high-contrast roadmap tiles with deep navy blue GIS filters and LiDAR telemetry.
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-[#111827] border border-[#2A364A] flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white block">Default Base Map Styling</span>
                    <span className="text-[11px] text-[#94A3B8]">Google Maps Road Network in Dark Navy Theme</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-950/80 text-blue-400 border border-blue-800/60 font-medium">
                    Active
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#111827] border border-[#2A364A] flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white block">Pothole Depth Trigger Threshold</span>
                    <span className="text-[11px] text-[#94A3B8]">LiDAR / Inspector threshold to classify as Critical</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={potholeThreshold}
                      onChange={(e) => setPotholeThreshold(e.target.value)}
                      className="w-16 bg-[#1A2332] text-white border border-[#2A364A] rounded-lg px-2 py-1 text-center font-mono"
                    />
                    <span className="text-slate-400">cm</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#111827] border border-[#2A364A] flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white block">Automated Municipal Dispatch Routing</span>
                    <span className="text-[11px] text-[#94A3B8]">Directly route verified citizen complaints to BBMP / BWSSB</span>
                  </div>
                  <button
                    onClick={() => setAutoRouting(!autoRouting)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      autoRouting ? 'bg-blue-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        autoRouting ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'notifications' && (
            <div className="space-y-3 text-xs">
              <h3 className="text-sm font-bold text-white">Alert Subscriptions</h3>
              <p className="text-[#94A3B8]">Configure push and operational notifications for critical road incidents.</p>
              <div className="p-3 rounded-xl bg-[#111827] border border-[#2A364A] text-slate-300">
                Critical Severity Alerts: <strong>Instant SMS & Dispatch Radio Active</strong>
              </div>
            </div>
          )}

          {activeSubTab === 'privacy' && (
            <div className="space-y-3 text-xs">
              <h3 className="text-sm font-bold text-white">Security & Audit Log</h3>
              <p className="text-[#94A3B8]">Every citizen report, image capture, and engineer sign-off is cryptographically hashed with GPS telemetry.</p>
            </div>
          )}

          {activeSubTab === 'help' && (
            <div className="space-y-3 text-xs">
              <h3 className="text-sm font-bold text-white">Municipal Standard Operating Procedure (SOP)</h3>
              <p className="text-[#94A3B8]">
                IRC (Indian Roads Congress) code IRC:SP:84-2019 standards are enforced for pavement defect classification.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
