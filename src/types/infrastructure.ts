export type Severity = 'critical' | 'high' | 'medium' | 'resolved' | 'predicted_risk';

export type Status = 'created' | 'assigned' | 'repair_started' | 'verification' | 'resolved';

export type IssueType =
  | 'pothole'
  | 'crack'
  | 'waterlogging'
  | 'signal'
  | 'manhole'
  | 'streetlight'
  | 'subsidence'
  | 'guardrail'
  | 'other';

export type DepartmentName =
  | 'Sewer Department'
  | 'Road Works'
  | 'Drainage & Stormwater'
  | 'Traffic & Signals'
  | 'Electrical & Lighting'
  | 'Structural & Bridges';

export interface TimelineEntry {
  id: string;
  stage: Status;
  label: string;
  timestamp: string;
  actor: string;
  notes?: string;
  completed: boolean;
  current?: boolean;
}

export interface AiInsights {
  issue: string;
  risk: 'Critical' | 'High' | 'Medium' | 'Low';
  department: DepartmentName;
  verification: 'Pending' | 'Verified' | 'Auto-Detected' | 'Audit Required';
  recommendedAction: string;
  impactLevel: string;
}

export interface Incident {
  id: string;
  ticketNumber: string;
  title: string;
  type: IssueType;
  severity: Severity;
  status: Status;
  department: DepartmentName;
  location: {
    address: string;
    street: string;
    district: string;
    city: string;
    state: string;
    country: string;
    lat: number;
    lng: number;
    lane?: string;
    postalCode?: string;
  };
  dateReported: string;
  reportedTimeAgo?: string;
  reportedBy: {
    source: 'Citizen Complaint' | 'Patrol LiDAR Unit' | 'Municipal Drone' | 'Traffic CCTV' | 'Google Street View & Citizen Inspection' | 'Google Street View';
    identifier: string;
    timestamp: string;
  };
  description: string;
  imageUrl: string;
  galleryImages?: string[];
  imageMetadata: {
    capturedAt: string;
    resolution: string;
    device: string;
    fileSize: string;
  };
  aiInsights: AiInsights;
  timeline: TimelineEntry[];
  assignedCrew?: {
    teamName: string;
    supervisor: string;
    vehicleUnit: string;
    contact: string;
    dispatchedAt?: string;
  };
  priorityScore: number; // 1-100
  accidentRiskPercentage?: number; // e.g. 91
}

export interface DepartmentInfo {
  id?: string;
  name: DepartmentName;
  shortCode?: string;
  activeTickets?: number;
  resolvedTickets?: number;
  activeIncidents?: number;
  criticalIncidents?: number;
  assignedCrews?: number;
  availableCrews: number;
  totalCrews?: number;
  avgResolutionHours: number;
  headOfDepartment?: string;
  contactNumber?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  severity?: 'critical' | 'high' | 'info';
  type?: string;
  incidentId?: string;
  read: boolean;
}
