
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Phone, Clock, Building, Star } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Enhanced mock pharmacy data with nationwide coverage
const pharmacies = [
  // CVS Locations
  {
    id: 1,
    name: "CVS Pharmacy",
    address: "123 Main St, New York, NY 10001",
    phone: "(212) 555-1234",
    hours: "24 hours",
    distance: "0.3 miles",
    rating: 4.5,
    chain: "CVS"
  },
  {
    id: 2,
    name: "CVS Pharmacy",
    address: "456 Broadway, Chicago, IL 60601",
    phone: "(312) 555-5678",
    hours: "8am - 10pm",
    distance: "0.8 miles",
    rating: 4.3,
    chain: "CVS"
  },
  // Walgreens Locations
  {
    id: 3,
    name: "Walgreens",
    address: "789 Oak Ave, Los Angeles, CA 90001",
    phone: "(323) 555-9012",
    hours: "24 hours",
    distance: "1.2 miles",
    rating: 4.4,
    chain: "Walgreens"
  },
  {
    id: 4,
    name: "Walgreens",
    address: "321 Pine St, Miami, FL 33101",
    phone: "(305) 555-3456",
    hours: "7am - 11pm",
    distance: "1.5 miles",
    rating: 4.6,
    chain: "Walgreens"
  },
  // Independent Pharmacies
  {
    id: 5,
    name: "Community Care Pharmacy",
    address: "567 Elm St, Boston, MA 02101",
    phone: "(617) 555-7890",
    hours: "9am - 8pm",
    distance: "0.6 miles",
    rating: 4.8,
    chain: "Independent"
  },
  {
    id: 6,
    name: "Metro Health Pharmacy",
    address: "890 Market St, San Francisco, CA 94102",
    phone: "(415) 555-4321",
    hours: "8am - 9pm",
    distance: "0.9 miles",
    rating: 4.7,
    chain: "Independent"
  }
];

const PharmacyFinder = () => {
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [results, setResults] = useState<typeof pharmacies>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  
  const handleSearch = (e: React.FormEvent, searchType: 'zip' | 'city') => {
    e.preventDefault();
    
    const searchTerm = searchType === 'zip' ? zipCode : city;
    
    if (!searchTerm) {
      toast.error(`Please enter a valid ${searchType === 'zip' ? 'ZIP code' : 'city'}`);
      return;
    }
    
    if (searchType === 'zip' && zipCode.length < 5) {
      toast.error("Please enter a valid ZIP code");
      return;
    }
    
    setSearching(true);
    setSearched(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Filter pharmacies based on search type
      let filteredPharmacies;
      if (searchType === 'zip') {
        // Simulate distance-based search for ZIP codes
        filteredPharmacies = pharmacies.map(pharmacy => ({
          ...pharmacy,
          distance: (Math.random() * 5).toFixed(1) + ' miles' // Randomize distances for demo
        }));
      } else {
        // Filter by city name (case-insensitive)
        filteredPharmacies = pharmacies.filter(pharmacy => 
          pharmacy.address.toLowerCase().includes(city.toLowerCase())
        );
      }
      
      setResults(filteredPharmacies);
      setSearching(false);
      
      if (filteredPharmacies.length === 0) {
        toast.info(`No pharmacies found for this ${searchType === 'zip' ? 'ZIP code' : 'city'}`);
      }
    }, 1000);
  };
  
  const getPharmacyRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white">
      <div className="container px-4 py-8 mx-auto">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Pharmacy Finder</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find pharmacies nationwide - including CVS, Walgreens, and local pharmacies
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card className="backdrop-blur-md bg-card/90 border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Search for Pharmacies</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="zip" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="zip">Search by ZIP Code</TabsTrigger>
                  <TabsTrigger value="city">Search by City</TabsTrigger>
                </TabsList>
                
                <TabsContent value="zip">
                  <form onSubmit={(e) => handleSearch(e, 'zip')} className="flex flex-col sm:flex-row gap-3">
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
                    <Button type="submit" disabled={searching}>
                      {searching ? "Searching..." : "Find Pharmacies"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="city">
                  <form onSubmit={(e) => handleSearch(e, 'city')} className="flex flex-col sm:flex-row gap-3">
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
                    <Button type="submit" disabled={searching}>
                      {searching ? "Searching..." : "Find Pharmacies"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {!searching && results.length > 0 && (
            <div className="space-y-4 mb-8">
              <h2 className="text-xl font-semibold mb-4">
                Pharmacies {city ? `in ${city}` : `Near ${zipCode}`}
              </h2>
              
              {results.map((pharmacy) => (
                <Card 
                  key={pharmacy.id} 
                  className="backdrop-blur-md bg-card/90 border-0 shadow hover:shadow-md transition-all"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-lg font-semibold text-primary">{pharmacy.name}</h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="h-4 w-4 mr-1" /> 
                          <span>{pharmacy.distance}</span>
                        </div>
                        {getPharmacyRating(pharmacy.rating)}
                      </div>
                      
                      <Button 
                        onClick={() => {
                          window.open(`https://www.google.com/maps/search/${encodeURIComponent(pharmacy.address)}`, '_blank');
                        }}
                      >
                        Get Directions
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-sm">
                      <div className="flex items-start gap-2">
                        <Building className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span>{pharmacy.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{pharmacy.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{pharmacy.hours}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {searching && (
            <div className="text-center py-12">
              <p className="text-gray-500">Searching for pharmacies...</p>
            </div>
          )}
          
          {searched && results.length === 0 && !searching && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No pharmacies found for this {city ? 'city' : 'ZIP code'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PharmacyFinder;
