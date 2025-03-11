
export interface Specialist {
  id: string | number;
  name: string;
  specialty: string;
  conditions: string[];
  location?: string;
  phone?: string;
  address?: string;
}

export interface TopTreatmentLocation {
  city: string;
  country: string;
  reason?: string;
}

export interface SpecialistInfo {
  locations?: string[];
  topTreatmentLocations?: TopTreatmentLocation[];
}

export const specialists: Specialist[] = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Dermatology",
    conditions: ["Acne", "Eczema", "Psoriasis", "Skin Cancer"],
    location: "New York, NY",
    phone: "(212) 555-1234",
    address: "123 Medical Plaza, New York, NY 10001"
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Cardiology",
    conditions: ["Heart Disease", "Hypertension", "Arrhythmia", "Chest Pain"],
    location: "Boston, MA",
    phone: "(617) 555-5678",
    address: "456 Cardiac Center, Boston, MA 02115"
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    specialty: "Endocrinology",
    conditions: ["Diabetes", "Thyroid Disorders", "Hormone Imbalances", "Metabolism Disorders"],
    location: "Chicago, IL",
    phone: "(312) 555-9012",
    address: "789 Endocrine Suite, Chicago, IL 60601"
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    specialty: "Neurology",
    conditions: ["Migraines", "Epilepsy", "Multiple Sclerosis", "Parkinson's Disease"],
    location: "Los Angeles, CA",
    phone: "(323) 555-3456",
    address: "321 Neuro Building, Los Angeles, CA 90001"
  },
  {
    id: 5,
    name: "Dr. Priya Patel",
    specialty: "Rheumatology",
    conditions: ["Rheumatoid Arthritis", "Lupus", "Osteoarthritis", "Gout"],
    location: "Houston, TX",
    phone: "(713) 555-7890",
    address: "654 Rheumatology Center, Houston, TX 77001"
  }
];

// Specialist additional information for detailed views
export const specialistsInfo: Record<string, SpecialistInfo> = {
  "Endocrinology": {
    locations: ["New York", "Boston", "Chicago", "Los Angeles", "Houston"],
    topTreatmentLocations: [
      { city: "Boston", country: "USA", reason: "Advanced diabetes research centers" },
      { city: "New York", country: "USA", reason: "Specialized thyroid clinics" },
      { city: "Rochester", country: "USA", reason: "Mayo Clinic expertise" }
    ]
  },
  "Rheumatology": {
    locations: ["Boston", "New York", "Baltimore", "San Francisco"],
    topTreatmentLocations: [
      { city: "Boston", country: "USA", reason: "Leading arthritis research" },
      { city: "Baltimore", country: "USA", reason: "Johns Hopkins expertise" }
    ]
  },
  "Neurology": {
    locations: ["Rochester", "Baltimore", "Boston", "San Francisco"],
    topTreatmentLocations: [
      { city: "Rochester", country: "USA", reason: "Mayo Clinic neurology department" },
      { city: "Baltimore", country: "USA", reason: "Johns Hopkins neurology center" },
      { city: "London", country: "UK", reason: "National Hospital for Neurology and Neurosurgery" }
    ]
  },
  "Infectious Disease": {
    locations: ["Atlanta", "Baltimore", "Seattle", "Boston"],
    topTreatmentLocations: [
      { city: "Atlanta", country: "USA", reason: "CDC headquarters and expertise" },
      { city: "Baltimore", country: "USA", reason: "Johns Hopkins infectious disease research" },
      { city: "Geneva", country: "Switzerland", reason: "WHO headquarters and international expertise" }
    ]
  },
  "Primary Care": {
    locations: ["Nationwide coverage in most cities"]
  },
  "Orthopedics": {
    locations: ["New York", "Boston", "Chicago", "Los Angeles", "Rochester"],
    topTreatmentLocations: [
      { city: "Rochester", country: "USA", reason: "Mayo Clinic orthopedic excellence" },
      { city: "Boston", country: "USA", reason: "Leading joint replacement research" }
    ]
  },
  "Regenerative Medicine": {
    locations: ["Boston", "Rochester", "San Diego", "Seattle"],
    topTreatmentLocations: [
      { city: "Boston", country: "USA", reason: "Advanced stem cell research" },
      { city: "San Diego", country: "USA", reason: "Regenerative therapy innovation" }
    ]
  },
  "Reconstructive Surgery": {
    locations: ["Boston", "Baltimore", "New York", "Los Angeles"],
    topTreatmentLocations: [
      { city: "Baltimore", country: "USA", reason: "Johns Hopkins reconstructive excellence" },
      { city: "Boston", country: "USA", reason: "Advanced surgical techniques" }
    ]
  },
  "Sports Medicine": {
    locations: ["New York", "Los Angeles", "Chicago", "Boston"],
    topTreatmentLocations: [
      { city: "New York", country: "USA", reason: "Specialized sports injury treatment" },
      { city: "Los Angeles", country: "USA", reason: "Elite athlete rehabilitation centers" }
    ]
  },
  "Functional Medicine": {
    locations: ["San Francisco", "New York", "Seattle", "Boulder"],
    topTreatmentLocations: [
      { city: "San Francisco", country: "USA", reason: "Integrative health approaches" },
      { city: "Seattle", country: "USA", reason: "Innovative wellness programs" }
    ]
  },
  "Anti-Aging Medicine": {
    locations: ["Los Angeles", "Miami", "New York", "Scottsdale"],
    topTreatmentLocations: [
      { city: "Los Angeles", country: "USA", reason: "Cutting-edge anti-aging clinics" },
      { city: "Zurich", country: "Switzerland", reason: "Advanced longevity research" }
    ]
  },
  "Pain Management": {
    locations: ["Boston", "Seattle", "Minneapolis", "Cleveland"],
    topTreatmentLocations: [
      { city: "Seattle", country: "USA", reason: "Innovative pain management approaches" },
      { city: "Boston", country: "USA", reason: "Multidisciplinary pain centers" }
    ]
  }
};
