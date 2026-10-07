export interface CityInfo {
  name: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  zoom: number;
  municipalBody: string;
  areas: string[];
}

export interface StateInfo {
  name: string;
  code: string;
  cities: CityInfo[];
}

export const INDIAN_STATES: StateInfo[] = [
  {
    name: 'Karnataka',
    code: 'KA',
    cities: [
      {
        name: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        lat: 12.9716,
        lng: 77.5946,
        zoom: 12.8,
        municipalBody: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
        areas: [
          'Koramangala',
          'Indiranagar',
          'HSR Layout',
          'Whitefield',
          'Hebbal',
          'Jayanagar',
          'Madiwala',
          'Ejipura',
          'BTM Layout',
          'Marathahalli',
          'Malleshwaram',
          'Electronic City'
        ],
      },
      {
        name: 'Mysuru',
        state: 'Karnataka',
        country: 'India',
        lat: 12.2958,
        lng: 76.6394,
        zoom: 13,
        municipalBody: 'Mysuru City Corporation (MCC)',
        areas: ['Vijayanagar', 'Gokulam', 'Kuvempunagar', 'Saraswathipuram', 'Jayalakshmipuram', 'Hebbal Industrial Area'],
      },
      {
        name: 'Mangaluru',
        state: 'Karnataka',
        country: 'India',
        lat: 12.9141,
        lng: 74.856,
        zoom: 13,
        municipalBody: 'Mangaluru City Corporation (MCC)',
        areas: ['Hampankatta', 'Kadri', 'Bejai', 'Kankanady', 'Surathkal', 'Lalbagh'],
      },
      {
        name: 'Hubballi-Dharwad',
        state: 'Karnataka',
        country: 'India',
        lat: 15.3647,
        lng: 75.124,
        zoom: 12.5,
        municipalBody: 'Hubballi-Dharwad Municipal Corporation (HDMC)',
        areas: ['Vidyanagar', 'Gokul Road', 'Navanagar', 'Keshwapur', 'Station Road'],
      }
    ],
  },
  {
    name: 'Maharashtra',
    code: 'MH',
    cities: [
      {
        name: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        lat: 19.076,
        lng: 72.8777,
        zoom: 12.2,
        municipalBody: 'Brihanmumbai Municipal Corporation (BMC)',
        areas: [
          'Bandra West',
          'Andheri East',
          'Lower Parel',
          'Dadar',
          'Colaba',
          'Juhu',
          'Goregaon',
          'Powai',
          'BKC (Bandra Kurla Complex)',
          'Worli'
        ],
      },
      {
        name: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        lat: 18.5204,
        lng: 73.8567,
        zoom: 12.5,
        municipalBody: 'Pune Municipal Corporation (PMC)',
        areas: ['Kothrud', 'Hinjawadi', 'Viman Nagar', 'Shivaji Nagar', 'Koregaon Park', 'Baner', 'Aundh', 'Hadapsar'],
      },
      {
        name: 'Nagpur',
        state: 'Maharashtra',
        country: 'India',
        lat: 21.1458,
        lng: 79.0882,
        zoom: 12.5,
        municipalBody: 'Nagpur Municipal Corporation (NMC)',
        areas: ['Dharampeth', 'Civil Lines', 'Sitabuldi', 'Manish Nagar', 'Sadar'],
      },
      {
        name: 'Thane',
        state: 'Maharashtra',
        country: 'India',
        lat: 19.2183,
        lng: 72.9781,
        zoom: 13,
        municipalBody: 'Thane Municipal Corporation (TMC)',
        areas: ['Ghodbunder Road', 'Panchpakhadi', 'Majiwada', 'Vartak Nagar', 'Naupada'],
      }
    ],
  },
  {
    name: 'Delhi NCR',
    code: 'DL',
    cities: [
      {
        name: 'New Delhi',
        state: 'Delhi NCR',
        country: 'India',
        lat: 28.6139,
        lng: 77.209,
        zoom: 12.5,
        municipalBody: 'Municipal Corporation of Delhi (MCD)',
        areas: [
          'Connaught Place',
          'Karol Bagh',
          'South Extension',
          'Dwarka',
          'Rohini',
          'Lajpat Nagar',
          'Hauz Khas',
          'Vasant Kunj',
          'Chandni Chowk',
          'Saket'
        ],
      },
      {
        name: 'Noida',
        state: 'Delhi NCR',
        country: 'India',
        lat: 28.5355,
        lng: 77.391,
        zoom: 12.8,
        municipalBody: 'Noida Authority',
        areas: ['Sector 18', 'Sector 62', 'Sector 150', 'Greater Noida West', 'Sector 137'],
      },
      {
        name: 'Gurugram',
        state: 'Delhi NCR',
        country: 'India',
        lat: 28.4595,
        lng: 77.0266,
        zoom: 12.8,
        municipalBody: 'Municipal Corporation of Gurugram (MCG)',
        areas: ['Cyber City', 'Golf Course Road', 'Sector 29', 'Sohna Road', 'DLF Phase 1-5', 'Udyog Vihar'],
      }
    ],
  },
  {
    name: 'Tamil Nadu',
    code: 'TN',
    cities: [
      {
        name: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        lat: 13.0827,
        lng: 80.2707,
        zoom: 12.5,
        municipalBody: 'Greater Chennai Corporation (GCC)',
        areas: ['T. Nagar', 'Anna Nagar', 'Adyar', 'Velachery', 'Mylapore', 'OMR (IT Corridor)', 'Guindy', 'Alwarpet'],
      },
      {
        name: 'Coimbatore',
        state: 'Tamil Nadu',
        country: 'India',
        lat: 11.0168,
        lng: 76.9558,
        zoom: 12.8,
        municipalBody: 'Coimbatore City Municipal Corporation',
        areas: ['RS Puram', 'Gandhipuram', 'Peelamedu', 'Saibaba Colony', 'Saravanampatti'],
      },
      {
        name: 'Madurai',
        state: 'Tamil Nadu',
        country: 'India',
        lat: 9.9252,
        lng: 78.1198,
        zoom: 13,
        municipalBody: 'Madurai Corporation',
        areas: ['KK Nagar', 'Anna Nagar', 'Tallakulam', 'Simmakkal', 'Villapuram'],
      }
    ],
  },
  {
    name: 'Telangana',
    code: 'TG',
    cities: [
      {
        name: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        lat: 17.385,
        lng: 78.4867,
        zoom: 12.3,
        municipalBody: 'Greater Hyderabad Municipal Corporation (GHMC)',
        areas: ['Hitec City', 'Gachibowli', 'Banjara Hills', 'Jubilee Hills', 'Madhapur', 'Secunderabad', 'Kondapur', 'Kukatpally'],
      },
      {
        name: 'Warangal',
        state: 'Telangana',
        country: 'India',
        lat: 17.9689,
        lng: 79.5941,
        zoom: 13,
        municipalBody: 'Greater Warangal Municipal Corporation (GWMC)',
        areas: ['Hanamkonda', 'Kazipet', 'Subedari', 'Nayeem Nagar'],
      }
    ],
  },
  {
    name: 'West Bengal',
    code: 'WB',
    cities: [
      {
        name: 'Kolkata',
        state: 'West Bengal',
        country: 'India',
        lat: 22.5726,
        lng: 88.3639,
        zoom: 12.5,
        municipalBody: 'Kolkata Municipal Corporation (KMC)',
        areas: ['Salt Lake (Bidhannagar)', 'Park Street', 'New Town', 'Ballygunge', 'Alipore', 'Howrah', 'Gariahat', 'Dum Dum'],
      },
      {
        name: 'Siliguri',
        state: 'West Bengal',
        country: 'India',
        lat: 26.7271,
        lng: 88.3953,
        zoom: 13,
        municipalBody: 'Siliguri Municipal Corporation',
        areas: ['Pradhan Nagar', 'Sevoke Road', 'Hakim Para', 'Matigara'],
      }
    ],
  },
  {
    name: 'Gujarat',
    code: 'GJ',
    cities: [
      {
        name: 'Ahmedabad',
        state: 'Gujarat',
        country: 'India',
        lat: 23.0225,
        lng: 72.5714,
        zoom: 12.4,
        municipalBody: 'Amdavad Municipal Corporation (AMC)',
        areas: ['SG Highway', 'Navrangpura', 'Bodakdev', 'Vastrapur', 'Prahlad Nagar', 'Maninagar', 'Satellite'],
      },
      {
        name: 'Surat',
        state: 'Gujarat',
        country: 'India',
        lat: 21.1702,
        lng: 72.8311,
        zoom: 12.6,
        municipalBody: 'Surat Municipal Corporation (SMC)',
        areas: ['Adajan', 'Vesu', 'Varachha', 'Piplod', 'Ghopad', 'Athwa'],
      },
      {
        name: 'Vadodara',
        state: 'Gujarat',
        country: 'India',
        lat: 22.3072,
        lng: 73.1812,
        zoom: 12.8,
        municipalBody: 'Vadodara Municipal Corporation (VMC)',
        areas: ['Alkapuri', 'Gotri', 'Manjalpur', 'Sayajigunj', 'Karelibaug'],
      }
    ],
  },
  {
    name: 'Uttar Pradesh',
    code: 'UP',
    cities: [
      {
        name: 'Lucknow',
        state: 'Uttar Pradesh',
        country: 'India',
        lat: 26.8467,
        lng: 80.9462,
        zoom: 12.5,
        municipalBody: 'Lucknow Municipal Corporation (LMC)',
        areas: ['Gomti Nagar', 'Hazratganj', 'Aliganj', 'Indira Nagar', 'Alambagh', 'Mahanagar'],
      },
      {
        name: 'Kanpur',
        state: 'Uttar Pradesh',
        country: 'India',
        lat: 26.4499,
        lng: 80.3319,
        zoom: 12.5,
        municipalBody: 'Kanpur Municipal Corporation',
        areas: ['Civil Lines', 'Swaroop Nagar', 'Kakadeo', 'Kidwai Nagar'],
      },
      {
        name: 'Varanasi',
        state: 'Uttar Pradesh',
        country: 'India',
        lat: 25.3176,
        lng: 82.9739,
        zoom: 13,
        municipalBody: 'Varanasi Nagar Nigam',
        areas: ['Lanka', 'Sigra', 'Godowlia', 'Bhelupur', 'Shivpur'],
      }
    ],
  },
  {
    name: 'Kerala',
    code: 'KL',
    cities: [
      {
        name: 'Kochi',
        state: 'Kerala',
        country: 'India',
        lat: 9.9312,
        lng: 76.2673,
        zoom: 12.8,
        municipalBody: 'Kochi Municipal Corporation',
        areas: ['Kakkanad (Infopark)', 'Marine Drive', 'Edappally', 'Palarivattom', 'Fort Kochi', 'Panampilly Nagar'],
      },
      {
        name: 'Thiruvananthapuram',
        state: 'Kerala',
        country: 'India',
        lat: 8.5241,
        lng: 76.9366,
        zoom: 12.8,
        municipalBody: 'Thiruvananthapuram Corporation',
        areas: ['Kazhakoottam (Technopark)', 'Kowdiar', 'Pattom', 'Vellayambalam', 'East Fort'],
      }
    ],
  },
  {
    name: 'Rajasthan',
    code: 'RJ',
    cities: [
      {
        name: 'Jaipur',
        state: 'Rajasthan',
        country: 'India',
        lat: 26.9124,
        lng: 75.7873,
        zoom: 12.5,
        municipalBody: 'Jaipur Greater & Heritage Municipal Corporation',
        areas: ['Malviya Nagar', 'Vaishali Nagar', 'C-Scheme', 'Mansarovar', 'Raja Park', 'Tonk Road'],
      },
      {
        name: 'Jodhpur',
        state: 'Rajasthan',
        country: 'India',
        lat: 26.2389,
        lng: 73.0243,
        zoom: 13,
        municipalBody: 'Jodhpur Nagar Nigam',
        areas: ['Shastri Nagar', 'Ratanada', 'Sardarpura', 'Paota'],
      }
    ],
  },
  {
    name: 'Madhya Pradesh',
    code: 'MP',
    cities: [
      {
        name: 'Indore',
        state: 'Madhya Pradesh',
        country: 'India',
        lat: 22.7196,
        lng: 75.8577,
        zoom: 12.6,
        municipalBody: 'Indore Municipal Corporation (IMC)',
        areas: ['Vijay Nagar', 'Palasia', 'AB Road', 'Rau', 'Chappan Dukan', 'Bhawarkua'],
      },
      {
        name: 'Bhopal',
        state: 'Madhya Pradesh',
        country: 'India',
        lat: 23.2599,
        lng: 77.4126,
        zoom: 12.6,
        municipalBody: 'Bhopal Municipal Corporation (BMC)',
        areas: ['Arera Colony', 'MP Nagar', 'Kolar Road', 'Shahpura'],
      }
    ],
  },
  {
    name: 'Punjab',
    code: 'PB',
    cities: [
      {
        name: 'Chandigarh',
        state: 'Punjab',
        country: 'India',
        lat: 30.7333,
        lng: 76.7794,
        zoom: 13,
        municipalBody: 'Municipal Corporation Chandigarh (MCC)',
        areas: ['Sector 17', 'Sector 35', 'Sector 22', 'Sector 43', 'IT Park (Kishangarh)'],
      },
      {
        name: 'Ludhiana',
        state: 'Punjab',
        country: 'India',
        lat: 30.901,
        lng: 75.8573,
        zoom: 12.7,
        municipalBody: 'Municipal Corporation Ludhiana',
        areas: ['Model Town', 'Sarabha Nagar', 'Ferozepur Road', 'Civil Lines'],
      },
      {
        name: 'Amritsar',
        state: 'Punjab',
        country: 'India',
        lat: 31.634,
        lng: 74.8723,
        zoom: 13,
        municipalBody: 'Municipal Corporation Amritsar',
        areas: ['Ranjit Avenue', 'Mall Road', 'Lawrence Road', 'Civil Lines'],
      }
    ],
  },
  {
    name: 'Andhra Pradesh',
    code: 'AP',
    cities: [
      {
        name: 'Visakhapatnam',
        state: 'Andhra Pradesh',
        country: 'India',
        lat: 17.6868,
        lng: 83.2185,
        zoom: 12.6,
        municipalBody: 'Greater Visakhapatnam Municipal Corporation (GVMC)',
        areas: ['MVP Colony', 'Siripuram', 'Gajuwaka', 'Madhurawada', 'Dwaraka Nagar'],
      },
      {
        name: 'Vijayawada',
        state: 'Andhra Pradesh',
        country: 'India',
        lat: 16.5062,
        lng: 80.648,
        zoom: 13,
        municipalBody: 'Vijayawada Municipal Corporation (VMC)',
        areas: ['Benz Circle', 'Governorpet', 'Moghalrajpuram', 'Bhavanipuram'],
      }
    ],
  },
  {
    name: 'Bihar',
    code: 'BR',
    cities: [
      {
        name: 'Patna',
        state: 'Bihar',
        country: 'India',
        lat: 25.5941,
        lng: 85.1376,
        zoom: 12.8,
        municipalBody: 'Patna Municipal Corporation (PMC)',
        areas: ['Boring Road', 'Kankarbagh', 'Bailey Road', 'Patliputra Colony', 'Rajendra Nagar'],
      }
    ],
  },
  {
    name: 'Odisha',
    code: 'OD',
    cities: [
      {
        name: 'Bhubaneswar',
        state: 'Odisha',
        country: 'India',
        lat: 20.2961,
        lng: 85.8245,
        zoom: 12.8,
        municipalBody: 'Bhubaneswar Municipal Corporation (BMC)',
        areas: ['Saheed Nagar', 'Jayadev Vihar', 'Patia (Infocity)', 'Khandagiri', 'Chandrasekharpur'],
      }
    ],
  },
  {
    name: 'Assam',
    code: 'AS',
    cities: [
      {
        name: 'Guwahati',
        state: 'Assam',
        country: 'India',
        lat: 26.1445,
        lng: 91.7362,
        zoom: 12.8,
        municipalBody: 'Guwahati Municipal Corporation (GMC)',
        areas: ['GS Road', 'Dispur', 'Ulubari', 'Paltan Bazaar', 'Beltola'],
      }
    ],
  }
];

// Flat list of all Indian cities
export const ALL_INDIAN_CITIES: CityInfo[] = INDIAN_STATES.flatMap((state) => state.cities);

// Helper to get all state names
export function getAllIndianStates(): string[] {
  return INDIAN_STATES.map((s) => s.name);
}

// Helper to get cities for a state
export function getCitiesByState(stateName: string): CityInfo[] {
  const state = INDIAN_STATES.find((s) => s.name.toLowerCase() === stateName.toLowerCase());
  return state ? state.cities : [];
}

// Helper to get city details by city name
export function getCityByName(cityName: string): CityInfo | undefined {
  return ALL_INDIAN_CITIES.find(
    (c) => c.name.toLowerCase() === cityName.toLowerCase()
  );
}

// Helper: Haversine distance in km
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Auto-detect closest Indian city to given latitude & longitude
export function findClosestIndianCity(lat: number, lng: number): CityInfo {
  let closest = ALL_INDIAN_CITIES[0];
  let minDistance = Infinity;

  for (const city of ALL_INDIAN_CITIES) {
    const dist = haversineDistance(lat, lng, city.lat, city.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = city;
    }
  }

  return closest;
}

export const DEFAULT_INDIAN_CITY: CityInfo = ALL_INDIAN_CITIES[0]; // Bengaluru
