
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

type SubscriptionTier = 'free' | 'premium' | 'business';

interface SubscriptionContextType {
  tier: SubscriptionTier;
  isSubscribed: boolean;
  features: {
    detailedMedicationInfo: boolean;
    internationalSearch: boolean;
    aiSupport: boolean;
    exclusiveContent: boolean;
    detailedReports: boolean;
    specialistContact: boolean;
  };
  toggleSubscription: (newTier?: SubscriptionTier) => void;
  isFeatureAvailable: (featureName: keyof SubscriptionContextType['features']) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [tier, setTier] = useState<SubscriptionTier>('free');
  
  // Define features available for each subscription tier
  const getTierFeatures = (subTier: SubscriptionTier) => {
    switch(subTier) {
      case 'free':
        return {
          detailedMedicationInfo: false,
          internationalSearch: true, // Keep the existing global search free
          aiSupport: true, // Basic AI support available for all users
          exclusiveContent: false,
          detailedReports: false,
          specialistContact: false,
        };
      case 'premium':
        return {
          detailedMedicationInfo: true,
          internationalSearch: true,
          aiSupport: true, // Enhanced AI support
          exclusiveContent: true,
          detailedReports: true,
          specialistContact: false,
        };
      case 'business':
        return {
          detailedMedicationInfo: true,
          internationalSearch: true,
          aiSupport: true, // Priority AI support
          exclusiveContent: true,
          detailedReports: true,
          specialistContact: true,
        };
      default:
        return {
          detailedMedicationInfo: false,
          internationalSearch: true,
          aiSupport: true,
          exclusiveContent: false,
          detailedReports: false,
          specialistContact: false,
        };
    }
  };
  
  const [features, setFeatures] = useState(getTierFeatures(tier));
  
  // Update features when tier changes
  useEffect(() => {
    setFeatures(getTierFeatures(tier));
  }, [tier]);
  
  const toggleSubscription = (newTier?: SubscriptionTier) => {
    if (newTier) {
      setTier(newTier);
      toast({
        title: "Subscription Updated",
        description: `You are now subscribed to the ${newTier.charAt(0).toUpperCase() + newTier.slice(1)} plan.`,
      });
    } else {
      const nextTier = tier === 'free' ? 'premium' : 'free';
      setTier(nextTier);
      toast({
        title: "Subscription Updated",
        description: nextTier === 'free' 
          ? "Your subscription has been canceled." 
          : "You are now a premium subscriber.",
      });
    }
  };
  
  const isFeatureAvailable = (featureName: keyof typeof features) => {
    return features[featureName];
  };
  
  return (
    <SubscriptionContext.Provider 
      value={{
        tier,
        isSubscribed: tier !== 'free',
        features,
        toggleSubscription,
        isFeatureAvailable
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
