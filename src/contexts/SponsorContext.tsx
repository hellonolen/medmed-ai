
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
  waitlistedSponsors: Sponsor[];
  availableSlots: { premium: number; standard: number };
  joinWaitlist: (sponsor: Sponsor) => void;
  activateSponsor: (sponsorId: string) => void;
  deactivateSponsor: (sponsorId: string) => void;
}

// Create the context with a default value
const SponsorContext = createContext<SponsorContextType>({
  currentSponsor: null,
  isLoading: true,
  login: async () => false,
  logout: () => {},
  error: null,
  activeSponsors: [],
  waitlistedSponsors: [],
  availableSlots: { premium: PREMIUM_SLOTS, standard: STANDARD_SLOTS },
  joinWaitlist: () => {},
  activateSponsor: () => {},
  deactivateSponsor: () => {},
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
  // Waitlisted sponsors
  {
    id: 'sponsor-7',
    name: 'Thomas Moore',
    email: 'thomas@medisafe.com',
    companyName: 'MediSafe Clinic',
    package: 'Premium',
    apiKey: 'sk_medisafe_12345',
    isActive: false,
    isOnWaitlist: true,
    waitlistPosition: 1,
  },
  {
    id: 'sponsor-8',
    name: 'Laura Garcia',
    email: 'laura@healthvitals.com',
    companyName: 'HealthVitals Monitor',
    package: 'Standard',
    apiKey: 'sk_healthvitals_67890',
    isActive: false,
    isOnWaitlist: true,
    waitlistPosition: 1,
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
  const waitlistedSponsors = sponsors.filter(s => s.isOnWaitlist).sort((a, b) => 
    (a.waitlistPosition || 999) - (b.waitlistPosition || 999)
  );

  // Calculate available slots
  const activePremiumCount = activeSponsors.filter(s => s.package === 'Premium').length;
  const activeStandardCount = activeSponsors.filter(s => s.package === 'Standard').length;
  
  const availableSlots = {
    premium: PREMIUM_SLOTS - activePremiumCount,
    standard: STANDARD_SLOTS - activeStandardCount
  };

  // Check for expired sponsors and process waitlist daily
  useEffect(() => {
    const checkExpirations = () => {
      const today = new Date();
      const updatedSponsors = [...sponsors];
      let waitlistUpdated = false;

      // Check for expired sponsors
      updatedSponsors.forEach(sponsor => {
        if (sponsor.isActive && sponsor.endDate) {
          const endDate = new Date(sponsor.endDate);
          if (endDate < today) {
            sponsor.isActive = false;
            waitlistUpdated = true;
            
            // Send notification email (in a real app)
            console.log(`Sponsor ${sponsor.companyName} subscription has ended`);
          }
        }
      });

      // Process waitlist if slots opened up
      if (waitlistUpdated) {
        processWaitlist(updatedSponsors);
      }
    };

    // Initial check
    checkExpirations();
    
    // Set up daily check
    const intervalId = setInterval(checkExpirations, 86400000); // 24 hours
    
    return () => clearInterval(intervalId);
  }, [sponsors]);

  // Process the waitlist
  const processWaitlist = (sponsorsList: Sponsor[]) => {
    const updatedSponsors = [...sponsorsList];
    const premiumWaitlist = updatedSponsors
      .filter(s => s.isOnWaitlist && s.package === 'Premium')
      .sort((a, b) => (a.waitlistPosition || 999) - (b.waitlistPosition || 999));
    
    const standardWaitlist = updatedSponsors
      .filter(s => s.isOnWaitlist && s.package === 'Standard')
      .sort((a, b) => (a.waitlistPosition || 999) - (b.waitlistPosition || 999));

    // Calculate available slots
    const activePremium = updatedSponsors.filter(s => s.isActive && s.package === 'Premium').length;
    const activeStandard = updatedSponsors.filter(s => s.isActive && s.package === 'Standard').length;
    
    const premiumSlots = PREMIUM_SLOTS - activePremium;
    const standardSlots = STANDARD_SLOTS - activeStandard;

    // Process premium waitlist
    for (let i = 0; i < Math.min(premiumSlots, premiumWaitlist.length); i++) {
      const sponsor = premiumWaitlist[i];
      sponsor.isActive = true;
      sponsor.isOnWaitlist = false;
      sponsor.waitlistPosition = undefined;
      sponsor.startDate = new Date().toISOString().split('T')[0];
      sponsor.endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 90 days
      
      // Send notification email (in a real app)
      toast({
        title: "Sponsor Activated",
        description: `${sponsor.companyName} has been moved from the waitlist to active status.`,
      });
    }

    // Process standard waitlist
    for (let i = 0; i < Math.min(standardSlots, standardWaitlist.length); i++) {
      const sponsor = standardWaitlist[i];
      sponsor.isActive = true;
      sponsor.isOnWaitlist = false;
      sponsor.waitlistPosition = undefined;
      sponsor.startDate = new Date().toISOString().split('T')[0];
      sponsor.endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 90 days
      
      // Send notification email (in a real app)
      toast({
        title: "Sponsor Activated", 
        description: `${sponsor.companyName} has been moved from the waitlist to active status.`,
      });
    }

    // Reindex waitlist positions
    const remainingPremiumWaitlist = updatedSponsors.filter(s => s.isOnWaitlist && s.package === 'Premium');
    const remainingStandardWaitlist = updatedSponsors.filter(s => s.isOnWaitlist && s.package === 'Standard');
    
    remainingPremiumWaitlist.forEach((sponsor, index) => {
      sponsor.waitlistPosition = index + 1;
    });
    
    remainingStandardWaitlist.forEach((sponsor, index) => {
      sponsor.waitlistPosition = index + 1;
    });

    setSponsors(updatedSponsors);
  };

  // Join waitlist function
  const joinWaitlist = (sponsor: Sponsor) => {
    const updatedSponsors = [...sponsors];
    
    // Determine waitlist position
    const packageWaitlist = updatedSponsors.filter(
      s => s.isOnWaitlist && s.package === sponsor.package
    );
    const waitlistPosition = packageWaitlist.length + 1;
    
    // Add to waitlist
    updatedSponsors.push({
      ...sponsor,
      isActive: false,
      isOnWaitlist: true,
      waitlistPosition,
    });
    
    setSponsors(updatedSponsors);
    
    // Send notification email (in a real app)
    toast({
      title: "Added to Waitlist",
      description: `${sponsor.companyName} has been added to the ${sponsor.package} waitlist at position ${waitlistPosition}.`,
    });
  };
  
  // Activate sponsor function (for admin use)
  const activateSponsor = (sponsorId: string) => {
    const updatedSponsors = [...sponsors];
    const sponsor = updatedSponsors.find(s => s.id === sponsorId);
    
    if (sponsor) {
      sponsor.isActive = true;
      sponsor.isOnWaitlist = false;
      sponsor.waitlistPosition = undefined;
      sponsor.startDate = new Date().toISOString().split('T')[0];
      sponsor.endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 90 days
      
      setSponsors(updatedSponsors);
      
      // Send notification email (in a real app)
      toast({
        title: "Sponsor Activated",
        description: `${sponsor.companyName} has been activated and their ad is now live.`,
      });
    }
  };
  
  // Deactivate sponsor function (for admin use)
  const deactivateSponsor = (sponsorId: string) => {
    const updatedSponsors = [...sponsors];
    const sponsor = updatedSponsors.find(s => s.id === sponsorId);
    
    if (sponsor) {
      sponsor.isActive = false;
      
      setSponsors(updatedSponsors);
      
      // Process waitlist to fill the slot
      processWaitlist(updatedSponsors);
      
      // Send notification email (in a real app)
      toast({
        title: "Sponsor Deactivated",
        description: `${sponsor.companyName} has been deactivated.`,
      });
    }
  };

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
      waitlistedSponsors,
      availableSlots,
      joinWaitlist,
      activateSponsor,
      deactivateSponsor
    }}>
      {children}
    </SponsorContext.Provider>
  );
};

// Custom hook to use the sponsor context
export const useSponsor = () => useContext(SponsorContext);
