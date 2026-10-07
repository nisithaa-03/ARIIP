import React, { useState } from 'react';
import { X, Plus, MapPin, Camera, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Incident, IssueType, Severity, DepartmentName } from '../../types/infrastructure';
import potholeImg from '../../assets/images/indian_road_pothole_1790739714987.jpg';
import crackImg from '../../assets/images/indian_road_crack_1790739780245.jpg';
import waterloggingImg from '../../assets/images/indian_road_waterlog_1790739755508.jpg';
import signalImg from '../../assets/images/indian_traffic_signal_1790739797320.jpg';
import manholeImg from '../../assets/images/indian_open_manhole_1790739733586.jpg';

interface NewIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newIncident: Incident) => void;
}

export const NewIncidentModal: React.FC<NewIncidentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<IssueType>('pothole');
  const [severity, setSeverity] = useState<Severity>('high');
  const [department, setDepartment] = useState<DepartmentName>('Road Works');
  const [street, setStreet] = useState('');
  const [district, setDistrict] = useState('Central Zone');
  const [lane, setLane] = useState('Right Lane');
  const [description, setDescription] = useState('');
  const [photoChoice, setPhotoChoice] = useState<'pothole' | 'crack' | 'water' | 'signal' | 'manhole'>('pothole');

  if (!isOpen) return null;

  const photoMap = {
    pothole: potholeImg,
    crack: crackImg,
    water: waterloggingImg,
    signal: signalImg,
    manhole: manholeImg,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !street) return;

    const ticketSeq = Math.floor(1000 + Math.random() * 9000);
    const id = `inc-${Date.now()}`;
    const now = new Date();
    const timestampStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString();

    // Coordinates in India
    const lat = 12.9716 + (Math.random() - 0.5) * 0.04;
    const lng = 77.5946 + (Math.random() - 0.5) * 0.04;

    const newInc: Incident = {
      id,
      ticketNumber: `ARIIP-2026-${ticketSeq}`,
      title,
      type,
      severity,
      status: 'created',
      department,
      location: {
        address: `${street}, ${district}, India`,
        street,
        district,
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        lat,
        lng,
        lane,
      },
      dateReported: dateStr,
      reportedBy: {
        source: 'Citizen Complaint',
        identifier: 'Manual Engineering Entry (M. Vance)',
        timestamp: `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${timestampStr}`,
      },
      description: description || 'Hazard observed and documented by municipal highway officer.',
      imageUrl: photoMap[photoChoice],
      imageMetadata: {
        capturedAt: `${now.toLocaleDateString()} ${timestampStr} PST`,
        resolution: '4032 x 3024',
        device: 'Inspector Mobile Unit',
        fileSize: '3.6 MB',
      },
      aiInsights: {
        issue: title,
        risk: severity === 'critical' ? 'Critical' : severity === 'high' ? 'High' : 'Medium',
        department,
        verification: 'Verified',
        recommendedAction: `Deploy ${department} rapid maintenance crew within 6 hours.`,
        impactLevel: 'Direct corridor disruption. Immediate perimeter coning recommended.',
      },
      timeline: [
        {
          id: `t-${Date.now()}-1`,
          stage: 'created',
          label: 'Created',
          timestamp: 'Just now',
          actor: 'Engineer Logged Entry',
          notes: 'Incident recorded into active municipal dispatch queue.',
          completed: true,
          current: true,
        },
        {
          id: `t-${Date.now()}-2`,
          stage: 'assigned',
          label: 'Assigned',
          timestamp: 'Pending Dispatch',
          actor: `${department} Operations`,
          completed: false,
        },
        {
          id: `t-${Date.now()}-3`,
          stage: 'repair_started',
          label: 'Repair Started',
          timestamp: 'Pending',
          actor: 'Maintenance Crew',
          completed: false,
        },
        {
          id: `t-${Date.now()}-4`,
          stage: 'verification',
          label: 'Verification',
          timestamp: 'Pending',
          actor: 'Field Inspector',
          completed: false,
        },
        {
          id: `t-${Date.now()}-5`,
          stage: 'resolved',
          label: 'Resolved',
          timestamp: 'Pending',
          actor: 'System Auto-Close',
          completed: false,
        },
      ],
      priorityScore: severity === 'critical' ? 95 : severity === 'high' ? 82 : 60,
    };

    onSubmit(newInc);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg bg-[#111827] border border-[#2A364A] rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#2A364A] flex items-center justify-between bg-[#111827]">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-slate-100">Log New Road Infrastructure Hazard</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded text-slate-400 hover:text-slate-200 hover:bg-[#1A2332] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Hazard Title / Headline</label>
            <input
              type="text"
              required
              placeholder="e.g. Deep Pothole Near Intersection"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#1A2332] text-slate-200 border border-[#2A364A] rounded p-2 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Type & Severity Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Issue Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as IssueType)}
                className="w-full bg-[#1A2332] text-slate-200 border border-[#2A364A] rounded p-2 focus:outline-none cursor-pointer"
              >
                <option value="pothole">Asphalt Pothole</option>
                <option value="crack">Surface Crack</option>
                <option value="waterlogging">Drainage & Flood</option>
                <option value="signal">Traffic Signal</option>
                <option value="manhole">Manhole / Sewer</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Severity Level</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Severity)}
                className="w-full bg-[#1A2332] text-slate-200 border border-[#2A364A] rounded p-2 focus:outline-none cursor-pointer"
              >
                <option value="critical">Critical (Red)</option>
                <option value="high">High (Orange)</option>
                <option value="medium">Medium (Yellow)</option>
                <option value="predicted_risk">Predicted Risk (Blue)</option>
              </select>
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Assign to Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value as DepartmentName)}
              className="w-full bg-[#1A2332] text-slate-200 border border-[#2A364A] rounded p-2 focus:outline-none cursor-pointer"
            >
              <option value="Road Works">Road Works</option>
              <option value="Drainage & Stormwater">Drainage & Stormwater</option>
              <option value="Traffic & Signals">Traffic & Signals</option>
              <option value="Structural & Bridges">Structural & Bridges</option>
              <option value="Electrical & Lighting">Electrical & Lighting</option>
            </select>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Street Address</label>
              <input
                type="text"
                required
                placeholder="e.g. 850 Mission St"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full bg-[#1A2332] text-slate-200 border border-[#2A364A] rounded p-2 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Lane / Position</label>
              <input
                type="text"
                placeholder="e.g. Northbound Center Lane"
                value={lane}
                onChange={(e) => setLane(e.target.value)}
                className="w-full bg-[#1A2332] text-slate-200 border border-[#2A364A] rounded p-2 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Photo Evidence Select */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Attach Verified Complaint Photo</label>
            <div className="grid grid-cols-5 gap-2">
              {(['pothole', 'crack', 'water', 'signal', 'manhole'] as const).map((key) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setPhotoChoice(key)}
                  className={`relative rounded-md overflow-hidden border transition-all ${
                    photoChoice === key ? 'border-blue-500 ring-2 ring-blue-500/40' : 'border-[#2A364A] opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={photoMap[key]} alt="" className="w-full h-12 object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] text-slate-200 text-center capitalize py-0.5 truncate">
                    {key}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Description & Field Notes</label>
            <textarea
              rows={2}
              placeholder="Provide context, dimension measurements, or safety hazards observed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#1A2332] text-slate-200 border border-[#2A364A] rounded p-2 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2A364A]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded transition-colors shadow-sm"
            >
              Submit to Queue & Pin on Map
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
