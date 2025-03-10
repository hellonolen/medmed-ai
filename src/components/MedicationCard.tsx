
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MedicationCardProps {
  name: string;
  details: string;
  price: string;
}

export const MedicationCard = ({ name, details, price }: MedicationCardProps) => {
  return (
    <Card className="backdrop-blur-md bg-card/90 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary">{name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{details}</p>
        <Badge variant="secondary" className="text-sm font-medium">
          {price}
        </Badge>
      </CardContent>
    </Card>
  );
};
