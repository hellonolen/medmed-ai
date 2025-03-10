
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

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
  "Physical Therapy",
  "Podiatry",
  "Pulmonology",
  "Rheumatology",
  "Weight Management"
];

export const SpecialistsList = ({ searchQuery }: SpecialistsListProps) => {
  const filteredSpecialists = specialists.filter(specialist => 
    specialist.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const displaySpecialists = filteredSpecialists.length > 0 ? filteredSpecialists : [];

  return (
    <div className="space-y-4 animate-fadeIn">
      {displaySpecialists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displaySpecialists.map((specialist) => (
            <Card key={specialist} className="backdrop-blur-md bg-card/80 hover:bg-card/90 transition-all duration-300 cursor-pointer hover:scale-105">
              <CardHeader>
                <CardTitle className="text-base font-medium text-primary">{specialist}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No specialists found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
};
