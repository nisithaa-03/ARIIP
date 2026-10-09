import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { saveOfflineIncident } from '../../utils/offlineIncidentStore';
import {
  UploadCloud,
  MapPin,
  CheckCircle2,
  Building,
  Target,
  ArrowRight,
  Sparkles,
  Camera,
  Check,
  Radio,
  Droplet,
  Edit2,
  Crosshair,
  Maximize2,
  AlertCircle,
  ChevronDown,
  Info
} from 'lucide-react';
import indianPotholeImg from '../../assets/images/indian_road_pothole_1790739714987.jpg';
import indianCrackImg from '../../assets/images/indian_road_crack_1790739780245.jpg';
import indianWaterlogImg from '../../assets/images/indian_road_waterlog_1790739755508.jpg';
import indianManholeImg from '../../assets/images/indian_open_manhole_1790739733586.jpg';
import indianSignalImg from '../../assets/images/indian_traffic_signal_1790739797320.jpg';
import indianDividerImg from '../../assets/images/indian_road_divider_1790740026519.jpg';
import indianOpenDrainImg from '../../assets/images/indian_open_drain_1790740040367.jpg';
import { Incident } from '../../types/infrastructure';
import {
  INDIAN_STATES,
  ALL_INDIAN_CITIES,
  CityInfo,
  getCitiesByState,
  getCityByName,
  findClosestIndianCity,
  DEFAULT_INDIAN_CITY
} from '../../data/indianLocations';

interface ReportHazardViewProps {
  onCancel: () => void;
  onSubmitComplaint: (newIncident: Incident) => void;
  initialCity?: string;
  initialState?: string;
}

interface HazardDetection {
  class: string;
  confidence: number;
  bbox: [number, number, number, number];
  depth_score?: number | null;
  coverage?: number | null;
  severity: string;
}

interface ImageDimensions {
  width: number;
  height: number;
}

const isHazardDetection = (value: unknown): value is HazardDetection => {
  if (typeof value !== 'object' || value === null) return false;

  const detection = value as Record<string, unknown>;
  return (
    typeof detection.class === 'string' &&
    typeof detection.confidence === 'number' &&
    detection.confidence >= 0 &&
    detection.confidence <= 1 &&
    (detection.depth_score === null ||
      detection.depth_score === undefined ||
      typeof detection.depth_score === 'number') &&
    (detection.coverage === null ||
      detection.coverage === undefined ||
      typeof detection.coverage === 'number') &&
    typeof detection.severity === 'string' &&
    Array.isArray(detection.bbox) &&
    detection.bbox.length === 4 &&
    detection.bbox.every((coordinate) => typeof coordinate === 'number')
  );
};

const drawDetections = (
  canvas: HTMLCanvasElement | null,
  detections: HazardDetection[],
  originalImageWidth: number,
  originalImageHeight: number
) => {
  if (!canvas) {
    console.warn('Detection overlay canvas is not mounted.');
    return;
  }

  const displayedWidth = canvas.clientWidth;
  const displayedHeight = canvas.clientHeight;
  if (displayedWidth === 0 || displayedHeight === 0) {
    console.warn('Detection overlay canvas has no displayed dimensions yet.');
    return;
  }

  canvas.width = displayedWidth;
  canvas.height = displayedHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Unable to get a 2D context for the detection overlay canvas.');
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  console.log('Detections received:', detections);
  console.log('Canvas width/height:', canvas.width, canvas.height);
  console.log('Image/video width/height:', originalImageWidth, originalImageHeight);

  if (originalImageWidth <= 0 || originalImageHeight <= 0) return;

  const scaleX = canvas.width / originalImageWidth;
  const scaleY = canvas.height / originalImageHeight;
  const potholeDetections = detections.filter(
    ({ class: className }) => className.toLowerCase() === 'pothole'
  );
  const crackDetections = detections.filter(
    ({ class: className }) => className.toLowerCase().includes('crack')
  );

  console.log('Total detections received:', detections.length);
  console.log('Number of potholes displayed:', potholeDetections.length);
  console.log('Number of cracks displayed:', crackDetections.length);
  potholeDetections.forEach(({ class: className, depth_score, severity }) => {
    console.log('Pothole overlay details:', {
      class: className,
      depth_score,
      severity,
    });
  });
  crackDetections.forEach(({ class: className, confidence, severity }) => {
    console.log('Crack overlay details:', {
      class: className,
      confidence,
      severity,
    });
  });

  detections.forEach(({ class: className, confidence, bbox, depth_score, coverage, severity }) => {
    const [x1, y1, x2, y2] = bbox;
    const scaledX = x1 * scaleX;
    const scaledY = y1 * scaleY;
    const scaledWidth = (x2 - x1) * scaleX;
    const scaledHeight = (y2 - y1) * scaleY;

    console.log('Scaled bbox coordinates:', {
      class: className,
      x1: scaledX,
      y1: scaledY,
      x2: scaledX + scaledWidth,
      y2: scaledY + scaledHeight,
    });

    const severityColor = {
      high: '#ef4444',
      medium: '#f97316',
      low: '#eab308',
    }[severity.toLowerCase()] ?? '#eab308';

    ctx.lineWidth = 3;
    ctx.strokeStyle = severityColor;
    ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

    const labelLines = [
      `${className} ${(confidence * 100).toFixed(1)}%`,
      ...(depth_score !== null && depth_score !== undefined
        ? [`Depth: ${depth_score.toFixed(3)}`]
        : coverage !== null && coverage !== undefined
          ? [`Coverage: ${coverage.toFixed(1)}%`]
          : []),
      `Severity: ${severity}`,
    ];
    const fontSize = 12;
    const lineHeight = 16;
    const padding = 5;
    ctx.font = `${fontSize}px sans-serif`;
    const labelWidth = Math.max(...labelLines.map((line) => ctx.measureText(line).width)) + padding * 2;
    const labelHeight = labelLines.length * lineHeight + padding * 2;
    const labelX = Math.max(0, Math.min(scaledX, canvas.width - labelWidth));
    const labelY = Math.max(0, scaledY - labelHeight);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.fillRect(labelX, labelY, labelWidth, labelHeight);
    ctx.fillStyle = '#ffffff';
    labelLines.forEach((line, index) => {
      ctx.fillText(
        line,
        labelX + padding,
        labelY + padding + fontSize + index * lineHeight
      );
    });
  });
};

export const ReportHazardView: React.FC<ReportHazardViewProps> = ({
  onCancel,
  onSubmitComplaint,
  initialCity = 'Bengaluru',
  initialState = 'Karnataka',
}) => {
  const startingCityInfo = getCityByName(initialCity) || DEFAULT_INDIAN_CITY;

  // 1. Location state
  const [selectedState, setSelectedState] = useState<string>(initialState || startingCityInfo.state);
  const [selectedCityName, setSelectedCityName] = useState<string>(startingCityInfo.name);
  const [selectedArea, setSelectedArea] = useState<string>(startingCityInfo.areas[0] || '');
  const [streetAddress, setStreetAddress] = useState<string>(
    `Main Road, ${startingCityInfo.areas[0] || startingCityInfo.name}`
  );
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: startingCityInfo.lat,
    lng: startingCityInfo.lng,
  });
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // 2. Hazard & AI Detection state
  const [selectedPhoto, setSelectedPhoto] = useState<string>(indianPotholeImg);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [detectedIssue, setDetectedIssue] = useState<string>('Pothole');
  const [confidence, setConfidence] = useState<number>(97);
  const [depthScore, setDepthScore] = useState<number | null>(null);
  const [coverage, setCoverage] = useState<number | null>(null);
  const [estimatedSeverity, setEstimatedSeverity] = useState<'Critical' | 'High' | 'Medium' | 'Low' | 'Unknown'>('High');
  const [recommendedDept, setRecommendedDept] = useState<string>('Roads Department');
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState<number>(0);

  // 3. Additional details
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<string>('Auto (Based on AI)');
  const [contactNumber, setContactNumber] = useState<string>('+91 98765 43210');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isEditLocationModal, setIsEditLocationModal] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // GPS + Camera States
  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [gpsStatus, setGpsStatus] = useState("Waiting for GPS...");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoOverlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [imageDetections, setImageDetections] = useState<HazardDetection[]>([]);
  const [videoDetections, setVideoDetections] = useState<HazardDetection[]>([]);
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions>({
    width: 0,
    height: 0,
  });

  const getCurrentLocation = () => {
    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation not supported");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        reject,
        { enableHighAccuracy: true, timeout: 20000 }
      );
    });
  };

  
  
  const startCamera = async () => {
    handleAutoDetectLocation();
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
      });

      setStream(mediaStream);
      setCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  };
  const stopCamera = () => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setCameraOpen(false);
    setStream(null);
  };

  const requestLiveDetections = async (
  file: File
): Promise<HazardDetection[]> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    "http://127.0.0.1:8000/live-detect",
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Live detection failed with HTTP status ${response.status}.`
    );
  }

  const payload: unknown = await response.json();

  console.log("RAW LIVE DETECTION RESPONSE:", payload);

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("detections" in payload) ||
    !Array.isArray(payload.detections)
  ) {
    console.error("Invalid backend response:", payload);
    throw new Error(
      "Backend response does not contain a detections array."
    );
  }

  const validDetections: HazardDetection[] = [];

  for (const item of payload.detections) {
    if (typeof item !== "object" || item === null) {
      continue;
    }

    const detection = item as Record<string, unknown>;
    const bbox = detection.bbox;
    const confidence = detection.confidence;

    if (
      typeof detection.class !== "string" ||
      typeof confidence !== "number" ||
      !Number.isFinite(confidence) ||
      confidence < 0 ||
      confidence > 1 ||
      !Array.isArray(bbox) ||
      bbox.length !== 4 ||
      !bbox.every(
        (coordinate) =>
          typeof coordinate === "number" &&
          Number.isFinite(coordinate)
      )
    ) {
      console.warn("Skipping invalid detection:", detection);
      continue;
    }

    validDetections.push({
      class: detection.class,
      confidence,
      bbox: bbox as [number, number, number, number],
      severity:
        typeof detection.severity === "string"
          ? detection.severity
          : "Unknown",
      depth_score:
        typeof detection.depth_score === "number"
          ? detection.depth_score
          : null,
      coverage:
        typeof detection.coverage === "number"
          ? detection.coverage
          : null,
    });
  }

  console.log("VALID DETECTIONS FOR DRAWING:", validDetections);

  return validDetections;
};
  useEffect(() => {
    drawDetections(
      overlayCanvasRef.current,
      imageDetections,
      imageDimensions.width,
      imageDimensions.height
    );
  }, [imageDetections, imageDimensions]);

useEffect(() => {
  const video = videoRef.current;
  const canvas = videoOverlayCanvasRef.current;

  if (!video || !canvas || !cameraOpen) return;

  const renderDetections = () => {
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      return;
    }

    drawDetections(
      canvas,
      videoDetections,
      video.videoWidth,
      video.videoHeight
    );
  };

  // Draw detections when the video is ready.
  renderDetections();

  video.addEventListener("loadedmetadata", renderDetections);
  video.addEventListener("loadeddata", renderDetections);
  video.addEventListener("resize", renderDetections);

  return () => {
    video.removeEventListener("loadedmetadata", renderDetections);
    video.removeEventListener("loadeddata", renderDetections);
    video.removeEventListener("resize", renderDetections);
  };
}, [videoDetections, cameraOpen]);

  useEffect(() => {
  if (!cameraOpen || !stream) return;

  let inFlight = false;

  const intervalId = window.setInterval(async () => {
    const video = videoRef.current;
    const captureCanvas = canvasRef.current;

    if (
      !video ||
      !captureCanvas ||
      video.videoWidth === 0 ||
      video.videoHeight === 0 ||
      inFlight
    ) {
      return;
    }

    inFlight = true;
    setVideoDetections([]);
    try {
      captureCanvas.width = video.videoWidth;
      captureCanvas.height = video.videoHeight;

      const ctx = captureCanvas.getContext("2d");

      if (!ctx) {
        throw new Error("Unable to get a 2D context for camera capture.");
      }

      ctx.drawImage(
        video,
        0,
        0,
        captureCanvas.width,
        captureCanvas.height
      );

      const frameBlob = await new Promise<Blob>((resolve, reject) => {
        captureCanvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Unable to encode camera frame."));
            }
          },
          "image/jpeg"
        );
      });

      const frame = new File(
        [frameBlob],
        "live-frame.jpg",
        { type: "image/jpeg" }
      );

      const detections = await requestLiveDetections(frame);

console.log("Live detections for overlay:", detections);
setVideoDetections(detections);

// Update the overlay for every frame.
// Empty detections clear any old bounding boxes.
setVideoDetections(detections);
    } catch (error) {
      console.error("Live camera detection failed:", error);
    } finally {
      inFlight = false;
    }
  }, 1000);

  return () => window.clearInterval(intervalId);
}, [cameraOpen, stream]);
  const capturePhoto = async () => {
  if (!videoRef.current || !canvasRef.current) return;

  const video = videoRef.current;
  const canvas = canvasRef.current;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.drawImage(video, 0, 0);

  canvas.toBlob(
    async (blob) => {
      if (!blob) return;

      const file = new File(
        [blob],
        `hazard_${Date.now()}.jpg`,
        {
          type: "image/jpeg",
        }
      );

      await handleFileUpload(file);

      stopCamera();
    },
    "image/jpeg",
    0.95
  );
};


  useEffect(() => {
    drawDetections(
      overlayCanvasRef.current,
      imageDetections,
      imageDimensions.width,
      imageDimensions.height
    );
  }, [imageDetections, imageDimensions]);

useEffect(() => {
  const video = videoRef.current;
  const canvas = videoOverlayCanvasRef.current;

  if (!video || !canvas || !cameraOpen) return;

  const renderDetections = () => {
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      return;
    }

    drawDetections(
      canvas,
      videoDetections,
      video.videoWidth,
      video.videoHeight
    );
  };

  // Draw detections when the video is ready.
  renderDetections();

  video.addEventListener("loadedmetadata", renderDetections);
  video.addEventListener("loadeddata", renderDetections);
  video.addEventListener("resize", renderDetections);

  return () => {
    video.removeEventListener("loadedmetadata", renderDetections);
    video.removeEventListener("loadeddata", renderDetections);
    video.removeEventListener("resize", renderDetections);
  };
}, [videoDetections, cameraOpen]);

  useEffect(() => {
  if (!cameraOpen || !stream) return;

  let inFlight = false;

  const intervalId = window.setInterval(async () => {
    const video = videoRef.current;
    const captureCanvas = canvasRef.current;

    if (
      !video ||
      !captureCanvas ||
      video.videoWidth === 0 ||
      video.videoHeight === 0 ||
      inFlight
    ) {
      return;
    }

    inFlight = true;

    try {
      captureCanvas.width = video.videoWidth;
      captureCanvas.height = video.videoHeight;

      const ctx = captureCanvas.getContext("2d");

      if (!ctx) {
        throw new Error("Unable to get a 2D context for camera capture.");
      }

      ctx.drawImage(
        video,
        0,
        0,
        captureCanvas.width,
        captureCanvas.height
      );

      const frameBlob = await new Promise<Blob>((resolve, reject) => {
        captureCanvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Unable to encode camera frame."));
            }
          },
          "image/jpeg"
        );
      });

      const frame = new File(
        [frameBlob],
        "live-frame.jpg",
        { type: "image/jpeg" }
      );

      const detections = await requestLiveDetections(frame);

      console.log("Live detections for overlay:", detections);

      // Keep the latest box visible when a frame has no detections.
      if (detections.length > 0) {
        setVideoDetections(detections);
      }
    } catch (error) {
      console.error("Live camera detection failed:", error);
    } finally {
      inFlight = false;
    }
  }, 1000);

  return () => window.clearInterval(intervalId);
}, [cameraOpen, stream]);
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mini-map ref
  const miniMapContainerRef = useRef<HTMLDivElement>(null);
  const miniMapInstanceRef = useRef<L.Map | null>(null);
  const miniMapMarkerRef = useRef<L.Marker | null>(null);

  // Available cities for currently selected state
  const availableCities = getCitiesByState(selectedState);
  const currentCityInfo = getCityByName(selectedCityName) || availableCities[0] || DEFAULT_INDIAN_CITY;

  // Example Images matching screenshot
  

  // Update cities when state changes
  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    const citiesInState = getCitiesByState(newState);
    if (citiesInState.length > 0) {
      const firstCity = citiesInState[0];
      setSelectedCityName(firstCity.name);
      setSelectedArea(firstCity.areas[0] || 'Main Area');
      setCoords({ lat: firstCity.lat, lng: firstCity.lng });
      setStreetAddress(`Main Carriageway, ${firstCity.areas[0] || firstCity.name}`);
    }
  };

  // Update areas when city changes
  const handleCityChange = (newCity: string) => {
    setSelectedCityName(newCity);
    const city = getCityByName(newCity);
    if (city) {
      setSelectedArea(city.areas[0] || 'Center');
      setCoords({ lat: city.lat, lng: city.lng });
      setStreetAddress(`Main Road, ${city.areas[0] || city.name}`);
    }
  };

  // Update address when area changes
  const handleAreaChange = (newArea: string) => {
    setSelectedArea(newArea);
    setStreetAddress(`${newArea} Main Corridor`);
    const city = getCityByName(selectedCityName);
    if (city) {
      setCoords({ lat: city.lat, lng: city.lng });
    }
  };

  const setPreciseLocation = (lat: number, lng: number, source: 'GPS' | 'Pinned') => {
    const city = findClosestIndianCity(lat, lng);
    setCoords({ lat, lng });
    setSelectedState(city.state);
    setSelectedCityName(city.name);
    setSelectedArea('GPS location');
    setStreetAddress(`${source} coordinates (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
  };

  const distanceFromCityCenterKm = (() => {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
    const latDelta = toRadians(currentCityInfo.lat - coords.lat);
    const lngDelta = toRadians(currentCityInfo.lng - coords.lng);
    const haversine =
      Math.sin(latDelta / 2) ** 2 +
      Math.cos(toRadians(coords.lat)) *
        Math.cos(toRadians(currentCityInfo.lat)) *
        Math.sin(lngDelta / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  })();

  // Pick an example image
 

  // File Upload Handlers
  const handleFileUpload = async (file: File) => {
  if (!file) return;

  setSelectedImageFile(file);

  try {
    // Show uploaded image immediately
    const objectUrl = URL.createObjectURL(file);
    setSelectedPhoto(objectUrl);
    setImageDetections([]);

    requestLiveDetections(file)
      .then(setImageDetections)
      .catch((error: unknown) => {
        console.error("Image live detection failed:", error);
        setImageDetections([]);
      });

    // Get the GPS location at the time the hazard is reported
    const location = await getCurrentLocation();

    setLatitude(location.lat);
    setLongitude(location.lng);

    // Update the location used by the incident
    setCoords({
      lat: location.lat,
      lng: location.lng,
    });

    setPreciseLocation(
      location.lat,
      location.lng,
      "GPS"
    );
if (!navigator.onLine) {
  setDetectedIssue("Saved Offline");
  setConfidence(0);
  setEstimatedSeverity("Medium");
  setRecommendedDept("AI Analysis Pending");

  console.log(
    "📴 Offline: image is ready to be saved with the submitted report."
  );

  return;
}
    console.log("Hazard GPS:", location);

    // Build form data
    const formData = new FormData();
    formData.append("file", file);

    // Use the GPS captured for THIS hazard
    formData.append(
      "latitude",
      location.lat.toString()
    );

    formData.append(
      "longitude",
      location.lng.toString()
    );

    // Call FastAPI backend
    const response = await fetch(
      "http://127.0.0.1:8000/upload-hazard",
      {
        method: "POST",
        body: formData,
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    console.log("Backend Response:", data);

    // Use REAL YOLO results
    console.log("Upload Response:", data);
    setDetectedIssue(data.issue);
    setConfidence(data.confidence);
    setDepthScore(typeof data.depth_score === "number" ? data.depth_score : null);
    setCoverage(typeof data.coverage === "number" ? data.coverage : null);
    setEstimatedSeverity(data.severity);
    setRecommendedDept(data.department);

  } catch (error) {
    console.error("Upload failed:", error);

    setDetectedIssue("Detection Failed");
    setConfidence(0);
    setDepthScore(null);
    setCoverage(null);
    setEstimatedSeverity("Unknown");
    setRecommendedDept("Inspection Required");
  }
};
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Auto-Detect Location with Geolocation API
  const handleAutoDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          setLatitude(lat);
          setLongitude(lng);
          setPreciseLocation(lat, lng, 'GPS');
        },
        () => {
          const city = currentCityInfo;
          const area = city.areas[0] || city.name;
          setCoords({ lat: city.lat, lng: city.lng });
          setSelectedState(city.state);
          setSelectedCityName(city.name);
          setSelectedArea(area);
          setStreetAddress(`Main Road, ${area}`);
        }
      );
    }
  };

  // Initialize Leaflet Mini-Map
  useEffect(() => {
    if (!miniMapContainerRef.current) return;

    if (miniMapInstanceRef.current) {
      miniMapInstanceRef.current.remove();
      miniMapInstanceRef.current = null;
    }

    const map = L.map(miniMapContainerRef.current, {
      center: [coords.lat, coords.lng],
      zoom: 13,
      zoomControl: false,
      attributionControl: true,
    });
    map.attributionControl.setPosition('bottomleft');

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      className: 'leaflet-tile-osm-dark',
    }).addTo(map);

    // Custom Red Drop Pin matching screenshot
    const pinHtml = `
      <div style="position: relative; width: 34px; height: 42px; display: flex; align-items: center; justify-content: center;">
        <svg width="34" height="42" viewBox="0 0 36 44" fill="none">
          <path d="M18 42C18 42 34 26 34 17C34 7.6 26.8 0 18 0C9.2 0 2 7.6 2 17C2 26 18 42 18 42Z" fill="#EF4444" stroke="#FFFFFF" stroke-width="2"/>
          <circle cx="18" cy="17" r="6" fill="#FFFFFF" />
        </svg>
      </div>
    `;

    const pinIcon = L.divIcon({
      className: 'minimap-pin',
      html: pinHtml,
      iconSize: [34, 42],
      iconAnchor: [17, 40],
    });

    const marker = L.marker([coords.lat, coords.lng], {
      icon: pinIcon,
      draggable: true,
    }).addTo(map);

    marker.on('dragend', () => {
      const newPos = marker.getLatLng();
      setPreciseLocation(newPos.lat, newPos.lng, 'Pinned');
    });

    miniMapMarkerRef.current = marker;
    miniMapInstanceRef.current = map;

    // ResizeObserver ensures mini-map renders at full width
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(miniMapContainerRef.current);

    return () => {
      observer.disconnect();
      map.remove();
      miniMapInstanceRef.current = null;
    };
  }, []);

  // Update Mini-Map when coords change
  useEffect(() => {
    if (!miniMapInstanceRef.current || !miniMapMarkerRef.current) return;
    miniMapInstanceRef.current.setView([coords.lat, coords.lng], 13.5, { animate: true });
    miniMapMarkerRef.current.setLatLng([coords.lat, coords.lng]);
  }, [coords.lat, coords.lng]);

  // Submit Complaint Handler
  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("SUBMIT BUTTON CLICKED");

    const ticketNumber = `ARIIP-2026-0${Math.floor(160 + Math.random() * 80)}`;
    const incidentId = `inc-${Date.now()}`;
    const fullAddress = `${streetAddress}, ${selectedArea}, ${selectedCityName}, ${selectedState} - India`;
    const newIncident: Incident = {
      id: incidentId,
      ticketNumber,
      title: detectedIssue,
      type: detectedIssue.toLowerCase().includes("pothole")
        ? "pothole"
        : detectedIssue.toLowerCase().includes("manhole")
        ? "manhole"
        : detectedIssue.toLowerCase().includes("water")
        ? "waterlogging"
        : "crack",
      severity: estimatedSeverity.toLowerCase() as any,
      status: "created",
      department:
        recommendedDept.includes("Sewer")
          ? "Sewer Department"
          : recommendedDept.includes("Drainage")
          ? "Drainage & Stormwater"
          : recommendedDept.includes("Traffic")
          ? "Traffic & Signals"
          : "Road Works",
      location: {
        address: fullAddress,
        street: streetAddress,
        district: selectedArea,
        city: selectedCityName,
        state: selectedState,
        country: "India",
        lat: coords.lat,
        lng: coords.lng,
      },
      dateReported: new Date().toISOString(),
      reportedTimeAgo: "Just now",
      reportedBy: {
        source: "Google Street View & Citizen Inspection",
        identifier: `Citizen Mobile (${contactNumber})`,
        timestamp: "Just now",
      },
      description: description || `Reported ${detectedIssue} on ${streetAddress} in ${selectedCityName}. Immediate municipal action requested.`,
      imageUrl: selectedPhoto,
      galleryImages: [selectedPhoto],
      imageMetadata: {
        capturedAt: "Just now",
        resolution: "4032 x 3024",
        device: "Inspector Mobile Camera",
        fileSize: "3.6 MB",
      },
      aiInsights: {
        issue: detectedIssue,
        risk: estimatedSeverity as any,
        department: recommendedDept as any,
        verification: "Verified",
        recommendedAction: "Rapid patch deployment by municipal zone crew.",
        impactLevel: "Direct vehicle collision hazard.",
      },
      timeline: [
        {
          id: `t-${Date.now()}`,
          stage: "created",
          label: "Complaint Created",
          timestamp: "Just now",
          actor: "Citizen Mobile App",
          completed: true,
          current: true,
        },
        {
          id: `t-${Date.now() + 1}`,
          stage: "assigned",
          label: "Assigned to Ward Crew",
          timestamp: `Auto-routing to ${selectedCityName} Municipal Desk`,
          actor: "Municipal Dispatch",
          completed: false,
        },
      ],
      priorityScore: estimatedSeverity === "Critical" ? 96 : 85,
      accidentRiskPercentage: estimatedSeverity === "Critical" ? 92 : 82,
    };
    if (!navigator.onLine || detectedIssue === "Saved Offline") {
      try {
        if (!selectedImageFile) {
          throw new Error("No image file available for offline storage.");
        }

        const offlineIncident = {
          id: newIncident.id,
          ticketNumber: newIncident.ticketNumber,
          hazardType: newIncident.title,
          severity: newIncident.severity,
          confidence,
          department: recommendedDept,
          latitude: newIncident.location.lat,
          longitude: newIncident.location.lng,
          address: newIncident.location.address,
          city: newIncident.location.city,
          state: newIncident.location.state,
          description: newIncident.description,
          imageBlob: selectedImageFile,
          detectedAt: newIncident.dateReported,
          syncStatus: "pending_ai" as const,
          createdAt: new Date().toISOString(),
          retryCount: 0,
        };

        await saveOfflineIncident(offlineIncident);
        console.log("Offline incident queued:", offlineIncident);
        window.dispatchEvent(new Event("incident-queued"));
      } catch (error) {
        console.error("Failed to queue offline incident:", error);
      }
    }
    setTimeout(() => {
      console.log("Submitting incident:", newIncident);
      onSubmitComplaint(newIncident);
    }, 800);
  };

  return (
    <div className="flex-1 bg-[#0b1220] flex flex-col h-[calc(100vh-4rem)] overflow-y-auto select-none p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Report a Hazard</h1>
        <p className="text-xs text-slate-400 mt-1">
          Help us build safer and better roads. Upload an image and let AI detect the issue automatically.
        </p>
      </div>

      <div className="relative flex items-center justify-between max-w-4xl py-2">
        <div className="flex flex-col items-center gap-1.5 z-10">
          <div className="w-8 h-8 rounded-full bg-[#10b981] text-slate-950 font-bold text-xs flex items-center justify-center shadow-lg shadow-emerald-900/40">
            1
          </div>
          <span className="text-xs font-semibold text-white">Upload & Detect</span>
        </div>

        <div className="flex flex-col items-center gap-1.5 z-10">
          <div className="w-8 h-8 rounded-full bg-[#1a2333] border border-[#2a364a] text-slate-400 font-bold text-xs flex items-center justify-center">
            2
          </div>
          <span className="text-xs font-medium text-slate-400">Location</span>
        </div>

        <div className="flex flex-col items-center gap-1.5 z-10">
          <div className="w-8 h-8 rounded-full bg-[#1a2333] border border-[#2a364a] text-slate-400 font-bold text-xs flex items-center justify-center">
            3
          </div>
          <span className="text-xs font-medium text-slate-400">Details</span>
        </div>

        <div className="flex flex-col items-center gap-1.5 z-10">
          <div className="w-8 h-8 rounded-full bg-[#1a2333] border border-[#2a364a] text-slate-400 font-bold text-xs flex items-center justify-center">
            4
          </div>
          <span className="text-xs font-medium text-slate-400">Review & Submit</span>
        </div>

        <div className="absolute top-[22px] left-10 right-10 h-[2px] bg-[#1a2333] z-0">
          <div className="w-1/4 h-full bg-[#10b981]" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl">
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-[#10b981] text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
              1
            </div>
            <h2 className="text-base font-bold text-white">Upload Image</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`sm:col-span-7 rounded-2xl border-2 border-dashed p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-[#0f1728] ${
                isDragOver
                  ? "border-[#10b981] bg-[#10b981]/5 shadow-xl"
                  : "border-[#243044] hover:border-[#3b82f6]/60"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <div className="w-12 h-12 rounded-xl bg-[#162235] border border-[#243044] flex items-center justify-center text-[#60a5fa] mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-200">Drag and drop an image here</p>
              <p className="text-xs text-slate-400 mt-0.5">
                or <span className="text-[#3b82f6] underline">click to upload</span>
              </p>
              <span className="text-[11px] text-slate-500 mt-3">Supports JPG, PNG (Max 10MB)</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  startCamera();
                }}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold"
              >
                Capture Live Hazard
              </button>
            </div>

            <div className="sm:col-span-5 space-y-3">
              <div className="relative rounded-2xl border border-[#243044] bg-[#0f1728] p-2 overflow-hidden">
                <img
                  src={selectedPhoto}
                  alt="Selected hazard"
                  className="w-full h-32 object-fill rounded-xl"
                  onLoad={(event) => {
                    const image = event.currentTarget;
                    setImageDimensions({
                      width: image.naturalWidth,
                      height: image.naturalHeight,
                    });
                  }}
                />
                <canvas
                  ref={overlayCanvasRef}
                  aria-hidden="true"
                  className="absolute inset-2 z-10 h-32 w-[calc(100%-1rem)] rounded-xl pointer-events-none"
                />
              </div>
              <div className="rounded-2xl bg-[#0f1728] border border-[#243044] p-3 text-xs text-slate-300 space-y-3">
                <div className="flex items-center justify-between">
                  <span>Issue</span>
                  <span className="text-emerald-400 font-semibold">{detectedIssue}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Confidence</span>
                  <span>{confidence.toFixed(1)}%</span>
                </div>
                {depthScore !== null && (
                  <div className="flex items-center justify-between rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2">
                    <span className="font-semibold text-cyan-200">Depth Score</span>
                    <span className="text-lg font-bold tabular-nums text-cyan-300">
                      {depthScore.toFixed(3)}
                    </span>
                  </div>
                )}
                {coverage !== null && (
                  <div className="flex items-center justify-between rounded-xl border border-violet-400/30 bg-violet-400/10 px-3 py-2">
                    <span className="font-semibold text-violet-200">Crack Coverage</span>
                    <span className="text-lg font-bold tabular-nums text-violet-300">
                      {coverage.toFixed(1)}%
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Severity</span>
                  <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 font-bold text-amber-300">
                    {estimatedSeverity}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Department</span>
                  <span>{recommendedDept}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#10b981] text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <h2 className="text-base font-bold text-white">Confirm Location</h2>
            </div>

            <button
              type="button"
              onClick={handleAutoDetectLocation}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Auto-Detect</span>
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  State<span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full bg-[#0f1728] text-white border border-[#243044] rounded-xl px-3 py-2.5 pr-8 appearance-none focus:outline-none focus:border-[#3b82f6] cursor-pointer"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s.code} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  City<span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedCityName}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full bg-[#0f1728] text-white border border-[#243044] rounded-xl px-3 py-2.5 pr-8 appearance-none focus:outline-none focus:border-[#3b82f6] cursor-pointer"
                  >
                    {availableCities.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="relative text-xs">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedArea}
                onChange={(e) => handleAreaChange(e.target.value)}
                className="w-full bg-[#0f1728] text-slate-200 border border-[#243044] rounded-xl pl-10 pr-8 py-2.5 appearance-none focus:outline-none focus:border-[#3b82f6] cursor-pointer"
              >
                {selectedArea === "GPS location" && <option value="GPS location">GPS location</option>}
                {currentCityInfo.areas.map((a) => (
                  <option key={a} value={a}>
                    {a}, {selectedCityName}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative h-52 w-full rounded-2xl overflow-hidden border border-[#243044] shadow-xl bg-[#0a0f19]">
              <div
                ref={miniMapContainerRef}
                className="w-full h-full"
                style={{ width: "100%", height: "100%" }}
              />

              <div className="absolute top-3 right-3 bg-[#111928]/95 backdrop-blur-md border border-[#243044] rounded-xl p-3 max-w-[210px] shadow-2xl z-[500]">
                <span className="text-[10px] text-slate-400 font-semibold block leading-tight">Selected Location</span>
                <p className="text-xs font-medium text-white leading-snug mt-1 break-words">
                  {selectedArea === "GPS location" ? (
                    <>
                      {streetAddress}
                      <span className="block text-[10px] text-slate-400 mt-1">
                        Nearest listed city: {selectedCityName} ({distanceFromCityCenterKm.toFixed(1)} km from center)
                      </span>
                    </>
                  ) : (
                    `${streetAddress}, ${selectedCityName} - India`
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setIsEditLocationModal(true)}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 mt-1.5"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleAutoDetectLocation}
                className="absolute bottom-3 right-3 w-8 h-8 rounded-lg bg-[#111928]/95 border border-[#243044] text-slate-300 hover:text-white flex items-center justify-center shadow-lg z-[500]"
                title="Locate Me"
              >
                <Crosshair className="w-4 h-4 text-blue-400" />
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#10b981] text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
                3
              </div>
              <h2 className="text-base font-bold text-white">Additional Details</h2>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <label className="text-slate-300 font-medium">Description (Optional)</label>
                <span className="text-[11px] text-slate-500 font-mono">{description.length}/300</span>
              </div>
              <textarea
                value={description}
                maxLength={300}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any additional details about the issue..."
                rows={3}
                className="w-full bg-[#0f1728] border border-[#243044] rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#3b82f6] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Priority (Optional)</label>
                <div className="relative">
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-[#0f1728] text-white border border-[#243044] rounded-xl px-3 py-2.5 pr-8 appearance-none focus:outline-none focus:border-[#3b82f6]"
                  >
                    <option value="Auto (Based on AI)">Auto (Based on AI)</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Contact Number (Optional)</label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full bg-[#0f1728] text-white border border-[#243044] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#3b82f6]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#10b981] text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
                4
              </div>
              <h2 className="text-base font-bold text-white">Review & Submit</h2>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="w-full py-4 bg-[#10b981] hover:bg-[#059669] active:bg-[#047857] disabled:opacity-50 text-slate-950 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-950/50 cursor-pointer"
            >
              <span>{isSubmitting ? "Routing Complaint to Dispatch..." : "Submit Complaint"}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {isEditLocationModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsEditLocationModal(false)}
        >
          <div
            className="w-full max-w-md bg-[#111928] border border-[#243044] rounded-2xl p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-white">Edit Street Address</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Street & Landmark</label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full bg-[#1a2333] text-white border border-[#2a364a] rounded-xl p-2.5 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Area / Ward</label>
                <input
                  type="text"
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full bg-[#1a2333] text-white border border-[#2a364a] rounded-xl p-2.5 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditLocationModal(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold"
                >
                  Confirm Address
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {cameraOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="bg-[#111928] p-4 rounded-2xl w-[90%] max-w-xl">
            <h2 className="text-white text-xl font-bold mb-4">Capture Hazard</h2>
            <div className="relative w-full h-[400px]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-fill rounded-xl bg-black"
              />
              <canvas
                ref={videoOverlayCanvasRef}
                aria-hidden="true"
                className="absolute inset-0 z-10 h-full w-full rounded-xl pointer-events-none"
              />
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={capturePhoto}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
              >
                Capture
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
