
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { medications } from '@/data/medications';

interface SearchBarProps {
  onSearch: (results: Array<{ name: string; details: string; price: string }>) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const results = medications.flatMap(category => 
      category.products.filter(product => {
        const searchString = `${product.name} ${product.details} ${category.category}`.toLowerCase();
        return searchString.includes(query.toLowerCase());
      }).map(product => ({
        name: product.name,
        details: product.details,
        price: product.price
      }))
    );

    onSearch(results);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search symptoms, conditions, or medications..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>
    </form>
  );
};
