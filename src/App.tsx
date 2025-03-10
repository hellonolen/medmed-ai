import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
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
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";

const queryClient = new QueryClient();

// Wrapper component to handle language loading states
const LanguageWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, error, t } = useLanguage();

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">{t("error.translations", "Error loading translations")}</h2>
          <p className="mt-2 text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 bg-primary/10 p-1 text-center text-sm text-primary z-50">
          {t("loading.translations", "Loading translations...")}
        </div>
      )}
      {children}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AdminProvider>
      <SearchHistoryProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <LanguageWrapper>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/medication/:id" element={<MedicationDetail />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/symptom-checker" element={<SymptomChecker />} />
                  <Route path="/pharmacy-finder" element={<PharmacyFinder />} />
                  <Route path="/interaction-checker" element={<InteractionChecker />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </LanguageWrapper>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </SearchHistoryProvider>
    </AdminProvider>
  </QueryClientProvider>
);

export default App;
