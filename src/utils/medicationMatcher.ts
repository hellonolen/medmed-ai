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
  detectedMedicationType: string | null;
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
  
  // Detect medication types
  let detectedMedicationType = null;
  if (/\b(tablet|pill|pills|tablets)\b/.test(lowerQuery)) {
    detectedMedicationType = "Tablets & Pills";
  } else if (/\b(syrup|liquid|solution|oral solution)\b/.test(lowerQuery)) {
    detectedMedicationType = "Syrups & Liquids";
  } else if (/\b(cream|ointment|gel|lotion|topical)\b/.test(lowerQuery)) {
    detectedMedicationType = "Creams, Ointments & Gels";
  } else if (/\b(patch|patches|transdermal)\b/.test(lowerQuery)) {
    detectedMedicationType = "Patches";
  } else if (/\b(drops|eyedrops|ear drops)\b/.test(lowerQuery)) {
    detectedMedicationType = "Drops";
  } else if (/\b(suppository|suppositories)\b/.test(lowerQuery)) {
    detectedMedicationType = "Suppositories";
  } else if (/\b(inhaler|nebulizer|inhaled|nebulizer|inhale)\b/.test(lowerQuery)) {
    detectedMedicationType = "Inhalers & Nebulizers";
  } else if (/\b(device|pump|brace|monitor|machine|equipment)\b/.test(lowerQuery)) {
    detectedMedicationType = "Medical Devices";
  } else if (/\b(diagnostic|thermometer|blood pressure|glucose|meter)\b/.test(lowerQuery)) {
    detectedMedicationType = "Diagnostic Tools";
  } else if (/\b(vaccine|vaccination|shot|booster)\b/.test(lowerQuery)) {
    detectedMedicationType = "Vaccines";
  } else if (/\b(injection|injectable|inject|syringe|shot)\b/.test(lowerQuery)) {
    detectedMedicationType = "Injections";
  } else if (/\b(capsule|capsules)\b/.test(lowerQuery)) {
    detectedMedicationType = "Capsules";
  }
  
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
  
  // If medication type is detected, enhance with that type
  if (detectedMedicationType) {
    enhancedQuery += ` ${detectedMedicationType}`;
  }
  
  return {
    enhancedQuery,
    detectedRegion,
    isSpecificMedication,
    detectedCondition,
    detectedMedicationType
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
    detectedCondition,
    detectedMedicationType
  } = processQueryWithAI(query);
  
  console.log("AI-enhanced query:", enhancedQuery);
  console.log("Detected region:", detectedRegion);
  console.log("Is specific medication:", isSpecificMedication);
  console.log("Detected condition:", detectedCondition);
  console.log("Detected medication type:", detectedMedicationType);
  
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
      
      // Boost for medication type match if detected
      if (detectedMedicationType && product.type && 
          product.type.toLowerCase().includes(detectedMedicationType.toLowerCase())) {
        relevance += 15;
      }
      
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
        const externalResults = await fetchExternalMedicationData(enhancedQuery, detectedRegion, detectedMedicationType);
        
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
    "Tablets & Pills",
    "Syrups & Liquids",
    "Spray", 
    "Inhaler", 
    "Inhalers & Nebulizers",
    "Ointment", 
    "Cream", 
    "Gel", 
    "Creams, Ointments & Gels",
    "Liquid", 
    "Powder", 
    "Patch",
    "Patches",
    "Drops",
    "Suppositories",
    "Medical Devices",
    "Diagnostic Tools",
    "Vaccines",
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
    const lowerType = actualType.toLowerCase();
    
    // Map to standard types based on substring matching
    if (lowerType.includes("inject") && lowerType.includes("gel")) {
      normalizedType = "Injectable Gel";
    }
    else if (lowerType.includes("inject")) normalizedType = "Injection";
    else if (lowerType.includes("capsule")) normalizedType = "Capsule";
    else if (lowerType.includes("tablet") || lowerType.includes("pill")) normalizedType = "Tablets & Pills";
    else if (lowerType.includes("syrup") || lowerType.includes("liquid solution")) normalizedType = "Syrups & Liquids";
    else if (lowerType.includes("spray")) normalizedType = "Spray";
    else if (lowerType.includes("inhaler") || lowerType.includes("nebulizer")) normalizedType = "Inhalers & Nebulizers";
    else if (lowerType.includes("ointment")) normalizedType = "Creams, Ointments & Gels";
    else if (lowerType.includes("cream")) normalizedType = "Creams, Ointments & Gels";
    else if (lowerType.includes("gel")) normalizedType = "Creams, Ointments & Gels";
    else if (lowerType.includes("liquid")) normalizedType = "Syrups & Liquids";
    else if (lowerType.includes("powder")) normalizedType = "Powder";
    else if (lowerType.includes("patch")) normalizedType = "Patches";
    else if (lowerType.includes("drop")) normalizedType = "Drops";
    else if (lowerType.includes("suppository")) normalizedType = "Suppositories";
    else if (lowerType.includes("device") || lowerType.includes("equipment") || lowerType.includes("pump") || lowerType.includes("brace")) normalizedType = "Medical Devices";
    else if (lowerType.includes("diagnostic") || lowerType.includes("monitor") || lowerType.includes("thermometer")) normalizedType = "Diagnostic Tools";
    else if (lowerType.includes("vaccine")) normalizedType = "Vaccines";
    
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
const fetchExternalMedicationData = async (
  query: string, 
  region: string | null,
  medicationType: string | null
): Promise<MatchedMedication[]> => {
  // This is a mockup of what an external API call would look like
  // In a real implementation, this would make actual API calls to medical databases
  
  // For now, we'll simulate external API responses with mock data
  return await simulateMedicalAPI(query, region, medicationType);
};

// Simulate external API calls (in a real app, this would be replaced with actual API requests)
const simulateMedicalAPI = async (
  query: string, 
  region: string | null,
  medicationType: string | null
): Promise<MatchedMedication[]> => {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const normalizedQuery = query.toLowerCase();
  const results: MatchedMedication[] = [];
  
  // Add additional medication types based on user request
  const additionalMedications = [
    // Tablets & Pills
    {
      name: "Warfarin",
      details: "Oral anticoagulant used to prevent blood clots.",
      category: "Cardiovascular Conditions",
      type: "Tablets & Pills",
      source: "MedlinePlus",
      region: "global"
    },
    // Syrups & Liquids
    {
      name: "Guaifenesin Syrup",
      details: "Expectorant that helps loosen congestion in chest and throat.",
      category: "Respiratory Conditions",
      type: "Syrups & Liquids",
      source: "RxNorm",
      region: "global"
    },
    // Creams, Ointments & Gels
    {
      name: "Hydrocortisone Cream",
      details: "Anti-inflammatory steroid that relieves redness, itching, and swelling.",
      category: "Dermatological Conditions",
      type: "Creams, Ointments & Gels",
      source: "MedlinePlus",
      region: "global"
    },
    // Patches
    {
      name: "Nicotine Transdermal Patch",
      details: "Helps people stop smoking by reducing nicotine withdrawal symptoms.",
      category: "Addiction Treatment",
      type: "Patches",
      source: "RxNorm",
      region: "global"
    },
    // Drops
    {
      name: "Latanoprost Eye Drops",
      details: "Reduces pressure inside the eye for glaucoma treatment.",
      category: "Ophthalmological Conditions",
      type: "Drops",
      source: "MedlinePlus",
      region: "global"
    },
    // Suppositories
    {
      name: "Glycerin Suppositories",
      details: "Used to treat constipation by drawing water into the intestines.",
      category: "Gastrointestinal Conditions",
      type: "Suppositories",
      source: "RxNorm",
      region: "global"
    },
    // Inhalers & Nebulizers
    {
      name: "Fluticasone Propionate Inhaler",
      details: "Corticosteroid that prevents inflammation in the airways.",
      category: "Respiratory Conditions",
      type: "Inhalers & Nebulizers",
      source: "MedlinePlus",
      region: "global"
    },
    // Medical Devices
    {
      name: "Insulin Pump",
      details: "Delivers insulin continuously for better diabetes management.",
      category: "Endocrine Conditions",
      type: "Medical Devices",
      source: "Global Medical Database",
      region: "global"
    },
    // Diagnostic Tools
    {
      name: "Digital Blood Pressure Monitor",
      details: "For monitoring hypertension and cardiovascular health at home.",
      category: "Cardiovascular Conditions",
      type: "Diagnostic Tools",
      source: "Global Medical Database",
      region: "global"
    },
    // Vaccines
    {
      name: "Influenza Vaccine",
      details: "Annual vaccine to protect against seasonal flu strains.",
      category: "Infectious Disease Prevention",
      type: "Vaccines",
      source: "WHO Essential Medicines",
      region: "global"
    }
  ];
  
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
  
  // Combine with existing medications and add the new ones
  const combinedMedications = [...externalMedications, ...additionalMedications];
  
  // Apply regional filtering if a region is specified
  const regionFilteredMedications = region && region !== "global"
    ? combinedMedications.filter(med => med.region === "global" || med.region === region)
    : combinedMedications;
  
  // Apply medication type filtering if specified
  const typeFilteredMedications = medicationType
    ? regionFilteredMedications.filter(med => {
        const medTypeMatch = med.type.toLowerCase().includes(medicationType.toLowerCase());
        // For Tablets & Pills, also include just "Tablet" types
        if (medicationType === "Tablets & Pills" && med.type.toLowerCase().includes("tablet")) {
          return true;
        }
        return medTypeMatch;
      })
    : regionFilteredMedications;
  
  // Search through the external medications
  typeFilteredMedications.forEach(med => {
    const medString = `${med.name} ${med.details} ${med.category} ${med.type}`.toLowerCase();
    
    // Increase chances of matching if medication type was detected in query
    const medicationTypeMatch = medicationType && med.type.toLowerCase().includes(medicationType.toLowerCase());
    const queryMatch = medString.includes(normalizedQuery);
    
    if (queryMatch || medicationTypeMatch) {
      const specialist = getSpecialistForCategory(med.category);
      
      let relevance = queryMatch ? 70 : 50; // Base relevance for matching
      
      // Boost relevance for medication type matches
      if (medicationTypeMatch) {
        relevance += 20;
      }
      
      results.push({
        name: med.name,
        details: `${med.details}\nRecommended Specialist: ${specialist}`,
        price: "Price varies by pharmacy",
        relevance: relevance,
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
  
  // Add injectable gel results if requested
  if (isInjectableGelQuery) {
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
    'ENT Conditions': 'ENT & Allergy',
    'Ophthalmological Conditions': 'Ophthalmology',
    'Infectious Disease Prevention': 'Infectious Disease'
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
  const specialistMap: Record<string, string>
