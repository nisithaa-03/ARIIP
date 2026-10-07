import { Severity, Status, IssueType } from '../types/infrastructure';

export const SEVERITY_COLORS: Record<Severity, { bg: string; text: string; border: string; hex: string; dot: string; label: string }> = {
  critical: {
    bg: 'bg-red-950/40',
    text: 'text-red-400',
    border: 'border-red-900/50',
    hex: '#EF4444',
    dot: 'bg-red-500',
    label: 'Critical',
  },
  high: {
    bg: 'bg-amber-950/40',
    text: 'text-amber-400',
    border: 'border-amber-900/50',
    hex: '#F59E0B',
    dot: 'bg-amber-500',
    label: 'High',
  },
  medium: {
    bg: 'bg-yellow-950/40',
    text: 'text-yellow-400',
    border: 'border-yellow-900/50',
    hex: '#EAB308',
    dot: 'bg-yellow-400',
    label: 'Medium',
  },
  resolved: {
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-400',
    border: 'border-emerald-900/50',
    hex: '#22C55E',
    dot: 'bg-emerald-500',
    label: 'Resolved',
  },
  predicted_risk: {
    bg: 'bg-blue-950/40',
    text: 'text-blue-400',
    border: 'border-blue-900/50',
    hex: '#3B82F6',
    dot: 'bg-blue-500',
    label: 'Predicted Risk',
  },
};

export const STATUS_LABELS: Record<Status, { label: string; text: string; bg: string }> = {
  created: {
    label: 'Created',
    text: 'text-slate-300',
    bg: 'bg-slate-800/80',
  },
  assigned: {
    label: 'Assigned',
    text: 'text-blue-300',
    bg: 'bg-blue-950/60',
  },
  repair_started: {
    label: 'Repair Started',
    text: 'text-amber-300',
    bg: 'bg-amber-950/60',
  },
  verification: {
    label: 'Verification',
    text: 'text-purple-300',
    bg: 'bg-purple-950/60',
  },
  resolved: {
    label: 'Resolved',
    text: 'text-emerald-300',
    bg: 'bg-emerald-950/60',
  },
};

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  pothole: 'Asphalt Pothole',
  crack: 'Surface & Structural Crack',
  waterlogging: 'Drainage & Waterlogging',
  signal: 'Traffic Signal & Arm',
  manhole: 'Manhole & Utility Cover',
  streetlight: 'Streetlight & Lamp Post',
  subsidence: 'Subsurface Subsidence',
  guardrail: 'Guardrail & Barrier',
  other: 'Other Hazard',
};
