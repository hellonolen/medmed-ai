
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AdminContextType {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Local storage key for persisting admin status
const ADMIN_STORAGE_KEY = "medmed_admin_status";

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  // Load admin status from localStorage on initial render
  useEffect(() => {
    try {
      const savedStatus = localStorage.getItem(ADMIN_STORAGE_KEY);
      // Set isAdmin to true if saved as true, or if no saved status (default owner access)
      if (savedStatus === "true" || savedStatus === null) {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error("Error loading admin status:", error);
      // If there's an error loading, default to admin access (owner)
      setIsAdmin(true);
    }
  }, []);

  // Save to localStorage whenever admin status changes
  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_STORAGE_KEY, isAdmin.toString());
    } catch (error) {
      console.error("Error saving admin status:", error);
    }
  }, [isAdmin]);

  return (
    <AdminContext.Provider value={{ isAdmin, setIsAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
