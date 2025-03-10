
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
      {specialists.map((specialist) => (
        <Card key={specialist} className="backdrop-blur-md bg-card/80 hover:bg-card/90 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base font-medium text-primary">{specialist}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};
