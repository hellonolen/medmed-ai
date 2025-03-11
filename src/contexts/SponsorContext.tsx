
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the sponsor type
export interface Sponsor {
  id: string;
  name: string;
  email: string;
  companyName: string;
  package: 'Basic' | 'Standard' | 'Premium';
  apiKey: string;
}

// Define the context type
interface SponsorContextType {
  currentSponsor: Sponsor | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
}

// Create the context with a default value
const SponsorContext = createContext<SponsorContextType>({
  currentSponsor: null,
  isLoading: true,
  login: async () => false,
  logout: () => {},
  error: null,
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
  },
  {
    id: 'sponsor-2',
    name: 'Sarah Johnson',
    email: 'sarah@meditech.com',
    companyName: 'MediCare Telehealth',
    package: 'Premium',
    apiKey: 'sk_medicare_67890',
  },
  {
    id: 'sponsor-3',
    name: 'David Brown',
    email: 'david@welllife.com',
    companyName: 'WellLife Insurance',
    package: 'Standard',
    apiKey: 'sk_welllife_54321',
  },
];

export const SponsorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSponsor, setCurrentSponsor] = useState<Sponsor | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check for saved sponsor session on load
  useEffect(() => {
    const savedSponsorId = localStorage.getItem('sponsorId');
    
    if (savedSponsorId) {
      const sponsor = MOCK_SPONSORS.find(s => s.id === savedSponsorId);
      if (sponsor) {
        setCurrentSponsor(sponsor);
      } else {
        localStorage.removeItem('sponsorId');
      }
    }
    
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    
    // In a real app, this would be an API call to verify credentials
    const sponsor = MOCK_SPONSORS.find(s => s.email.toLowerCase() === email.toLowerCase());
    
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
    <SponsorContext.Provider value={{ currentSponsor, isLoading, login, logout, error }}>
      {children}
    </SponsorContext.Provider>
  );
};

// Custom hook to use the sponsor context
export const useSponsor = () => useContext(SponsorContext);
