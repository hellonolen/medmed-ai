
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Pharmacy } from "@/data/pharmacies";
import { searchPharmaciesByZip, searchPharmaciesByCity } from "@/utils/pharmacySearch";
import { PharmacySearchForm } from "@/components/pharmacy/PharmacySearchForm";
import { PharmacyList } from "@/components/pharmacy/PharmacyList";

const PharmacyFinder = () => {
  const [results, setResults] = useState<Pharmacy[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<'zip' | 'city'>('zip');
  
  const handleSearch = (term: string, type: 'zip' | 'city') => {
    setSearching(true);
    setSearched(true);
    setSearchTerm(term);
    setSearchType(type);
    
    // Simulate API call delay
    setTimeout(() => {
      let filteredPharmacies: Pharmacy[] = [];
      
      if (type === 'zip') {
        filteredPharmacies = searchPharmaciesByZip(term);
      } else {
        filteredPharmacies = searchPharmaciesByCity(term);
      }
      
      setResults(filteredPharmacies);
      setSearching(false);
      
      if (filteredPharmacies.length === 0) {
        toast.info(`No pharmacies found for this ${type === 'zip' ? 'ZIP code' : 'city'}`);
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
          <h1 className="text-4xl font-bold text-primary mb-4">Pharmacy Finder</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find pharmacies nationwide - including CVS, Walgreens, and local pharmacies
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
