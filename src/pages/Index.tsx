import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AIChatInterface } from "@/components/AIChatInterface";
import { MedicationCardWrapper } from "@/components/MedicationCardWrapper";
import { SpecialistsList } from "@/components/SpecialistsList";
import { Button } from "@/components/ui/button";
import { X, Clipboard, Map, Activity, Globe, FileText, Settings, Search, LogIn } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { useSearchHistory } from "@/contexts/SearchHistoryContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { groupMedicationsByType, MatchedMedication } from "@/utils/medicationMatcher";
import { RecommendationSystem } from "@/components/RecommendationSystem";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { SponsoredContent } from "@/components/SponsoredContent";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [searchResults, setSearchResults] = useState<Array<{
    name: string;
    details: string;
    price: string;
    type?: string;
    source?: string;
    phone?: string;
    address?: string;
  }>>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { isAdmin } = useAdmin();
  const { t } = useLanguage();
  const { tier, isSubscribed } = useSubscription();
  const navigate = useNavigate();

  const handleSearch = (query: string, results: Array<{
    name: string;
    details: string;
    price: string;
    type?: string;
    source?: string;
    phone?: string;
    address?: string;
  }>) => {
    setSearchResults(results);
    setSearchQuery(query);
    setSearchPerformed(query !== '');

    if (results.length > 0) {
      const resultTypes = new Set(results.map(r => r.type?.toLowerCase()));
      if (resultTypes.size === 1) {
        const type = Array.from(resultTypes)[0];
        if (type?.includes('med spa')) {
          setActiveTab('medspas');
        } else if (type?.includes('specialist')) {
          setActiveTab('specialists');
        } else if (type?.includes('tablet') || type?.includes('capsule') || type?.includes('injection')) {
          setActiveTab('medications');
        } else if (type?.includes('pharmacy')) {
          setActiveTab('pharmacies');
        }
      }
    }
  };

  const removeResult = (index: number) => {
    setSearchResults(prev => prev.filter((_, i) => i !== index));

    if (searchResults.length <= 1) {
      setSearchPerformed(false);
    }
  };

  const currentYear = new Date().getFullYear();

  const getResultId = (result: {
    name: string;
    details: string;
  }, index: number) => {
    return `0-${index}`;
  };

  const groupedResults = groupMedicationsByType(searchResults as MatchedMedication[]);

  const displayOrder = ["Injection", "Injectable Gel", "Capsule", "Tablet", "Spray", "Inhaler", "Ointment", "Cream", "Gel", "Liquid", "Powder", "Patch", "Other"];

  const medSpaResults = searchResults.filter(r =>
    r.type?.toLowerCase().includes('spa') ||
    r.type?.toLowerCase().includes('aesthetic') ||
    r.type?.toLowerCase().includes('beauty') ||
    r.name.toLowerCase().includes('spa')
  );

  const specialistResults = searchResults.filter(r =>
    r.type?.toLowerCase().includes('specialist') ||
    r.type?.toLowerCase().includes('doctor') ||
    r.type?.toLowerCase().includes('physician')
  );

  const pharmacyResults = searchResults.filter(r =>
    r.type?.toLowerCase().includes('pharmacy') &&
    !r.type?.toLowerCase().includes('spa')
  );

  const medicationResults = searchResults.filter(r =>
    !r.type?.toLowerCase().includes('spa') &&
    !r.type?.toLowerCase().includes('specialist') &&
    !r.type?.toLowerCase().includes('pharmacy') &&
    r.type !== undefined
  );

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-secondary to-white flex flex-col">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary">MedMed.AI</span>
            </Link>

            <div className="flex items-center space-x-3">
              <div className="hidden sm:block h-6 w-px bg-gray-200 mx-1"></div>

              <Button variant="outline" size="sm" asChild>
                <Link to="/signin">
                  <LogIn className="h-4 w-4 mr-1.5" />
                  {t("nav.signin", "Sign In")}
                </Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link to="/signup">
                  {t("nav.signup", "Get started")}
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="container px-4 py-8 mx-auto flex-grow">
          <div className="flex justify-end mb-4">
            {isSubscribed ? (
              <Button
                size="sm"
                variant="outline"
                className="bg-primary/10 text-primary"
                onClick={() => navigate('/user-portal')}
              >
                <span className="flex items-center gap-1.5">
                  Premium {tier.charAt(0).toUpperCase() + tier.slice(1)} Active
                </span>
              </Button>
            ) : null}
          </div>

          <div className="text-center mb-12">
            <h1 className="font-bold text-primary mb-4 flex items-center justify-center text-7xl">
              {t("app.name", "MedMed.AI")}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("app.tagline", "Your healthcare intelligence platform. Find medications, symptoms, and nearby healthcare services worldwide.")}
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-8">
            <AIChatInterface onSearch={handleSearch} />
          </div>

          <div className="max-w-4xl mx-auto mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link to="/symptom-checker">
                <Button variant="outline" className="w-full h-20 flex-col space-y-1 bg-card/90 backdrop-blur-md hover:bg-card/100 hover:shadow-sm transition-all">
                  <Clipboard className="h-4 w-4 text-primary" />
                  <span className="text-center w-full truncate">{t("menu.symptom_checker", "Symptom Checker")}</span>
                </Button>
              </Link>
              <Link to="/pharmacy-finder">
                <Button variant="outline" className="w-full h-20 flex-col space-y-1 bg-card/90 backdrop-blur-md hover:bg-card/100 hover:shadow-sm transition-all">
                  <Map className="h-4 w-4 text-primary" />
                  <span className="text-center w-full truncate">{t("menu.pharmacy_finder", "Pharmacy & Med Spa Finder")}</span>
                </Button>
              </Link>
              <Link to="/interaction-checker">
                <Button variant="outline" className="w-full h-20 flex-col space-y-1 bg-card/90 backdrop-blur-md hover:bg-card/100 hover:shadow-sm transition-all">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-center w-full truncate">{t("menu.interaction_checker", "Interaction Checker")}</span>
                </Button>
              </Link>
            </div>
          </div>

          {searchPerformed && (
            <div className="max-w-4xl mx-auto">
              {searchResults.length > 0 && (
                <div className="mb-12">
                  <Card className="mb-6 overflow-hidden">
                    <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-primary" />
                        <h2 className="text-xl font-semibold">Search Results for "{searchQuery}"</h2>
                      </div>
                      <Badge variant="outline" className="flex items-center text-xs">
                        <Globe className="h-3 w-3 mr-1" />
                        {searchResults.length} worldwide results
                      </Badge>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="w-full border-b rounded-none justify-start px-4">
                        <TabsTrigger value="all">All Results</TabsTrigger>
                        {medicationResults.length > 0 && (
                          <TabsTrigger value="medications">Medications</TabsTrigger>
                        )}
                        {medSpaResults.length > 0 && (
                          <TabsTrigger value="medspas">Med Spas</TabsTrigger>
                        )}
                        {specialistResults.length > 0 && (
                          <TabsTrigger value="specialists">Specialists</TabsTrigger>
                        )}
                        {pharmacyResults.length > 0 && (
                          <TabsTrigger value="pharmacies">Pharmacies</TabsTrigger>
                        )}
                      </TabsList>

                      <TabsContent value="all" className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {searchResults.map((result, index) => (
                            <div key={index} className="relative">
                              <Link to={`/medication/${getResultId(result, index)}`}>
                                <MedicationCardWrapper
                                  name={result.name}
                                  details={result.details}
                                  price={isAdmin ? result.price : t("medication.price", "Login to see pricing")}
                                  type={result.type}
                                  source={result.source}
                                  phone={result.phone}
                                  address={result.address}
                                />
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute -right-2 -top-2 z-10 bg-background/80 hover:bg-background"
                                onClick={() => removeResult(index)}
                                aria-label="Remove result"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      {medicationResults.length > 0 && (
                        <TabsContent value="medications" className="p-4">
                          {displayOrder.map(type => {
                            const typeResults = medicationResults.filter(r => r.type === type);
                            if (typeResults.length === 0) return null;

                            return (
                              <div key={type} className="mb-8">
                                <h3 className="text-xl font-medium text-primary mb-4">{type}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {typeResults.map((result, index) => {
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
                                          onClick={() => removeResult(overallIndex)}
                                          aria-label="Remove result"
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </TabsContent>
                      )}

                      {medSpaResults.length > 0 && (
                        <TabsContent value="medspas" className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {medSpaResults.map((result, index) => {
                              const overallIndex = searchResults.findIndex(r => r.name === result.name);
                              return (
                                <div key={`medspa-${index}`} className="relative">
                                  <Link to={`/pharmacy-finder?name=${encodeURIComponent(result.name)}`}>
                                    <MedicationCardWrapper
                                      name={result.name}
                                      details={result.details}
                                      price={result.price}
                                      type="Med Spa"
                                      source={result.source}
                                      phone={result.phone}
                                      address={result.address}
                                    />
                                  </Link>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute -right-2 -top-2 z-10 bg-background/80 hover:bg-background"
                                    onClick={() => removeResult(overallIndex)}
                                    aria-label="Remove result"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </TabsContent>
                      )}

                      {specialistResults.length > 0 && (
                        <TabsContent value="specialists" className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {specialistResults.map((result, index) => {
                              const overallIndex = searchResults.findIndex(r => r.name === result.name);
                              return (
                                <div key={`specialist-${index}`} className="relative">
                                  <MedicationCardWrapper
                                    name={result.name}
                                    details={result.details}
                                    price={result.price}
                                    type="Specialist"
                                    source={result.source}
                                    phone={result.phone}
                                    address={result.address}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute -right-2 -top-2 z-10 bg-background/80 hover:bg-background"
                                    onClick={() => removeResult(overallIndex)}
                                    aria-label="Remove result"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </TabsContent>
                      )}

                      {pharmacyResults.length > 0 && (
                        <TabsContent value="pharmacies" className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {pharmacyResults.map((result, index) => {
                              const overallIndex = searchResults.findIndex(r => r.name === result.name);
                              return (
                                <div key={`pharmacy-${index}`} className="relative">
                                  <Link to={`/pharmacy-finder?name=${encodeURIComponent(result.name)}`}>
                                    <MedicationCardWrapper
                                      name={result.name}
                                      details={result.details}
                                      price={result.price}
                                      type="Pharmacy"
                                      source={result.source}
                                      phone={result.phone}
                                      address={result.address}
                                    />
                                  </Link>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute -right-2 -top-2 z-10 bg-background/80 hover:bg-background"
                                    onClick={() => removeResult(overallIndex)}
                                    aria-label="Remove result"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </TabsContent>
                      )}
                    </Tabs>
                  </Card>
                </div>
              )}

              <SpecialistsList searchQuery={searchResults.length > 0 ? searchQuery : ''} />

              {!searchResults.length && !document.querySelector('[data-specialist-found="true"]') && (
                <div className="text-center py-8 mb-8 bg-card/50 rounded-lg">
                  <p className="text-gray-500">
                    {t("search.no_results", "No results found matching your search. Try different keywords.")}
                  </p>
                </div>
              )}
            </div>
          )}

          {!searchPerformed && (
            <div className="max-w-4xl mx-auto grid grid-cols-1 gap-8 mb-12">
              <div>
                {!isSubscribed && <SponsoredContent />}
              </div>
            </div>
          )}
        </div>

        <footer className="w-full bg-white border-t border-gray-100">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-500 text-sm">
                <p>© {currentYear} MedMed.AI. {t("app.footer.rights", "All rights reserved.")}</p>
              </div>

              <div className="flex items-center gap-6 mt-4 md:mt-0">
                <Link to="/sponsor-portal" className="text-gray-500 hover:text-primary text-sm transition-colors">
                  {t("footer.sponsors", "Sponsors")}
                </Link>
                <Link to="/privacy" className="text-gray-500 hover:text-primary text-sm transition-colors">
                  {t("footer.privacy", "Privacy")}
                </Link>
                <Link to="/terms" className="text-gray-500 hover:text-primary text-sm transition-colors">
                  {t("footer.terms", "Terms")}
                </Link>
                <Link to="/settings" className="text-gray-500 hover:text-primary text-sm flex items-center gap-1.5 transition-colors">
                  <Settings className="h-3.5 w-3.5" />
                  {t("footer.settings", "Settings")}
                </Link>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center md:text-left">
              Results vary. No specific health outcomes are guaranteed. MedMed.AI provides information only — not medical advice. Always consult a qualified healthcare professional.
            </p>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
};

export default Index;
