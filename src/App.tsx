import React, { useState, useMemo, useEffect } from 'react';
import {
  initialNotifications
 
} from './data/mockIncidents';
import { Incident } from './types/infrastructure';
import { TopNavbar } from './components/layout/TopNavbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { OsmMap } from './components/map/OsmMap';
import { IncidentDetailsPanel } from './components/incidents/IncidentDetailsPanel';
import { ReportHazardView } from './components/report/ReportHazardView';
import { MyComplaintsView } from './components/complaints/MyComplaintsView';
import { ComplaintDetailsPage } from './components/complaints/ComplaintDetailsPage';
import { DepartmentsView } from './components/departments/DepartmentsView';
import { VerificationQueueView } from './components/verification/VerificationQueueView';
import { SettingsView } from './components/settings/SettingsView';
import { getCityByName, DEFAULT_INDIAN_CITY } from './data/indianLocations';


export default function App() {

  const [incidents, setIncidents] =
  useState<Incident[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/incidents")
      .then((res) => res.json())
      .then((data) => {
        setIncidents(
  data.map((item: any) => ({
    id: item.incident_id,
    ticketNumber: item.incident_id.slice(0, 8),

    title: item.hazard_type,
    description: item.hazard_type,

    severity: item.severity.toLowerCase(),
    status: item.status,

    department: item.department,

    priorityScore: Math.round(item.confidence),

    imageUrl: `http://127.0.0.1:8000/${item.image_path.replace(/\\/g, "/")}`,
    location: {
  city: "Chennai",
  state: "Tamil Nadu",
  district: "Chennai",
  address: `${item.latitude}, ${item.longitude}`,

  lat: item.latitude,
  lng: item.longitude,

  latitude: item.latitude,
  longitude: item.longitude,
},

    reportedBy: {
      identifier: "Citizen",
    },

    type: item.hazard_type,
  }))
);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
      });
  }, []);
  // Default selected incident to ARIIP-2026-0143 Open Manhole
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>('inc-0143');
  const [activeTab, setActiveTab] = useState<NavTab>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [notifications, setNotifications] = useState(initialNotifications);

  // Nationwide, location-aware state
  const [selectedCity, setSelectedCity] = useState<string>('Bengaluru');
  const [selectedState, setSelectedState] = useState<string>('Karnataka');
  const [isAllIndia, setIsAllIndia] = useState<boolean>(false);

  // Current city metadata
  const currentCityInfo = useMemo(() => {
    return getCityByName(selectedCity) || DEFAULT_INDIAN_CITY;
  }, [selectedCity]);

  // Dynamically resolved incidents for the selected city or nationwide
   const cityIncidents = incidents;

  // Filtered incidents based on search query
  const displayedIncidents = useMemo(() => {
    if (!searchQuery.trim()) return cityIncidents;
    const q = searchQuery.toLowerCase();
    return cityIncidents.filter((i) => {
      return (
        i.title.toLowerCase().includes(q) ||
        i.ticketNumber.toLowerCase().includes(q) ||
        i.location.address.toLowerCase().includes(q) ||
        i.location.district.toLowerCase().includes(q) ||
        i.location.city.toLowerCase().includes(q) ||
        i.location.state.toLowerCase().includes(q) ||
        i.department.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q)
      );
    });
  }, [cityIncidents, searchQuery]);

  // Selected incident object
  const selectedIncident = useMemo(() => {
    return (
      displayedIncidents.find((i) => i.id === selectedIncidentId) ||
      displayedIncidents[0] ||
      null
    );
  }, [displayedIncidents, selectedIncidentId]);

  // Dynamic status counts calculated from current active city or nationwide
  const openIssuesCount = displayedIncidents.filter((i) => i.status === 'created' || i.status === 'assigned').length;
  const criticalCount = displayedIncidents.filter((i) => i.severity === 'critical').length;
  const inProgressCount = displayedIncidents.filter((i) => i.status === 'repair_started' || i.status === 'assigned').length;
  const resolvedCount = displayedIncidents.filter((i) => i.status === 'resolved' || i.status === 'verification').length;

  // City change handler
  const handleCityChange = (cityName: string, stateName: string) => {
    setSelectedCity(cityName);
    setSelectedState(stateName);
    setIsAllIndia(false);

    // Pick top hazard for newly selected city
    if (incidents.length > 0) {
  setSelectedIncidentId(incidents[0].id);
}
  };
  const handleToggleAllIndia = () => {
    setIsAllIndia((prev) => !prev);
  };

  // Handlers
  const handleSelectIncident = (incident: Incident) => {
    setSelectedIncidentId(incident.id);
  };

  const handleSelectIncidentFromNav = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
    setActiveTab('map');
  };

  const handleTrackComplaint = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
    setActiveTab('complaint-detail');
  };

  const handleViewComplaint = (complaintId: string) => {
    const found = incidents.find((i) => i.ticketNumber === complaintId || i.id === complaintId);
    if (found) {
      setSelectedIncidentId(found.id);
    }
    setActiveTab('complaint-detail');
  };

  // Storing country, state, city, lat, and lng for EVERY complaint
  const handleNewIncident = (newInc: Incident) => {
  setIncidents((prev) => [newInc, ...prev]);

  setSelectedCity(newInc.location.city);
  setSelectedState(newInc.location.state);
  setIsAllIndia(false);
  setSelectedIncidentId(newInc.id);
  setActiveTab('complaints');
};
  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (

    <div className="flex h-screen w-screen bg-[#0B1220] text-[#E5E7EB] overflow-hidden select-none font-sans">
      {/* Left Sidebar (260px wide) */}
      <Sidebar
        activeTab={activeTab === 'complaint-detail' ? 'complaints' : activeTab}
        onTabChange={setActiveTab}
        onOpenReportModal={() => setActiveTab('report')}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar with Location-Aware Nationwide Selector */}
        <TopNavbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          notifications={notifications}
          onSelectIncident={handleSelectIncidentFromNav}
          onMarkNotificationRead={handleMarkNotificationRead}
          onToggleFilterModal={() => setActiveTab('map')}
          selectedCity={selectedCity}
          selectedState={selectedState}
          onCityChange={handleCityChange}
          isAllIndia={isAllIndia}
          onToggleAllIndia={handleToggleAllIndia}
        />

        {/* Screen 1: Live Map View */}
        {/* Screen 1: Live Map View */}
        {activeTab === 'map' && (
  <div className="flex-1 flex overflow-hidden relative min-h-0 min-w-0">

    <div className="flex-1 h-full relative min-h-0 min-w-0">
      <OsmMap
  incidents={displayedIncidents}
  selectedIncident={selectedIncident}
  onSelectIncident={handleSelectIncident}
  activeCategory={activeCategory}
  onSelectCategory={setActiveCategory}
  openIssuesCount={openIssuesCount}
  criticalCount={criticalCount}
  inProgressCount={inProgressCount}
  resolvedCount={resolvedCount}
  currentCityInfo={currentCityInfo}
  isAllIndia={isAllIndia}
/>
    </div>

    <IncidentDetailsPanel
  incident={selectedIncident}
  onClose={() => setSelectedIncidentId(null)}
  onTrackComplaint={handleTrackComplaint}
/>
  </div>  
 )}
        {/* Screen 2: Report a Hazard */}
        {activeTab === 'report' && (
          <ReportHazardView
            onCancel={() => setActiveTab('map')}
            onSubmitComplaint={handleNewIncident}
            initialCity={selectedCity}
            initialState={selectedState}
          />
        )}

        {/* Screen 3: My Complaints */}
        {activeTab === 'complaints' && (
          <MyComplaintsView
  incidents={incidents}
  onViewComplaint={handleViewComplaint}
  onNewComplaint={() => setActiveTab('report')}
  selectedCity={selectedCity}
  selectedState={selectedState}
  isAllIndia={isAllIndia}
/>
        )}

        {/* Screen 7: Complaint Details (Dedicated Full Page) */}
        {activeTab === 'complaint-detail' && (
          <ComplaintDetailsPage
            incidentId={selectedIncident?.ticketNumber || 'ARIIP-2026-0143'}
            onBack={() => setActiveTab('complaints')}
            selectedIncident={selectedIncident}
          />
        )}

        {/* Screen 4: Departments */}
        {activeTab === 'departments' && (
          <DepartmentsView
  incidents={incidents}
  selectedCity={selectedCity}
  selectedState={selectedState}
  isAllIndia={isAllIndia}
  municipalBody={currentCityInfo.municipalBody}
  onSelectDepartment={(deptName) => {
    setActiveTab('map');
  }}
/>
        )}

        {/* Screen 5: Verification */}
        {activeTab === 'verification' && (
          <VerificationQueueView
            selectedCity={selectedCity}
            selectedState={selectedState}
            isAllIndia={isAllIndia}
          />
        )}

        {/* Screen 8: Settings */}
        {activeTab === 'settings' && (
          <SettingsView />
        )}
      </div>
    </div>
  );
  }
