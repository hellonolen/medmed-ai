
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { findMedicationsForQuery } from '@/utils/medicationMatcher';

interface SearchBarProps {
  onSearch: (query: string, results: Array<{ name: string; details: string; price: string }>) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Searching for:", query);
    
    // Use our enhanced medication matcher
    const matchedMedications = findMedicationsForQuery(query);
    console.log("Matched medications:", matchedMedications);
    
    // Convert to format expected by onSearch
    const results = matchedMedications.map(med => ({
      name: med.name,
      details: med.details,
      price: med.price
    }));

    onSearch(query, results);
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
