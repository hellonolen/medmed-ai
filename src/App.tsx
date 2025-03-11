
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from "./pages/Index";
import Subscription from "./pages/Subscription";
import SymptomChecker from "./pages/SymptomChecker";
import PharmacyFinder from "./pages/PharmacyFinder";
import InteractionChecker from "./pages/InteractionChecker";
import Favorites from "./pages/Favorites";
import MedicationDetails from "./pages/MedicationDetails";
import OwnerDashboard from "./pages/OwnerDashboard";
import SponsorDashboard from "./pages/SponsorDashboard";
import SponsorLogin from "./pages/SponsorLogin";
import SponsorPortal from "./pages/SponsorPortal";
import ResetPassword from "./pages/ResetPassword";
import { AdminProvider } from './contexts/AdminContext';
import { SearchHistoryProvider } from './contexts/SearchHistoryContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { SponsorProvider } from './contexts/SponsorContext';
import AdvertiserEnrollment from "./pages/AdvertiserEnrollment";
import { MedicalSearchProvider } from './contexts/MedicalSearchContext';
import { Toaster } from './components/ui/toaster';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Settings from './pages/Settings';

function App() {
  return (
    <AdminProvider>
      <SearchHistoryProvider>
        <LanguageProvider>
          <AccessibilityProvider>
            <SubscriptionProvider>
              <MedicalSearchProvider>
                <SponsorProvider>
                  <Router>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/subscription" element={<Subscription />} />
                      <Route path="/symptom-checker" element={<SymptomChecker />} />
                      <Route path="/pharmacy-finder" element={<PharmacyFinder />} />
                      <Route path="/interaction-checker" element={<InteractionChecker />} />
                      <Route path="/favorites" element={<Favorites />} />
                      <Route path="/medication/:id" element={<MedicationDetails />} />
                      <Route path="/admin" element={<OwnerDashboard />} />
                      <Route path="/sponsor-dashboard" element={<SponsorDashboard />} />
                      <Route path="/sponsor-login" element={<SponsorLogin />} />
                      <Route path="/sponsor-portal" element={<SponsorPortal />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/advertiser-enrollment" element={<AdvertiserEnrollment />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </Router>
                  <Toaster />
                </SponsorProvider>
              </MedicalSearchProvider>
            </SubscriptionProvider>
          </AccessibilityProvider>
        </LanguageProvider>
      </SearchHistoryProvider>
    </AdminProvider>
  );
}

export default App;
