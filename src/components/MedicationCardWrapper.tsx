
import { MedicationCard } from "@/components/MedicationCard";
import { useAdmin } from "@/contexts/AdminContext";

interface MedicationCardWrapperProps {
  name: string;
  details: string;
  price: string;
  source?: string;
}

export const MedicationCardWrapper = ({ name, details, price, source }: MedicationCardWrapperProps) => {
  const { isAdmin } = useAdmin();
  
  // Filter out price information for non-admin users
  const displayPrice = isAdmin ? price : "Login as admin to view price";
  
  return (
    <MedicationCard
      name={name}
      details={details}
      price={displayPrice}
      source={source}
    />
  );
};
