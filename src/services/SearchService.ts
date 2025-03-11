
import { medications } from '@/data/medications';
import { pharmacies } from '@/data/pharmacies';
import { specialists as specialistsData } from '@/data/specialists';
import { weightedSearch, levenshteinDistance, matchMedicalTerms } from '@/utils/enhancedSearch';

// Define the interfaces
export interface SearchParams {
  query: string;
  category?: 'medications' | 'specialists' | 'pharmacies' | 'all';
  location?: string;
  limit?: number;
}

export interface SearchResult {
  id: string | number;
  name: string;
  details: string;
  price?: string;
  type?: string;
  source?: string;
  relevanceScore?: number;
  phone?: string;
  address?: string;
}

class SearchService {
  searchAll(params: SearchParams): Promise<SearchResult[]> {
    return new Promise((resolve) => {
      // Add a small delay to simulate API call
      setTimeout(() => {
        const results: SearchResult[] = [];
        const { query, category = 'all', limit = 20 } = params;
        
        // Skip search for very short queries
        if (!query || query.trim().length < 2) {
          resolve([]);
          return;
        }
        
        // Search each category based on the selected filter
        if (category === 'all' || category === 'medications') {
          results.push(...this.searchMedications(query, limit));
        }
        
        if (category === 'all' || category === 'specialists') {
          results.push(...this.searchSpecialists(query, limit));
        }
        
        if (category === 'all' || category === 'pharmacies') {
          results.push(...this.searchPharmacies(query, limit));
        }
        
        // Sort by relevance score
        results.sort((a, b) => {
          return (b.relevanceScore || 0) - (a.relevanceScore || 0);
        });
        
        resolve(results.slice(0, limit));
      }, 300);
    });
  }
  
  private searchMedications(query: string, limit: number): SearchResult[] {
    const results: SearchResult[] = [];
    
    // Process each medication category
    for (const category of medications) {
      // Process each product in the category
      for (const product of category.products) {
        // Calculate relevance score based on name, details, and type
        const relevanceScore = weightedSearch(
          query,
          { 
            name: product.name, 
            details: product.details, 
            type: product.type 
          },
          { name: 10, details: 5, type: 3 }
        );
        
        // Only include results with a minimum relevance
        if (relevanceScore > 0) {
          results.push({
            id: `${medications.indexOf(category)}-${category.products.indexOf(product)}`,
            name: product.name,
            details: product.details,
            type: product.type,
            price: product.price,
            source: 'Internal Database',
            relevanceScore
          });
        }
      }
    }
    
    return results.slice(0, limit);
  }
  
  private searchSpecialists(query: string, limit: number): SearchResult[] {
    const results: SearchResult[] = [];
    
    // Make sure we have specialistsData before trying to search it
    if (!specialistsData || !Array.isArray(specialistsData)) {
      console.warn('Specialists data is not available or not in the expected format');
      return [];
    }
    
    for (const specialist of specialistsData) {
      const relevanceScore = weightedSearch(
        query,
        { 
          name: specialist.name, 
          specialty: specialist.specialty, 
          conditions: specialist.conditions.join(' ')
        },
        { name: 5, specialty: 10, conditions: 8 }
      );
      
      if (relevanceScore > 0) {
        results.push({
          id: specialist.id,
          name: specialist.name,
          details: `${specialist.specialty}. Treats: ${specialist.conditions.join(', ')}`,
          type: 'Specialist',
          source: 'Specialist Directory',
          relevanceScore,
          phone: specialist.phone || undefined,
          address: specialist.address || undefined
        });
      }
    }
    
    return results.slice(0, limit);
  }
  
  private searchPharmacies(query: string, limit: number): SearchResult[] {
    const results: SearchResult[] = [];
    
    for (const pharmacy of pharmacies) {
      const nameMatch = pharmacy.name.toLowerCase().includes(query.toLowerCase());
      const cityMatch = pharmacy.city.toLowerCase().includes(query.toLowerCase());
      const chainMatch = pharmacy.chain && pharmacy.chain.toLowerCase().includes(query.toLowerCase());
      
      if (nameMatch || cityMatch || chainMatch) {
        // Determine the type based on the name or chain
        let type = 'Pharmacy';
        if (pharmacy.name.toLowerCase().includes('spa') || 
            (pharmacy.chain && pharmacy.chain.toLowerCase().includes('spa')) ||
            pharmacy.name.toLowerCase().includes('aesthetic') || 
            pharmacy.name.toLowerCase().includes('beauty')) {
          type = 'Med Spa';
        }
        
        results.push({
          id: pharmacy.id,
          name: pharmacy.name,
          details: `${pharmacy.address}, ${pharmacy.city}, ${pharmacy.state} ${pharmacy.zipCode}`,
          type,
          source: 'Pharmacy Network',
          phone: pharmacy.phone || undefined,
          address: `${pharmacy.address}, ${pharmacy.city}, ${pharmacy.state} ${pharmacy.zipCode}`
        });
      }
    }
    
    return results.slice(0, limit);
  }
}

export const searchService = new SearchService();
