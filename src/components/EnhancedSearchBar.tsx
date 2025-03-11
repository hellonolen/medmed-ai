
import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchParams } from '@/services/SearchService';
import { Search, X, MapPin } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface EnhancedSearchBarProps {
  onSearch: (params: SearchParams) => void;
  initialQuery?: string;
}

export const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({ 
  onSearch,
  initialQuery = ''
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<SearchParams['category']>('all');
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  
  const debouncedSearch = useDebounce((searchParams: SearchParams) => {
    onSearch(searchParams);
  }, 300);
  
  const handleSearch = useCallback(() => {
    const searchParams: SearchParams = {
      query,
      category,
      ...(location && { location })
    };
    
    onSearch(searchParams);
  }, [query, category, location, onSearch]);
  
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    if (newQuery.length >= 2) {
      debouncedSearch({
        query: newQuery,
        category,
        ...(location && { location })
      });
    }
  };
  
  const clearSearch = () => {
    setQuery('');
    onSearch({ query: '', category });
  };
  
  const toggleLocationInput = () => {
    setShowLocationInput(!showLocationInput);
    if (showLocationInput) {
      setLocation('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search medications, specialists, conditions..."
          value={query}
          onChange={handleQueryChange}
          className="pr-20 h-12 text-lg"
        />
        <div className="absolute right-2 top-2 flex items-center space-x-1">
          {query && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={clearSearch}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleLocationInput}
            className={`h-8 w-8 ${showLocationInput ? 'text-primary' : ''}`}
          >
            <MapPin className="h-4 w-4" />
          </Button>
          <Button 
            variant="default" 
            size="icon" 
            onClick={handleSearch}
            className="h-8 w-8"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {showLocationInput && (
        <div className="relative">
          <Input
            type="text"
            placeholder="Enter location (city, state, zip)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-12 text-lg"
          />
        </div>
      )}
      
      <Tabs value={category} onValueChange={(value) => setCategory(value as SearchParams['category'])}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="specialists">Specialists</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="pharmacies">Pharmacies</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
