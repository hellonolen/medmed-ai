
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MedicationDetail from "./pages/MedicationDetail";
import Favorites from "./pages/Favorites";
import SymptomChecker from "./pages/SymptomChecker";
import PharmacyFinder from "./pages/PharmacyFinder";
import InteractionChecker from "./pages/InteractionChecker";
import AdminDashboard from "./pages/AdminDashboard";
import { AdminProvider } from "./contexts/AdminContext";
import { SearchHistoryProvider } from "./contexts/SearchHistoryContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AdminProvider>
      <SearchHistoryProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/medication/:id" element={<MedicationDetail />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/symptom-checker" element={<SymptomChecker />} />
              <Route path="/pharmacy-finder" element={<PharmacyFinder />} />
              <Route path="/interaction-checker" element={<InteractionChecker />} />
              <Route path="/admin" element={<AdminDashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SearchHistoryProvider>
    </AdminProvider>
  </QueryClientProvider>
);

export default App;
