
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Database, MapPin, Pill, Globe, Droplets, Notebook, Activity, Thermometer, Syringe, Tablets } from "lucide-react";
import { specialistsInfo } from "@/data/specialists";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();
  const [mainDetails, specialist] = details.split('\nRecommended Specialist: ');

  // Find the specialist location information if available
  const specialistInfo = specialist ? specialistsInfo[specialist] : null;
  const hasLocations = specialistInfo?.locations && specialistInfo.locations.length > 0;
  const hasTopTreatmentLocations = specialistInfo?.topTreatmentLocations && specialistInfo.topTreatmentLocations.length > 0;

  // Get appropriate icon based on medication type
  const getMedicationIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    
    if (lowerType.includes('tablet') || lowerType.includes('pill')) return <Pill className="h-3 w-3" />;
    if (lowerType.includes('syrup') || lowerType.includes('liquid')) return <Droplets className="h-3 w-3" />;
    if (lowerType.includes('cream') || lowerType.includes('ointment') || lowerType.includes('gel')) return <Droplets className="h-3 w-3" />;
    if (lowerType.includes('patch')) return <Notebook className="h-3 w-3" />;
    if (lowerType.includes('drop')) return <Droplets className="h-3 w-3" />;
    if (lowerType.includes('suppository')) return <Pill className="h-3 w-3" />;
    if (lowerType.includes('inhaler') || lowerType.includes('nebulizer')) return <Activity className="h-3 w-3" />;
    if (lowerType.includes('device')) return <Activity className="h-3 w-3" />;
    if (lowerType.includes('diagnostic') || lowerType.includes('thermometer')) return <Thermometer className="h-3 w-3" />;
    if (lowerType.includes('vaccine') || lowerType.includes('injection')) return <Syringe className="h-3 w-3" />;
    if (lowerType.includes('capsule')) return <Tablets className="h-3 w-3" />; // Changed from Capsule to Tablets
    
    return <Pill className="h-3 w-3" />; // Default icon
  };

  return (
    <Card className="backdrop-blur-md bg-card/90 border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-primary truncate pr-2">{name}</CardTitle>
          <Badge variant="outline" className="text-xs flex items-center gap-1 whitespace-nowrap flex-shrink-0">
            {getMedicationIcon(type)}
            {type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-3 overflow-hidden">{mainDetails}</p>
        {specialist && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm text-primary truncate">{specialist}</span>
            </div>
            
            {hasLocations && (
              <div className="flex flex-col gap-1 pl-6">
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="whitespace-nowrap">{t("medication.available", "Available in:")} </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(specialistInfo.locations.length > 2 ? 
                    specialistInfo.locations.slice(0, 2) : 
                    specialistInfo.locations
                  ).map(location => (
                    <Badge key={location} variant="outline" className="text-xs max-w-full">
                      <span className="truncate">{location}</span>
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
            
            {hasTopTreatmentLocations && (
              <div className="flex flex-col gap-1 pl-6 mt-2">
                <div className="flex items-center text-xs text-gray-500">
                  <Globe className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{t("medication.best_places", "Best places for treatment:")}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {specialistInfo.topTreatmentLocations.slice(0, 2).map((location, index) => (
                    <Badge key={index} variant="secondary" className="text-xs max-w-full">
                      <span className="truncate">{location.city}, {location.country}</span>
                    </Badge>
                  ))}
                  {specialistInfo.topTreatmentLocations.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{specialistInfo.topTreatmentLocations.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-sm font-medium truncate max-w-full">
            {price}
          </Badge>
          <Badge variant="outline" className="text-xs font-normal flex items-center gap-1 truncate max-w-full">
            <Database className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{t("medication.source", "Source:")}: {source}</span>
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
