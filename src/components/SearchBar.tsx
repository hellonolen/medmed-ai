
import { useState, useEffect } from 'react';
import { Search, X, Globe, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { VoiceSearchButton } from '@/components/VoiceSearchButton';
import { useMedicalSearch } from '@/contexts/MedicalSearchContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Link, useNavigate } from 'react-router-dom';
import { AccessibilityPanel } from '@/components/AccessibilityPanel';
import { toast } from 'sonner';
import { intelligentPharmacySearch } from '@/utils/pharmacySearch';

interface SearchBarProps {
  onSearch: (query: string, results: Array<{ name: string; details: string; price: string; type?: string; source?: string }>) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const { t } = useLanguage();
  const { searchWithContext, loading } = useMedicalSearch();
  const { tier } = useSubscription();
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();
  
  // Clear suggestions when query changes
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
    }
  }, [query]);

  // AI-powered search function that handles multiple query types
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!query.trim()) {
      onSearch('', []);
      return;
    }
    
    setAiProcessing(true);
    
    try {
      // AI analysis of query type
      const normalizedQuery = query.toLowerCase().trim();
      
      // Check if query appears to be looking for pharmacy locations
      const pharmacyLocationPattern = /pharma(c|s|cy|cies)|drug\s?store|chemist/;
      const locationPattern = /(in|near|at|around)\s+([a-zA-Z\s]+)|(\b\d{5}\b)/;
      
      const isPharmacySearch = pharmacyLocationPattern.test(normalizedQuery);
      const hasLocation = locationPattern.test(normalizedQuery);
      
      // Extract location if present
      let location = "";
      if (hasLocation) {
        const locationMatch = normalizedQuery.match(/(in|near|at|around)\s+([a-zA-Z\s]+)/);
        location = locationMatch ? locationMatch[2].trim() : "";
        
        // Check for ZIP code if no city was matched
        if (!location) {
          const zipMatch = normalizedQuery.match(/\b\d{5}\b/);
          location = zipMatch ? zipMatch[0] : "";
        }
      }
      
      // If it's a pharmacy location search
      if (isPharmacySearch && (hasLocation || normalizedQuery.includes("find"))) {
        toast.info("Searching pharmacies...", {
          icon: <Search className="h-4 w-4 text-primary animate-pulse" />,
        });
        
        // Quick show of pharmacy page for better user experience
        if (location) {
          navigate(`/pharmacy-finder?query=${encodeURIComponent(query)}`);
          return;
        }
        
        // If no specific location but clearly pharmacy-related, redirect to pharmacy finder
        if (isPharmacySearch) {
          navigate(`/pharmacy-finder`);
          return;
        }
      }
      
      // For medical/medication searches
      toast.info("Searching global medical database...", {
        icon: <Search className="h-4 w-4 text-primary animate-pulse" />,
        duration: 2000,
      });
      
      const results = await searchWithContext(query);
      onSearch(query, results);
      
      // Generate search suggestions after results are shown
      if (results.length === 0) {
        generateSearchSuggestions(query);
      }
    } catch (error) {
      console.error("Error in AI-powered search:", error);
      uiToast({
        title: t("search.error.title", "Search Error"),
        description: t("search.error.description", "There was an issue with your search. Please try again."),
        variant: "destructive",
      });
      onSearch(query, []);
    } finally {
      setAiProcessing(false);
    }
  };

  // Generate AI-powered search suggestions
  const generateSearchSuggestions = async (searchQuery: string) => {
    try {
      // Use the API key if available
      const apiKey = process.env.PERPLEXITY_API_KEY || window.localStorage.getItem('PERPLEXITY_API_KEY');
      
      if (!apiKey) return;
      
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a medical search assistant. Generate 3 search suggestions related to the user\'s query. Return only a JSON array of strings with no additional text. For example: ["suggestion 1", "suggestion 2", "suggestion 3"]'
            },
            {
              role: 'user',
              content: `Generate search suggestions for: ${searchQuery}`
            }
          ],
          temperature: 0.3,
          max_tokens: 200
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        try {
          let suggestions: string[] = [];
          const content = data.choices[0].message.content;
          
          if (content.startsWith('[') && content.endsWith(']')) {
            suggestions = JSON.parse(content);
          } else {
            const match = content.match(/\[(.*)\]/s);
            if (match) {
              suggestions = JSON.parse(`[${match[1]}]`);
            }
          }
          
          if (Array.isArray(suggestions) && suggestions.length > 0) {
            setSuggestions(suggestions.slice(0, 3));
          }
        } catch (error) {
          console.error("Error parsing suggestions:", error);
        }
      }
    } catch (error) {
      console.error("Error generating suggestions:", error);
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    setSuggestions([]);
    onSearch('', []);
  };
  
  const applySuggestion = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch();
    setSuggestions([]);
  };
  
  const handleVoiceResult = (text: string) => {
    setQuery(text);
    // Automatically trigger search when voice input is received
    if (text.trim()) {
      handleSearch();
    }
  };

  return (
    <div className="w-full mx-auto relative">
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
        </div>
        <div className="flex items-center gap-2">
          <VoiceSearchButton
            onResult={handleVoiceResult}
            isListening={isListening}
            setIsListening={setIsListening}
          />
          <AccessibilityPanel />
        </div>
      </div>
      
      <form onSubmit={handleSearch} className="w-full relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder={t("search.placeholder.global", "Search symptoms, conditions, specialists, pharmacies or medications worldwide...")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-24 py-6 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-lg"
            aria-label={t("search.placeholder.global", "Search medications, symptoms, conditions worldwide")}
          />
          
          {/* Submit Button */}
          <Button 
            type="submit"
            size="icon"
            variant="ghost"
            className={`absolute right-14 top-1/2 transform -translate-y-1/2 text-primary ${aiProcessing || loading ? 'opacity-50' : ''}`}
            disabled={loading || aiProcessing}
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>
          
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
          className={`sr-only ${loading || aiProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={loading || aiProcessing}
        >
          {t("button.search", "Search")}
        </button>
        
        {loading && (
          <div className="absolute right-20 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
      </form>
      
      {/* Search suggestions */}
      {suggestions.length > 0 && (
        <div className="absolute w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50">
          <p className="text-xs text-gray-500 mb-2 px-2">Try searching for:</p>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="w-full text-left py-2 px-3 hover:bg-primary/10 rounded text-gray-700 text-sm transition-colors flex items-center"
              onClick={() => applySuggestion(suggestion)}
            >
              <Search className="h-3 w-3 text-primary mr-2" />
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
