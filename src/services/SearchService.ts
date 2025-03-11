
import { medications } from '@/data/medications';
import { pharmacies } from '@/data/pharmacies';
import { specialists } from '@/data/specialists';
import { medicalConditions } from '@/data/symptoms';
import { levenshteinDistance } from '@/utils/enhancedSearch';

export interface SearchResult {
  id: string;
  name: string;
  details: string;
  type?: string;
  price?: string;
  source?: string;
  phone?: string;
  address?: string;
  relevanceScore?: number;
}

export interface SearchParams {
  query: string;
  category?: 'medications' | 'specialists' | 'conditions' | 'pharmacies' | 'all';
  location?: string;
}

class SearchService {
  async searchAll({ query, category = 'all', location }: SearchParams): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    const normalizedQuery = query.toLowerCase().trim();
    
    let results: SearchResult[] = [];
    
    // Switch based on category or search all if 'all' is selected
    if (category === 'all' || category === 'medications') {
      const medicationResults = this.searchMedications(normalizedQuery);
      results = [...results, ...medicationResults];
    }
    
    if (category === 'all' || category === 'specialists') {
      const specialistResults = this.searchSpecialists(normalizedQuery, location);
      results = [...results, ...specialistResults];
    }
    
    if (category === 'all' || category === 'conditions') {
      const conditionResults = this.searchConditions(normalizedQuery);
      results = [...results, ...conditionResults];
    }
    
    if (category === 'all' || category === 'pharmacies') {
      const pharmacyResults = this.searchPharmacies(normalizedQuery, location);
      results = [...results, ...pharmacyResults];
    }
    
    // Sort by relevance score
    return results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  }
  
  private searchMedications(query: string): SearchResult[] {
    return medications
      .filter(med => {
        // Check if medication name or type contains the query
        const nameMatch = med.name.toLowerCase().includes(query);
        const typeMatch = med.type?.toLowerCase().includes(query);
        
        // If no direct match, try fuzzy matching
        if (!nameMatch && !typeMatch) {
          const nameDistance = levenshteinDistance(query, med.name.toLowerCase());
          // Allow matches with distance less than 3 (adjust based on preference)
          return nameDistance < 3;
        }
        
        return nameMatch || typeMatch;
      })
      .map(med => ({
        id: `med-${med.name.replace(/\s/g, '-').toLowerCase()}`,
        name: med.name,
        details: med.description || 'No description available',
        type: med.type,
        price: med.price,
        source: 'Medication Database',
        relevanceScore: this.calculateRelevanceScore(query, med.name, med.type || '', med.description || '')
      }));
  }
  
  private searchSpecialists(query: string, location?: string): SearchResult[] {
    return specialists
      .filter(spec => {
        const nameMatch = spec.name.toLowerCase().includes(query);
        const specialtyMatch = spec.specialty.toLowerCase().includes(query);
        
        // Location filter if provided
        const locationMatch = !location || 
          (spec.location && spec.location.toLowerCase().includes(location.toLowerCase()));
        
        return (nameMatch || specialtyMatch) && locationMatch;
      })
      .map(spec => ({
        id: `spec-${spec.name.replace(/\s/g, '-').toLowerCase()}`,
        name: spec.name,
        details: `${spec.specialty} - ${spec.location || 'Location not specified'}`,
        type: 'Specialist',
        price: spec.price || 'Consultation fee varies',
        source: 'Specialist Directory',
        phone: spec.phone,
        address: spec.address,
        relevanceScore: this.calculateRelevanceScore(query, spec.name, spec.specialty, '')
      }));
  }
  
  private searchConditions(query: string): SearchResult[] {
    let results: SearchResult[] = [];
    
    medicalConditions.forEach(category => {
      // Search through conditions in each category
      category.conditions
        .filter(condition => condition.toLowerCase().includes(query))
        .forEach(condition => {
          results.push({
            id: `cond-${condition.replace(/\s/g, '-').toLowerCase()}`,
            name: condition,
            details: `Category: ${category.category} - Related symptoms: ${category.symptoms.join(', ')}`,
            type: 'Medical Condition',
            source: 'Medical Conditions Database',
            relevanceScore: this.calculateRelevanceScore(query, condition, category.category, '')
          });
        });
    });
    
    return results;
  }
  
  private searchPharmacies(query: string, location?: string): SearchResult[] {
    return pharmacies
      .filter(pharm => {
        const nameMatch = pharm.name.toLowerCase().includes(query);
        const chainMatch = pharm.chain && pharm.chain.toLowerCase().includes(query);
        
        // Location filter if provided
        const locationMatch = !location || 
          (pharm.address && pharm.address.toLowerCase().includes(location.toLowerCase()));
        
        return (nameMatch || chainMatch) && locationMatch;
      })
      .map(pharm => {
        // Determine if this is a med spa based on name or chain
        const isMedSpa = 
          pharm.chain?.toLowerCase().includes('spa') || 
          pharm.name.toLowerCase().includes('spa') || 
          pharm.name.toLowerCase().includes('beauty') || 
          pharm.name.toLowerCase().includes('clinic');
        
        return {
          id: `pharm-${pharm.name.replace(/\s/g, '-').toLowerCase()}`,
          name: pharm.name,
          details: `${pharm.address} - ${pharm.hours || 'Hours vary'} - ${pharm.phone}`,
          type: isMedSpa ? 'Med Spa' : 'Pharmacy',
          price: pharm.chain || 'Independent',
          source: pharm.distance ? `Distance: ${pharm.distance}` : 'Healthcare Directory',
          phone: pharm.phone,
          address: pharm.address,
          relevanceScore: this.calculateRelevanceScore(query, pharm.name, pharm.chain || '', '')
        };
      });
  }
  
  private calculateRelevanceScore(
    query: string, 
    name: string, 
    category: string, 
    description: string
  ): number {
    let score = 0;
    
    // Name match has highest weight
    if (name.toLowerCase().includes(query)) {
      score += 5;
      // Exact match gets even higher score
      if (name.toLowerCase() === query) {
        score += 3;
      }
    }
    
    // Category match
    if (category.toLowerCase().includes(query)) {
      score += 3;
    }
    
    // Description match
    if (description.toLowerCase().includes(query)) {
      score += 1;
    }
    
    // Check for fuzzy matches if no exact match
    if (score === 0) {
      const nameDistance = levenshteinDistance(query, name.toLowerCase());
      if (nameDistance < 3) {
        score += (3 - nameDistance);
      }
    }
    
    return score;
  }
}

export const searchService = new SearchService();
