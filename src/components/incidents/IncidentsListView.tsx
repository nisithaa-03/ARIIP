import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  AlertTriangle,
  Clock,
  MapPin,
  Building,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { Incident, Severity, Status, DepartmentName } from '../../types/infrastructure';
import { SEVERITY_COLORS, STATUS_LABELS, ISSUE_TYPE_LABELS } from '../../utils/helpers';

interface IncidentsListViewProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onOpenNewIncidentModal: () => void;
}

export const IncidentsListView: React.FC<IncidentsListViewProps> = ({
  incidents,
  onSelectIncident,
  onOpenNewIncidentModal,
}) => {
  const [search, setSearch] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<Status | 'all'>('all');
  const [selectedDept, setSelectedDept] = useState<DepartmentName | 'all'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'severity'>('priority');

  const filteredIncidents = incidents
    .filter((inc) => {
      if (selectedSeverity !== 'all' && inc.severity !== selectedSeverity) return false;
      if (selectedStatus !== 'all' && inc.status !== selectedStatus) return false;
      if (selectedDept !== 'all' && inc.department !== selectedDept) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          inc.title.toLowerCase().includes(q) ||
          inc.ticketNumber.toLowerCase().includes(q) ||
          inc.location.street.toLowerCase().includes(q) ||
          inc.department.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') return b.priorityScore - a.priorityScore;
      if (sortBy === 'date') return new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime();
      return 0;
    });

  return (
    <div className="flex-1 bg-[#0B1220] flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden select-none">
      {/* Header bar */}
      <div className="p-4 border-b border-[#2A364A] bg-[#111827] flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-slate-100">Infrastructure Incidents</h1>
            <span className="text-xs font-mono bg-[#1A2332] text-slate-300 px-2 py-0.5 rounded border border-[#2A364A]">
              {filteredIncidents.length} active records
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time municipal hazard logs, dispatch queues, and repair status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewIncidentModal}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Road Hazard</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-3 border-b border-[#2A364A] bg-[#111827]/60 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by street, ticket #, or issue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1A2332] text-xs text-slate-200 placeholder:text-slate-500 pl-8 pr-3 py-1.5 rounded border border-[#2A364A] focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Severity filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value as Severity | 'all')}
            className="bg-[#1A2332] text-slate-300 border border-[#2A364A] rounded px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="resolved">Resolved</option>
            <option value="predicted_risk">Predicted Risk</option>
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as Status | 'all')}
            className="bg-[#1A2332] text-slate-300 border border-[#2A364A] rounded px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="created">Created</option>
            <option value="assigned">Assigned</option>
            <option value="repair_started">Repair Started</option>
            <option value="verification">Verification</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Department filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value as DepartmentName | 'all')}
            className="bg-[#1A2332] text-slate-300 border border-[#2A364A] rounded px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="all">All Departments</option>
            <option value="Road Works">Road Works</option>
            <option value="Drainage & Stormwater">Drainage & Stormwater</option>
            <option value="Traffic & Signals">Traffic & Signals</option>
            <option value="Structural & Bridges">Structural & Bridges</option>
            <option value="Electrical & Lighting">Electrical & Lighting</option>
          </select>

          {/* Sort order */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#1A2332] text-slate-300 border border-[#2A364A] rounded px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="priority">Sort: Priority Score</option>
            <option value="date">Sort: Date Reported</option>
          </select>
        </div>
      </div>

      {/* Table Data View */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 bg-[#111827] border-b border-[#2A364A] text-slate-400 font-medium uppercase tracking-wider text-[11px] z-10">
            <tr>
              <th className="py-2.5 px-4 w-32">Ticket #</th>
              <th className="py-2.5 px-4">Hazard Description</th>
              <th className="py-2.5 px-4 w-28">Severity</th>
              <th className="py-2.5 px-4 w-32">Status</th>
              <th className="py-2.5 px-4 w-44">Department</th>
              <th className="py-2.5 px-4 w-48">Location</th>
              <th className="py-2.5 px-4 w-24 text-right">Priority</th>
              <th className="py-2.5 px-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A364A]/60">
            {filteredIncidents.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  No road incidents match the current filters.
                </td>
              </tr>
            ) : (
              filteredIncidents.map((incident) => {
                const sev = SEVERITY_COLORS[incident.severity];
                const stat = STATUS_LABELS[incident.status];

                return (
                  <tr
                    key={incident.id}
                    onClick={() => onSelectIncident(incident)}
                    className="hover:bg-[#1A2332]/60 transition-colors cursor-pointer group"
                  >
                    {/* Ticket */}
                    <td className="py-3 px-4 font-mono font-medium text-blue-400 whitespace-nowrap">
                      {incident.ticketNumber}
                    </td>

                    {/* Hazard Title & Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={incident.imageUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-10 h-8 rounded object-cover border border-[#2A364A] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-200 group-hover:text-blue-400 transition-colors truncate">
                            {incident.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {ISSUE_TYPE_LABELS[incident.type]} · {incident.reportedBy.identifier}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Severity */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${sev.bg} ${sev.text} border ${sev.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                        {sev.label}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${stat.bg} ${stat.text} border border-[#2A364A]`}
                      >
                        {stat.label}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      {incident.department}
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 text-slate-400 truncate max-w-[200px]">
                      {incident.location.address}
                    </td>

                    {/* Priority Score */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-200">
                      <span
                        className={`font-semibold ${
                          incident.priorityScore > 90
                            ? 'text-red-400'
                            : incident.priorityScore > 75
                            ? 'text-amber-400'
                            : 'text-slate-300'
                        }`}
                      >
                        {incident.priorityScore}
                      </span>
                    </td>

                    {/* Arrow */}
                    <td className="py-3 px-4 text-right text-slate-400 group-hover:text-slate-200">
                      <ChevronRight className="w-4 h-4" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
