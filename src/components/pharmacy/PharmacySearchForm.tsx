
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Search, Globe, Sparkles, Building, Phone } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { aiService } from "@/services/AIService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PharmacySearchFormProps {
  onSearch: (searchTerm: string, searchType: 'zip' | 'city' | 'smart' | 'phone' | 'name') => void;
  isSearching: boolean;
  initialSearchTerm?: string;
}

export const PharmacySearchForm = ({ onSearch, isSearching, initialSearchTerm = "" }: PharmacySearchFormProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [phoneSearch, setPhoneSearch] = useState("");

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
        query: `Generate 3 pharmacy, med spa, or healthcare provider search suggestions related to: ${query}`,
        systemPrompt: 'Generate 3 search suggestions related to pharmacies, med spas, and healthcare facilities for the user\'s query. Return only a JSON array of strings with no additional text. For example: ["suggestion 1", "suggestion 2", "suggestion 3"]'
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
    
    // Determine which search field to use based on active tab
    let searchTermToUse = searchTerm;
    let searchTypeToUse: 'zip' | 'city' | 'smart' | 'phone' | 'name' = 'smart';
    
    if (activeTab === "phone" && phoneSearch) {
      searchTermToUse = phoneSearch;
      searchTypeToUse = 'phone';
    } else if (!searchTermToUse) {
      toast.error("Please enter a search term");
      return;
    }
    
    // Clean the search term - remove any existing language codes first
    let cleanedSearchTerm = searchTermToUse.replace(/\s*\([a-z]{2}\)\s*/g, "").trim();
    
    // Add language context to search only once
    let searchQuery = `${cleanedSearchTerm} (${language})`;
    
    // Determine the search type based on the content and active tab
    if (activeTab === "zip") {
      searchTypeToUse = 'zip';
    } else if (activeTab === "city") {
      searchTypeToUse = 'city';
    } else if (activeTab === "phone") {
      searchTypeToUse = 'phone';
    } else if (activeTab === "name") {
      searchTypeToUse = 'name';
    } else if (activeTab === "all") {
      // Auto-detect search type
      const termLower = cleanedSearchTerm.toLowerCase();
      
      // Check if this looks like a ZIP/postal code
      if (/^\d{5}(-\d{4})?$/.test(termLower)) {
        searchTypeToUse = 'zip';
      } 
      // Check if it contains location-specific terms
      else if (/(in|near|at)\s+([a-zA-Z\s]+)/.test(termLower)) {
        searchTypeToUse = 'city';
      }
      // Check if it's a phone number format
      else if (/(\+\d{1,3})?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(termLower)) {
        searchTypeToUse = 'phone';
      }
    }
    
    // Analyze the search query for better results if using smart search
    if (searchTypeToUse === 'smart') {
      try {
        const response = await aiService.askAI({
          query: `Analyze this healthcare search query: "${searchQuery}"`,
          systemPrompt: 'Determine if this query is looking for a pharmacy, med spa, medical specialist, healthcare facility, or specific medication. Return only a JSON object like {"type": "pharmacy|med_spa|specialist|facility|medication", "enhancedQuery": "improved search query"}. No other text.'
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
    
    console.log(`Searching with term: "${searchQuery}" using search type: ${searchTypeToUse}`);
    onSearch(searchQuery, searchTypeToUse);
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
          <span>Find Pharmacies, Med Spas & Healthcare Services Worldwide</span>
          <Globe className="ml-2 h-4 w-4 text-primary/70" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="all">All Search</TabsTrigger>
            <TabsTrigger value="zip">ZIP Code</TabsTrigger>
            <TabsTrigger value="city">City/State</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
            <TabsTrigger value="name">Facility Name</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search pharmacies, med spas, or healthcare services..."
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
          </TabsContent>
          
          <TabsContent value="zip" className="mt-0">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Enter ZIP/Postal code..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={handleInputChange}
                />
              </div>
              <Button type="submit" disabled={isSearching}>
                {isSearching ? "Searching..." : "Search by ZIP"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="city" className="mt-0">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Enter city, state, or province..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={handleInputChange}
                />
              </div>
              <Button type="submit" disabled={isSearching}>
                {isSearching ? "Searching..." : "Search by Location"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="phone" className="mt-0">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="tel"
                  placeholder="Enter phone number..."
                  className="pl-9"
                  value={phoneSearch}
                  onChange={(e) => setPhoneSearch(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={isSearching}>
                {isSearching ? "Searching..." : "Search by Phone"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="name" className="mt-0">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Enter facility name (pharmacy, med spa, clinic)..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={handleInputChange}
                />
              </div>
              <Button type="submit" disabled={isSearching}>
                {isSearching ? "Searching..." : "Search by Name"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        
        <div className="mt-3 text-xs text-gray-500">
          Search for med spas, pharmacies, and other healthcare facilities by location, name, or phone number worldwide.
        </div>
      </CardContent>
    </Card>
  );
};
