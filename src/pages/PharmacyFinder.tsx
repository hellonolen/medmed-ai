
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Phone, Clock, Building, Star } from "lucide-react";
import { toast } from "sonner";

// Mock pharmacy data
const pharmacies = [
  {
    id: 1,
    name: "HealthPlus Pharmacy",
    address: "123 Main St, Anytown, CA 12345",
    phone: "(555) 123-4567",
    hours: "9am - 9pm",
    distance: "0.8 miles",
    rating: 4.8
  },
  {
    id: 2,
    name: "MedExpress Pharmacy",
    address: "456 Oak Ave, Anytown, CA 12345",
    phone: "(555) 987-6543",
    hours: "8am - 10pm",
    distance: "1.2 miles",
    rating: 4.5
  },
  {
    id: 3,
    name: "Community Care Pharmacy",
    address: "789 Pine St, Anytown, CA 12345",
    phone: "(555) 456-7890",
    hours: "9am - 8pm",
    distance: "1.5 miles",
    rating: 4.7
  },
  {
    id: 4,
    name: "Downtown Drugstore",
    address: "101 Center St, Anytown, CA 12345",
    phone: "(555) 222-3333",
    hours: "7am - 11pm",
    distance: "2.1 miles",
    rating: 4.3
  },
  {
    id: 5,
    name: "QuickMeds Pharmacy",
    address: "202 Elm St, Anytown, CA 12345",
    phone: "(555) 789-0123",
    hours: "8am - 9pm",
    distance: "2.4 miles",
    rating: 4.6
  }
];

const PharmacyFinder = () => {
  const [zipCode, setZipCode] = useState("");
  const [results, setResults] = useState<typeof pharmacies>([]);
  const [searching, setSearching] = useState(false);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!zipCode || zipCode.length < 5) {
      toast.error("Please enter a valid ZIP code");
      return;
    }
    
    setSearching(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setResults(pharmacies);
      setSearching(false);
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
            Find pharmacies near you that carry the medications you need
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card className="backdrop-blur-md bg-card/90 border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Search for Pharmacies</CardTitle>
            </CardHeader>
            <CardContent>
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
                <Button type="submit" disabled={searching}>
                  {searching ? "Searching..." : "Find Pharmacies"}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {results.length > 0 && (
            <div className="space-y-4 mb-8">
              <h2 className="text-xl font-semibold mb-4">Pharmacies Near {zipCode}</h2>
              
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
                      
                      <Button>Get Directions</Button>
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
        </div>
      </div>
    </div>
  );
};

export default PharmacyFinder;
