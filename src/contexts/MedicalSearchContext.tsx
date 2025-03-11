
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
    timestamp: Date;
  }>;
  lastError: string | null;
}

interface MedicalSearchContextType {
  searchWithContext: (query: string, searchType?: string) => Promise<any[]>;
  searchHistory: SearchState['history'];
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

// Define common types of medical search results
type SearchResultType = 'Medication' | 'Med Spa' | 'Pharmacy' | 'Specialist' | 'Condition' | 'Other';

// Structure for unified search results
interface UnifiedSearchResult {
  name: string;
  details: string;
  price: string;
  type: string;
  source: string;
  phone?: string;
  address?: string;
  rating?: number;
  url?: string;
  distance?: string;
}

const MedicalSearchContext = createContext<MedicalSearchContextType | undefined>(undefined);

export const MedicalSearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = React.useState<SearchState>({ 
    history: [],
    lastError: null
  });
  const [loading, setLoading] = useState(false);
  const { toast: uiToast } = useToast();
  const { t, language } = useLanguage();

  // Clear the last error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, lastError: null }));
  }, []);

  // Enhanced fallback results database for when service is not available
  // Medication fallbacks
  const medicationFallbacks = [
    { name: "Amoxicillin", details: "Antibiotic used to treat bacterial infections", price: "$12.99", type: "Tablet", source: "FDA Database" },
    { name: "Ibuprofen", details: "NSAID used to treat pain and inflammation", price: "$8.99", type: "Tablet", source: "FDA Database" },
    { name: "Lisinopril", details: "ACE inhibitor used to treat high blood pressure", price: "$15.99", type: "Tablet", source: "FDA Database" },
    { name: "Metformin", details: "Oral medication used to treat type 2 diabetes", price: "$10.99", type: "Tablet", source: "FDA Database" },
    { name: "Atorvastatin", details: "Statin used to lower cholesterol levels", price: "$14.99", type: "Tablet", source: "FDA Database" },
    { name: "Levothyroxine", details: "Synthetic thyroid hormone for hypothyroidism", price: "$11.99", type: "Tablet", source: "FDA Database" },
    { name: "Xanax", details: "Benzodiazepine medication used to treat anxiety and panic disorders", price: "$24.99", type: "Tablet", source: "FDA Database" },
    { name: "Prozac", details: "SSRI antidepressant medication", price: "$18.99", type: "Capsule", source: "FDA Database" },
    { name: "Lipitor", details: "Brand name for atorvastatin, used to lower cholesterol", price: "$45.99", type: "Tablet", source: "FDA Database" },
    { name: "Advil", details: "Brand name for ibuprofen, anti-inflammatory pain reliever", price: "$9.99", type: "Tablet", source: "FDA Database" },
    { name: "Tylenol", details: "Brand name for acetaminophen, pain reliever and fever reducer", price: "$7.99", type: "Tablet", source: "FDA Database" },
    { name: "Adderall", details: "CNS stimulant used to treat ADHD and narcolepsy", price: "$38.99", type: "Tablet", source: "FDA Database" },
    { name: "Zyrtec", details: "Antihistamine for allergy symptoms", price: "$15.99", type: "Tablet", source: "FDA Database" },
    { name: "Claritin", details: "Non-drowsy antihistamine for allergies", price: "$12.99", type: "Tablet", source: "FDA Database" },
    { name: "Viagra", details: "Medication for erectile dysfunction", price: "$65.99", type: "Tablet", source: "FDA Database" },
    { name: "Cialis", details: "Treatment for erectile dysfunction and BPH", price: "$75.99", type: "Tablet", source: "FDA Database" },
    { name: "Metoprolol", details: "Beta blocker used to treat high blood pressure and chest pain", price: "$11.99", type: "Tablet", source: "FDA Database" },
    { name: "Hydrochlorothiazide", details: "Diuretic that treats fluid retention and high blood pressure", price: "$9.99", type: "Tablet", source: "FDA Database" },
    { name: "Prednisone", details: "Corticosteroid that treats inflammation and autoimmune conditions", price: "$8.99", type: "Tablet", source: "FDA Database" },
    { name: "Gabapentin", details: "Anti-seizure and nerve pain medication", price: "$14.99", type: "Capsule", source: "FDA Database" },
    { name: "Escitalopram", details: "SSRI for depression and generalized anxiety disorder", price: "$17.99", type: "Tablet", source: "FDA Database" },
    { name: "Sertraline", details: "SSRI for depression, OCD, and anxiety disorders", price: "$16.99", type: "Tablet", source: "FDA Database" },
    { name: "Amlodipine", details: "Calcium channel blocker for high blood pressure and coronary artery disease", price: "$10.99", type: "Tablet", source: "FDA Database" },
    { name: "Humira", details: "Biologic medication for rheumatoid arthritis and Crohn's disease", price: "$5,872.99", type: "Injectable", source: "FDA Database" },
    { name: "Ozempic", details: "Injectable medication for type 2 diabetes and weight management", price: "$892.99", type: "Injectable", source: "FDA Database" },
    { name: "Wegovy", details: "Injectable medication for chronic weight management", price: "$1,349.99", type: "Injectable", source: "FDA Database" },
    { name: "Mounjaro", details: "Injectable medication for type 2 diabetes", price: "$1,023.99", type: "Injectable", source: "FDA Database" },
    { name: "Botox", details: "Injectable neurotoxin used for wrinkles, migraines, and muscle spasms", price: "$300-600 per area", type: "Injectable", source: "FDA Database" },
    { name: "Juvederm", details: "Injectable dermal filler for wrinkles and volume loss", price: "$500-800 per syringe", type: "Injectable Gel", source: "FDA Database" },
    { name: "Restylane", details: "Hyaluronic acid filler for wrinkles and facial volume", price: "$400-700 per syringe", type: "Injectable Gel", source: "FDA Database" }
  ];

  // Med Spa fallbacks
  const medSpaFallbacks = [
    { name: "Serenity Med Spa", details: "Full-service medical spa offering botox, fillers, and laser treatments", price: "$$", type: "Med Spa", source: "Healthcare Directory", phone: "+1-555-123-4567", address: "123 Main St, New York, NY 10001", rating: 4.8 },
    { name: "Rejuvenation Wellness", details: "Specializing in anti-aging treatments and skin rejuvenation", price: "$$$", type: "Med Spa", source: "Healthcare Directory", phone: "+1-555-987-6543", address: "456 Oak Ave, Los Angeles, CA 90001", rating: 4.7 },
    { name: "Elite Aesthetics", details: "Premium med spa with custom treatment plans and membership options", price: "$$$$", type: "Med Spa", source: "Healthcare Directory", phone: "+1-555-456-7890", address: "789 Pine Blvd, Chicago, IL 60007", rating: 4.9 },
    { name: "The Beauty Clinic", details: "Medical spa focusing on non-invasive cosmetic procedures", price: "$$", type: "Med Spa", source: "Healthcare Directory", phone: "+1-555-789-0123", address: "321 Maple Dr, Miami, FL 33101", rating: 4.6 },
    { name: "Botox & Beyond", details: "Specializing in injectable treatments and facials", price: "$$$", type: "Med Spa", source: "Healthcare Directory", phone: "+1-555-321-6549", address: "555 Market St, San Francisco, CA 94105", rating: 4.5 },
    { name: "LaserAway", details: "Nationwide chain offering laser hair removal and skin treatments", price: "$$$", type: "Med Spa", source: "Healthcare Directory", phone: "+1-555-444-3333", address: "777 Peachtree St, Atlanta, GA 30308", rating: 4.3 },
    { name: "Spa Radiance Medical", details: "Luxury medical spa with a full range of cosmetic treatments", price: "$$$$", type: "Med Spa", source: "Healthcare Directory", phone: "+1-555-777-8888", address: "999 Highland Dr, Dallas, TX 75201", rating: 4.9 },
    { name: "Pure Glow Medical Spa", details: "Specializing in skin rejuvenation and body contouring", price: "$$$", type: "Med Spa", source: "Healthcare Directory", phone: "+1-555-222-1111", address: "123 Broadway, Boston, MA 02116", rating: 4.7 },
    { name: "Eternal Youth Aesthetics", details: "Anti-aging focused medical spa with advanced treatments", price: "$$$$", type: "Med Spa", source: "Healthcare Directory", phone: "+1-555-999-8877", address: "888 Pike St, Seattle, WA 98101", rating: 4.8 },
    { name: "Flawless Face Med Spa", details: "Boutique medical spa specializing in facial rejuvenation", price: "$$$", type: "Med Spa", source: "Healthcare Directory", phone: "+1-555-123-9876", address: "456 Walnut St, Philadelphia, PA 19102", rating: 4.6 },
    { name: "SkinFix Medical Spa", details: "Focused on corrective skincare and medical-grade treatments", price: "$$", type: "Med Spa", source: "Healthcare Directory", phone: "+1-555-333-2222", address: "777 University Ave, Denver, CO 80202", rating: 4.5 },
    { name: "Glow Aesthetics", details: "Beauty bar offering injectables, facials, and body treatments", price: "$$", type: "Med Spa", source: "Healthcare Directory", phone: "+1-555-555-1212", address: "333 Lincoln Rd, Miami Beach, FL 33139", rating: 4.4 },
    { name: "Ideal Image", details: "National chain offering laser hair removal and body contouring", price: "$$$", type: "Med Spa", source: "Healthcare Directory", phone: "+1-555-777-2323", address: "111 Biscayne Blvd, Miami, FL 33132", rating: 4.2 },
    { name: "Ageless Beauty Institute", details: "Comprehensive anti-aging treatments and wellness services", price: "$$$", type: "Med Spa", source: "Healthcare Directory", phone: "+1-555-888-7766", address: "222 Michigan Ave, Chicago, IL 60601", rating: 4.7 }
  ];

  // Specialist fallbacks
  const specialistFallbacks = [
    { name: "Dr. Sarah Johnson", details: "Board-certified dermatologist specializing in cosmetic procedures", price: "Consultation: $200", type: "Specialist", source: "Medical Directory", phone: "+1-555-222-3333", address: "100 Medical Plaza, Boston, MA 02115", rating: 4.9 },
    { name: "Dr. Michael Chen", details: "Plastic surgeon with expertise in facial reconstruction and aesthetics", price: "Consultation: $250", type: "Specialist", source: "Medical Directory", phone: "+1-555-444-5555", address: "200 Health Center, San Francisco, CA 94107", rating: 4.8 },
    { name: "Dr. Emily Rodriguez", details: "Cosmetic dentist specializing in smile makeovers and veneers", price: "Consultation: $150", type: "Specialist", source: "Medical Directory", phone: "+1-555-666-7777", address: "300 Dental Lane, Austin, TX 78701", rating: 4.7 },
    { name: "Dr. Robert Williams", details: "Cardiologist specializing in preventive cardiology and heart disease", price: "Consultation: $275", type: "Specialist", source: "Medical Directory", phone: "+1-555-888-9999", address: "400 Heart Center, Chicago, IL 60607", rating: 4.9 },
    { name: "Dr. Jennifer Lee", details: "Endocrinologist focusing on hormone therapy and metabolic disorders", price: "Consultation: $225", type: "Specialist", source: "Medical Directory", phone: "+1-555-111-2222", address: "500 Hormone Way, New York, NY 10016", rating: 4.8 },
    { name: "Dr. David Brown", details: "Neurologist specializing in headache treatment and nerve disorders", price: "Consultation: $240", type: "Specialist", source: "Medical Directory", phone: "+1-555-333-4444", address: "600 Brain Ave, Philadelphia, PA 19104", rating: 4.7 },
    { name: "Dr. Lisa Martinez", details: "Gynecologist specializing in women's health and hormone management", price: "Consultation: $190", type: "Specialist", source: "Medical Directory", phone: "+1-555-555-6666", address: "700 Women's Health Blvd, Atlanta, GA 30309", rating: 4.8 },
    { name: "Dr. James Wilson", details: "Orthopedic surgeon focusing on sports medicine and joint replacements", price: "Consultation: $260", type: "Specialist", source: "Medical Directory", phone: "+1-555-777-8888", address: "800 Joint Center, Denver, CO 80206", rating: 4.9 },
    { name: "Dr. Patricia Taylor", details: "Allergist and immunologist treating allergies and immune disorders", price: "Consultation: $180", type: "Specialist", source: "Medical Directory", phone: "+1-555-999-0000", address: "900 Allergy Lane, Miami, FL 33136", rating: 4.6 },
    { name: "Dr. Kevin Patel", details: "Gastroenterologist specializing in digestive disorders and nutrition", price: "Consultation: $210", type: "Specialist", source: "Medical Directory", phone: "+1-555-222-1111", address: "1000 Digestive Drive, Houston, TX 77030", rating: 4.7 }
  ];

  // Pharmacy fallbacks
  const pharmacyFallbacks = [
    { name: "MedExpress Pharmacy", details: "24-hour pharmacy with prescription delivery service", price: "Varies", type: "Pharmacy", source: "Pharmacy Directory", phone: "+1-555-123-4567", address: "123 Health St, New York, NY 10001", rating: 4.5 },
    { name: "CVS Pharmacy", details: "National chain pharmacy with in-store clinic services", price: "Varies", type: "Pharmacy", source: "Pharmacy Directory", phone: "+1-555-987-6543", address: "456 Wellness Ave, Los Angeles, CA 90001", rating: 4.2 },
    { name: "Walgreens", details: "Pharmacy chain with 24-hour locations and drive-through service", price: "Varies", type: "Pharmacy", source: "Pharmacy Directory", phone: "+1-555-234-5678", address: "789 Medication Blvd, Chicago, IL 60007", rating: 4.3 },
    { name: "Rite Aid", details: "Pharmacy offering prescription services and health products", price: "Varies", type: "Pharmacy", source: "Pharmacy Directory", phone: "+1-555-345-6789", address: "321 Pill Lane, Philadelphia, PA 19101", rating: 4.0 },
    { name: "Walmart Pharmacy", details: "Discount pharmacy with $4 generic medication program", price: "Varies", type: "Pharmacy", source: "Pharmacy Directory", phone: "+1-555-456-7890", address: "111 Retail Road, Houston, TX 77001", rating: 4.1 },
    { name: "Target Pharmacy", details: "In-store pharmacy with online refill ordering", price: "Varies", type: "Pharmacy", source: "Pharmacy Directory", phone: "+1-555-567-8901", address: "222 Shop Circle, Miami, FL 33101", rating: 4.2 },
    { name: "Publix Pharmacy", details: "Grocery store pharmacy with free medication programs", price: "Varies", type: "Pharmacy", source: "Pharmacy Directory", phone: "+1-555-678-9012", address: "333 Market Street, Atlanta, GA 30301", rating: 4.6 },
    { name: "Kroger Pharmacy", details: "Supermarket pharmacy with loyalty discount program", price: "Varies", type: "Pharmacy", source: "Pharmacy Directory", phone: "+1-555-789-0123", address: "444 Grocery Way, Cincinnati, OH 45201", rating: 4.3 },
    { name: "Costco Pharmacy", details: "Membership warehouse pharmacy with discounted pricing", price: "Varies", type: "Pharmacy", source: "Pharmacy Directory", phone: "+1-555-890-1234", address: "555 Wholesale Drive, Seattle, WA 98101", rating: 4.7 },
    { name: "Sam's Club Pharmacy", details: "Members-only warehouse pharmacy with savings program", price: "Varies", type: "Pharmacy", source: "Pharmacy Directory", phone: "+1-555-901-2345", address: "666 Club Road, Dallas, TX 75201", rating: 4.4 }
  ];

  // Unified search function with comprehensive search capabilities
  const searchWithContext = useCallback(async (query: string, searchType?: string): Promise<UnifiedSearchResult[]> => {
    if (!query.trim()) return [];
    
    setLoading(true);
    setState(prev => ({ ...prev, lastError: null }));
    
    try {
      console.log(`Advanced search beginning for: "${query}" with type: ${searchType || 'auto'}`);
      
      // Advanced query analysis
      const queryLower = query.toLowerCase();
      
      // Determine search type based on keywords and patterns
      const patternAnalysis = {
        // Location patterns
        location: /\b(in|near|at|around)\b\s+([a-zA-Z\s]+)|\b\d{5}\b|\bzip\s+\d{5}\b|\bin\s+[a-z]{2}\b|\bstate\s+of\s+[a-z\s]+\b|\bcity\s+of\s+[a-z\s]+\b|\bprovince\s+of\s+[a-z\s]+\b/i.test(queryLower),
        
        // Pharmacy patterns
        pharmacy: /pharma(c|s|cy|cies)|drug\s?store|chemist|apothe(c|k)|dispensary|prescription|refill|rx|meds|medication store/i.test(queryLower),
        
        // Med spa patterns
        medSpa: /med\s*spa|medi\s*spa|med-spa|spa|cosmetic|aesthetic|beauty|salon|wellness|massage|facial|botox|filler|injection|laser|skin|treatment|rejuvenation|wellness\s*center|beauty\s*clinic|day\s*spa|medical\s*spa|anti(\s|-)?aging|skin\s*care|dermatology\s*clinic/i.test(queryLower),
        
        // Specialist patterns
        specialist: /doctor|physician|specialist|md|practitioner|surgeon|neurologist|cardiologist|dermatologist|pediatrician|therapist|clinician|provider|professional|expert|consultant|dentist|orthodontist/i.test(queryLower),
        
        // Phone number patterns
        phone: /phone|call|contact|telephone|dial|number/.test(queryLower) || /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(queryLower),
        
        // Symptom patterns
        symptom: /symptom|pain|ache|fever|cough|headache|nausea|dizziness|check|diagnose|hurt|sore|suffering|experiencing/.test(queryLower),
        
        // Medication patterns
        medication: /drug|medicine|pill|capsule|tablet|prescription|dose|dosage|take|medication|antibiotic|painkiller|treatment/.test(queryLower),
        
        // Injection/injectable patterns
        injection: /injection|injectable|shot|botox|filler|needle|syringe|iv|intravenous|juvederm|restylane|dysport|xeomin/.test(queryLower)
      };
      
      console.log("Query pattern analysis:", patternAnalysis);
      
      // Extract location information if present
      const locationMatch = queryLower.match(/\b(in|near|at|around)\b\s+([a-zA-Z\s]+)/);
      const locationInfo = locationMatch ? locationMatch[2].trim() : '';
      
      // Get recent context from history for continuity in conversation
      const recentContext = state.history
        .slice(-3)
        .map(item => `${item.query} - ${item.context}`)
        .join('\n');

      // Determine search priority based on analysis and explicit searchType
      let searchPriority: SearchResultType[] = [];
      
      // If searchType is explicitly provided, prioritize that type
      if (searchType) {
        switch (searchType.toLowerCase()) {
          case 'pharmacy':
          case 'pharmacies':
            searchPriority = ['Pharmacy', 'Medication', 'Med Spa', 'Specialist'];
            break;
          case 'medspa':
          case 'med spa':
          case 'medspas':
          case 'med spas':
            searchPriority = ['Med Spa', 'Specialist', 'Pharmacy', 'Medication'];
            break;
          case 'medication':
          case 'medications':
          case 'drug':
          case 'drugs':
            searchPriority = ['Medication', 'Pharmacy', 'Specialist', 'Med Spa'];
            break;
          case 'specialist':
          case 'specialists':
          case 'doctor':
          case 'doctors':
            searchPriority = ['Specialist', 'Med Spa', 'Pharmacy', 'Medication'];
            break;
          default:
            // Automatic priority determination
            searchPriority = determineSearchPriority(patternAnalysis);
        }
      } else {
        // Automatic priority determination
        searchPriority = determineSearchPriority(patternAnalysis);
      }
      
      console.log("Search priority:", searchPriority);
      
      // Combined results array
      let results: UnifiedSearchResult[] = [];
      
      // Handle pharmacy and med spa location searches using the pharmacy search utility
      if ((patternAnalysis.pharmacy || patternAnalysis.medSpa) && 
          (patternAnalysis.location || patternAnalysis.phone)) {
        console.log("Using enhanced location/phone search for pharmacy/med spa");
        
        // Pass the full query to get more accurate results
        const pharmacyResults = intelligentPharmacySearch(query, language);
        
        if (pharmacyResults && pharmacyResults.length > 0) {
          // Format results for consistency
          const formattedResults = pharmacyResults.map(pharmacy => ({
            name: pharmacy.name,
            details: `${pharmacy.address} - ${pharmacy.hours || 'Hours vary'} - ${pharmacy.phone}`,
            price: pharmacy.chain || "Independent",
            type: patternAnalysis.medSpa ? "Med Spa" : "Pharmacy",
            source: pharmacy.distance ? `Distance: ${pharmacy.distance}` : "Healthcare Directory",
            phone: pharmacy.phone,
            address: pharmacy.address,
            rating: pharmacy.rating || 4.0
          }));
          
          results = [...results, ...formattedResults];
        }
      }
      
      // If we still need more results, try the AI service
      if (results.length === 0) {
        try {
          // Use the centralized AI service
          const systemPrompt = 'Analyze the query and provide relevant medical information. Return structured data only in this JSON format: {"results": [{"name": "Name", "details": "Description", "price": "Price if applicable", "type": "Category", "source": "Source", "phone": "Phone if applicable", "address": "Address if applicable"}]}';
          
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
              
              const aiResults = parsedData.results || [];
              
              if (Array.isArray(aiResults) && aiResults.length > 0) {
                // Post-process results for consistency
                const formattedAiResults = aiResults.map(result => ({
                  name: result.name || "Unknown",
                  details: result.details || "No details available",
                  price: result.price || "Price unavailable",
                  type: result.type || "Unknown",
                  source: result.source || "Medical Database",
                  phone: result.phone || undefined,
                  address: result.address || undefined,
                  rating: result.rating || undefined
                }));
                
                results = [...results, ...formattedAiResults];
              }
            } catch (parseError) {
              console.error("Error parsing AI response:", parseError);
              // Continue with fallback data
            }
          }
        } catch (aiError) {
          console.error("AI service error:", aiError);
          // Continue with fallback data
        }
      }
      
      // If we still need more results, use fallback data based on search priority
      if (results.length === 0) {
        console.log("Using fallback data for search");
        
        // Generate results based on search priority
        for (const priority of searchPriority) {
          if (results.length >= 10) break; // Limit to 10 results
          
          let fallbackResults: UnifiedSearchResult[] = [];
          
          switch (priority) {
            case 'Medication':
              fallbackResults = filterFallbackData(medicationFallbacks, queryLower);
              break;
            case 'Med Spa':
              fallbackResults = filterFallbackData(medSpaFallbacks, queryLower);
              break;
            case 'Specialist':
              fallbackResults = filterFallbackData(specialistFallbacks, queryLower);
              break;
            case 'Pharmacy':
              fallbackResults = filterFallbackData(pharmacyFallbacks, queryLower);
              break;
            default:
              // Mix of different types
              fallbackResults = [
                ...filterFallbackData(medicationFallbacks, queryLower, 2),
                ...filterFallbackData(medSpaFallbacks, queryLower, 2),
                ...filterFallbackData(specialistFallbacks, queryLower, 2),
                ...filterFallbackData(pharmacyFallbacks, queryLower, 2)
              ];
          }
          
          // Add fallback results, avoiding duplicates
          for (const result of fallbackResults) {
            if (!results.some(r => r.name === result.name)) {
              results.push(result);
            }
          }
        }
      }
      
      // Update search history
      setState(prev => ({
        ...prev,
        history: [
          ...prev.history,
          {
            query,
            context: results.length > 0 
              ? results.map(r => r.name).join(", ") 
              : "No relevant results",
            results: results,
            timestamp: new Date()
          }
        ].slice(-10) // Keep last 10 searches
      }));

      console.log("Final search results:", results);
      return results;
    } catch (error) {
      console.error('Search system error:', error);
      
      // Set the error state
      setState(prev => ({ 
        ...prev, 
        lastError: error instanceof Error ? error.message : 'Unknown search error' 
      }));
      
      // Show error toast
      uiToast({
        title: t("search.error.title", "Search Error"),
        description: t("search.error.description", "Failed to perform search. Please try again."),
        variant: "destructive"
      });
      
      // Return emergency fallback results
      return medicationFallbacks.slice(0, 5);
    } finally {
      setLoading(false);
    }
  }, [state.history, uiToast, t, language, medicationFallbacks, medSpaFallbacks, specialistFallbacks, pharmacyFallbacks]);
  
  // Helper function to determine search priority based on query analysis
  function determineSearchPriority(analysis: Record<string, boolean>): SearchResultType[] {
    // Starting with a base priority list
    const priority: SearchResultType[] = ['Medication', 'Pharmacy', 'Med Spa', 'Specialist', 'Condition', 'Other'];
    
    // Reorder based on analysis
    if (analysis.medSpa) {
      // Med spa search takes highest priority
      return ['Med Spa', 'Specialist', 'Pharmacy', 'Medication', 'Condition', 'Other'];
    } else if (analysis.pharmacy) {
      // Pharmacy search takes highest priority
      return ['Pharmacy', 'Medication', 'Med Spa', 'Specialist', 'Condition', 'Other'];
    } else if (analysis.specialist) {
      // Specialist search takes highest priority
      return ['Specialist', 'Med Spa', 'Pharmacy', 'Medication', 'Condition', 'Other'];
    } else if (analysis.symptom) {
      // Symptom search prioritizes conditions and specialists
      return ['Condition', 'Specialist', 'Medication', 'Pharmacy', 'Med Spa', 'Other'];
    } else if (analysis.injection) {
      // Injectable searches prioritize med spas and specialists
      return ['Med Spa', 'Specialist', 'Medication', 'Pharmacy', 'Condition', 'Other'];
    } else if (analysis.medication) {
      // Medication searches prioritize medications and pharmacies
      return ['Medication', 'Pharmacy', 'Specialist', 'Med Spa', 'Condition', 'Other'];
    }
    
    // Default priority
    return priority;
  }
  
  // Helper function to filter fallback data based on search terms
  function filterFallbackData(
    data: UnifiedSearchResult[], 
    searchTerm: string, 
    limit: number = 10
  ): UnifiedSearchResult[] {
    // Filter data that matches the search term
    const matchedResults = data.filter(item => 
      item.name.toLowerCase().includes(searchTerm) || 
      item.details.toLowerCase().includes(searchTerm) ||
      item.type.toLowerCase().includes(searchTerm) ||
      (item.address && item.address.toLowerCase().includes(searchTerm))
    );
    
    // If we found matches, return them (up to the limit)
    if (matchedResults.length > 0) {
      return matchedResults.slice(0, limit);
    }
    
    // If no matches, return a subset of the data
    return data
      .sort(() => 0.5 - Math.random()) // Randomize the results
      .slice(0, limit);
  }

  return (
    <MedicalSearchContext.Provider value={{
      searchWithContext,
      searchHistory: state.history,
      loading,
      error: state.lastError,
      clearError
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
