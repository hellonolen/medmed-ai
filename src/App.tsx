import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from "./pages/Index";
import Subscription from "./pages/Subscription";
import SymptomChecker from "./pages/SymptomChecker";
import PharmacyFinder from "./pages/PharmacyFinder";
import InteractionChecker from "./pages/InteractionChecker";
import Favorites from "./pages/Favorites";
import MedicationDetails from "./pages/MedicationDetails";
import AdminPanel from "./pages/AdminPanel";
import { AdminProvider } from './contexts/AdminContext';
import { SearchHistoryProvider } from './contexts/SearchHistoryContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import AdvertiserEnrollment from "./pages/AdvertiserEnrollment";

function App() {
  return (
    <AdminProvider>
      <SearchHistoryProvider>
        <LanguageProvider>
          <AccessibilityProvider>
            <SubscriptionProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/subscription" element={<Subscription />} />
                  <Route path="/symptom-checker" element={<SymptomChecker />} />
                  <Route path="/pharmacy-finder" element={<PharmacyFinder />} />
                  <Route path="/interaction-checker" element={<InteractionChecker />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/medication/:id" element={<MedicationDetails />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/advertiser-enrollment" element={<AdvertiserEnrollment />} />
                </Routes>
              </Router>
            </SubscriptionProvider>
          </AccessibilityProvider>
        </LanguageProvider>
      </SearchHistoryProvider>
    </AdminProvider>
  );
}

export default App;
