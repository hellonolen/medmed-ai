
import { useState } from 'react';
import { Search, X, Globe, Languages } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { findMedicationsForQuery } from '@/utils/medicationMatcher';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
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
  const [region, setRegion] = useState<string>('global');
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      onSearch('', []);
      return;
    }
    
    setIsSearching(true);
    console.log("Searching for:", query, "Region:", region, "Language:", language);
    
    try {
      // Enhance search query with region context and language
      const enhancedQuery = region !== 'global' 
        ? `${query} (${region}, ${language})` 
        : `${query} (${language})`;
        
      // Use our enhanced medication matcher (now async)
      const matchedMedications = await findMedicationsForQuery(enhancedQuery);
      console.log("Matched medications:", matchedMedications);
      
      // Convert to format expected by onSearch
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
          description: region === 'global' 
            ? t("search.worldwide", "Results include data from global medical databases")
            : t("search.region", `Results include data for region: ${region}`),
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
      // Still call onSearch with empty results to handle the error gracefully
      onSearch(query, []);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    onSearch('', []);
  };
  
  const regions = [
    { value: 'global', label: t('region.global', 'Global') },
    { value: 'north-america', label: t('region.north-america', 'North America') },
    { value: 'europe', label: t('region.europe', 'Europe') },
    { value: 'asia', label: t('region.asia', 'Asia') },
    { value: 'africa', label: t('region.africa', 'Africa') },
    { value: 'south-america', label: t('region.south-america', 'South America') },
    { value: 'australia', label: t('region.australia', 'Australia/Oceania') }
  ];

  return (
    <div className="w-full mx-auto">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <div className="text-sm flex flex-wrap gap-1">
            {regions.map((r) => (
              <Badge 
                key={r.value}
                variant={region === r.value ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setRegion(r.value)}
              >
                {r.label}
              </Badge>
            ))}
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Languages className="h-4 w-4" />
              <span>{supportedLanguages[language]}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.entries(supportedLanguages).map(([code, name]) => (
              <DropdownMenuItem 
                key={code}
                onClick={() => setLanguage(code as LanguageCode)}
                className={language === code ? "bg-accent" : ""}
              >
                {name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <form onSubmit={handleSearch} className="w-full relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder={region === 'global' 
              ? t("search.placeholder.global", "Search symptoms, conditions, specialists or medications worldwide...") 
              : t("search.placeholder.region", `Search for healthcare in ${regions.find(r => r.value === region)?.label}...`)}
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
