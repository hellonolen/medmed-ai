
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
  passwordResetToken?: string;
  passwordResetExpires?: string;
}

// Define the context type
interface SponsorContextType {
  currentSponsor: Sponsor | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (token: string, newPassword: string) => Promise<boolean>;
  registerSponsor: (sponsorData: Partial<Sponsor>, password: string) => Promise<boolean>;
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
  resetPassword: async () => false,
  updatePassword: async () => false,
  registerSponsor: async () => false,
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
    
    try {
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
    } catch (err) {
      setError('An unexpected error occurred');
      return false;
    }
  };

  // Password reset function
  const resetPassword = async (email: string): Promise<boolean> => {
    setError(null);
    
    try {
      // Find sponsor by email
      const sponsor = sponsors.find(s => s.email.toLowerCase() === email.toLowerCase());
      
      if (sponsor) {
        // Generate a reset token (in a real app, this would be more secure)
        const token = Math.random().toString(36).substring(2, 15);
        const expires = new Date();
        expires.setHours(expires.getHours() + 1); // Token expires in 1 hour
        
        // Update the sponsor with the reset token
        const updatedSponsors = sponsors.map(s => {
          if (s.id === sponsor.id) {
            return {
              ...s,
              passwordResetToken: token,
              passwordResetExpires: expires.toISOString()
            };
          }
          return s;
        });
        
        setSponsors(updatedSponsors);
        
        // In a real app, this would send an email with the reset link
        console.log(`Reset token for ${email}: ${token}`);
        
        return true;
      } else {
        setError('No account found with this email');
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      return false;
    }
  };

  // Update password function
  const updatePassword = async (token: string, newPassword: string): Promise<boolean> => {
    setError(null);
    
    try {
      // Find sponsor by reset token
      const sponsor = sponsors.find(
        s => s.passwordResetToken === token && 
        s.passwordResetExpires && 
        new Date(s.passwordResetExpires) > new Date()
      );
      
      if (sponsor) {
        // Update the sponsor's password
        const updatedSponsors = sponsors.map(s => {
          if (s.id === sponsor.id) {
            return {
              ...s,
              passwordResetToken: undefined,
              passwordResetExpires: undefined
              // In a real app, we would hash the new password here
            };
          }
          return s;
        });
        
        setSponsors(updatedSponsors);
        return true;
      } else {
        setError('Invalid or expired token');
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      return false;
    }
  };

  // Register new sponsor function
  const registerSponsor = async (sponsorData: Partial<Sponsor>, password: string): Promise<boolean> => {
    setError(null);
    
    try {
      // Check if email already exists
      const existingEmail = sponsors.find(s => s.email.toLowerCase() === sponsorData.email?.toLowerCase());
      
      if (existingEmail) {
        setError('Email already in use');
        return false;
      }
      
      // Create new sponsor
      const newSponsor: Sponsor = {
        id: `sponsor-${Date.now()}`,
        name: sponsorData.name || '',
        email: sponsorData.email || '',
        companyName: sponsorData.companyName || '',
        package: sponsorData.package || 'Standard',
        apiKey: `sk_${sponsorData.companyName?.toLowerCase().replace(/\s/g, '')}_${Math.random().toString(36).substring(2, 7)}`,
        startDate: new Date().toISOString(),
        endDate: sponsorData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        isActive: false, // Will be activated after payment
        isOnWaitlist: false,
        // In a real app, we would hash the password here
      };
      
      setSponsors([...sponsors, newSponsor]);
      return true;
    } catch (err) {
      setError('An unexpected error occurred during registration');
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
      resetPassword,
      updatePassword,
      registerSponsor,
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
