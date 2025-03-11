
export interface Specialist {
  id: string | number;
  name: string;
  specialty: string;
  conditions: string[];
  location?: string;
  phone?: string;
  address?: string;
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
