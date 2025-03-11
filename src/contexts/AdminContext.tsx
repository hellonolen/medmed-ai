
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface OwnerContextType {
  isOwner: boolean;
  setIsOwner: (value: boolean) => void;
}

const OwnerContext = createContext<OwnerContextType | undefined>(undefined);

// Local storage key for persisting owner status
const OWNER_STORAGE_KEY = "medmed_owner_status";

export function OwnerProvider({ children }: { children: ReactNode }) {
  const [isOwner, setIsOwner] = useState(false);

  // Load owner status from localStorage on initial render
  useEffect(() => {
    try {
      const savedStatus = localStorage.getItem(OWNER_STORAGE_KEY);
      if (savedStatus === "true") {
        setIsOwner(true);
      }
    } catch (error) {
      console.error("Error loading owner status:", error);
    }
  }, []);

  // Save to localStorage whenever owner status changes
  useEffect(() => {
    try {
      localStorage.setItem(OWNER_STORAGE_KEY, isOwner.toString());
    } catch (error) {
      console.error("Error saving owner status:", error);
    }
  }, [isOwner]);

  return (
    <OwnerContext.Provider value={{ isOwner, setIsOwner }}>
      {children}
    </OwnerContext.Provider>
  );
}

export function useOwner() {
  const context = useContext(OwnerContext);
  if (context === undefined) {
    throw new Error("useOwner must be used within an OwnerProvider");
  }
  return context;
}
