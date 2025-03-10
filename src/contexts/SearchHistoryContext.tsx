
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface SearchHistoryItem {
  query: string;
  resultsCount: number;
  timestamp: number;
}

interface SearchHistoryContextType {
  searchHistory: SearchHistoryItem[];
  addSearchToHistory: (query: string, resultsCount: number) => void;
  clearSearchHistory: () => void;
}

const SearchHistoryContext = createContext<SearchHistoryContextType | undefined>(undefined);

const STORAGE_KEY = "medmed_search_history";

export function SearchHistoryProvider({ children }: { children: ReactNode }) {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  // Load search history from localStorage on initial render
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY);
      if (savedHistory) {
        setSearchHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Error loading search history:", error);
      // If there's an error loading, start with empty history
      setSearchHistory([]);
    }
  }, []);

  // Save to localStorage whenever history changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searchHistory));
    } catch (error) {
      console.error("Error saving search history:", error);
    }
  }, [searchHistory]);

  const addSearchToHistory = (query: string, resultsCount: number) => {
    if (!query.trim()) return; // Don't record empty searches
    
    const newItem: SearchHistoryItem = {
      query: query.trim(),
      resultsCount,
      timestamp: Date.now()
    };
    
    setSearchHistory(prev => [newItem, ...prev].slice(0, 100)); // Keep last 100 searches
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
  };

  return (
    <SearchHistoryContext.Provider 
      value={{ searchHistory, addSearchToHistory, clearSearchHistory }}
    >
      {children}
    </SearchHistoryContext.Provider>
  );
}

export function useSearchHistory() {
  const context = useContext(SearchHistoryContext);
  if (context === undefined) {
    throw new Error("useSearchHistory must be used within a SearchHistoryProvider");
  }
  return context;
}
