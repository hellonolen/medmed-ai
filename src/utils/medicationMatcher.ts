
import { medications } from "@/data/medications";
import { findMatchingSymptoms, medicalConditions } from "@/data/symptoms";

export interface MatchedMedication {
  name: string;
  details: string;
  price: string;
  relevance: number; // 0-100 relevance score
  category: string;
}

export const findMedicationsForQuery = (query: string): MatchedMedication[] => {
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
          category: category.category
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
            category: condition.category
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
            category: condition.category
          });
        }
      });
    });
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
