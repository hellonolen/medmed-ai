
/**
 * Calculate Levenshtein distance between two strings
 * This helps with fuzzy matching for misspelled search terms
 */
export function levenshteinDistance(s1: string, s2: string): number {
  const track = Array(s2.length + 1).fill(null).map(() => 
    Array(s1.length + 1).fill(null));
  
  for (let i = 0; i <= s1.length; i++) {
    track[0][i] = i;
  }
  
  for (let j = 0; j <= s2.length; j++) {
    track[j][0] = j;
  }
  
  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return track[s2.length][s1.length];
}

/**
 * Match medical terms including synonyms
 */
export function matchMedicalTerms(query: string, text: string): boolean {
  // Basic synonym dictionary for common medical terms
  const synonyms: Record<string, string[]> = {
    'heart': ['cardiac', 'cardiovascular', 'coronary'],
    'blood pressure': ['hypertension', 'bp'],
    'diabetes': ['diabetic', 'type 1', 'type 2', 'glucose'],
    'headache': ['migraine', 'head pain', 'cephalgia'],
    'pain': ['ache', 'discomfort', 'soreness'],
    'skin': ['dermal', 'cutaneous', 'dermatological'],
    'allergies': ['hypersensitivity', 'allergen', 'allergic'],
    // Add more synonyms as needed
  };
  
  // Check direct match
  if (text.toLowerCase().includes(query.toLowerCase())) {
    return true;
  }
  
  // Check synonyms
  for (const [term, synonymList] of Object.entries(synonyms)) {
    const isQueryTerm = query.toLowerCase().includes(term.toLowerCase());
    const isTextTerm = text.toLowerCase().includes(term.toLowerCase());
    
    // If query contains the term, check if text contains any synonym
    if (isQueryTerm) {
      if (synonymList.some(syn => text.toLowerCase().includes(syn.toLowerCase()))) {
        return true;
      }
    }
    
    // If text contains the term, check if query contains any synonym
    if (isTextTerm) {
      if (synonymList.some(syn => query.toLowerCase().includes(syn.toLowerCase()))) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Weight search results by field importance
 */
export function weightedSearch(
  query: string,
  item: any,
  weights: { [key: string]: number }
): number {
  let score = 0;
  
  // Calculate weighted score for each field
  for (const [field, weight] of Object.entries(weights)) {
    if (item[field] && typeof item[field] === 'string') {
      // Exact match gets full weight
      if (item[field].toLowerCase().includes(query.toLowerCase())) {
        score += weight;
      }
      // Medical term match gets partial weight
      else if (matchMedicalTerms(query, item[field])) {
        score += weight * 0.7;
      }
      // Fuzzy match gets lower weight
      else {
        const distance = levenshteinDistance(query, item[field].toLowerCase());
        // Only consider close matches
        if (distance < 3) {
          score += weight * (3 - distance) / 3;
        }
      }
    }
  }
  
  return score;
}
