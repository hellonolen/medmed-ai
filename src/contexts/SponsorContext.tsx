
import React, { createContext, useContext, useState, useEffect } from 'react';
import { PREMIUM_SLOTS, STANDARD_SLOTS } from '@/data/adPackages';
import { useToast } from '@/hooks/use-toast';

// Define the sponsor type
export interface Sponsor {
  id: string;
  name: string;
  email: string;
  companyName: string;
  package: 'Standard' | 'Premium';
  apiKey: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  isOnWaitlist: boolean;
  waitlistPosition?: number;
}

// Define the context type
interface SponsorContextType {
  currentSponsor: Sponsor | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
  activeSponsors: Sponsor[];
  availableSlots: { premium: number; standard: number };
}

// Create the context with a default value
const SponsorContext = createContext<SponsorContextType>({
  currentSponsor: null,
  isLoading: true,
  login: async () => false,
  logout: () => {},
  error: null,
  activeSponsors: [],
  availableSlots: { premium: PREMIUM_SLOTS, standard: STANDARD_SLOTS },
});

// Mock sponsors data (in a real app, this would come from a database)
const MOCK_SPONSORS: Sponsor[] = [
  {
    id: 'sponsor-1',
    name: 'John Smith',
    email: 'john@healthplus.com',
    companyName: 'HealthPlus Pharmacy',
    package: 'Premium',
    apiKey: 'sk_healthplus_12345',
    startDate: '2023-01-01',
    endDate: '2023-03-31',
    isActive: true,
    isOnWaitlist: false,
  },
  {
    id: 'sponsor-2',
    name: 'Sarah Johnson',
    email: 'sarah@meditech.com',
    companyName: 'MediCare Telehealth',
    package: 'Premium',
    apiKey: 'sk_medicare_67890',
    startDate: '2023-02-01',
    endDate: '2023-04-30',
    isActive: true,
    isOnWaitlist: false,
  },
  {
    id: 'sponsor-3',
    name: 'David Brown',
    email: 'david@welllife.com',
    companyName: 'WellLife Insurance',
    package: 'Premium',
    apiKey: 'sk_welllife_54321',
    startDate: '2023-03-01',
    endDate: '2023-05-31',
    isActive: true,
    isOnWaitlist: false,
  },
  {
    id: 'sponsor-4',
    name: 'Emily Davis',
    email: 'emily@nutrihealth.com',
    companyName: 'NutriHealth Supplements',
    package: 'Standard',
    apiKey: 'sk_nutrihealth_12345',
    startDate: '2023-01-15',
    endDate: '2023-04-15',
    isActive: true,
    isOnWaitlist: false,
  },
  {
    id: 'sponsor-5',
    name: 'Michael Wilson',
    email: 'michael@mindwell.com',
    companyName: 'MindWell Therapy',
    package: 'Standard',
    apiKey: 'sk_mindwell_67890',
    startDate: '2023-02-15',
    endDate: '2023-05-15',
    isActive: true,
    isOnWaitlist: false,
  },
  {
    id: 'sponsor-6',
    name: 'Jessica Taylor',
    email: 'jessica@fittrack.com',
    companyName: 'FitTrack Devices',
    package: 'Standard',
    apiKey: 'sk_fittrack_54321',
    startDate: '2023-03-15',
    endDate: '2023-06-15',
    isActive: true,
    isOnWaitlist: false,
  },
];

export const SponsorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSponsor, setCurrentSponsor] = useState<Sponsor | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sponsors, setSponsors] = useState<Sponsor[]>(MOCK_SPONSORS);
  const { toast } = useToast();

  // Get active sponsors by package type
  const activeSponsors = sponsors.filter(s => s.isActive);

  // Calculate available slots
  const activePremiumCount = activeSponsors.filter(s => s.package === 'Premium').length;
  const activeStandardCount = activeSponsors.filter(s => s.package === 'Standard').length;
  
  const availableSlots = {
    premium: PREMIUM_SLOTS - activePremiumCount,
    standard: STANDARD_SLOTS - activeStandardCount
  };

  // Check for expired sponsors daily
  useEffect(() => {
    const checkExpirations = () => {
      const today = new Date();
      const updatedSponsors = [...sponsors];
      let sponsorsUpdated = false;

      // Check for expired sponsors
      updatedSponsors.forEach(sponsor => {
        if (sponsor.isActive && sponsor.endDate) {
          const endDate = new Date(sponsor.endDate);
          if (endDate < today) {
            sponsor.isActive = false;
            sponsorsUpdated = true;
            
            // Send notification email (in a real app)
            console.log(`Sponsor ${sponsor.companyName} subscription has ended`);
          }
        }
      });

      if (sponsorsUpdated) {
        setSponsors(updatedSponsors);
      }
    };

    // Initial check
    checkExpirations();
    
    // Set up daily check
    const intervalId = setInterval(checkExpirations, 86400000); // 24 hours
    
    return () => clearInterval(intervalId);
  }, [sponsors]);

  // Check for saved sponsor session on load
  useEffect(() => {
    const savedSponsorId = localStorage.getItem('sponsorId');
    
    if (savedSponsorId) {
      const sponsor = sponsors.find(s => s.id === savedSponsorId);
      if (sponsor) {
        setCurrentSponsor(sponsor);
      } else {
        localStorage.removeItem('sponsorId');
      }
    }
    
    setIsLoading(false);
  }, [sponsors]);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    
    // In a real app, this would be an API call to verify credentials
    const sponsor = sponsors.find(s => s.email.toLowerCase() === email.toLowerCase());
    
    if (sponsor && password === 'demo123') { // Using a fixed password for demo
      setCurrentSponsor(sponsor);
      localStorage.setItem('sponsorId', sponsor.id);
      return true;
    } else {
      setError('Invalid credentials');
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setCurrentSponsor(null);
    localStorage.removeItem('sponsorId');
  };

  return (
    <SponsorContext.Provider value={{ 
      currentSponsor, 
      isLoading, 
      login, 
      logout, 
      error,
      activeSponsors,
      availableSlots
    }}>
      {children}
    </SponsorContext.Provider>
  );
};

// Custom hook to use the sponsor context
export const useSponsor = () => useContext(SponsorContext);
