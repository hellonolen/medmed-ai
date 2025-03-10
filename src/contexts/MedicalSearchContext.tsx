
import React, { createContext, useContext, useCallback } from 'react';
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
}

const MedicalSearchContext = createContext<MedicalSearchContextType | undefined>(undefined);

export const MedicalSearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = React.useState<SearchState>({ history: [] });
  const { toast } = useToast();
  const { t } = useLanguage();

  const searchWithContext = useCallback(async (query: string) => {
    try {
      // Get recent context from history
      const recentContext = state.history
        .slice(-3)
        .map(item => `${item.query} - ${item.context}`)
        .join('\n');

      // Call Perplexity API for intelligent search
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY || window.localStorage.getItem('PERPLEXITY_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a medical search assistant. Analyze the query and previous context to determine the most relevant medical information, medications, specialists, or conditions. Return structured data only.'
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
        throw new Error('Search failed');
      }

      const data = await response.json();
      
      // Extract and structure the results
      const searchResults = data.choices[0].message.content;
      
      // Update search history with new context
      setState(prev => ({
        history: [
          ...prev.history,
          {
            query,
            context: searchResults.summary || '',
            results: searchResults.results || []
          }
        ].slice(-10) // Keep last 10 searches
      }));

      return searchResults.results;
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: t("search.error.title", "Search Error"),
        description: t("search.error.description", "Failed to perform search. Please try again."),
        variant: "destructive"
      });
      return [];
    }
  }, [state.history, toast, t]);

  return (
    <MedicalSearchContext.Provider value={{
      searchWithContext,
      searchHistory: state.history
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
