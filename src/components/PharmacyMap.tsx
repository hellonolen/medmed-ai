
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface PharmacyMapProps {
  center?: [number, number];
  zoom?: number;
}

export const PharmacyMap = ({ center, zoom }: PharmacyMapProps) => {
  const [loading, setLoading] = useState(false);

  const handleFindPharmacies = () => {
    setLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // For now just show a toast - in a future update we'll integrate with a maps API
          toast.success("Location Found", {
            description: "This feature will show nearby pharmacies in a future update.",
          });
          setLoading(false);
        },
        () => {
          toast.error("Location Access Denied", {
            description: "Please enable location access to find nearby pharmacies.",
          });
          setLoading(false);
        }
      );
    } else {
      toast.error("Geolocation Unavailable", {
        description: "Your browser doesn't support location services.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="p-4 bg-card/80 rounded-lg shadow-md text-center">
        <div className="mb-4 text-gray-600">Map integration coming soon</div>
        <Button 
          onClick={handleFindPharmacies} 
          className="flex items-center justify-center gap-2"
          disabled={loading}
        >
          <MapPin className="h-4 w-4" />
          Find Nearby Pharmacies
        </Button>
      </div>
    </div>
  );
};
