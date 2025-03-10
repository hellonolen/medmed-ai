import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSearchHistory } from '@/contexts/SearchHistoryContext';
import { MedicationCardWrapper } from '@/components/MedicationCardWrapper';
import { Sparkles, History } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdmin } from '@/contexts/AdminContext';
import { findMedicationsForQuery } from '@/utils/medicationMatcher';

export const RecommendationSystem = () => {
  const [recommendations, setRecommendations] = useState<Array<{ 
    name: string; 
    details: string; 
    price: string;
    type?: string;
    source?: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { searchHistory } = useSearchHistory();
  const { t } = useLanguage();
  const { isAdmin } = useAdmin();

  useEffect(() => {
    const generateRecommendations = async () => {
      setIsLoading(true);
      
      try {
        // Skip if there's no search history
        if (searchHistory.length === 0) {
          setRecommendations([]);
          setIsLoading(false);
          return;
        }
        
        // Get the last 3 searches to base recommendations on
        const recentSearches = searchHistory
          .slice(0, 3)
          .map(item => item.query);
          
        // Analyze search terms to find common themes
        const searchTerms = recentSearches.join(' ').toLowerCase();
        const words = searchTerms.split(/\s+/);
        
        // Remove common words and keep only significant terms
        const significantTerms = words
          .filter(word => word.length > 3)
          .filter(word => !['with', 'from', 'what', 'when', 'where', 'how'].includes(word));
          
        // Get a random significant term or use the most recent search
        const term = significantTerms.length > 0
          ? significantTerms[Math.floor(Math.random() * significantTerms.length)]
          : recentSearches[0];
          
        // Get recommendations based on the term
        const recommendedMeds = await findMedicationsForQuery(term);
        
        // Limit to 2 different medications
        const uniqueMeds = recommendedMeds
          .filter((med, index, self) => 
            index === self.findIndex(m => m.name === med.name)
          )
          .slice(0, 2);
        
        setRecommendations(uniqueMeds.map(med => ({
          name: med.name,
          details: med.details,
          price: med.price,
          type: med.type,
          source: med.source
        })));
      } catch (error) {
        console.error("Error generating recommendations:", error);
        setRecommendations([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    generateRecommendations();
  }, [searchHistory]);
  
  // Don't show anything if we have no recommendations
  if (recommendations.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="mb-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {t("recommendations.title", "Recommended for you")}
        </h2>
        
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <span className="text-sm text-gray-600">
            {t("recommendations.based_on", "Based on your recent searches")}
          </span>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="bg-card/40 rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-muted rounded-md w-3/4 mb-4"></div>
              <div className="h-4 bg-muted rounded-md w-full mb-2"></div>
              <div className="h-4 bg-muted rounded-md w-5/6"></div>
            </div>
          ))}
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((recommendation, index) => (
            <Link 
              key={index} 
              to={`/medication/rec-${index}`}
              className="transition-transform hover:scale-[1.02]"
            >
              <MedicationCardWrapper
                name={recommendation.name}
                details={recommendation.details}
                price={isAdmin ? recommendation.price : t("medication.price", "Login to see pricing")}
                type={recommendation.type}
                source={recommendation.source}
                isRecommended={true}
              />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-card/50 rounded-lg">
          <p className="text-gray-500">
            {t("recommendations.no_history", "Search for medications to get personalized recommendations")}
          </p>
        </div>
      )}
    </div>
  );
};
