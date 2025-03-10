
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { medications } from '@/data/medications';
import { findMatchingSymptoms, medicalConditions } from '@/data/symptoms';

interface SearchBarProps {
  onSearch: (query: string, results: Array<{ name: string; details: string; price: string }>) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Searching for:", query);
    
    // Find matching symptoms first
    const matchingSymptoms = findMatchingSymptoms(query);
    console.log("Matching symptoms:", matchingSymptoms);
    
    // Get related conditions from matching symptoms
    const relatedConditions = new Set(
      matchingSymptoms.flatMap(symptom => symptom.relatedConditions)
    );
    console.log("Related conditions:", Array.from(relatedConditions));

    // Search medications based on symptoms, conditions, and direct medication matches
    let results: Array<{ name: string; details: string; price: string }> = [];
    
    // First try to match from our medication data
    medications.forEach(category => {
      // Include if category matches symptoms or direct search
      if (
        relatedConditions.has(category.category) || 
        category.category.toLowerCase().includes(query.toLowerCase())
      ) {
        const productsFromCategory = category.products.map(product => ({
          name: product.name,
          details: `${product.details}\nRecommended Specialist: ${getRecommendedSpecialist(category.category, matchingSymptoms)}`,
          price: product.price
        }));
        results = [...results, ...productsFromCategory];
      } else {
        // Check individual products
        const matchingProducts = category.products.filter(product => {
          const searchString = `${product.name} ${product.details}`.toLowerCase();
          return searchString.includes(query.toLowerCase());
        }).map(product => ({
          name: product.name,
          details: `${product.details}\nRecommended Specialist: ${getRecommendedSpecialist(category.category, matchingSymptoms)}`,
          price: product.price
        }));
        
        results = [...results, ...matchingProducts];
      }
    });

    // If we have condition matches from medical data but no medication results yet,
    // try to add generic medication recommendations
    if (relatedConditions.size > 0 && results.length === 0) {
      medicalConditions.forEach(condition => {
        if (relatedConditions.has(condition.category)) {
          // Add generic medication recommendations
          condition.medications.forEach(medication => {
            results.push({
              name: medication,
              details: `Common medication for ${condition.category}\nRecommended Specialist: ${condition.specialists.join(' or ')}`,
              price: "Price varies"
            });
          });
        }
      });
    }

    // Search for medication names directly
    if (results.length === 0) {
      medicalConditions.forEach(condition => {
        const matchingMeds = condition.medications.filter(med => 
          med.toLowerCase().includes(query.toLowerCase())
        );
        
        if (matchingMeds.length > 0) {
          matchingMeds.forEach(med => {
            results.push({
              name: med,
              details: `Medication for ${condition.category}\nRecommended Specialist: ${condition.specialists.join(' or ')}`,
              price: "Price varies"
            });
          });
        }
      });
    }

    console.log("Search results:", results);
    onSearch(query, results);
  };

  const getRecommendedSpecialist = (category: string, matchingSymptoms: any[]): string => {
    // First check if we have specialists from symptom matching
    const specialistsFromSymptoms = new Set(
      matchingSymptoms.flatMap(symptom => symptom.specialists)
    );
    
    if (specialistsFromSymptoms.size > 0) {
      return Array.from(specialistsFromSymptoms).join(' or ');
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

  return (
    <form onSubmit={handleSearch} className="w-full mx-auto relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search symptoms, conditions, specialists or medications..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-6 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-lg"
        />
      </div>
      <button type="submit" className="sr-only">Search</button>
    </form>
  );
};
