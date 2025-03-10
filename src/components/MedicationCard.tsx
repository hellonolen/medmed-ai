
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MedicationCardProps {
  name: string;
  details: string;
  price: string;
}

export const MedicationCard = ({ name, details, price }: MedicationCardProps) => {
  return (
    <Card className="backdrop-blur-md bg-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-2">{details}</p>
        <p className="text-sm font-medium text-gray-800">{price}</p>
      </CardContent>
    </Card>
  );
};
