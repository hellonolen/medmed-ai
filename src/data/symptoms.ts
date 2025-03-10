
interface SymptomMapping {
  symptom: string;
  specialists: string[];
  relatedConditions: string[];
}

export const symptomMappings: SymptomMapping[] = [
  {
    symptom: "acne",
    specialists: ["Dermatology"],
    relatedConditions: ["ACNE/ROSACEA"]
  },
  {
    symptom: "skin rash",
    specialists: ["Dermatology", "Allergy"],
    relatedConditions: ["ACNE/ROSACEA"]
  },
  {
    symptom: "aging skin",
    specialists: ["Dermatology"],
    relatedConditions: ["Anti-Aging"]
  },
  {
    symptom: "wrinkles",
    specialists: ["Dermatology"],
    relatedConditions: ["Anti-Aging"]
  },
  {
    symptom: "itchy eye",
    specialists: ["ENT & Allergy", "Ophthalmology"],
    relatedConditions: ["ACNE/ROSACEA"]
  },
  {
    symptom: "red eye",
    specialists: ["ENT & Allergy", "Ophthalmology"],
    relatedConditions: ["ACNE/ROSACEA"]
  },
  {
    symptom: "dry skin",
    specialists: ["Dermatology"],
    relatedConditions: ["Anti-Aging"]
  },
  {
    symptom: "joint pain",
    specialists: ["Rheumatology", "Physical Therapy"],
    relatedConditions: ["Anti-Aging"]
  },
  {
    symptom: "headache",
    specialists: ["Neurology", "Primary Care"],
    relatedConditions: ["ACNE/ROSACEA"]
  },
  {
    symptom: "cough",
    specialists: ["Pulmonology", "ENT & Allergy"],
    relatedConditions: ["ACNE/ROSACEA"]
  }
];

export const findMatchingSymptoms = (searchQuery: string) => {
  // If search query is empty, return empty array
  if (!searchQuery.trim()) return [];
  
  // Split the search query into words
  const searchWords = searchQuery.toLowerCase().split(/\s+/);
  
  // Return symptoms that match any of the search words
  return symptomMappings.filter(mapping => 
    searchWords.some(word => 
      mapping.symptom.toLowerCase().includes(word) ||
      word.includes(mapping.symptom.toLowerCase())
    )
  );
};
