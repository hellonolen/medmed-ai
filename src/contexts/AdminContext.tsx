
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AdminContextType {
  isAdmin: boolean;
  isOwner: boolean;
  setIsAdmin: (value: boolean) => void;
  assignAdmin: (email: string) => void;
  admins: string[];
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Local storage keys for persisting status
const ADMIN_STORAGE_KEY = "medmed_admin_status";
const OWNER_STORAGE_KEY = "medmed_owner_status";
const ADMINS_STORAGE_KEY = "medmed_admins_list";

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [admins, setAdmins] = useState<string[]>([]);

  // Load admin and owner status from localStorage on initial render
  useEffect(() => {
    try {
      const savedAdminStatus = localStorage.getItem(ADMIN_STORAGE_KEY);
      const savedOwnerStatus = localStorage.getItem(OWNER_STORAGE_KEY);
      const savedAdmins = localStorage.getItem(ADMINS_STORAGE_KEY);
      
      if (savedAdminStatus === "true") {
        setIsAdmin(true);
      }
      
      if (savedOwnerStatus === "true") {
        setIsOwner(true);
        setIsAdmin(true); // Owner always has admin privileges
      }
      
      if (savedAdmins) {
        setAdmins(JSON.parse(savedAdmins));
      }
    } catch (error) {
      console.error("Error loading admin/owner status:", error);
    }
  }, []);

  // Save to localStorage whenever status changes
  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_STORAGE_KEY, isAdmin.toString());
      localStorage.setItem(OWNER_STORAGE_KEY, isOwner.toString());
      localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(admins));
    } catch (error) {
      console.error("Error saving admin/owner status:", error);
    }
  }, [isAdmin, isOwner, admins]);

  const assignAdmin = (email: string) => {
    if (!email || !email.includes('@')) return;
    
    if (!admins.includes(email)) {
      setAdmins([...admins, email]);
    }
  };

  return (
    <AdminContext.Provider value={{ isAdmin, isOwner, setIsAdmin, assignAdmin, admins }}>
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
