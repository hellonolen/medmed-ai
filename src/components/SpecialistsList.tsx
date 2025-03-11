import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { findMatchingSymptoms, medicalConditions } from "@/data/symptoms";
import { specialistsInfo } from "@/data/specialists";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAdmin } from "@/contexts/AdminContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Filter, Stethoscope, UserCog } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface SpecialistsListProps {
  searchQuery: string;
}

const specialists = [
  "Primary Care",
  "Adolescent Pediatrics",
  "Anorectal Care/Colorectal Surgery",
  "Audiology",
  "Behavioral Health",
  "Cardiology",
  "Dermatology",
  "ENT & Allergy",
  "Endocrinology",
  "Gastroenterology",
  "Gynecology",
  "Hematology",
  "Infectious Disease",
  "Nephrology",
  "Neurology",
  "Ophthalmology",
  "Physical Therapy",
  "Podiatry",
  "Pulmonology",
  "Rheumatology",
  "Weight Management",
  "Oncology",
  "Psychiatry",
  "Orthopedics",
  "Urology",
  "Immunology",
  "Pediatrics"
];

// Healthcare professionals data (would come from a database in a real application)
interface HealthcareProfessional {
  id: string;
  name: string;
  type: "doctor" | "nurse";
  specialization: string;
  location: string;
  language?: string[];
}

const healthcareProfessionals: HealthcareProfessional[] = [
  { id: "d1", name: "Dr. Sarah Johnson", type: "doctor", specialization: "Cardiology", location: "New York, USA", language: ["English", "Spanish"] },
  { id: "d2", name: "Dr. Michael Chen", type: "doctor", specialization: "Pediatrics", location: "Toronto, Canada", language: ["English", "Chinese"] },
  { id: "d3", name: "Dr. Emma Richards", type: "doctor", specialization: "Neurology", location: "London, UK", language: ["English"] },
  { id: "d4", name: "Dr. Raj Patel", type: "doctor", specialization: "Oncology", location: "Mumbai, India", language: ["Hindi", "English"] },
  { id: "d5", name: "Dr. Carlos Mendez", type: "doctor", specialization: "Dermatology", location: "Madrid, Spain", language: ["Spanish", "English"] },
  { id: "n1", name: "Nurse Olivia Smith", type: "nurse", specialization: "Pediatric Care", location: "Boston, USA", language: ["English"] },
  { id: "n2", name: "Nurse Thomas Weber", type: "nurse", specialization: "Emergency Care", location: "Berlin, Germany", language: ["German", "English"] },
  { id: "n3", name: "Nurse Yuki Tanaka", type: "nurse", specialization: "Geriatric Care", location: "Tokyo, Japan", language: ["Japanese", "English"] },
  { id: "n4", name: "Nurse Maria Gonzalez", type: "nurse", specialization: "Maternal Health", location: "Mexico City, Mexico", language: ["Spanish", "English"] },
  { id: "n5", name: "Nurse James Wilson", type: "nurse", specialization: "Critical Care", location: "Sydney, Australia", language: ["English"] }
];

export const SpecialistsList = ({ searchQuery }: SpecialistsListProps) => {
  const { isAdmin } = useAdmin();
  const { t, language } = useLanguage();
  const [locationFilter, setLocationFilter] = useState("");
  const [showLocationFilter, setShowLocationFilter] = useState(false);
  const [allSpecialists, setAllSpecialists] = useState<string[]>([]);
  const [matchedProfessionals, setMatchedProfessionals] = useState<HealthcareProfessional[]>([]);
  
  // Process the search query whenever it changes
  useEffect(() => {
    if (!searchQuery) {
      setAllSpecialists([]);
      setMatchedProfessionals([]);
      return;
    }
    
    console.log("Processing specialist search for query:", searchQuery);
    
    // Normalize the query - remove language code if present
    let queryLower = searchQuery.toLowerCase().trim();
    const langCodeMatch = queryLower.match(/\s*\([a-z]{2}\)$/);
    if (langCodeMatch) {
      queryLower = queryLower.substring(0, queryLower.length - langCodeMatch[0].length).trim();
    }
    
    console.log("Normalized specialist search query:", queryLower);
    
    // First, search for specialists based on symptoms and conditions
    // Get specialists from symptom mappings
    const matchingSymptoms = findMatchingSymptoms(queryLower);
    const specialistsFromSymptoms = new Set(
      matchingSymptoms.flatMap(symptom => symptom.specialists)
    );
    
    // Get specialists directly from medical conditions
    const conditionSpecialists = new Set<string>();
    medicalConditions.forEach(condition => {
      // Check if condition name matches
      const conditionMatches = condition.conditions.some(c => 
        c.toLowerCase().includes(queryLower)
      );
      
      // Check if medication matches
      const medicationMatches = condition.medications.some(m => 
        m.toLowerCase().includes(queryLower)
      );
      
      if (conditionMatches || medicationMatches) {
        condition.specialists.forEach(s => conditionSpecialists.add(s));
      }
    });
    
    // Also filter specialists by direct name match
    const directMatchedSpecialists = specialists.filter(specialist => 
      specialist.toLowerCase().includes(queryLower)
    );
    
    // If no specialists found through exact matches, consider it a general search
    const foundSpecialists = [
      ...directMatchedSpecialists,
      ...Array.from(conditionSpecialists).filter(spec => !directMatchedSpecialists.includes(spec)),
      ...Array.from(specialistsFromSymptoms).filter(spec => 
        !directMatchedSpecialists.includes(spec) && !conditionSpecialists.has(spec)
      )
    ];
    
    // Check for ZIP code patterns in the query (for location-based filtering)
    const zipMatch = queryLower.match(/\b\d{5}\b/);
    
    // If no specialists found and it's a non-empty search, show some default specialists
    const specialistsToDisplay = foundSpecialists.length > 0 
      ? foundSpecialists 
      : queryLower.trim() !== "" ? specialists.slice(0, 6) : [];
    
    console.log(`Found ${specialistsToDisplay.length} matching specialists`);
    setAllSpecialists(specialistsToDisplay);
    
    // Next, search for healthcare professionals (doctors and nurses)
    const isDoctorSearch = queryLower.includes("doctor") || queryLower.includes("dr") || queryLower.includes("physician");
    const isNurseSearch = queryLower.includes("nurse") || queryLower.includes("nursing");
    
    // Filter professionals based on the search query
    const professionals = healthcareProfessionals.filter(prof => {
      // Match by type (doctor/nurse)
      if ((isDoctorSearch && prof.type === "doctor") || (isNurseSearch && prof.type === "nurse")) {
        return true;
      }
      
      // Match by name
      if (prof.name.toLowerCase().includes(queryLower)) {
        return true;
      }
      
      // Match by specialization
      if (prof.specialization.toLowerCase().includes(queryLower)) {
        return true;
      }
      
      // Match by location
      if (prof.location.toLowerCase().includes(queryLower)) {
        return true;
      }
      
      // Match by language if available
      if (prof.language && prof.language.some(lang => lang.toLowerCase().includes(queryLower))) {
        return true;
      }
      
      // If there's a ZIP code in the query, match professionals from that area
      if (zipMatch && prof.location.includes(zipMatch[0])) {
        return true;
      }
      
      return false;
    });
    
    console.log(`Found ${professionals.length} matching healthcare professionals`);
    setMatchedProfessionals(professionals);
    
    // If we're showing default specialists because none matched, notify the user
    if (queryLower.trim() !== "" && foundSpecialists.length === 0 && specialistsToDisplay.length > 0 && professionals.length === 0) {
      toast.info("Showing available specialists. Try more specific symptoms or conditions for better matches.");
    }
  }, [searchQuery]);
  
  // Apply location filter if active
  const filteredByLocation = locationFilter.trim() === "" 
    ? allSpecialists 
    : allSpecialists.filter(specialist => {
        const info = specialistsInfo[specialist];
        // If specialist has locations and any location matches our filter
        return info?.locations?.some(location => 
          location.toLowerCase().includes(locationFilter.toLowerCase())
        );
      });
  
  // Filter professionals by location if needed
  const filteredProfessionals = locationFilter.trim() === ""
    ? matchedProfessionals
    : matchedProfessionals.filter(prof => 
        prof.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
  
  // Limit to 6 specialists maximum
  const limitedSpecialists = filteredByLocation.slice(0, 6);
  
  // Group healthcare professionals by type
  const doctors = filteredProfessionals.filter(prof => prof.type === "doctor");
  const nurses = filteredProfessionals.filter(prof => prof.type === "nurse");
  
  if (allSpecialists.length === 0 && matchedProfessionals.length === 0) {
    return null;
  }
  
  // Get list of all unique locations from filtered specialists and professionals
  const allLocations = new Set<string>();
  filteredByLocation.forEach(specialist => {
    const locations = specialistsInfo[specialist]?.locations || [];
    locations.forEach(location => allLocations.add(location));
  });
  
  filteredProfessionals.forEach(prof => {
    allLocations.add(prof.location);
  });
  
  const sortedLocations = Array.from(allLocations).sort();
  
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="mb-2 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">
          {t("search.healthcare_professionals", "Healthcare Professionals")}
        </h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowLocationFilter(!showLocationFilter)}
          className="flex items-center gap-1"
        >
          <Filter className="h-4 w-4" />
          <span>Filter</span>
        </Button>
      </div>
      
      {showLocationFilter && (
        <div className="bg-secondary/50 backdrop-blur-sm p-4 rounded-lg mb-4 animate-fadeIn">
          <h3 className="text-sm font-medium mb-2">Filter by Location</h3>
          <div className="flex gap-2">
            <Input
              placeholder="City, State (e.g. Boston, MA)"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="max-w-xs"
            />
            {locationFilter && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setLocationFilter("")}
                className="h-10 w-10"
              >
                ×
              </Button>
            )}
          </div>
          
          {sortedLocations.length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs text-gray-500 mb-1">Available Locations:</h4>
              <div className="flex flex-wrap gap-1">
                {sortedLocations.slice(0, 10).map(location => (
                  <Badge 
                    key={location} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => setLocationFilter(location)}
                  >
                    {location}
                  </Badge>
                ))}
                {sortedLocations.length > 10 && (
                  <Badge variant="outline">+{sortedLocations.length - 10} more</Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Healthcare Professionals (Doctors and Nurses) Section */}
      {(doctors.length > 0 || nurses.length > 0) && (
        <div className="mb-8">
          {/* Doctors Section */}
          {doctors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-medium text-primary mb-4">
                {t("search.doctors", "Doctors")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.map((doctor) => (
                  <Card 
                    key={doctor.id}
                    className="backdrop-blur-md bg-card/80 hover:bg-card/90 transition-all duration-300 cursor-pointer hover:scale-105"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <UserCog className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base font-medium text-primary">
                          {doctor.name}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="font-medium text-gray-600">{t("professional.specialization", "Specialization")}:</span>
                          <span>{doctor.specialization}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-medium text-gray-600">{t("professional.location", "Practice Location")}:</span>
                          <span>{doctor.location}</span>
                        </div>
                        {doctor.language && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {doctor.language.map(lang => (
                              <Badge key={lang} variant="outline" className="text-xs">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Nurses Section */}
          {nurses.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-medium text-primary mb-4">
                {t("search.nurses", "Nurses")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nurses.map((nurse) => (
                  <Card 
                    key={nurse.id}
                    className="backdrop-blur-md bg-card/80 hover:bg-card/90 transition-all duration-300 cursor-pointer hover:scale-105"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base font-medium text-primary">
                          {nurse.name}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="font-medium text-gray-600">{t("professional.specialization", "Specialization")}:</span>
                          <span>{nurse.specialization}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-medium text-gray-600">{t("professional.location", "Practice Location")}:</span>
                          <span>{nurse.location}</span>
                        </div>
                        {nurse.language && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {nurse.language.map(lang => (
                              <Badge key={lang} variant="outline" className="text-xs">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Medical Specialists Section - show this section regardless of doctor/nurse matches */}
      {limitedSpecialists.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-medium text-primary mb-4">Medical Specialists</h3>
          
          {limitedSpecialists.length < filteredByLocation.length && (
            <p className="text-sm text-gray-500 mb-4">
              Showing top {limitedSpecialists.length} of {filteredByLocation.length} specialists
              {locationFilter && ` in "${locationFilter}"`}
            </p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {limitedSpecialists.map((specialist) => {
              const specialistInfo = specialistsInfo[specialist] || { 
                name: specialist, 
                description: "Healthcare specialist focused on specific medical conditions and treatments.",
                locations: [] // Add empty locations array as fallback
              };
              
              return (
                <TooltipProvider key={specialist}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card 
                        className="backdrop-blur-md bg-card/80 hover:bg-card/90 transition-all duration-300 cursor-pointer hover:scale-105"
                        data-specialist-found="true"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4 text-primary" />
                            <CardTitle className="text-base font-medium text-primary">{specialist}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {specialistInfo.locations && specialistInfo.locations.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              <div className="flex items-center text-xs text-gray-500">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span>Available in:</span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {(specialistInfo.locations.length > 3 ? 
                                  specialistInfo.locations.slice(0, 3) : 
                                  specialistInfo.locations
                                ).map(location => (
                                  <Badge key={location} variant="outline" className="text-xs">
                                    {location}
                                  </Badge>
                                ))}
                                {specialistInfo.locations.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{specialistInfo.locations.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-4">
                      <h4 className="font-medium mb-1">{specialist}</h4>
                      <p className="text-sm">{specialistInfo.description}</p>
                      {specialistInfo.locations && specialistInfo.locations.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-border">
                          <h5 className="text-xs font-medium mb-1">Available Locations:</h5>
                          <div className="text-xs text-gray-500">
                            {specialistInfo.locations.join(', ')}
                          </div>
                        </div>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>
      )}
      
      {/* No Results Message */}
      {limitedSpecialists.length === 0 && doctors.length === 0 && nurses.length === 0 && (
        <div className="p-6 text-center bg-card/90 backdrop-blur-sm rounded-lg border border-border">
          <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium">No healthcare professionals found</h3>
          <p className="text-sm text-gray-500 mt-1">
            {locationFilter ? 
              `No results matching "${searchQuery}" available in "${locationFilter}".` : 
              `No results matching "${searchQuery}" found.`}
          </p>
          {locationFilter && (
            <Button 
              variant="link" 
              onClick={() => setLocationFilter("")} 
              className="mt-2"
            >
              Clear location filter
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
