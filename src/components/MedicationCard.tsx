
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Database, MapPin, Pill } from "lucide-react";
import { specialistsInfo } from "@/data/specialists";

interface MedicationCardProps {
  name: string;
  details: string;
  price: string;
  type?: string;
  source?: string;
}

export const MedicationCard = ({ 
  name, 
  details, 
  price, 
  type = "Medication",
  source = "MedMed Database" 
}: MedicationCardProps) => {
  const [mainDetails, specialist] = details.split('\nRecommended Specialist: ');

  // Find the specialist location information if available
  const specialistInfo = specialist ? specialistsInfo[specialist] : null;
  const hasLocations = specialistInfo?.locations && specialistInfo.locations.length > 0;

  return (
    <Card className="backdrop-blur-md bg-card/90 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-primary">{name}</CardTitle>
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <Pill className="h-3 w-3" />
            {type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{mainDetails}</p>
        {specialist && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary">{specialist}</span>
            </div>
            
            {hasLocations && (
              <div className="flex flex-col gap-1 pl-6">
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>Available in:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(specialistInfo.locations.length > 2 ? 
                    specialistInfo.locations.slice(0, 2) : 
                    specialistInfo.locations
                  ).map(location => (
                    <Badge key={location} variant="outline" className="text-xs">
                      {location}
                    </Badge>
                  ))}
                  {specialistInfo.locations.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{specialistInfo.locations.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-sm font-medium">
            {price}
          </Badge>
          <Badge variant="outline" className="text-xs font-normal flex items-center gap-1">
            <Database className="h-3 w-3" />
            {source}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
