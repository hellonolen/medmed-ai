
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Building, Search, Globe } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface PharmacySearchFormProps {
  onSearch: (searchTerm: string, searchType: 'zip' | 'city' | 'smart') => void;
  isSearching: boolean;
  initialSearchTerm?: string;
}

export const PharmacySearchForm = ({ onSearch, isSearching, initialSearchTerm = "" }: PharmacySearchFormProps) => {
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [smartSearch, setSmartSearch] = useState("");
  const [activeTab, setActiveTab] = useState<'zip' | 'city' | 'smart'>('smart');
  const { language } = useLanguage();

  // Set initial search term if provided
  useEffect(() => {
    if (initialSearchTerm) {
      // Check if it looks like a ZIP code
      if (/^\d{5}$/.test(initialSearchTerm)) {
        setZipCode(initialSearchTerm);
        setActiveTab('zip');
      } 
      // Check if it contains a city/location reference
      else if (/(in|near|at)\s+([a-zA-Z\s]+)/.test(initialSearchTerm)) {
        const locationMatch = initialSearchTerm.match(/(in|near|at)\s+([a-zA-Z\s]+)/);
        const extractedLocation = locationMatch ? locationMatch[2].trim() : "";
        setCity(extractedLocation || initialSearchTerm);
        setActiveTab('city');
      } 
      // Default to smart search
      else {
        setSmartSearch(initialSearchTerm);
        setActiveTab('smart');
      }
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
  }, [initialSearchTerm, activeTab]);

  // Clear form when language changes
  useEffect(() => {
    // Keep the values but force a re-search if language changes
  }, [language]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    let searchTerm = "";
    
    switch(activeTab) {
      case 'zip':
        searchTerm = zipCode;
        if (!searchTerm) {
          toast.error("Please enter a valid ZIP or postal code");
          return;
        }
        break;
      case 'city':
        searchTerm = city;
        if (!searchTerm) {
          toast.error("Please enter a valid city or location");
          return;
        }
        break;
      case 'smart':
        searchTerm = smartSearch;
        if (!searchTerm) {
          toast.error("Please enter a search term");
          return;
        }
        break;
    }
    
    // Add language context to search
    searchTerm = `${searchTerm} (${language})`;
    
    console.log(`Searching with term: "${searchTerm}" using search type: ${activeTab}`);
    onSearch(searchTerm, activeTab);
  };

  return (
    <Card className="backdrop-blur-md bg-card/90 border-0 shadow-lg mb-8">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          <span>Search for Pharmacies, Healthcare Professionals, or Specialists Worldwide</span>
          <Globe className="ml-2 h-4 w-4 text-primary/70" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs 
          value={activeTab}
          defaultValue="smart" 
          className="w-full"
          onValueChange={(value) => setActiveTab(value as 'zip' | 'city' | 'smart')}
        >
          <TabsList className="mb-4 grid grid-cols-3">
            <TabsTrigger value="smart">AI Smart Search</TabsTrigger>
            <TabsTrigger value="zip">Search by Postal Code</TabsTrigger>
            <TabsTrigger value="city">Search by Location</TabsTrigger>
          </TabsList>
          
          <TabsContent value="smart">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Enter any healthcare professional, pharmacy, symptom, condition, or medication type..."
                  className="pl-9"
                  value={smartSearch}
                  onChange={(e) => setSmartSearch(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={isSearching}>
                {isSearching ? "Searching..." : "Find Healthcare"}
              </Button>
            </form>
            <p className="text-xs text-gray-500 mt-2">
              Our AI-powered search automatically detects what you're looking for and searches globally. 
              Try searching for specific medication types like "tablets", "inhalers", "medical devices", "diagnostic tools", etc.
            </p>
          </TabsContent>
          
          <TabsContent value="zip">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Enter ZIP or postal code (US, UK, Canada, etc.)"
                  className="pl-9"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={isSearching}>
                {isSearching ? "Searching..." : "Find Healthcare"}
              </Button>
            </form>
            <p className="text-xs text-gray-500 mt-2">
              Supports US ZIP codes like 33511, 60601, 90001 (Tampa, Chicago, LA). For international searches, try the Smart Search.
            </p>
          </TabsContent>
          
          <TabsContent value="city">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Enter city, region or country"
                  className="pl-9"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={isSearching}>
                {isSearching ? "Searching..." : "Find Healthcare"}
              </Button>
            </form>
            <p className="text-xs text-gray-500 mt-2">
              Try "Tampa", "Chicago", "New York" or include country for international searches like "Paris, France".
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
