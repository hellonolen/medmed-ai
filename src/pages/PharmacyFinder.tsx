
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
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
  
  const handleSearch = (term: string, type: 'zip' | 'city' | 'smart') => {
    setSearching(true);
    setSearched(true);
    setSearchTerm(term);
    setSearchType(type);
    
    // Simulate API call delay
    setTimeout(() => {
      let filteredPharmacies: Pharmacy[] = [];
      
      console.log(`Searching by ${type}:`, term);
      
      // Use the appropriate search function based on the search type
      switch (type) {
        case 'zip':
          filteredPharmacies = searchPharmaciesByZip(term);
          break;
        case 'city':
          filteredPharmacies = searchPharmaciesByCity(term);
          break;
        case 'smart':
          filteredPharmacies = intelligentPharmacySearch(term);
          toast.success(`AI-enhanced search completed for "${term}"`);
          break;
      }
      
      console.log("Search results:", filteredPharmacies.length);
      setResults(filteredPharmacies);
      setSearching(false);
      
      if (filteredPharmacies.length === 0) {
        toast.info(`No pharmacies found for this search term. Try using the Smart Search for better results.`);
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
          <h1 className="text-4xl font-bold text-primary mb-4">Global Pharmacy Finder</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find pharmacies worldwide - including local chains and international locations
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <PharmacySearchForm 
            onSearch={handleSearch}
            isSearching={searching}
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
