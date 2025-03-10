
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const PharmacyMap = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFindPharmacies = () => {
    setLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // For now just show a toast - in a future update we'll integrate with a maps API
          toast({
            title: "Location Found",
            description: "This feature will show nearby pharmacies in a future update.",
          });
          setLoading(false);
        },
        () => {
          toast({
            title: "Location Access Denied",
            description: "Please enable location access to find nearby pharmacies.",
            variant: "destructive",
          });
          setLoading(false);
        }
      );
    } else {
      toast({
        title: "Geolocation Unavailable",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-4 bg-card/80 rounded-lg shadow-md">
      <Button 
        onClick={handleFindPharmacies} 
        className="w-full flex items-center justify-center gap-2"
        disabled={loading}
      >
        <MapPin className="h-4 w-4" />
        Find Nearby Pharmacies
      </Button>
    </div>
  );
};
