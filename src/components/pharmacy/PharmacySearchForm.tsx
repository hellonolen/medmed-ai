
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { pharmacies } from '@/data/pharmacies';
import { Pharmacy } from '@/data/pharmacies';
import { Search, MapPin } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';

interface PharmacySearchFormProps {
  onResultsFound: (results: Pharmacy[]) => void;
  initialName?: string;
}

export const PharmacySearchForm: React.FC<PharmacySearchFormProps> = ({ 
  onResultsFound,
  initialName = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialName);
  const [searchType, setSearchType] = useState<'smart' | 'zip' | 'city'>('smart');
  const { t } = useLanguage();
  
  // Process search when component mounts with initialName
  useEffect(() => {
    if (initialName) {
      handleSearch();
    }
  }, [initialName]);
  
  const debouncedSearch = useDebounce(performSearch, 500);
  
  function handleSearch() {
    debouncedSearch();
  }
  
  function performSearch() {
    if (!searchTerm) return;
    
    let results: Pharmacy[] = [];
    const term = searchTerm.toLowerCase();
    
    switch (searchType) {
      case 'zip':
        results = pharmacies.filter(p => p.zip.includes(term));
        break;
      case 'city':
        results = pharmacies.filter(p => p.city.toLowerCase().includes(term));
        break;
      case 'smart':
      default:
        // Smart search across name, city, chain, and zip
        results = pharmacies.filter(p => {
          return p.name.toLowerCase().includes(term) || 
                 p.city.toLowerCase().includes(term) || 
                 (p.chain && p.chain.toLowerCase().includes(term)) ||
                 p.zip.includes(term);
        });
    }
    
    // Add a relevance property for sorting based on exact matches
    const enrichedResults = results.map(pharmacy => {
      let relevance = 0;
      
      if (pharmacy.name.toLowerCase() === term) relevance += 10;
      else if (pharmacy.name.toLowerCase().includes(term)) relevance += 5;
      
      if (pharmacy.city.toLowerCase() === term) relevance += 8;
      else if (pharmacy.city.toLowerCase().includes(term)) relevance += 4;
      
      if (pharmacy.zip === term) relevance += 9;
      else if (pharmacy.zip.includes(term)) relevance += 4;
      
      if (pharmacy.chain && pharmacy.chain.toLowerCase() === term) relevance += 7;
      else if (pharmacy.chain && pharmacy.chain.toLowerCase().includes(term)) relevance += 3;
      
      return { ...pharmacy, relevance };
    });
    
    // Sort by relevance
    enrichedResults.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
    
    onResultsFound(enrichedResults);
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  return (
    <div className="space-y-4">
      <Tabs 
        value={searchType} 
        onValueChange={(value) => setSearchType(value as 'smart' | 'zip' | 'city')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="smart">
            {t("pharmacy.search.smart", "Smart Search")}
          </TabsTrigger>
          <TabsTrigger value="zip">
            {t("pharmacy.search.zip", "ZIP Code")}
          </TabsTrigger>
          <TabsTrigger value="city">
            {t("pharmacy.search.city", "City")}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex space-x-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={
              searchType === 'zip'
                ? t("pharmacy.search.zip_placeholder", "Enter ZIP code...")
                : searchType === 'city'
                ? t("pharmacy.search.city_placeholder", "Enter city name...")
                : t("pharmacy.search.smart_placeholder", "Search by name, city, or ZIP...")
            }
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        
        <Button onClick={handleSearch} type="button">
          <Search className="h-4 w-4 mr-2" />
          {t("pharmacy.search.button", "Search")}
        </Button>
      </div>
    </div>
  );
};
