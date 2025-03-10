
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { medications } from '@/data/medications';
import { findMatchingSymptoms } from '@/data/symptoms';

interface SearchBarProps {
  onSearch: (query: string, results: Array<{ name: string; details: string; price: string }>) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find matching symptoms first
    const matchingSymptoms = findMatchingSymptoms(query);
    
    // Get related conditions from matching symptoms
    const relatedConditions = new Set(
      matchingSymptoms.flatMap(symptom => symptom.relatedConditions)
    );

    // Search medications based on symptoms and direct medication matches
    const results = medications.flatMap(category => {
      // Include if category matches symptoms or direct search
      if (relatedConditions.has(category.category) || 
          category.category.toLowerCase().includes(query.toLowerCase())) {
        return category.products.map(product => ({
          name: product.name,
          details: `${product.details}\nRecommended Specialist: ${getRecommendedSpecialist(category.category, matchingSymptoms)}`,
          price: product.price
        }));
      }
      
      // Check individual products
      return category.products.filter(product => {
        const searchString = `${product.name} ${product.details}`.toLowerCase();
        return searchString.includes(query.toLowerCase());
      }).map(product => ({
        name: product.name,
        details: `${product.details}\nRecommended Specialist: ${getRecommendedSpecialist(category.category, matchingSymptoms)}`,
        price: product.price
      }));
    });

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

    // Fallback to category mapping
    const specialistMap: Record<string, string> = {
      'ACNE/ROSACEA': 'Dermatology',
      'Anti-Aging': 'Dermatology',
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
