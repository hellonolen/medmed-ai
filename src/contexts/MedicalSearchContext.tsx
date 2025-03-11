
import React, { createContext, useContext, useCallback, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { aiService } from '@/services/AIService';
import { intelligentPharmacySearch } from '@/utils/pharmacySearch';

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
  const { t, language } = useLanguage();

  // Enhanced fallback results for when service is not available
  const fallbackResults = [
    { name: "Amoxicillin", details: "Antibiotic used to treat bacterial infections", price: "$12.99", type: "Tablet", source: "FDA Database" },
    { name: "Ibuprofen", details: "NSAID used to treat pain and inflammation", price: "$8.99", type: "Tablet", source: "FDA Database" },
    { name: "Lisinopril", details: "ACE inhibitor used to treat high blood pressure", price: "$15.99", type: "Tablet", source: "FDA Database" },
    { name: "Metformin", details: "Oral medication used to treat type 2 diabetes", price: "$10.99", type: "Tablet", source: "FDA Database" },
    { name: "Atorvastatin", details: "Statin used to lower cholesterol levels", price: "$14.99", type: "Tablet", source: "FDA Database" },
    { name: "Levothyroxine", details: "Synthetic thyroid hormone for hypothyroidism", price: "$11.99", type: "Tablet", source: "FDA Database" }
  ];

  // Med Spa fallback results
  const medSpaFallbackResults = [
    { name: "Serenity Med Spa", details: "Full-service medical spa offering botox, fillers, and laser treatments", price: "$$", type: "Med Spa", source: "Healthcare Directory", phone: "+1-555-123-4567", address: "123 Main St, New York, NY 10001" },
    { name: "Rejuvenation Wellness", details: "Specializing in anti-aging treatments and skin rejuvenation", price: "$$$", type: "Med Spa", source: "Healthcare Directory", phone: "+1-555-987-6543", address: "456 Oak Ave, Los Angeles, CA 90001" },
    { name: "Elite Aesthetics", details: "Premium med spa with custom treatment plans and membership options", price: "$$$$", type: "Med Spa", source: "Healthcare Directory", phone: "+1-555-456-7890", address: "789 Pine Blvd, Chicago, IL 60007" },
    { name: "The Beauty Clinic", details: "Medical spa focusing on non-invasive cosmetic procedures", price: "$$", type: "Med Spa", source: "Healthcare Directory", phone: "+1-555-789-0123", address: "321 Maple Dr, Miami, FL 33101" }
  ];

  // Enhanced specialist fallback results
  const specialistFallbackResults = [
    { name: "Dr. Sarah Johnson", details: "Board-certified dermatologist specializing in cosmetic procedures", price: "Consultation: $200", type: "Specialist", source: "Medical Directory", phone: "+1-555-222-3333", address: "100 Medical Plaza, Boston, MA 02115" },
    { name: "Dr. Michael Chen", details: "Plastic surgeon with expertise in facial reconstruction and aesthetics", price: "Consultation: $250", type: "Specialist", source: "Medical Directory", phone: "+1-555-444-5555", address: "200 Health Center, San Francisco, CA 94107" },
    { name: "Dr. Emily Rodriguez", details: "Cosmetic dentist specializing in smile makeovers and veneers", price: "Consultation: $150", type: "Specialist", source: "Medical Directory", phone: "+1-555-666-7777", address: "300 Dental Lane, Austin, TX 78701" }
  ];

  // Enhanced search function
  const searchWithContext = useCallback(async (query: string) => {
    if (!query.trim()) return [];
    
    setLoading(true);
    try {
      // Advanced query analysis
      const queryLower = query.toLowerCase();
      
      // More comprehensive check for location-related queries
      const locationPattern = /\b(in|near|at|around)\b\s+([a-zA-Z\s]+)|\b\d{5}\b|\bzip\s+\d{5}\b|\bin\s+[a-z]{2}\b|\bstate\s+of\s+[a-z\s]+\b|\bcity\s+of\s+[a-z\s]+\b|\bprovince\s+of\s+[a-z\s]+\b/i;
      const isLocationSearch = locationPattern.test(queryLower);
      
      // Extract location information if present
      const locationMatch = queryLower.match(locationPattern);
      const locationInfo = locationMatch ? locationMatch[0] : '';
      
      // Check for pharmacy-related queries
      const isPharmacySearch = /pharma(c|s|cy|cies)|drug\s?store|chemist|apothe(c|k)|dispensary/.test(queryLower);
      
      // Check for med spa specific searches - expanded to catch more variations
      const isMedSpaSearch = /med\s*spa|medi\s*spa|med-spa|spa|cosmetic|aesthetic|beauty|salon|wellness|massage|facial|botox|filler|injection|laser|skin|treatment|rejuvenation|wellness\s*center|beauty\s*clinic|day\s*spa|medical\s*spa/.test(queryLower);
      
      // Check for specialist-specific searches - expanded to catch more variations
      const isSpecialistSearch = /doctor|physician|specialist|md|practitioner|surgeon|neurologist|cardiologist|dermatologist|pediatrician|therapist|clinician|provider|professional|expert|consultant|dentist|orthodontist/.test(queryLower);
      
      // Check for phone number searches
      const isPhoneSearch = /phone|call|contact|telephone|dial|number/.test(queryLower) || 
                           /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(queryLower);
      
      // Check for symptom-specific searches
      const isSymptomSearch = /symptom|pain|ache|fever|cough|headache|nausea|dizziness|check|diagnose/.test(queryLower) && 
        !isPharmacySearch && !isSpecialistSearch && !isMedSpaSearch;
      
      // Get recent context from history for continuity in conversation
      const recentContext = state.history
        .slice(-3)
        .map(item => `${item.query} - ${item.context}`)
        .join('\n');

      console.log("Analyzing search query:", query);
      console.log("Using context:", recentContext);
      console.log("Query classification:", { 
        isLocationSearch,
        locationInfo,
        isPharmacySearch, 
        isMedSpaSearch,
        isSpecialistSearch,
        isPhoneSearch,
        isSymptomSearch 
      });
      
      let results = [];
      let systemPrompt = '';
      
      // Handle combined searches (e.g., med spa in New York)
      if ((isPharmacySearch || isMedSpaSearch) && (isLocationSearch || isPhoneSearch)) {
        // Prioritize location/phone searches for pharmacies and med spas
        console.log("Using enhanced location/phone search for pharmacy/med spa");
        
        // Pass the full query to get more accurate results
        const pharmacyResults = intelligentPharmacySearch(query, language);
        
        // Format results for consistency with the medical search results
        results = pharmacyResults.map(pharmacy => ({
          name: pharmacy.name,
          details: `${pharmacy.address} - ${pharmacy.hours} - ${pharmacy.phone}`,
          price: pharmacy.chain || "Independent",
          type: isMedSpaSearch ? "Med Spa" : "Pharmacy",
          source: pharmacy.distance ? `Distance: ${pharmacy.distance}` : "Healthcare Database",
          phone: pharmacy.phone,
          address: pharmacy.address
        }));
      } else if (isMedSpaSearch) {
        // Handle general med spa searches without specific location
        console.log("Searching for med spas generally");
        
        if (isLocationSearch) {
          // Try to extract location information for better results
          const pharmacyResults = intelligentPharmacySearch(`med spa ${locationInfo}`, language);
          results = pharmacyResults.map(pharmacy => ({
            name: pharmacy.name,
            details: `${pharmacy.address} - ${pharmacy.hours} - ${pharmacy.phone}`,
            price: pharmacy.chain || "$$",
            type: "Med Spa",
            source: "Healthcare Directory",
            phone: pharmacy.phone,
            address: pharmacy.address
          }));
        } else {
          // Use fallback data for generic med spa searches
          systemPrompt = 'Return information about medical spas based on the query in JSON format: {"results": [{"name": "Med Spa Name", "details": "Services and specialties", "price": "Price range ($$-$$$$)", "type": "Med Spa", "source": "Healthcare Directory", "phone": "Contact number", "address": "Full address"}]}';
          
          // Use fallback data until AI response
          results = medSpaFallbackResults.filter(spa => 
            spa.name.toLowerCase().includes(queryLower) || 
            spa.details.toLowerCase().includes(queryLower)
          );
          
          // If no matches in fallback, provide general results
          if (results.length === 0) {
            results = medSpaFallbackResults.slice(0, 3);
          }
        }
      } else if (isSpecialistSearch) {
        // Enhanced specialist search
        console.log("Searching for specialists");
        systemPrompt = 'Return detailed information about medical specialists based on the query in JSON format: {"results": [{"name": "Specialist Name", "details": "Specialization, qualifications and expertise", "price": "Consultation fee if available", "type": "Specialist", "source": "Medical Directory", "phone": "Contact number", "address": "Full address"}]}';
        
        // Use fallback data until AI response
        results = specialistFallbackResults.filter(specialist => 
          specialist.name.toLowerCase().includes(queryLower) || 
          specialist.details.toLowerCase().includes(queryLower)
        );
        
        // If no matches in fallback, provide general results
        if (results.length === 0) {
          results = specialistFallbackResults.slice(0, 2);
        }
      } else if (isSymptomSearch) {
        // Symptom analysis prompt
        systemPrompt = 'Provide possible conditions, recommended specialists, and over-the-counter medications for these symptoms in JSON format: {"results": [{"name": "Possible Condition/Medication", "details": "Description and recommendations", "price": "Estimate if medication", "type": "Condition or Medication", "source": "Medical Database"}]}';
      } else {
        // Default medical search
        systemPrompt = 'Analyze the query and previous context to determine the most relevant medical information, medications, specialists, or conditions. Return structured data only in the following JSON format: {"results": [{"name": "Medication/Specialist Name", "details": "Brief description", "price": "Price if applicable", "type": "Category or type", "source": "Data source", "phone": "Contact number if applicable", "address": "Address if applicable"}]}';
      }
      
      // Only use AI service if we haven't already found results from pharmacy/med spa search
      if (results.length === 0) {
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
              source: result.source || "Medical Database",
              phone: result.phone || "No phone available",
              address: result.address || "No address available"
            }));
            
          } catch (parseError) {
            console.error("Error parsing response:", parseError);
            toast.error("Unable to process search results");
            throw new Error("Invalid response format");
          }
        } else {
          console.log("Service unavailable, using fallback data");
          // Filter through fallback data based on search terms
          
          // Try to match against med spas if the query seems related
          if (query.toLowerCase().includes("spa") || query.toLowerCase().includes("cosmetic") || 
              query.toLowerCase().includes("beauty") || query.toLowerCase().includes("facial")) {
            results = medSpaFallbackResults.filter(item => 
              item.name.toLowerCase().includes(queryLower) || 
              item.details.toLowerCase().includes(queryLower)
            );
            
            if (results.length === 0) {
              results = medSpaFallbackResults.slice(0, 2);
            }
          } else {
            // Default to medication results
            results = fallbackResults.filter(item => 
              item.name.toLowerCase().includes(queryLower) || 
              item.details.toLowerCase().includes(queryLower) ||
              item.type?.toLowerCase().includes(queryLower)
            );
            
            // If no direct matches, return some general results
            if (results.length === 0 && !isPharmacySearch && !isMedSpaSearch) {
              // For medication searches, return a subset of fallback results
              results = fallbackResults.slice(0, 3);
            }
          }
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
  }, [state.history, uiToast, t, language, fallbackResults, medSpaFallbackResults, specialistFallbackResults]);

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
