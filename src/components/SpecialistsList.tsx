
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { findMatchingSymptoms } from "@/data/symptoms";

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
  "Weight Management"
];

export const SpecialistsList = ({ searchQuery }: SpecialistsListProps) => {
  // Get specialists from symptom mappings first
  const matchingSymptoms = findMatchingSymptoms(searchQuery);
  const specialistsFromSymptoms = new Set(
    matchingSymptoms.flatMap(symptom => symptom.specialists)
  );
  
  // Also filter specialists by direct name match
  const directMatchedSpecialists = specialists.filter(specialist => 
    specialist.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Combine both lists, giving priority to symptom-matched specialists
  const allSpecialists = [
    ...Array.from(specialistsFromSymptoms),
    ...directMatchedSpecialists.filter(spec => !specialistsFromSymptoms.has(spec))
  ];
  
  if (allSpecialists.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="mb-2">
        <h2 className="text-2xl font-semibold text-gray-800">Specialist Results</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allSpecialists.map((specialist) => (
          <Card 
            key={specialist} 
            className="backdrop-blur-md bg-card/80 hover:bg-card/90 transition-all duration-300 cursor-pointer hover:scale-105"
            data-specialist-found="true"
          >
            <CardHeader>
              <CardTitle className="text-base font-medium text-primary">{specialist}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};
