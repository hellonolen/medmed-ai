
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import { useAuth } from './contexts/AuthContext';
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
import { AuthProvider } from './contexts/AuthContext';
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
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import RefundPolicy from "./pages/legal/RefundPolicy";
import CookiePolicy from "./pages/legal/CookiePolicy";
import PolicyCenter from "./pages/PolicyCenter";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import Onboarding from "./pages/Onboarding";
import HealthProfile from "./pages/HealthProfile";
import MedicationTracker from "./pages/MedicationTracker";
import SymptomJournal from "./pages/SymptomJournal";
import ConversationHistory from "./pages/ConversationHistory";
import ReferralPage from "./pages/ReferralPage";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";
import AdminCenter from "./pages/AdminCenter";
import BusinessCenter from "./pages/BusinessCenter";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Root: show Landing to guests, redirect signed-in users to /chat
function Root() {
  const { user } = useAuth();
  return user ? <Navigate to="/chat" replace /> : <Landing />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminProvider>
          <SearchHistoryProvider>
            <LanguageProvider>
              <AccessibilityProvider>
                <SubscriptionProvider>
                  <MedicalSearchProvider>
                    <SponsorProvider>
                      <Router>
                        <Routes>
                          {/* Root & Chat */}
                          <Route path="/" element={<Root />} />
                          <Route path="/chat" element={<Index />} />
                          <Route path="/search" element={<Layout><Search /></Layout>} />
                          <Route path="/subscription" element={<Layout><Subscription /></Layout>} />
                          <Route path="/symptom-checker" element={<Layout><SymptomChecker /></Layout>} />
                          <Route path="/pharmacy-finder" element={<Layout><PharmacyFinder /></Layout>} />
                          <Route path="/interaction-checker" element={<Layout><InteractionChecker /></Layout>} />
                          <Route path="/favorites" element={<Layout><Favorites /></Layout>} />
                          <Route path="/medication/:id" element={<Layout><MedicationDetails /></Layout>} />

                          {/* Auth pages — manage their own Layout with hideNav */}
                          <Route path="/signin" element={<SignIn />} />
                          <Route path="/signup" element={<SignUp />} />
                          <Route path="/reset-password" element={<ResetPassword />} />

                          {/* Sponsor & Admin */}
                          <Route path="/admin" element={<Layout><OwnerDashboard /></Layout>} />
                          <Route path="/sponsor-dashboard" element={<Layout><SponsorDashboard /></Layout>} />
                          <Route path="/sponsor-login" element={<SponsorLogin />} />
                          <Route path="/sponsor-portal" element={<Layout><SponsorPortal /></Layout>} />
                          <Route path="/advertiser-enrollment" element={<Layout><AdvertiserEnrollment /></Layout>} />
                          <Route path="/user-portal" element={<Layout><UserPortal /></Layout>} />

                          {/* Info pages */}
                          <Route path="/privacy" element={<PrivacyPolicy />} />
                          <Route path="/terms" element={<TermsOfService />} />
                          <Route path="/refund-policy" element={<RefundPolicy />} />
                          <Route path="/cookie-policy" element={<CookiePolicy />} />
                          <Route path="/policy" element={<PolicyCenter />} />
                          <Route path="/pricing" element={<Pricing />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="/onboarding" element={<Onboarding />} />
                          <Route path="/settings" element={<Layout><Settings /></Layout>} />

                          {/* Health tools */}
                          <Route path="/health-profile" element={<Layout><HealthProfile /></Layout>} />
                          <Route path="/medications" element={<Layout><MedicationTracker /></Layout>} />
                          <Route path="/journal" element={<Layout><SymptomJournal /></Layout>} />
                          <Route path="/history" element={<Layout><ConversationHistory /></Layout>} />
                          <Route path="/referral" element={<Layout><ReferralPage /></Layout>} />

                          {/* Standalone info pages */}
                          <Route path="/about" element={<About />} />
                          <Route path="/how-it-works" element={<HowItWorks />} />
                          <Route path="/faq" element={<FAQ />} />
                          <Route path="/admin-center" element={<AdminCenter />} />
                          <Route path="/business" element={<BusinessCenter />} />

                          {/* 404 */}
                          <Route path="*" element={<Layout><NotFound /></Layout>} />
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
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
