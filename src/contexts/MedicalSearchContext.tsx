
import React, { createContext, useContext, useCallback, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { toast } = useToast();
  const { t } = useLanguage();

  // Mock data for specialists and medications when API is not available
  const fallbackResults = [
    { name: "Amoxicillin", details: "Antibiotic used to treat bacterial infections", price: "$12.99", type: "Tablet", source: "FDA Database" },
    { name: "Ibuprofen", details: "NSAID used to treat pain and inflammation", price: "$8.99", type: "Tablet", source: "FDA Database" },
    { name: "Lisinopril", details: "ACE inhibitor used to treat high blood pressure", price: "$15.99", type: "Tablet", source: "FDA Database" }
  ];

  const searchWithContext = useCallback(async (query: string) => {
    if (!query.trim()) return [];
    
    setLoading(true);
    try {
      // Check if query appears to be looking for pharmacy locations
      const isPharmacyLocationSearch = /pharma(c|s|cy|cies)|drug\s?store|location|near|in\s\w+/.test(query.toLowerCase());
      
      // If it looks like a pharmacy location search, we should let the pharmacy finder handle it
      if (isPharmacyLocationSearch) {
        // We'll still return some basic results and let the main search component
        // decide how to handle it (it will check for this pattern again)
        return [];
      }
      
      // Get recent context from history
      const recentContext = state.history
        .slice(-3)
        .map(item => `${item.query} - ${item.context}`)
        .join('\n');

      console.log("Searching with query:", query);
      console.log("Using context:", recentContext);
      
      // Check if Perplexity API key is available
      const apiKey = process.env.PERPLEXITY_API_KEY || window.localStorage.getItem('PERPLEXITY_API_KEY');
      
      let results = [];
      
      if (apiKey) {
        // Call Perplexity API for intelligent search
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-sonar-large-128k-online',
            messages: [
              {
                role: 'system',
                content: 'You are a medical search assistant. Analyze the query and previous context to determine the most relevant medical information, medications, specialists, or conditions. Return structured data only in the following JSON format: {"results": [{"name": "Medication/Specialist Name", "details": "Brief description", "price": "Price if applicable", "type": "Category or type", "source": "Data source"}]}'
              },
              {
                role: 'user',
                content: `Previous context:\n${recentContext}\n\nCurrent query: ${query}`
              }
            ],
            temperature: 0.2,
            max_tokens: 1000,
            return_search: true
          }),
        });

        if (!response.ok) {
          throw new Error(`Search failed with status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API response:", data);
        
        // Parse the content to extract results
        try {
          const content = data.choices[0].message.content;
          const parsedData = typeof content === 'string' 
            ? JSON.parse(content) 
            : content;
          
          results = parsedData.results || [];
          
          if (!Array.isArray(results)) {
            throw new Error("Invalid results format");
          }
        } catch (parseError) {
          console.error("Error parsing API response:", parseError);
          throw new Error("Invalid response format from API");
        }
      } else {
        console.log("No Perplexity API key found, using fallback data");
        // Use fallback data when API key is not available
        results = fallbackResults.filter(item => 
          item.name.toLowerCase().includes(query.toLowerCase()) || 
          item.details.toLowerCase().includes(query.toLowerCase())
        );
        
        // Add a short delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
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
      toast({
        title: t("search.error.title", "Search Error"),
        description: t("search.error.description", "Failed to perform search. Please try again."),
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [state.history, toast, t, fallbackResults]);

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
