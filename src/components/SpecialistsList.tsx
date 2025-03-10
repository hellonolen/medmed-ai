
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { findMatchingSymptoms, medicalConditions } from "@/data/symptoms";
import { specialistsInfo } from "@/data/specialists";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAdmin } from "@/contexts/AdminContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Filter, Stethoscope } from "lucide-react";
import { toast } from "sonner";

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

export const SpecialistsList = ({ searchQuery }: SpecialistsListProps) => {
  const { isAdmin } = useAdmin();
  const [locationFilter, setLocationFilter] = useState("");
  const [showLocationFilter, setShowLocationFilter] = useState(false);
  const [allSpecialists, setAllSpecialists] = useState<string[]>([]);
  
  useEffect(() => {
    if (!searchQuery) {
      setAllSpecialists([]);
      return;
    }
    
    // Get specialists from symptom mappings first
    const matchingSymptoms = findMatchingSymptoms(searchQuery);
    const specialistsFromSymptoms = new Set(
      matchingSymptoms.flatMap(symptom => symptom.specialists)
    );
    
    // Get specialists directly from medical conditions
    const conditionSpecialists = new Set<string>();
    medicalConditions.forEach(condition => {
      // Check if condition name matches
      const conditionMatches = condition.conditions.some(c => 
        c.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      // Check if medication matches
      const medicationMatches = condition.medications.some(m => 
        m.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (conditionMatches || medicationMatches) {
        condition.specialists.forEach(s => conditionSpecialists.add(s));
      }
    });
    
    // Also filter specialists by direct name match
    const directMatchedSpecialists = specialists.filter(specialist => 
      specialist.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // If no specialists found through exact matches, consider it a general search
    const foundSpecialists = [
      ...directMatchedSpecialists,
      ...Array.from(conditionSpecialists).filter(spec => !directMatchedSpecialists.includes(spec)),
      ...Array.from(specialistsFromSymptoms).filter(spec => 
        !directMatchedSpecialists.includes(spec) && !conditionSpecialists.has(spec)
      )
    ];
    
    // If no specialists found and it's a non-empty search, show some default specialists
    const specialistsToDisplay = foundSpecialists.length > 0 
      ? foundSpecialists 
      : searchQuery.trim() !== "" ? specialists.slice(0, 6) : [];
    
    setAllSpecialists(specialistsToDisplay);
    
    // If we're showing default specialists because none matched, notify the user
    if (searchQuery.trim() !== "" && foundSpecialists.length === 0 && specialistsToDisplay.length > 0) {
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
  
  // Limit to 6 specialists maximum
  const limitedSpecialists = filteredByLocation.slice(0, 6);
  
  if (allSpecialists.length === 0) {
    return null;
  }
  
  // Get list of all unique locations from filtered specialists
  const allLocations = new Set<string>();
  filteredByLocation.forEach(specialist => {
    const locations = specialistsInfo[specialist]?.locations || [];
    locations.forEach(location => allLocations.add(location));
  });
  
  const sortedLocations = Array.from(allLocations).sort();
  
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="mb-2 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Specialist Results</h2>
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
      
      {limitedSpecialists.length === 0 ? (
        <div className="p-6 text-center bg-card/90 backdrop-blur-sm rounded-lg border border-border">
          <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium">No specialists found</h3>
          <p className="text-sm text-gray-500 mt-1">
            {locationFilter ? 
              `No specialists matching "${searchQuery}" available in "${locationFilter}".` : 
              `No specialists matching "${searchQuery}" found.`}
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
      ) : (
        <>
          {limitedSpecialists.length < filteredByLocation.length && (
            <p className="text-sm text-gray-500">
              Showing top {limitedSpecialists.length} of {filteredByLocation.length} specialists
              {locationFilter && ` in "${locationFilter}"`}
            </p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {limitedSpecialists.map((specialist) => {
              const specialistInfo = specialistsInfo[specialist] || { 
                name: specialist, 
                description: "Healthcare specialist focused on specific medical conditions and treatments."
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
                      {specialistInfo.locations && (
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
        </>
      )}
    </div>
  );
};
