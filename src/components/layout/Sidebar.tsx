import React from 'react';
import {
  Map,
  Camera,
  FileText,
  Landmark,
  ShieldCheck,
  Settings,
  MoreVertical,
  ArrowRight
} from 'lucide-react';
import saferRoadsBanner from '../../assets/images/sidebar_safer_roads_1790737473231.jpg';
import avatarImg from '../../assets/images/avatar_nisithaa_1790737494378.jpg';

export type NavTab = 'map' | 'report' | 'complaints' | 'departments' | 'verification' | 'settings' | 'complaint-detail';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenReportModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenReportModal,
}) => {
  const navItems: Array<{
    id: NavTab;
    title: string;
    subtitle: string;
    icon: React.ElementType;
  }> = [
    {
      id: 'map',
      title: 'Live Map',
      subtitle: 'View and explore incidents',
      icon: Map,
    },
    {
      id: 'report',
      title: 'Report Hazard',
      subtitle: 'Capture and raise a complaint',
      icon: Camera,
    },
    {
      id: 'complaints',
      title: 'My Complaints',
      subtitle: 'Track your reports',
      icon: FileText,
    },
    {
      id: 'departments',
      title: 'Departments',
      subtitle: 'Manage and respond',
      icon: Landmark,
    },
    {
      id: 'verification',
      title: 'Verification',
      subtitle: 'Review and confirm repairs',
      icon: ShieldCheck,
    },
  ];

  return (
    <aside className="w-[260px] bg-[#111827] border-r border-[#2A364A] flex flex-col justify-between select-none shrink-0 h-screen overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-1 pt-1">
          {/* Logo icon */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/30 to-blue-900/50 border border-blue-500/40 flex items-center justify-center shadow-inner shrink-0">
            <svg
              className="w-6 h-6 text-blue-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 20L10 4h4l6 16" />
              <path d="M12 4v16" strokeDasharray="3 3" />
            </svg>
          </div>

          <div>
            <h1 className="text-base font-bold text-white tracking-wide leading-tight">ARIIP</h1>
            <p className="text-[11px] text-[#94A3B8] leading-tight">
              Autonomous Road Infrastructure
            </p>
            <p className="text-[11px] text-[#94A3B8] leading-tight">
              Intelligence Platform
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5 pt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'report' && onOpenReportModal) {
                    onOpenReportModal();
                  } else {
                    onTabChange(item.id);
                  }
                }}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-[#1A2332] border border-[#3B82F6]/50 text-white shadow-md'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#1A2332]/60 border border-transparent'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? 'text-[#3B82F6] bg-blue-500/10' : 'text-[#94A3B8]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <div
                    className={`text-xs font-semibold leading-tight ${
                      isActive ? 'text-white' : 'text-slate-200'
                    }`}
                  >
                    {item.title}
                  </div>
                  <div className="text-[11px] text-[#94A3B8] truncate mt-0.5 leading-tight">
                    {item.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Promo Card: Safer Roads Stronger Cities */}
        <div
          onClick={() => onTabChange('map')}
          className="relative rounded-2xl overflow-hidden border border-[#2A364A] shadow-xl group cursor-pointer mt-3"
        >
          <img
            src={saferRoadsBanner}
            alt="Safer Roads"
            referrerPolicy="no-referrer"
            className="w-full h-32 object-cover brightness-75 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col justify-end">
            <h3 className="text-sm font-bold text-white leading-tight">Safer Roads</h3>
            <h3 className="text-sm font-bold text-white leading-tight">Stronger Cities</h3>
            <p className="text-[11px] text-slate-300 mt-1">Report. Track. Improve.</p>

            <div className="absolute bottom-3.5 right-3.5 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white group-hover:bg-[#3B82F6] group-hover:border-blue-400 transition-colors">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Area: Settings & Profile */}
      <div className="p-4 border-t border-[#2A364A] space-y-3">
        {/* Settings button */}
        <button
          onClick={() => onTabChange('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
            activeTab === 'settings'
              ? 'bg-[#1A2332] text-white border border-[#2A364A]'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#1A2332]'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </button>

        {/* User profile row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <img
              src={avatarImg}
              alt="Nisithaa S"
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-blue-500/40 ring-1 ring-blue-500/20"
            />
            <div>
              <p className="text-xs font-semibold text-white leading-tight">Nisithaa S</p>
              <p className="text-[11px] text-[#94A3B8] leading-tight mt-0.5">Citizen Inspector</p>
            </div>
          </div>

          <button
            onClick={() => onTabChange('settings')}
            className="text-slate-500 hover:text-slate-300 p-1"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
