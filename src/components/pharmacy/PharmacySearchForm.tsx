
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Search, Globe, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { aiService } from "@/services/AIService";

interface PharmacySearchFormProps {
  onSearch: (searchTerm: string, searchType: 'zip' | 'city' | 'smart') => void;
  isSearching: boolean;
  initialSearchTerm?: string;
}

export const PharmacySearchForm = ({ onSearch, isSearching, initialSearchTerm = "" }: PharmacySearchFormProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const { language } = useLanguage();

  // Set initial search term if provided
  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  // Trigger search when initialSearchTerm is provided
  useEffect(() => {
    if (initialSearchTerm && !isSearching) {
      // Use a small delay to ensure the form has updated
      const timer = setTimeout(() => {
        handleSearch(new Event('submit') as any);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [initialSearchTerm]);

  // Generate search suggestions
  const generateSearchSuggestions = async (query: string) => {
    if (!query || query.length < 3) return;
    
    setLoadingSuggestions(true);
    
    try {
      const response = await aiService.askAI({
        query: `Generate 3 pharmacy or healthcare provider search suggestions related to: ${query}`,
        systemPrompt: 'Generate 3 search suggestions related to the user\'s query. Return only a JSON array of strings with no additional text. For example: ["suggestion 1", "suggestion 2", "suggestion 3"]'
      });
      
      if (response.success) {
        try {
          let suggestionsArr: string[] = [];
          const content = response.content;
          
          if (content.startsWith('[') && content.endsWith(']')) {
            suggestionsArr = JSON.parse(content);
          } else {
            const match = content.match(/\[(.*)\]/s);
            if (match) {
              suggestionsArr = JSON.parse(`[${match[1]}]`);
            }
          }
          
          if (Array.isArray(suggestionsArr) && suggestionsArr.length > 0) {
            setSuggestions(suggestionsArr.slice(0, 3));
          } else {
            setSuggestions([]);
          }
        } catch (error) {
          console.error("Error parsing suggestions:", error);
          setSuggestions([]);
        }
      }
    } catch (error) {
      console.error("Error generating suggestions:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Enhanced search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm) {
      toast.error("Please enter a search term");
      return;
    }
    
    // Clean the search term - remove any existing language codes first
    let cleanedSearchTerm = searchTerm.replace(/\s*\([a-z]{2}\)\s*/g, "").trim();
    
    // Add language context to search only once
    let searchQuery = `${cleanedSearchTerm} (${language})`;
    
    // Determine the search type based on the content
    const termLower = cleanedSearchTerm.toLowerCase();
    let searchType: 'zip' | 'city' | 'smart' = 'smart';
    
    // Check if this looks like a ZIP/postal code
    if (/^\d{5}(-\d{4})?$/.test(termLower)) {
      searchType = 'zip';
    } 
    // Check if it contains location-specific terms
    else if (/(in|near|at)\s+([a-zA-Z\s]+)/.test(termLower)) {
      searchType = 'city';
    }
    
    // Analyze the search query for better results if using smart search
    if (searchType === 'smart') {
      try {
        const response = await aiService.askAI({
          query: `Analyze this healthcare search query: "${searchQuery}"`,
          systemPrompt: 'Determine if this query is looking for a pharmacy, medical specialist, healthcare facility, or specific medication. Return only a JSON object like {"type": "pharmacy|specialist|facility|medication", "enhancedQuery": "improved search query"}. No other text.'
        });
        
        if (response.success) {
          try {
            const analysis = JSON.parse(response.content);
            if (analysis.enhancedQuery) {
              searchQuery = analysis.enhancedQuery;
              console.log("Enhanced query:", searchQuery);
            }
          } catch (error) {
            console.error("Error parsing response:", error);
          }
        }
      } catch (error) {
        console.error("Error analyzing search query:", error);
      }
    }
    
    console.log(`Searching with term: "${searchQuery}" using search type: ${searchType}`);
    onSearch(searchQuery, searchType);
    setSuggestions([]);
  };

  // Apply suggestion to search field
  const applySuggestion = (suggestion: string) => {
    setSearchTerm(suggestion);
    
    setTimeout(() => {
      handleSearch(new Event('submit') as any);
    }, 100);
  };

  // Handle input change with suggestions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length >= 3) {
      generateSearchSuggestions(value);
    } else {
      setSuggestions([]);
    }
  };

  return (
    <Card className="backdrop-blur-md bg-card/90 border-0 shadow-lg mb-8">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          <span>Find Pharmacies & Healthcare Services Worldwide</span>
          <Globe className="ml-2 h-4 w-4 text-primary/70" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by location, postal code, or healthcare services..."
              className="pl-9"
              value={searchTerm}
              onChange={handleInputChange}
            />
            {suggestions.length > 0 && (
              <div className="absolute w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => applySuggestion(suggestion)}
                  >
                    <Sparkles className="h-3 w-3 text-primary" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button type="submit" disabled={isSearching} className="flex items-center gap-2">
            {isSearching ? (
              "Searching..."
            ) : (
              <>
                <MapPin className="h-4 w-4" />
                <span>Search</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
