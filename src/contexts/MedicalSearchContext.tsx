
import React, { createContext, useContext, useCallback, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { aiService } from '@/services/AIService';

interface SearchState {
  history: Array<{
    query: string;
    context: string;
    results: any[];
  }>;
}

interface MedicalSearchContextType {
  searchWithContext: (query: string) => Promise<any[]>;
  searchHistory: SearchState['history'];
  loading: boolean;
}

const MedicalSearchContext = createContext<MedicalSearchContextType | undefined>(undefined);

export const MedicalSearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = React.useState<SearchState>({ history: [] });
  const [loading, setLoading] = useState(false);
  const { toast: uiToast } = useToast();
  const { t } = useLanguage();

  // Enhanced fallback results for when API is not available
  const fallbackResults = [
    { name: "Amoxicillin", details: "Antibiotic used to treat bacterial infections", price: "$12.99", type: "Tablet", source: "FDA Database" },
    { name: "Ibuprofen", details: "NSAID used to treat pain and inflammation", price: "$8.99", type: "Tablet", source: "FDA Database" },
    { name: "Lisinopril", details: "ACE inhibitor used to treat high blood pressure", price: "$15.99", type: "Tablet", source: "FDA Database" },
    { name: "Metformin", details: "Oral medication used to treat type 2 diabetes", price: "$10.99", type: "Tablet", source: "FDA Database" },
    { name: "Atorvastatin", details: "Statin used to lower cholesterol levels", price: "$14.99", type: "Tablet", source: "FDA Database" },
    { name: "Levothyroxine", details: "Synthetic thyroid hormone for hypothyroidism", price: "$11.99", type: "Tablet", source: "FDA Database" }
  ];

  // Enhanced search function
  const searchWithContext = useCallback(async (query: string) => {
    if (!query.trim()) return [];
    
    setLoading(true);
    try {
      // Advanced query analysis
      const queryLower = query.toLowerCase();
      
      // More comprehensive check for pharmacy-related queries
      const isPharmacyLocationSearch = /pharma(c|s|cy|cies)|drug\s?store|chemist|apothe(c|k)|dispensary/.test(queryLower) && 
        (/\b(in|near|at|around)\b\s+([a-zA-Z\s]+)|\b\d{5}\b/.test(queryLower) || /\bfind\b|\blocate\b|\bwhere\b/.test(queryLower));
      
      // Check for specialist-specific searches
      const isSpecialistSearch = /doctor|physician|specialist|md|practitioner|surgeon|neurologist|cardiologist|dermatologist|pediatrician/.test(queryLower);
      
      // Check for symptom-specific searches
      const isSymptomSearch = /symptom|pain|ache|fever|cough|headache|nausea|dizziness|check|diagnose/.test(queryLower) && 
        !isPharmacyLocationSearch && !isSpecialistSearch;
      
      // Get recent context from history for continuity in conversation
      const recentContext = state.history
        .slice(-3)
        .map(item => `${item.query} - ${item.context}`)
        .join('\n');

      console.log("Analyzing search query:", query);
      console.log("Using context:", recentContext);
      console.log("Query classification:", { 
        isPharmacyLocationSearch, 
        isSpecialistSearch,
        isSymptomSearch 
      });
      
      let results = [];
      let systemPrompt = '';
      
      if (isPharmacyLocationSearch) {
        // Specialized pharmacy search
        systemPrompt = 'You are a pharmacy search assistant. Return detailed information about pharmacies that match the query in JSON format: {"results": [{"name": "Pharmacy Name", "details": "Address and hours", "price": "N/A", "type": "Pharmacy", "source": "Pharmacy Database"}]}';
      } else if (isSpecialistSearch) {
        // Specialized doctor search
        systemPrompt = 'You are a medical specialist search assistant. Return information about medical specialists based on the query in JSON format: {"results": [{"name": "Specialist Name", "details": "Specialization and qualifications", "price": "Consultation fee if available", "type": "Specialist", "source": "Medical Directory"}]}';
      } else if (isSymptomSearch) {
        // Symptom analysis prompt
        systemPrompt = 'You are a symptom analysis assistant. Provide possible conditions, recommended specialists, and over-the-counter medications for these symptoms in JSON format: {"results": [{"name": "Possible Condition/Medication", "details": "Description and recommendations", "price": "Estimate if medication", "type": "Condition or Medication", "source": "Medical Database"}]}';
      } else {
        // Default medical search
        systemPrompt = 'You are a medical search assistant. Analyze the query and previous context to determine the most relevant medical information, medications, specialists, or conditions. Return structured data only in the following JSON format: {"results": [{"name": "Medication/Specialist Name", "details": "Brief description", "price": "Price if applicable", "type": "Category or type", "source": "Data source"}]}';
      }
      
      // Use the centralized service
      const apiResponse = await aiService.askAI({
        query: `Previous context:\n${recentContext}\n\nCurrent query: ${query}`,
        systemPrompt
      });
      
      if (apiResponse.success) {
        try {
          const content = apiResponse.content;
          const parsedData = typeof content === 'string' 
            ? JSON.parse(content) 
            : content;
          
          results = parsedData.results || [];
          
          if (!Array.isArray(results)) {
            throw new Error("Invalid results format");
          }
          
          // Post-process results for consistency
          results = results.map(result => ({
            name: result.name || "Unknown",
            details: result.details || "No details available",
            price: result.price || "Price unavailable",
            type: result.type || "Unknown",
            source: result.source || "Medical Database"
          }));
          
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
          toast.error("Unable to process search results");
          throw new Error("Invalid response format");
        }
      } else {
        console.log("Service unavailable, using fallback data");
        // Filter through fallback data based on search terms
        results = fallbackResults.filter(item => 
          item.name.toLowerCase().includes(queryLower) || 
          item.details.toLowerCase().includes(queryLower) ||
          item.type?.toLowerCase().includes(queryLower)
        );
        
        // If no direct matches, return some general results
        if (results.length === 0 && !isPharmacyLocationSearch) {
          // For medication searches, return a subset of fallback results
          results = fallbackResults.slice(0, 3);
        }
      }
      
      // Update search history with new context
      setState(prev => ({
        history: [
          ...prev.history,
          {
            query,
            context: results.length > 0 
              ? results.map((r: any) => r.name).join(", ") 
              : "No relevant results",
            results: results
          }
        ].slice(-10) // Keep last 10 searches
      }));

      console.log("Returning results:", results);
      return results;
    } catch (error) {
      console.error('Search error:', error);
      uiToast({
        title: t("search.error.title", "Search Error"),
        description: t("search.error.description", "Failed to perform search. Please try again."),
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [state.history, uiToast, t, fallbackResults]);

  return (
    <MedicalSearchContext.Provider value={{
      searchWithContext,
      searchHistory: state.history,
      loading
    }}>
      {children}
    </MedicalSearchContext.Provider>
  );
};

export const useMedicalSearch = () => {
  const context = useContext(MedicalSearchContext);
  if (!context) {
    throw new Error('useMedicalSearch must be used within a MedicalSearchProvider');
  }
  return context;
};
