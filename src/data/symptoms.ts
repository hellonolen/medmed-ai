
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
  }
];

export const findMatchingSymptoms = (searchQuery: string) => {
  return symptomMappings.filter(mapping => 
    mapping.symptom.toLowerCase().includes(searchQuery.toLowerCase())
  );
};
