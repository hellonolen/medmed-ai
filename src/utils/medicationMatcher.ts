
import { medications } from "@/data/medications";
import { findMatchingSymptoms, medicalConditions } from "@/data/symptoms";

export interface MatchedMedication {
  name: string;
  details: string;
  price: string;
  relevance: number; // 0-100 relevance score
  category: string;
  source?: string; // Source of the medication data
}

// External API configuration
const EXTERNAL_API_ENABLED = true; // Toggle for easier testing/development
const EXTERNAL_SOURCES = [
  { name: "MedlinePlus", baseUrl: "https://medlineplus.gov/api/search" },
  { name: "RxNorm", baseUrl: "https://rxnav.nlm.nih.gov/REST/rxcui" }
];

// Cache for external API results to minimize redundant calls
const apiCache = new Map<string, MatchedMedication[]>();

export const findMedicationsForQuery = async (query: string): Promise<MatchedMedication[]> => {
  if (!query.trim()) return [];
  
  // First try to match symptoms and conditions
  const matchingSymptoms = findMatchingSymptoms(query);
  
  // Get related conditions from matching symptoms
  const relatedConditions = new Set(
    matchingSymptoms.flatMap(symptom => symptom.relatedConditions)
  );
  
  // Build a set of relevant specialists
  const relevantSpecialists = new Set(
    matchingSymptoms.flatMap(symptom => symptom.specialists)
  );
  
  // Collect potentially relevant medications
  let matchedMedications: MatchedMedication[] = [];
  
  // First match from our medication data based on categories
  medications.forEach(category => {
    // Match category
    const matchesCategory = relatedConditions.has(category.category) || 
                           category.category.toLowerCase().includes(query.toLowerCase());
    
    const categoryRelevance = matchesCategory ? 80 : 0;
    
    category.products.forEach(product => {
      // Direct product name or details match
      const productString = `${product.name} ${product.details}`.toLowerCase();
      const directMatch = productString.includes(query.toLowerCase());
      const directMatchScore = directMatch ? 90 : 0;
      
      // Calculate relevance score
      let relevance = Math.max(categoryRelevance, directMatchScore);
      
      // Don't include products with zero relevance
      if (relevance === 0) return;
      
      // Add to results if relevant
      if (relevance > 0) {
        // Get recommended specialist
        const specialist = getRecommendedSpecialist(category.category, matchingSymptoms, relevantSpecialists);
        
        matchedMedications.push({
          name: product.name,
          details: `${product.details}\nRecommended Specialist: ${specialist}`,
          price: product.price,
          relevance: relevance,
          category: category.category,
          source: "MedMed Database"
        });
      }
    });
  });
  
  // If no direct matches, try to find generic medications from medicalConditions data
  if (matchedMedications.length === 0 && relatedConditions.size > 0) {
    medicalConditions.forEach(condition => {
      if (relatedConditions.has(condition.category)) {
        condition.medications.forEach((medName, index) => {
          // We give progressively lower scores to medications in the list
          // First medications are usually more common/important
          const position = Math.max(0, 10 - index);
          const relevance = 60 + position;
          
          matchedMedications.push({
            name: medName,
            details: `Common medication for ${condition.category}\nRecommended Specialist: ${condition.specialists.join(' or ')}`,
            price: "Price varies",
            relevance: relevance,
            category: condition.category,
            source: "MedMed Database"
          });
        });
      }
    });
  }
  
  // Direct medication name search from medical conditions data
  if (matchedMedications.length === 0) {
    medicalConditions.forEach(condition => {
      condition.medications.forEach((medName, index) => {
        if (medName.toLowerCase().includes(query.toLowerCase())) {
          matchedMedications.push({
            name: medName,
            details: `Medication for ${condition.category}\nRecommended Specialist: ${condition.specialists.join(' or ')}`,
            price: "Price varies",
            relevance: 75,
            category: condition.category,
            source: "MedMed Database"
          });
        }
      });
    });
  }
  
  // Try to fetch external data if we have fewer than 5 results
  // or if the query is specific enough to warrant external search
  if (EXTERNAL_API_ENABLED && (matchedMedications.length < 5 || query.length > 4)) {
    try {
      // Check if we have cached results
      if (apiCache.has(query)) {
        console.log("Using cached external data for:", query);
        matchedMedications = [...matchedMedications, ...apiCache.get(query)!];
      } else {
        console.log("Fetching external data for:", query);
        const externalResults = await fetchExternalMedicationData(query);
        
        // Cache the results
        apiCache.set(query, externalResults);
        
        // Merge with local results
        matchedMedications = [...matchedMedications, ...externalResults];
      }
    } catch (error) {
      console.error("Error fetching external medication data:", error);
      // Continue with local results only
    }
  }
  
  // Sort by relevance
  matchedMedications.sort((a, b) => b.relevance - a.relevance);
  
  // Remove duplicates based on name
  const uniqueMedications: MatchedMedication[] = [];
  const seenNames = new Set<string>();
  
  matchedMedications.forEach(med => {
    if (!seenNames.has(med.name)) {
      uniqueMedications.push(med);
      seenNames.add(med.name);
    }
  });
  
  return uniqueMedications.slice(0, 8); // Limit to top 8
};

// Function to fetch medication data from external APIs
const fetchExternalMedicationData = async (query: string): Promise<MatchedMedication[]> => {
  // This is a mockup of what an external API call would look like
  // In a real implementation, this would make actual API calls to medical databases
  
  // For now, we'll simulate external API responses with mock data
  return await simulateMedicalAPI(query);
};

// Simulate external API calls (in a real app, this would be replaced with actual API requests)
const simulateMedicalAPI = async (query: string): Promise<MatchedMedication[]> => {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const normalizedQuery = query.toLowerCase();
  const results: MatchedMedication[] = [];
  
  // Simulated external medication database
  const externalMedications = [
    {
      name: "Atorvastatin",
      details: "Lowers cholesterol and triglycerides in the blood.",
      category: "Cardiovascular Conditions",
      source: "MedlinePlus"
    },
    {
      name: "Levothyroxine",
      details: "Treats hypothyroidism (low thyroid hormone).",
      category: "Endocrine Conditions",
      source: "MedlinePlus"
    },
    {
      name: "Lisinopril",
      details: "ACE inhibitor that treats high blood pressure and heart failure.",
      category: "Cardiovascular Conditions",
      source: "RxNorm"
    },
    {
      name: "Metformin",
      details: "Treats type 2 diabetes mellitus by decreasing blood sugar production.",
      category: "Endocrine Conditions",
      source: "MedlinePlus"
    },
    {
      name: "Amlodipine",
      details: "Calcium channel blocker that treats high blood pressure and chest pain.",
      category: "Cardiovascular Conditions",
      source: "RxNorm"
    },
    {
      name: "Metoprolol",
      details: "Beta-blocker that treats high blood pressure, chest pain, and heart failure.",
      category: "Cardiovascular Conditions",
      source: "MedlinePlus"
    },
    {
      name: "Albuterol",
      details: "Bronchodilator that treats or prevents bronchospasm in asthma or COPD.",
      category: "Respiratory Conditions",
      source: "RxNorm"
    },
    {
      name: "Omeprazole",
      details: "Proton pump inhibitor that decreases stomach acid production.",
      category: "Gastrointestinal Conditions",
      source: "MedlinePlus"
    },
    {
      name: "Losartan",
      details: "Angiotensin II receptor blocker that treats high blood pressure.",
      category: "Cardiovascular Conditions",
      source: "RxNorm"
    },
    {
      name: "Gabapentin",
      details: "Anticonvulsant that treats seizures and nerve pain.",
      category: "Neurological Conditions",
      source: "MedlinePlus"
    },
    {
      name: "Hydrochlorothiazide",
      details: "Diuretic that treats high blood pressure and fluid retention.",
      category: "Cardiovascular Conditions",
      source: "RxNorm"
    }
  ];
  
  // Search through the external medications
  externalMedications.forEach(med => {
    const medString = `${med.name} ${med.details} ${med.category}`.toLowerCase();
    
    if (medString.includes(normalizedQuery)) {
      const specialist = getSpecialistForCategory(med.category);
      
      results.push({
        name: med.name,
        details: `${med.details}\nRecommended Specialist: ${specialist}`,
        price: "Price varies by pharmacy",
        relevance: 70, // External results get a slightly lower base relevance
        category: med.category,
        source: med.source
      });
    }
  });
  
  return results;
};

// Helper to get specialists by category for external data
const getSpecialistForCategory = (category: string): string => {
  for (const condition of medicalConditions) {
    if (condition.category === category) {
      return condition.specialists.join(' or ');
    }
  }
  
  // Fallback mapping for common categories
  const specialistMap: Record<string, string> = {
    'Cardiovascular Conditions': 'Cardiology',
    'Respiratory Conditions': 'Pulmonology',
    'Gastrointestinal Conditions': 'Gastroenterology',
    'Endocrine Conditions': 'Endocrinology',
    'Neurological Conditions': 'Neurology',
    'Musculoskeletal Conditions': 'Orthopedics or Rheumatology',
    'Dermatological Conditions': 'Dermatology'
  };
  
  return specialistMap[category] || 'Primary Care';
};

// Helper to get the appropriate specialist
const getRecommendedSpecialist = (
  category: string, 
  matchingSymptoms: any[],
  relevantSpecialists: Set<string>
): string => {
  // First check if we have specialists from symptom matching
  if (relevantSpecialists.size > 0) {
    return Array.from(relevantSpecialists).join(' or ');
  }

  // Try to find from medical conditions data
  for (const condition of medicalConditions) {
    if (condition.category === category) {
      return condition.specialists.join(' or ');
    }
  }

  // Fallback to category mapping
  const specialistMap: Record<string, string> = {
    'ACNE/ROSACEA': 'Dermatology',
    'Anti-Aging': 'Dermatology',
    'Respiratory Conditions': 'Pulmonology or ENT & Allergy',
    'Gastrointestinal Conditions': 'Gastroenterology',
    'Pain Relief': 'Primary Care',
    'Allergy Relief': 'ENT & Allergy'
  };
  
  return specialistMap[category] || 'Primary Care';
};
