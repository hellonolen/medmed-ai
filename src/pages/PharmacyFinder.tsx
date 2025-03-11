
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe } from "lucide-react";
import { toast } from "sonner";
import { Pharmacy } from "@/data/pharmacies";
import { searchPharmaciesByZip, searchPharmaciesByCity, intelligentPharmacySearch } from "@/utils/pharmacySearch";
import { PharmacySearchForm } from "@/components/pharmacy/PharmacySearchForm";
import { PharmacyList } from "@/components/pharmacy/PharmacyList";

const PharmacyFinder = () => {
  const [results, setResults] = useState<Pharmacy[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<'zip' | 'city' | 'smart'>('smart');
  const [searchParams] = useSearchParams();
  
  // Handle search query from URL parameters
  useEffect(() => {
    const query = searchParams.get('query');
    if (query) {
      setSearchTerm(query);
      handleSearch(query, 'smart');
    }
  }, [searchParams]);
  
  const handleSearch = (term: string, type: 'zip' | 'city' | 'smart') => {
    setSearching(true);
    setSearched(true);
    setSearchTerm(term);
    setSearchType(type);
    
    // Clean the term by removing duplicate language codes
    const cleanedTerm = term.replace(/\s*\([a-z]{2}\)(\s*\([a-z]{2}\))+/g, " ($1)").trim();
    
    // Simulate API call delay
    setTimeout(() => {
      let filteredPharmacies: Pharmacy[] = [];
      
      console.log(`Searching by ${type}:`, cleanedTerm);
      
      // Check if term contains a city name or location mention
      const hasCityOrLocation = /(in|near|at)\s+([a-zA-Z\s]+)/.test(cleanedTerm);
      const locationMatch = cleanedTerm.match(/(in|near|at)\s+([a-zA-Z\s]+)/);
      const extractedLocation = locationMatch ? locationMatch[2].trim() : "";
      
      // Use the appropriate search function based on the search type and query
      if (type === 'zip' || /^\d{5}$/.test(cleanedTerm)) {
        // It's a ZIP code search
        filteredPharmacies = searchPharmaciesByZip(cleanedTerm);
      } else if (type === 'city' || hasCityOrLocation) {
        // It's a city search or contains a city mention
        const searchLocation = hasCityOrLocation ? extractedLocation : cleanedTerm;
        filteredPharmacies = searchPharmaciesByCity(searchLocation);
      } else {
        // Use intelligent search for everything else
        filteredPharmacies = intelligentPharmacySearch(cleanedTerm);
      }
      
      console.log("Search results:", filteredPharmacies.length);
      setResults(filteredPharmacies);
      setSearching(false);
      
      if (filteredPharmacies.length === 0) {
        toast.info(`No pharmacies found for this search term. Try a different search.`);
      } else if (filteredPharmacies.some(p => p.distance === "International")) {
        toast.success(`Found ${filteredPharmacies.length} pharmacies worldwide including international locations.`);
      } else {
        toast.success(`Found ${filteredPharmacies.length} pharmacies matching your search.`);
      }
    }, 1000);
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
          <h1 className="text-4xl font-bold text-primary mb-4">
            Global Pharmacy Finder
            <Globe className="inline-block ml-3 h-8 w-8 text-primary/70" />
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find pharmacies worldwide - including local chains and international locations
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <PharmacySearchForm 
            onSearch={handleSearch}
            isSearching={searching}
            initialSearchTerm={searchTerm}
          />
          
          <PharmacyList 
            pharmacies={results}
            searchTerm={searchTerm}
            searchType={searchType}
            isLoading={searching}
            hasSearched={searched}
          />
        </div>
      </div>
    </div>
  );
};

export default PharmacyFinder;
