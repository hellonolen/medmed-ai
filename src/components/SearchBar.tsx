
import { useState, useEffect } from 'react';
import { Search, X, Languages } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { findMedicationsForQuery } from '@/utils/medicationMatcher';
import { useToast } from '@/components/ui/use-toast';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useLanguage, supportedLanguages, LanguageCode } from '@/contexts/LanguageContext';

interface SearchBarProps {
  onSearch: (query: string, results: Array<{ name: string; details: string; price: string; type?: string; source?: string }>) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      onSearch('', []);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const matchedMedications = await findMedicationsForQuery(query);
      
      const results = matchedMedications.map(med => ({
        name: med.name,
        details: med.details,
        price: med.price,
        type: med.type,
        source: med.source
      }));

      onSearch(query, results);
      
      if (matchedMedications.some(med => med.source && med.source !== "MedMed Database")) {
        toast({
          title: "Global Data Sources",
          description: t("search.worldwide", "Results include data from global medical databases"),
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error in medication search:", error);
      toast({
        title: "Search Error",
        description: "There was an issue with your search. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      onSearch(query, []);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    onSearch('', []);
  };

  return (
    <div className="w-full mx-auto">
      <form onSubmit={handleSearch} className="w-full relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder={t("search.placeholder.global", "Search symptoms, conditions, specialists or medications worldwide...")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-6 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-lg"
            disabled={isSearching}
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={handleClearSearch}
              aria-label={t("button.clear", "Clear search")}
              disabled={isSearching}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        <button 
          type="submit" 
          className={`sr-only ${isSearching ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={isSearching}
        >
          {t("button.search", "Search")}
        </button>
        {isSearching && (
          <div className="absolute right-14 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
      </form>
    </div>
  );
};
