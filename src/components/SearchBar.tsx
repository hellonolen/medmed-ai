import { useState } from 'react';
import { Search, X, Globe, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { VoiceSearchButton } from '@/components/VoiceSearchButton';
import { useMedicalSearch } from '@/contexts/MedicalSearchContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Link } from 'react-router-dom';

interface SearchBarProps {
  onSearch: (query: string, results: Array<{ name: string; details: string; price: string; type?: string; source?: string }>) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const { t } = useLanguage();
  const { searchWithContext } = useMedicalSearch();
  const { isSubscribed, tier } = useSubscription();
  const { toast } = useToast();

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!query.trim()) {
      onSearch('', []);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const results = await searchWithContext(query);
      onSearch(query, results);
    } catch (error) {
      console.error("Error in medical search:", error);
      toast({
        title: t("search.error.title", "Search Error"),
        description: t("search.error.description", "There was an issue with your search. Please try again."),
        variant: "destructive",
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
  
  const handleVoiceResult = (text: string) => {
    setQuery(text);
  };

  return (
    <div className="w-full mx-auto">
      <div className="flex items-center mb-2 justify-between">
        <div className="flex items-center">
          <Globe className="h-5 w-5 text-primary mr-2" />
          <span className="text-sm text-gray-600">Worldwide search</span>
          
          {tier !== 'free' && (
            <div className="ml-2 flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
              <Star className="h-3 w-3 fill-primary" />
              <span>{tier.charAt(0).toUpperCase() + tier.slice(1)}</span>
            </div>
          )}
          
          {!isSubscribed && (
            <Link to="/subscription" className="ml-2 text-xs text-primary hover:underline hover:text-primary/80">
              Upgrade for more results
            </Link>
          )}
        </div>
        <VoiceSearchButton
          onResult={handleVoiceResult}
          isListening={isListening}
          setIsListening={setIsListening}
          className="ml-2"
        />
      </div>
      
      <form onSubmit={handleSearch} className="w-full relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder={t("search.placeholder.global", "Search symptoms, conditions, specialists or medications worldwide...")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-20 py-6 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-lg"
            aria-label={t("search.placeholder.global", "Search medications, symptoms, conditions worldwide")}
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={handleClearSearch}
              aria-label={t("button.clear", "Clear search")}
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
