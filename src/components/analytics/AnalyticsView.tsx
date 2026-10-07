import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
  Activity,
  ShieldAlert,
  Globe2,
  BarChart3
} from 'lucide-react';
import indianPotholeImg from '../../assets/images/indian_road_pothole_1790739714987.jpg';
import indianManholeImg from '../../assets/images/indian_open_manhole_1790739733586.jpg';
import indianWaterlogImg from '../../assets/images/indian_road_waterlog_1790739755508.jpg';
import indianCrackImg from '../../assets/images/indian_road_crack_1790739780245.jpg';
import indianDividerImg from '../../assets/images/indian_road_divider_1790740026519.jpg';
import indianOpenDrainImg from '../../assets/images/indian_open_drain_1790740040367.jpg';

interface AnalyticsViewProps {
  selectedCity?: string;
  selectedState?: string;
  isAllIndia?: boolean;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  selectedCity = 'Bengaluru',
  selectedState = 'Karnataka',
  isAllIndia = false,
}) => {
  const [timeRange, setTimeRange] = useState('Last 6 Months');

  // Corridors adapting to city or nationwide
  const corridors = isAllIndia
    ? [
        {
          name: 'Western Express Highway (Bandra - Andheri)',
          city: 'Mumbai',
          state: 'Maharashtra',
          issuesCount: 46,
          riskLevel: 'Critical',
          pciScore: 36,
          topHazard: 'High-Speed Flyover Crater Potholes',
          img: indianPotholeImg,
        },
        {
          name: 'Outer Ring Road (Nagavara - Marathahalli)',
          city: 'Bengaluru',
          state: 'Karnataka',
          issuesCount: 38,
          riskLevel: 'Critical',
          pciScore: 42,
          topHazard: 'Alligator Cracks & Waterlogging',
          img: indianCrackImg,
        },
        {
          name: 'Ring Road & AIIMS Flyover Transit',
          city: 'New Delhi',
          state: 'Delhi NCR',
          issuesCount: 34,
          riskLevel: 'High',
          pciScore: 49,
          topHazard: 'Fatigue Fissures & Radial Manholes',
          img: indianManholeImg,
        },
        {
          name: 'Anna Salai Arterial Metro Corridor',
          city: 'Chennai',
          state: 'Tamil Nadu',
          issuesCount: 31,
          riskLevel: 'High',
          pciScore: 52,
          topHazard: 'Storm Waterlogging & Silt Deposition',
          img: indianWaterlogImg,
        },
        {
          name: 'Hitec City Cyber Towers Arterial',
          city: 'Hyderabad',
          state: 'Telangana',
          issuesCount: 28,
          riskLevel: 'Critical',
          pciScore: 44,
          topHazard: 'Deep Cavity Potholes & Underpass Drops',
          img: indianPotholeImg,
        },
      ]
    : [
        {
          name: `${selectedCity} Main Ring Road & Arterial`,
          city: selectedCity,
          state: selectedState,
          issuesCount: 38,
          riskLevel: 'Critical',
          pciScore: 42,
          topHazard: 'Alligator Cracks & Asphalt Potholes',
          img: indianPotholeImg,
        },
        {
          name: `${selectedCity} Commercial Corridor & Market Junction`,
          city: selectedCity,
          state: selectedState,
          issuesCount: 29,
          riskLevel: 'High',
          pciScore: 56,
          topHazard: 'Dislodged Manholes & Gutter Drops',
          img: indianManholeImg,
        },
        {
          name: `${selectedCity} Flyover Incline & Connector`,
          city: selectedCity,
          state: selectedState,
          issuesCount: 24,
          riskLevel: 'Critical',
          pciScore: 38,
          topHazard: 'High-Impact Cavity Potholes',
          img: indianDividerImg,
        },
        {
          name: `${selectedCity} Low-Lying Subway & Storm Basin`,
          city: selectedCity,
          state: selectedState,
          issuesCount: 19,
          riskLevel: 'High',
          pciScore: 48,
          topHazard: 'Monsoon Waterlogging & Clogged Inlets',
          img: indianWaterlogImg,
        },
      ];

  const stateWiseDistribution = [
    { state: 'Maharashtra', cities: 'Mumbai, Pune, Nagpur, Thane', complaints: 1420, resolvedRate: '88%' },
    { state: 'Karnataka', cities: 'Bengaluru, Mysuru, Mangaluru', complaints: 1280, resolvedRate: '91%' },
    { state: 'Delhi NCR', cities: 'New Delhi, Noida, Gurugram', complaints: 990, resolvedRate: '86%' },
    { state: 'Tamil Nadu', cities: 'Chennai, Coimbatore, Madurai', complaints: 870, resolvedRate: '92%' },
    { state: 'Telangana', cities: 'Hyderabad, Warangal', complaints: 760, resolvedRate: '89%' },
    { state: 'West Bengal', cities: 'Kolkata, Howrah, Siliguri', complaints: 640, resolvedRate: '84%' },
  ];

  return (
    <div className="flex-1 bg-[#0B1220] flex flex-col h-[calc(100vh-4rem)] overflow-y-auto select-none p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Predictive Road Infrastructure Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-950/60 border border-blue-800/40 text-blue-300 text-[11px] font-semibold flex items-center gap-1">
              <Globe2 className="w-3 h-3 text-emerald-400" />
              {isAllIndia ? 'Nationwide Infrastructure Grid' : `${selectedCity}, ${selectedState}`}
            </span>
          </div>
          <p className="text-xs text-[#94A3B8]">
            AI-powered degradation forecasts, Pavement Condition Index (PCI) analytics, and corridor risk monitoring across India.
          </p>
        </div>

        {/* Time range selector */}
        <div className="relative">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-[#1A2332] text-xs font-semibold text-slate-200 border border-[#2A364A] rounded-xl px-4 py-2 pr-9 appearance-none focus:outline-none focus:border-blue-500 cursor-pointer shadow-md"
          >
            <option>Last 30 Days</option>
            <option>Last 3 Months</option>
            <option>Last 6 Months</option>
            <option>Year to Date</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-5 rounded-2xl bg-[#1A2332] border border-[#2A364A] shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8] font-medium">Average Pavement PCI</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">68.4</span>
            <span className="text-[11px] text-emerald-400 flex items-center gap-0.5 font-semibold">
              <TrendingUp className="w-3 h-3" /> +3.2 pts
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {isAllIndia ? 'All India National Average' : `${selectedCity} Municipal Network`}
          </p>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-2xl bg-[#1A2332] border border-[#2A364A] shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8] font-medium">Mean Time to Resolve (MTTR)</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">3.4 hrs</span>
            <span className="text-[11px] text-emerald-400 flex items-center gap-0.5 font-semibold">
              <TrendingDown className="w-3 h-3" /> -42 mins
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Pothole & Manhole Emergency SLA</p>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-2xl bg-[#1A2332] border border-[#2A364A] shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8] font-medium">Auto-Detection Precision</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">98.2%</span>
            <span className="text-[11px] text-purple-400 flex items-center gap-0.5 font-semibold">
              LiDAR + Vision
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Validated against verified field audits</p>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-2xl bg-[#1A2332] border border-[#2A364A] shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8] font-medium">Accident Risk Reduction</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">-64%</span>
            <span className="text-[11px] text-emerald-400 flex items-center gap-0.5 font-semibold">
              <TrendingDown className="w-3 h-3" /> YoY Impact
            </span>
          </div>
          <p className="text-[11px] text-slate-400">On mapped arterial corridors</p>
        </div>
      </div>

      {/* High-Risk Hazard Corridors Section with Real Indian Road Photos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              High-Risk Hazard Corridors
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Corridors requiring immediate surface overhaul, ranked by accident probability and severity.
            </p>
          </div>
          <span className="text-xs text-blue-400 font-semibold flex items-center gap-1">
            <Camera className="w-3.5 h-3.5" /> Authentic Evidence Monitored
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {corridors.map((c, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#1A2332] border border-[#2A364A] overflow-hidden shadow-lg flex flex-col justify-between group hover:border-blue-500 transition-all"
            >
              <div>
                {/* Photo Header */}
                <div className="h-40 w-full relative overflow-hidden bg-[#0B1220]">
                  <img
                    src={c.img}
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-semibold text-white flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-400" />
                    {c.city}
                  </div>
                  <div
                    className={`absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.riskLevel === 'Critical'
                        ? 'bg-red-950/90 text-red-400 border border-red-800'
                        : 'bg-amber-950/90 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {c.riskLevel} Risk
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                    {c.name}
                  </h3>
                  <p className="text-xs text-[#94A3B8] flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{c.topHazard}</span>
                  </p>
                </div>
              </div>

              {/* Corridor Footer */}
              <div className="p-4 pt-0">
                <div className="pt-3 border-t border-[#2A364A] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-[#94A3B8] block">PCI Index</span>
                    <span className="font-bold text-white font-mono">{c.pciScore}/100</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#94A3B8] block">Active Defects</span>
                    <span className="font-bold text-red-400 font-mono">{c.issuesCount} logged</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nationwide State-Wise Infrastructure Grid Section */}
      <div className="p-6 rounded-2xl bg-[#1A2332] border border-[#2A364A] shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">
              Nationwide Multi-State Municipal Deployment
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Live operational sync across 16 states, 42 municipal corporations, and national highway authorities.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
            Active Multi-State Routing
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {stateWiseDistribution.map((s, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#111827] border border-[#2A364A] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{s.state}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[10px] font-bold">
                  {s.resolvedRate} Resolved
                </span>
              </div>
              <p className="text-slate-400 text-[11px] truncate">{s.cities}</p>
              <div className="flex items-center justify-between pt-1 border-t border-[#1F293D] text-[11px]">
                <span className="text-slate-500">Recorded Complaints</span>
                <span className="font-mono font-bold text-blue-400">{s.complaints}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
