
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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

export const SpecialistsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  
  const filteredSpecialists = specialists.filter(specialist => 
    specialist.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Show only first 6 results unless "show all" is clicked or there's a search query
  const displaySpecialists = searchQuery 
    ? filteredSpecialists 
    : (showAll ? specialists : specialists.slice(0, 6));

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search for a specialist..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>
      
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
          <p className="text-gray-500">No specialists found matching "{searchQuery}"</p>
        </div>
      )}
      
      {!searchQuery && !showAll && specialists.length > 6 && (
        <div className="text-center mt-4">
          <button 
            onClick={() => setShowAll(true)}
            className="text-primary hover:text-primary/80 font-medium"
          >
            Show all {specialists.length} specialists
          </button>
        </div>
      )}
    </div>
  );
};
