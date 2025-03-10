
import { SearchBar } from "@/components/SearchBar";
import { MedicationCard } from "@/components/MedicationCard";
import { SpecialistsList } from "@/components/SpecialistsList";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ name: string; details: string; price: string }>>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = (query: string, results: Array<{ name: string; details: string; price: string }>) => {
    setSearchQuery(query);
    setSearchResults(results);
    setSearchPerformed(true);
  };

  const removeResult = (index: number) => {
    setSearchResults(prev => prev.filter((_, i) => i !== index));
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white">
      <div className="container px-4 py-8 mx-auto">
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl font-bold text-primary mb-4">MedMed.AI</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Search medications, find specialists, and get personalized healthcare recommendations
          </p>
        </div>

        <div className="mb-12 max-w-2xl mx-auto">
          <SearchBar onSearch={handleSearch} />
        </div>

        {searchPerformed && (
          <div className="max-w-4xl mx-auto">
            {searchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 animate-fadeIn">
                <div className="md:col-span-2 mb-2">
                  <h2 className="text-2xl font-semibold text-gray-800">Medication Results</h2>
                </div>
                {searchResults.map((result, index) => (
                  <div key={index} className="relative">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute -right-2 -top-2 z-10 bg-background/80 hover:bg-background"
                      onClick={() => removeResult(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <MedicationCard
                      name={result.name}
                      details={result.details}
                      price={result.price}
                    />
                  </div>
                ))}
              </div>
            )}
            
            <SpecialistsList searchQuery={searchQuery} />
            
            {searchQuery && !searchResults.length && !document.querySelector('[data-specialist-found="true"]') && (
              <div className="text-center py-8 mb-8 bg-card/50 rounded-lg">
                <p className="text-gray-500">No results found matching your search. Try different keywords.</p>
              </div>
            )}
          </div>
        )}
        
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>© {currentYear} MedMed.AI. All rights reserved.</p>
          <p className="mt-2">This is a demo application. Not for actual medical use.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
