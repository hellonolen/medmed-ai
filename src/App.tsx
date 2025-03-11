
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
import UserPortal from "./pages/UserPortal";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Layout from "./components/Layout";
import Search from "./pages/Search";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminProvider>
        <SearchHistoryProvider>
          <LanguageProvider>
            <AccessibilityProvider>
              <SubscriptionProvider>
                <MedicalSearchProvider>
                  <SponsorProvider>
                    <Router>
                      <Routes>
                        <Route path="/" element={<Layout><Index /></Layout>} />
                        <Route path="/subscription" element={<Layout><Subscription /></Layout>} />
                        <Route path="/symptom-checker" element={<Layout><SymptomChecker /></Layout>} />
                        <Route path="/pharmacy-finder" element={<Layout><PharmacyFinder /></Layout>} />
                        <Route path="/interaction-checker" element={<Layout><InteractionChecker /></Layout>} />
                        <Route path="/favorites" element={<Layout><Favorites /></Layout>} />
                        <Route path="/medication/:id" element={<Layout><MedicationDetails /></Layout>} />
                        <Route path="/admin" element={<Layout><OwnerDashboard /></Layout>} />
                        <Route path="/sponsor-dashboard" element={<Layout><SponsorDashboard /></Layout>} />
                        <Route path="/sponsor-login" element={<Layout><SponsorLogin /></Layout>} />
                        <Route path="/sponsor-portal" element={<Layout><SponsorPortal /></Layout>} />
                        <Route path="/reset-password" element={<Layout><ResetPassword /></Layout>} />
                        <Route path="/advertiser-enrollment" element={<Layout><AdvertiserEnrollment /></Layout>} />
                        <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
                        <Route path="/terms" element={<Layout><Terms /></Layout>} />
                        <Route path="/settings" element={<Layout><Settings /></Layout>} />
                        <Route path="/user-portal" element={<Layout><UserPortal /></Layout>} />
                        <Route path="/signin" element={<SignIn />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/search" element={<Layout><Search /></Layout>} />
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
    </QueryClientProvider>
  );
}

export default App;
