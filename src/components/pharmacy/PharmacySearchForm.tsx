
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Building } from "lucide-react";
import { toast } from "sonner";

interface PharmacySearchFormProps {
  onSearch: (searchTerm: string, searchType: 'zip' | 'city') => void;
  isSearching: boolean;
}

export const PharmacySearchForm = ({ onSearch, isSearching }: PharmacySearchFormProps) => {
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [activeTab, setActiveTab] = useState<'zip' | 'city'>('zip');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const searchTerm = activeTab === 'zip' ? zipCode : city;
    
    if (!searchTerm) {
      toast.error(`Please enter a valid ${activeTab === 'zip' ? 'ZIP code' : 'city'}`);
      return;
    }
    
    if (activeTab === 'zip' && zipCode.length < 5) {
      toast.error("Please enter a valid ZIP code");
      return;
    }
    
    onSearch(searchTerm, activeTab);
  };

  return (
    <Card className="backdrop-blur-md bg-card/90 border-0 shadow-lg mb-8">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Search for Pharmacies</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="zip" 
          className="w-full"
          onValueChange={(value) => setActiveTab(value as 'zip' | 'city')}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="zip">Search by ZIP Code</TabsTrigger>
            <TabsTrigger value="city">Search by City</TabsTrigger>
          </TabsList>
          
          <TabsContent value="zip">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Enter ZIP code"
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
                  placeholder="Enter city name"
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
