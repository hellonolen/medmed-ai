import { useState } from "react";
import { Link } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { MedicationCardWrapper } from "@/components/MedicationCardWrapper";
import { SpecialistsList } from "@/components/SpecialistsList";
import { Button } from "@/components/ui/button";
import { X, Heart, Clipboard, Map, Activity, Globe, CreditCard } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { useSearchHistory } from "@/contexts/SearchHistoryContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { groupMedicationsByType, MatchedMedication } from "@/utils/medicationMatcher";
import { RecommendationSystem } from "@/components/RecommendationSystem";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { SponsoredContent } from "@/components/SponsoredContent";
import { AIKeySetup } from "@/components/AIKeySetup";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ name: string; details: string; price: string; type?: string; source?: string }>>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { isAdmin } = useAdmin();
  const { addSearchToHistory, searchHistory } = useSearchHistory();
  const { t, language } = useLanguage();
  const { tier, isSubscribed } = useSubscription();

  const handleSearch = (query: string, results: Array<{ name: string; details: string; price: string; type?: string; source?: string }>) => {
    setSearchQuery(query);
    setSearchResults(results);
    setSearchPerformed(query !== '');
    setIsSearching(false);
    
    // Track search in history if it's not an empty search
    if (query.trim()) {
      addSearchToHistory(query, results.length);
    }
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

  // Group medications by type for display
  const groupedResults = groupMedicationsByType(searchResults as MatchedMedication[]);
  
  // Define preferred display order for medication types
  const displayOrder = [
    "Injection",
    "Injectable Gel",
    "Capsule",
    "Tablet",
    "Spray",
    "Inhaler",
    "Ointment",
    "Cream",
    "Gel",
    "Liquid",
    "Powder",
    "Patch",
    "Other"
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-secondary to-white">
        <div className="container px-4 py-8 mx-auto">
          <div className="flex justify-between mb-4">
            <div>
              <AIKeySetup />
            </div>
            {isSubscribed && (
              <Button size="sm" variant="outline" className="bg-primary/10 text-primary" disabled>
                <span className="flex items-center gap-1.5">
                  Premium {tier.charAt(0).toUpperCase() + tier.slice(1)} Active
                </span>
              </Button>
            )}
          </div>
          
          <div className="text-center mb-12 animate-fadeIn">
            <h1 className="text-4xl font-bold text-primary mb-4 flex items-center justify-center">
              {t("app.name", "MedMed.AI")}
              <Globe className="ml-2 h-6 w-6 text-primary/70" />
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("app.tagline", "Search medications, find specialists, and get personalized recommendations.")}
            </p>
          </div>

          <div className="mb-8 max-w-2xl mx-auto">
            <SearchBar onSearch={handleSearch} />
          </div>
          
          <div className="mb-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <Link to="/symptom-checker">
                <Button variant="outline" className="w-full h-20 flex-col space-y-1 bg-card/90 backdrop-blur-md hover:bg-card">
                  <Clipboard className="h-4 w-4 text-primary" />
                  <span>{t("menu.symptom_checker", "Symptom Checker")}</span>
                </Button>
              </Link>
              <Link to="/pharmacy-finder">
                <Button variant="outline" className="w-full h-20 flex-col space-y-1 bg-card/90 backdrop-blur-md hover:bg-card">
                  <Map className="h-4 w-4 text-primary" />
                  <span>{t("menu.pharmacy_finder", "Global Pharmacy Finder")}</span>
                </Button>
              </Link>
              <Link to="/interaction-checker">
                <Button variant="outline" className="w-full h-20 flex-col space-y-1 bg-card/90 backdrop-blur-md hover:bg-card">
                  <Activity className="h-4 w-4 text-primary" />
                  <span>{t("menu.interaction_checker", "Interaction Checker")}</span>
                </Button>
              </Link>
              <Link to="/favorites">
                <Button variant="outline" className="w-full h-20 flex-col space-y-1 bg-card/90 backdrop-blur-md hover:bg-card">
                  <Heart className="h-4 w-4 text-primary" />
                  <span>{t("menu.favorites", "My Favorites")}</span>
                </Button>
              </Link>
              <Link to="/subscription">
                <Button variant="outline" className="w-full h-20 flex-col space-y-1 bg-card/90 backdrop-blur-md hover:bg-card">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <span>{t("menu.premium", "Premium Plans")}</span>
                </Button>
              </Link>
            </div>
          </div>

          {searchPerformed && (
            <div className="max-w-4xl mx-auto">
              {searchResults.length > 0 && (
                <div className="mb-12 animate-fadeIn">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">{t("search.results", "Global Medication Results")}</h2>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      <span className="text-sm text-gray-600">{t("search.worldwide", "Worldwide search")}</span>
                    </div>
                  </div>
                  
                  {displayOrder.map(type => 
                    groupedResults[type] && groupedResults[type].length > 0 && (
                      <div key={type} className="mb-8">
                        <h3 className="text-xl font-medium text-primary mb-4">{type}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {groupedResults[type].map((result, index) => {
                            const overallIndex = searchResults.findIndex(r => r.name === result.name);
                            
                            return (
                              <div key={`${type}-${index}`} className="relative">
                                <Link to={`/medication/${getResultId(result, overallIndex)}`}>
                                  <MedicationCardWrapper
                                    name={result.name}
                                    details={result.details}
                                    price={isAdmin ? result.price : t("medication.price", "Login to see pricing")}
                                    type={result.type}
                                    source={result.source}
                                  />
                                </Link>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="absolute -right-2 -top-2 z-10 bg-background/80 hover:bg-background"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    removeResult(overallIndex);
                                  }}
                                  aria-label="Remove result"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
              
              <SpecialistsList searchQuery={searchQuery} />
              
              {searchQuery && !searchResults.length && !document.querySelector('[data-specialist-found="true"]') && (
                <div className="text-center py-8 mb-8 bg-card/50 rounded-lg">
                  <p className="text-gray-500">{t("search.no_results", "No results found matching your search. Try different keywords.")}</p>
                </div>
              )}
            </div>
          )}
          
          {!searchPerformed && (
            <div className="max-w-4xl mx-auto grid grid-cols-1 gap-8 mb-12">
              <div>
                {!isSubscribed && (
                  <SponsoredContent />
                )}
              </div>
            </div>
          )}
          
          <footer className="mt-16 text-left text-gray-500 text-sm">
            <p>© 2025 MedMed.AI. {t("app.footer.rights", "All rights reserved.")}</p>
            <p className="mt-2">{t("app.footer.demo", "This is a demo application. Not for actual medical use.")}</p>
            <p className="mt-1">{t("app.footer.global", "Providing global healthcare information and resources")}</p>
          </footer>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Index;
