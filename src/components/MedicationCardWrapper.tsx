
import { MedicationCard } from "@/components/MedicationCard";
import { useAdmin } from "@/contexts/AdminContext";

interface MedicationCardWrapperProps {
  name: string;
  details: string;
  price: string;
  type?: string;
  source?: string;
}

export const MedicationCardWrapper = ({ name, details, price, type, source }: MedicationCardWrapperProps) => {
  const { isAdmin } = useAdmin();
  
  // Filter out price information for non-admin users
  const displayPrice = isAdmin ? price : "Login as admin to view price";
  
  return (
    <MedicationCard
      name={name}
      details={details}
      price={displayPrice}
      type={type}
      source={source}
    />
  );
};
