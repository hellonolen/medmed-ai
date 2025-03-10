import { useState } from "react";
import { Link } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { MedicationCardWrapper } from "@/components/MedicationCardWrapper";
import { SpecialistsList } from "@/components/SpecialistsList";
import { Button } from "@/components/ui/button";
import { X, Heart, Clipboard, Map, Pill, Activity, ShieldCheck } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { TooltipProvider } from "@/components/ui/tooltip";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ name: string; details: string; price: string }>>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const { isAdmin, setIsAdmin } = useAdmin();

  const handleSearch = (query: string, results: Array<{ name: string; details: string; price: string }>) => {
    setSearchQuery(query);
    setSearchResults(results);
    setSearchPerformed(query !== '');
  };

  const removeResult = (index: number) => {
    setSearchResults(prev => prev.filter((_, i) => i !== index));
  };

  const currentYear = new Date().getFullYear();
  
  const getResultId = (result: { name: string; details: string; }, index: number) => {
    // In a real app, this would be more sophisticated
    // For this demo, we'll use the index in the search results
    return `0-${index}`;
  };

  const toggleAdmin = () => {
    setIsAdmin(!isAdmin);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-secondary to-white">
        <div className="container px-4 py-8 mx-auto">
          <div className="text-center mb-12 animate-fadeIn">
            <h1 className="text-4xl font-bold text-primary mb-4">MedMed.AI</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Search medications, find specialists, and get personalized healthcare recommendations
            </p>
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2" 
                onClick={toggleAdmin}
              >
                <ShieldCheck className="h-4 w-4" />
                {isAdmin ? "Admin Mode: ON" : "Admin Mode: OFF"}
              </Button>
            </div>
          </div>

          <div className="mb-8 max-w-2xl mx-auto">
            <SearchBar onSearch={handleSearch} />
          </div>
          
          <div className="mb-8 max-w-3xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/symptom-checker">
                <Button variant="outline" className="w-full h-16 flex-col space-y-1 bg-card/90 backdrop-blur-md hover:bg-card">
                  <Clipboard className="h-4 w-4 text-primary" />
                  <span>Symptom Checker</span>
                </Button>
              </Link>
              <Link to="/pharmacy-finder">
                <Button variant="outline" className="w-full h-16 flex-col space-y-1 bg-card/90 backdrop-blur-md hover:bg-card">
                  <Map className="h-4 w-4 text-primary" />
                  <span>Pharmacy Finder</span>
                </Button>
              </Link>
              <Link to="/interaction-checker">
                <Button variant="outline" className="w-full h-16 flex-col space-y-1 bg-card/90 backdrop-blur-md hover:bg-card">
                  <Activity className="h-4 w-4 text-primary" />
                  <span>Interaction Checker</span>
                </Button>
              </Link>
              <Link to="/favorites">
                <Button variant="outline" className="w-full h-16 flex-col space-y-1 bg-card/90 backdrop-blur-md hover:bg-card">
                  <Heart className="h-4 w-4 text-primary" />
                  <span>My Favorites</span>
                </Button>
              </Link>
            </div>
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
                      <Link to={`/medication/${getResultId(result, index)}`}>
                        <MedicationCardWrapper
                          name={result.name}
                          details={result.details}
                          price={result.price}
                        />
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute -right-2 -top-2 z-10 bg-background/80 hover:bg-background"
                        onClick={(e) => {
                          e.preventDefault();
                          removeResult(index);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
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
    </TooltipProvider>
  );
};

export default Index;
