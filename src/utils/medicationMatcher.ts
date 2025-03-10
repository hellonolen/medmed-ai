import { medications } from "@/data/medications";
import { findMatchingSymptoms, medicalConditions } from "@/data/symptoms";

export interface MatchedMedication {
  name: string;
  details: string;
  price: string;
  relevance: number; // 0-100 relevance score
  category: string;
  type: string; // Medication type (injection, capsule, etc.)
  source?: string; // Source of the medication data
  region?: string; // Region/country where medication is available
}

// External API configuration
const EXTERNAL_API_ENABLED = true; // Toggle for easier testing/development
const EXTERNAL_SOURCES = [
  { name: "MedlinePlus", baseUrl: "https://medlineplus.gov/api/search" },
  { name: "RxNorm", baseUrl: "https://rxnav.nlm.nih.gov/REST/rxcui" },
  { name: "WHO Essential Medicines", baseUrl: "https://essential-medicines.who.int" },
  { name: "Global Medical Database", baseUrl: "https://global-med-db.example.org" }
];

// Regions for global search
const REGIONS = {
  NORTH_AMERICA: "north-america",
  EUROPE: "europe",
  ASIA: "asia",
  AFRICA: "africa",
  SOUTH_AMERICA: "south-america",
  AUSTRALIA: "australia",
  GLOBAL: "global"
};

// Cache for external API results to minimize redundant calls
const apiCache = new Map<string, MatchedMedication[]>();

// AI-enhanced query understanding
const processQueryWithAI = (query: string): { 
  enhancedQuery: string; 
  detectedRegion: string | null;
  isSpecificMedication: boolean;
  detectedCondition: string | null;
} => {
  const lowerQuery = query.toLowerCase();
  
  // Detect regions from the query
  let detectedRegion = null;
  if (lowerQuery.includes('europe') || lowerQuery.includes('eu') || 
      /\b(uk|france|germany|italy|spain)\b/.test(lowerQuery)) {
    detectedRegion = REGIONS.EUROPE;
  } else if (lowerQuery.includes('asia') || 
            /\b(china|japan|india|korea)\b/.test(lowerQuery)) {
    detectedRegion = REGIONS.ASIA;
  } else if (lowerQuery.includes('africa') || 
            /\b(nigeria|egypt|kenya|south africa)\b/.test(lowerQuery)) {
    detectedRegion = REGIONS.AFRICA;
  } else if (lowerQuery.includes('north america') || 
            /\b(usa|us|canada|mexico)\b/.test(lowerQuery)) {
    detectedRegion = REGIONS.NORTH_AMERICA;
  } else if (lowerQuery.includes('south america') || 
            /\b(brazil|argentina|chile|colombia)\b/.test(lowerQuery)) {
    detectedRegion = REGIONS.SOUTH_AMERICA;
  } else if (lowerQuery.includes('australia') || lowerQuery.includes('oceania') || 
            /\b(new zealand|pacific)\b/.test(lowerQuery)) {
    detectedRegion = REGIONS.AUSTRALIA;
  }
  
  // Check if query is likely for a specific medication
  const isSpecificMedication = /\b(mg|ml|dose|tablet|capsule|injection)\b/.test(lowerQuery) ||
                              medications.some(cat => 
                                cat.products.some(p => 
                                  lowerQuery.includes(p.name.toLowerCase())
                                )
                              );
  
  // Detect possible medical conditions
  const detectedCondition = medicalConditions.find(condition => 
    condition.conditions.some(c => lowerQuery.includes(c.toLowerCase()))
  )?.category || null;
  
  // Create enhanced query by adding context terms
  let enhancedQuery = query;
  
  // If region is specified, we can add regional medical terms
  if (detectedRegion === REGIONS.EUROPE) {
    enhancedQuery += " European Medicines Agency approved";
  } else if (detectedRegion === REGIONS.NORTH_AMERICA) {
    enhancedQuery += " FDA approved";
  }
  
  // If it's a specific medication, we can enhance with dosage terms
  if (isSpecificMedication) {
    enhancedQuery += " medication dosage information";
  }
  
  // If a condition is detected, we can enhance with treatment terms
  if (detectedCondition) {
    enhancedQuery += ` treatment for ${detectedCondition}`;
  }
  
  return {
    enhancedQuery,
    detectedRegion,
    isSpecificMedication,
    detectedCondition
  };
};

export const findMedicationsForQuery = async (query: string): Promise<MatchedMedication[]> => {
  if (!query.trim()) return [];
  
  console.log("Original query:", query);
  
  // Process query with AI-enhancement
  const { 
    enhancedQuery, 
    detectedRegion, 
    isSpecificMedication,
    detectedCondition 
  } = processQueryWithAI(query);
  
  console.log("AI-enhanced query:", enhancedQuery);
  console.log("Detected region:", detectedRegion);
  console.log("Is specific medication:", isSpecificMedication);
  console.log("Detected condition:", detectedCondition);
  
  // First try to match symptoms and conditions
  const matchingSymptoms = findMatchingSymptoms(enhancedQuery);
  
  // Get related conditions from matching symptoms
  const relatedConditions = new Set(
    matchingSymptoms.flatMap(symptom => symptom.relatedConditions)
  );
  
  // Add detected condition if found
  if (detectedCondition) {
    relatedConditions.add(detectedCondition);
  }
  
  // Build a set of relevant specialists
  const relevantSpecialists = new Set(
    matchingSymptoms.flatMap(symptom => symptom.specialists)
  );
  
  // Check if query is related to injectable gels
  const injectableGelKeywords = [
    "injectable gel", "hydrogel", "gel injection", "tissue engineering", 
    "drug delivery", "shear-thinning", "stimuli-responsive", "alginate", 
    "chitosan", "hyaluronan", "cross-linked gel", "long-acting"
  ];
  
  const isInjectableGelQuery = injectableGelKeywords.some(keyword => 
    enhancedQuery.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (isInjectableGelQuery) {
    relatedConditions.add("Injectable Gels");
  }
  
  // Collect potentially relevant medications
  let matchedMedications: MatchedMedication[] = [];
  
  // First match from our medication data based on categories
  medications.forEach(category => {
    // Match category
    const matchesCategory = relatedConditions.has(category.category) || 
                           category.category.toLowerCase().includes(enhancedQuery.toLowerCase());
    
    const categoryRelevance = matchesCategory ? 80 : 0;
    
    category.products.forEach(product => {
      // Direct product name or details match
      const productString = `${product.name} ${product.details}`.toLowerCase();
      const directMatch = productString.includes(query.toLowerCase());
      const directMatchScore = directMatch ? 90 : 0;
      
      // Calculate relevance score
      let relevance = Math.max(categoryRelevance, directMatchScore);
      
      // Boost injectable gels if query is related
      if (isInjectableGelQuery && category.category === "Injectable Gels") {
        relevance += 10;
      }
      
      // Region relevance boost for global search
      if (detectedRegion && product.region && product.region === detectedRegion) {
        relevance += 15;
      }
      
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
          type: product.type || "Other", // Add medication type
          source: "MedMed Database",
          region: product.region || "global"
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
            type: "Medication", // Default type for generic medications
            source: "MedMed Database",
            region: "global" // These are generally globally available
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
            type: "Medication", // Default type for generic medications
            source: "MedMed Database",
            region: "global"
          });
        }
      });
    });
  }
  
  // Try to fetch external data if we have fewer than 5 results
  // or if the query is specific enough to warrant external search
  if (EXTERNAL_API_ENABLED && (matchedMedications.length < 5 || enhancedQuery.length > 4)) {
    try {
      // Check if we have cached results
      if (apiCache.has(enhancedQuery)) {
        console.log("Using cached external data for:", enhancedQuery);
        matchedMedications = [...matchedMedications, ...apiCache.get(enhancedQuery)!];
      } else {
        console.log("Fetching external data for:", enhancedQuery);
        const externalResults = await fetchExternalMedicationData(enhancedQuery, detectedRegion);
        
        // Cache the results
        apiCache.set(enhancedQuery, externalResults);
        
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
  
  return uniqueMedications.slice(0, 10); // Limit to top 10
};

// Group medications by type
export const groupMedicationsByType = (medications: MatchedMedication[]) => {
  const groups: Record<string, MatchedMedication[]> = {};
  
  // Define standard medication types for grouping in order of display
  const standardTypes = [
    "Injection", 
    "Injectable Gel", 
    "Capsule", 
    "Tablet", 
    "Spray", 
    "Inhaler", 
    "Ointment", 
    "Cream", 
    "Gel", 
    "Liquid", 
    "Powder", 
    "Patch", 
    "Other"
  ];
  
  // Initialize groups
  standardTypes.forEach(type => {
    groups[type] = [];
  });
  
  // Categorize medications
  medications.forEach(med => {
    // Normalize the type for consistent grouping
    let normalizedType = "Other";
    
    // Get the actual type from the medication
    const actualType = med.type || "";
    
    // Map to standard types based on substring matching
    if (actualType.toLowerCase().includes("inject") && actualType.toLowerCase().includes("gel")) {
      normalizedType = "Injectable Gel";
    }
    else if (actualType.toLowerCase().includes("inject")) normalizedType = "Injection";
    else if (actualType.toLowerCase().includes("capsule")) normalizedType = "Capsule";
    else if (actualType.toLowerCase().includes("tablet")) normalizedType = "Tablet";
    else if (actualType.toLowerCase().includes("spray")) normalizedType = "Spray";
    else if (actualType.toLowerCase().includes("inhaler")) normalizedType = "Inhaler";
    else if (actualType.toLowerCase().includes("ointment")) normalizedType = "Ointment";
    else if (actualType.toLowerCase().includes("cream")) normalizedType = "Cream";
    else if (actualType.toLowerCase().includes("gel")) normalizedType = "Gel";
    else if (actualType.toLowerCase().includes("liquid")) normalizedType = "Liquid";
    else if (actualType.toLowerCase().includes("powder")) normalizedType = "Powder";
    else if (actualType.toLowerCase().includes("patch")) normalizedType = "Patch";
    
    // Add to appropriate group
    if (groups[normalizedType]) {
      groups[normalizedType].push({...med, type: normalizedType});
    } else {
      groups["Other"].push({...med, type: normalizedType});
    }
  });
  
  // Remove empty groups
  Object.keys(groups).forEach(key => {
    if (groups[key].length === 0) {
      delete groups[key];
    }
  });
  
  return groups;
};

// Function to fetch medication data from external APIs
const fetchExternalMedicationData = async (query: string, region: string | null): Promise<MatchedMedication[]> => {
  // This is a mockup of what an external API call would look like
  // In a real implementation, this would make actual API calls to medical databases
  
  // For now, we'll simulate external API responses with mock data
  return await simulateMedicalAPI(query, region);
};

// Simulate external API calls (in a real app, this would be replaced with actual API requests)
const simulateMedicalAPI = async (query: string, region: string | null): Promise<MatchedMedication[]> => {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const normalizedQuery = query.toLowerCase();
  const results: MatchedMedication[] = [];
  
  // Simulated external medication database - enhanced with regional information
  const externalMedications = [
    {
      name: "Atorvastatin",
      details: "Lowers cholesterol and triglycerides in the blood.",
      category: "Cardiovascular Conditions",
      type: "Tablet",
      source: "MedlinePlus",
      region: "global"
    },
    {
      name: "Levothyroxine",
      details: "Treats hypothyroidism (low thyroid hormone).",
      category: "Endocrine Conditions",
      type: "Tablet",
      source: "MedlinePlus",
      region: "global"
    },
    {
      name: "Lisinopril",
      details: "ACE inhibitor that treats high blood pressure and heart failure.",
      category: "Cardiovascular Conditions",
      type: "Tablet",
      source: "RxNorm",
      region: "north-america"
    },
    {
      name: "Metformin",
      details: "Treats type 2 diabetes mellitus by decreasing blood sugar production.",
      category: "Endocrine Conditions",
      type: "Tablet",
      source: "MedlinePlus",
      region: "global"
    },
    {
      name: "Amlodipine",
      details: "Calcium channel blocker that treats high blood pressure and chest pain.",
      category: "Cardiovascular Conditions",
      type: "Tablet",
      source: "RxNorm",
      region: "global"
    },
    {
      name: "Metoprolol",
      details: "Beta-blocker that treats high blood pressure, chest pain, and heart failure.",
      category: "Cardiovascular Conditions",
      type: "Tablet",
      source: "MedlinePlus",
      region: "north-america"
    },
    {
      name: "Albuterol",
      details: "Bronchodilator that treats or prevents bronchospasm in asthma or COPD.",
      category: "Respiratory Conditions",
      type: "Inhaler",
      source: "RxNorm",
      region: "north-america"
    },
    {
      name: "Omeprazole",
      details: "Proton pump inhibitor that decreases stomach acid production.",
      category: "Gastrointestinal Conditions",
      type: "Capsule",
      source: "MedlinePlus",
      region: "global"
    },
    {
      name: "Losartan",
      details: "Angiotensin II receptor blocker that treats high blood pressure.",
      category: "Cardiovascular Conditions",
      type: "Tablet",
      source: "RxNorm",
      region: "global"
    },
    {
      name: "Gabapentin",
      details: "Anticonvulsant that treats seizures and nerve pain.",
      category: "Neurological Conditions",
      type: "Capsule",
      source: "MedlinePlus",
      region: "north-america"
    },
    {
      name: "Hydrochlorothiazide",
      details: "Diuretic that treats high blood pressure and fluid retention.",
      category: "Cardiovascular Conditions",
      type: "Tablet",
      source: "RxNorm",
      region: "global"
    },
    {
      name: "Fluticasone",
      details: "Corticosteroid that treats allergic and non-allergic nasal symptoms.",
      category: "ENT Conditions",
      type: "Spray",
      source: "MedlinePlus",
      region: "global"
    },
    {
      name: "Insulin Glargine",
      details: "Long-acting insulin analogue for diabetes management.",
      category: "Endocrine Conditions",
      type: "Injection",
      source: "RxNorm",
      region: "global"
    },
    {
      name: "Mupirocin",
      details: "Antibiotic ointment for bacterial skin infections.",
      category: "Dermatological Conditions",
      type: "Ointment",
      source: "MedlinePlus",
      region: "global"
    },
    // European-specific medications
    {
      name: "Pantoprazole",
      details: "Proton pump inhibitor widely prescribed in Europe for acid reflux and ulcers.",
      category: "Gastrointestinal Conditions",
      type: "Tablet",
      source: "European Medicines Agency",
      region: "europe"
    },
    {
      name: "Diclofenac",
      details: "NSAID commonly used in European countries for pain and inflammation.",
      category: "Pain Relief",
      type: "Tablet",
      source: "European Medicines Agency",
      region: "europe"
    },
    // Asian-specific medications
    {
      name: "Tosufloxacin",
      details: "Fluoroquinolone antibiotic commonly used in Japan and other Asian countries.",
      category: "Infectious Disease",
      type: "Tablet",
      source: "Asian Medical Database",
      region: "asia"
    },
    {
      name: "Lianhua Qingwen",
      details: "Traditional Chinese medicine used for respiratory infections.",
      category: "Respiratory Conditions",
      type: "Capsule",
      source: "Traditional Medicine Database",
      region: "asia"
    },
    // African-specific medications
    {
      name: "Artesunate-Amodiaquine",
      details: "Antimalarial combination therapy common in African countries.",
      category: "Infectious Disease",
      type: "Tablet",
      source: "WHO Essential Medicines",
      region: "africa"
    },
    // South American medications
    {
      name: "Benznidazole",
      details: "Antiparasitic medication used in South America for Chagas disease.",
      category: "Infectious Disease",
      type: "Tablet",
      source: "PAHO Database",
      region: "south-america"
    },
    // Australian/Oceania medications
    {
      name: "Tiotropium",
      details: "Bronchodilator commonly prescribed in Australia for COPD management.",
      category: "Respiratory Conditions",
      type: "Inhaler",
      source: "Australian PBS",
      region: "australia"
    }
  ];
  
  // Add injectable gel mock data
  const externalInjectableGels = [
    {
      name: "Hyaluronic Acid Dermal Filler",
      details: "Injectable gel used for soft tissue augmentation. Adds volume to facial wrinkles and folds.",
      category: "Dermatological Conditions",
      type: "Injectable Gel",
      source: "MedlinePlus"
    },
    {
      name: "PRP Injectable Gel",
      details: "Platelet-rich plasma gel for tissue regeneration and wound healing.",
      category: "Regenerative Medicine",
      type: "Injectable Gel",
      source: "RxNorm"
    },
    {
      name: "PLGA Microsphere Gel",
      details: "Biodegradable gel containing poly(lactic-co-glycolic acid) microspheres for extended drug delivery.",
      category: "Drug Delivery Systems",
      type: "Injectable Gel",
      source: "MedlinePlus"
    }
  ];
  
  // Apply regional filtering if a region is specified
  const regionFilteredMedications = region && region !== "global"
    ? externalMedications.filter(med => med.region === "global" || med.region === region)
    : externalMedications;
  
  // Search through the external medications
  regionFilteredMedications.forEach(med => {
    const medString = `${med.name} ${med.details} ${med.category}`.toLowerCase();
    
    if (medString.includes(normalizedQuery)) {
      const specialist = getSpecialistForCategory(med.category);
      
      results.push({
        name: med.name,
        details: `${med.details}\nRecommended Specialist: ${specialist}`,
        price: "Price varies by pharmacy",
        relevance: 70, // External results get a slightly lower base relevance
        category: med.category,
        type: med.type,
        source: med.source,
        region: med.region
      });
    }
  });
  
  // Check if query is related to injectable gels and add the mock data to results
  const injectableGelKeywords = [
    "injectable gel", "hydrogel", "gel injection", "tissue engineering", 
    "drug delivery", "shear-thinning", "stimuli-responsive", "alginate", 
    "chitosan", "hyaluronan", "cross-linked gel", "long-acting"
  ];
  
  const isInjectableGelQuery = injectableGelKeywords.some(keyword => 
    query.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (isInjectableGelQuery) {
    externalInjectableGels.forEach(gel => {
      results.push({
        name: gel.name,
        details: `${gel.details}\nRecommended Specialist: ${getSpecialistForCategory(gel.category)}`,
        price: "Price varies by provider",
        relevance: 90,
        category: gel.category,
        type: gel.type,
        source: gel.source,
        region: "global" // Injectable gels are generally available globally
      });
    });
  }
  
  return results;
};

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
    'Dermatological Conditions': 'Dermatology',
    'ENT Conditions': 'ENT & Allergy'
  };
  
  return specialistMap[category] || 'Primary Care';
};

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
    'Allergy Relief': 'ENT & Allergy',
    'Injectable Gels': 'Regenerative Medicine or Orthopedics',
    'Injectable Medications': 'Specialist depends on medication'
  };
  
  return specialistMap[category] || 'Primary Care';
};
