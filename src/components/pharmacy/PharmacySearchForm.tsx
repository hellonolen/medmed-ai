
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Building, Search } from "lucide-react";
import { toast } from "sonner";

interface PharmacySearchFormProps {
  onSearch: (searchTerm: string, searchType: 'zip' | 'city' | 'smart') => void;
  isSearching: boolean;
}

export const PharmacySearchForm = ({ onSearch, isSearching }: PharmacySearchFormProps) => {
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [smartSearch, setSmartSearch] = useState("");
  const [activeTab, setActiveTab] = useState<'zip' | 'city' | 'smart'>('smart');

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
    
    onSearch(searchTerm, activeTab);
  };

  return (
    <Card className="backdrop-blur-md bg-card/90 border-0 shadow-lg mb-8">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Search for Pharmacies Worldwide</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="smart" 
          className="w-full"
          onValueChange={(value) => setActiveTab(value as 'zip' | 'city' | 'smart')}
        >
          <TabsList className="mb-4 grid grid-cols-3">
            <TabsTrigger value="smart">Smart Search</TabsTrigger>
            <TabsTrigger value="zip">Search by Postal Code</TabsTrigger>
            <TabsTrigger value="city">Search by Location</TabsTrigger>
          </TabsList>
          
          <TabsContent value="smart">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Enter any location, postal code, or pharmacy name"
                  className="pl-9"
                  value={smartSearch}
                  onChange={(e) => setSmartSearch(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={isSearching}>
                {isSearching ? "Searching..." : "Find Pharmacies"}
              </Button>
            </form>
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
                {isSearching ? "Searching..." : "Find Pharmacies"}
              </Button>
            </form>
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
                {isSearching ? "Searching..." : "Find Pharmacies"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
