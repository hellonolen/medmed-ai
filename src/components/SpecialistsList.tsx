
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { findMatchingSymptoms, medicalConditions } from "@/data/symptoms";
import { specialistsInfo } from "@/data/specialists";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAdmin } from "@/contexts/AdminContext";

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
  
  // Combine all sources, with priority: direct matches, condition matches, symptom matches
  const allSpecialists = [
    ...directMatchedSpecialists,
    ...Array.from(conditionSpecialists).filter(spec => !directMatchedSpecialists.includes(spec)),
    ...Array.from(specialistsFromSymptoms).filter(spec => 
      !directMatchedSpecialists.includes(spec) && !conditionSpecialists.has(spec)
    )
  ];
  
  // Limit to 3 specialists maximum
  const limitedSpecialists = allSpecialists.slice(0, 3);
  
  if (limitedSpecialists.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="mb-2">
        <h2 className="text-2xl font-semibold text-gray-800">Specialist Results</h2>
        {limitedSpecialists.length < allSpecialists.length && (
          <p className="text-sm text-gray-500">
            Showing top {limitedSpecialists.length} of {allSpecialists.length} specialists
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {limitedSpecialists.map((specialist) => {
          const specialistInfo = specialistsInfo[specialist] || { 
            name: specialist, 
            description: "Healthcare specialist focused on specific medical conditions and treatments."
          };
          
          return (
            <Tooltip key={specialist}>
              <TooltipTrigger asChild>
                <Card 
                  className="backdrop-blur-md bg-card/80 hover:bg-card/90 transition-all duration-300 cursor-pointer hover:scale-105"
                  data-specialist-found="true"
                >
                  <CardHeader>
                    <CardTitle className="text-base font-medium text-primary">{specialist}</CardTitle>
                  </CardHeader>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{specialistInfo.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};
