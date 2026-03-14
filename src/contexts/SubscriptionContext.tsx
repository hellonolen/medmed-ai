
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

const WORKER_URL =
  (import.meta as any).env?.VITE_WORKER_URL ||
  'https://medmed-agent.hellonolen.workers.dev';

const TIER_KEY = 'medmed_sub_tier';

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

function getTierFeatures(subTier: SubscriptionTier) {
  switch (subTier) {
    case 'premium':
      return {
        detailedMedicationInfo: true,
        internationalSearch: true,
        aiSupport: true,
        exclusiveContent: true,
        detailedReports: true,
        specialistContact: false,
      };
    case 'business':
      return {
        detailedMedicationInfo: true,
        internationalSearch: true,
        aiSupport: true,
        exclusiveContent: true,
        detailedReports: true,
        specialistContact: true,
      };
    default: // free
      return {
        detailedMedicationInfo: false,
        internationalSearch: true,
        aiSupport: true,
        exclusiveContent: false,
        detailedReports: false,
        specialistContact: false,
      };
  }
}

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();

  // Restore tier from localStorage so it survives page refresh
  const [tier, setTier] = useState<SubscriptionTier>(() => {
    const saved = localStorage.getItem(TIER_KEY);
    if (saved === 'premium' || saved === 'business') return saved;
    return 'free';
  });

  const [features, setFeatures] = useState(getTierFeatures(tier));

  // Update features when tier changes + persist to localStorage
  useEffect(() => {
    setFeatures(getTierFeatures(tier));
    localStorage.setItem(TIER_KEY, tier);
  }, [tier]);

  // Sync tier to Worker when authenticated user data is available
  useEffect(() => {
    const syncTierFromAuth = () => {
      try {
        const savedUser = localStorage.getItem('medmed_auth_user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          if (user.tier && user.tier !== tier) {
            setTier(user.tier as SubscriptionTier);
          }
        }
      } catch {
        // ignore
      }
    };
    syncTierFromAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSubscription = (newTier?: SubscriptionTier) => {
    const nextTier = newTier || (tier === 'free' ? 'premium' : 'free');
    setTier(nextTier);
    
    // Persist tier to Worker (fire-and-forget)
    try {
      const savedUser = localStorage.getItem('medmed_auth_user');
      const savedToken = localStorage.getItem('medmed_auth_token');
      if (savedUser && savedToken) {
        const user = JSON.parse(savedUser);
        fetch(`${WORKER_URL}/api/user/tier`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${savedToken}` },
          body: JSON.stringify({ userId: user.id, tier: nextTier }),
        }).then(() => {
          // Update cached user with new tier
          const updated = { ...user, tier: nextTier };
          localStorage.setItem('medmed_auth_user', JSON.stringify(updated));
        }).catch(() => {});
      }
    } catch {
      // ignore — local state already updated
    }

    toast({
      title: 'Subscription Updated',
      description: nextTier === 'free'
        ? 'Your subscription has been canceled.'
        : `You are now on the ${nextTier.charAt(0).toUpperCase() + nextTier.slice(1)} plan.`,
    });
  };

  const isFeatureAvailable = (featureName: keyof typeof features) => features[featureName];

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        isSubscribed: tier !== 'free',
        features,
        toggleSubscription,
        isFeatureAvailable,
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
