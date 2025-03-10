
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stethoscope } from "lucide-react";

interface MedicationCardProps {
  name: string;
  details: string;
  price: string;
}

export const MedicationCard = ({ name, details, price }: MedicationCardProps) => {
  const [mainDetails, specialist] = details.split('\nRecommended Specialist: ');

  return (
    <Card className="backdrop-blur-md bg-card/90 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary">{name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{mainDetails}</p>
        {specialist && (
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary">{specialist}</span>
          </div>
        )}
        <Badge variant="secondary" className="text-sm font-medium">
          {price}
        </Badge>
      </CardContent>
    </Card>
  );
};
