
import React from 'react';
import { Link } from 'react-router-dom';
import { SearchResult } from '@/services/SearchService';
import { MedicationCardWrapper } from '@/components/MedicationCardWrapper';
import { Button } from '@/components/ui/button';
import { X, BadgeInfo, Star, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  error?: Error | null;
  onRemoveResult?: (index: number) => void;
  searchQuery: string;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  isLoading,
  error,
  onRemoveResult,
  searchQuery
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-8 mb-8 bg-card/50 rounded-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 mx-auto bg-gray-200 rounded"></div>
          <div className="h-4 w-48 mx-auto bg-gray-200 rounded"></div>
          <div className="h-4 w-64 mx-auto bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 mb-8 bg-destructive/10 rounded-lg">
        <p className="text-destructive">Error: {error.message}</p>
      </div>
    );
  }

  if (results.length === 0 && searchQuery) {
    return (
      <div className="flex flex-col items-center py-12 mb-8 bg-card/50 rounded-lg">
        <BadgeInfo className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">
          No results found matching "{searchQuery}"
        </p>
        <p className="text-gray-400 mt-2">
          Try different keywords or check your spelling.
        </p>
      </div>
    );
  }

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    const type = result.type || 'Other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  // Determine if we should show grouped mode (more than one type of results)
  const hasMultipleTypes = Object.keys(groupedResults).length > 1;

  return (
    <div>
      {hasMultipleTypes ? (
        // Display results grouped by category
        Object.entries(groupedResults).map(([type, typeResults]) => (
          <div key={type} className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-primary flex items-center">
              {type === 'Specialist' && <Stethoscope className="h-5 w-5 mr-2" />}
              {type === 'Pharmacy' && <MapPin className="h-5 w-5 mr-2" />}
              {type === 'Med Spa' && <Star className="h-5 w-5 mr-2" />}
              {type === 'Other' && <Clock className="h-5 w-5 mr-2" />}
              {type}
              <Badge variant="outline" className="ml-2">{typeResults.length}</Badge>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {typeResults.map((result, index) => {
                const originalIndex = results.findIndex(r => r.id === result.id);
                
                return (
                  <Card 
                    key={`${type}-${result.id || index}`} 
                    className="relative overflow-hidden bg-[#F1F0FB] border-gray-200 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="p-1">
                      <Link 
                        to={
                          result.type === 'Pharmacy' || result.type === 'Med Spa'
                            ? `/pharmacy-finder?name=${encodeURIComponent(result.name)}`
                            : result.type === 'Specialist'
                            ? `/symptom-checker?specialist=${encodeURIComponent(result.name)}`
                            : `/medication/${result.id}`
                        }
                        className="block"
                      >
                        <MedicationCardWrapper
                          name={result.name}
                          details={result.details}
                          price={result.price || ''}
                          type={result.type}
                          source={result.source}
                          phone={result.phone}
                          address={result.address}
                          isRecommended={result.relevanceScore !== undefined && result.relevanceScore > 8}
                        />
                      </Link>
                    </div>
                    
                    {onRemoveResult && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 z-10 bg-white rounded-full shadow-sm hover:bg-gray-100"
                        onClick={() => onRemoveResult(originalIndex)}
                        aria-label="Remove result"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      ) : (
        // Single type display
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((result, index) => (
            <Card 
              key={result.id || index} 
              className="relative overflow-hidden bg-[#F1F0FB] border-gray-200 shadow-sm hover:shadow-md transition-all"
            >
              <div className="p-1">
                <Link 
                  to={
                    result.type === 'Pharmacy' || result.type === 'Med Spa'
                      ? `/pharmacy-finder?name=${encodeURIComponent(result.name)}`
                      : result.type === 'Specialist'
                      ? `/symptom-checker?specialist=${encodeURIComponent(result.name)}`
                      : `/medication/${result.id}`
                  }
                  className="block"
                >
                  <MedicationCardWrapper
                    name={result.name}
                    details={result.details}
                    price={result.price || ''}
                    type={result.type}
                    source={result.source}
                    phone={result.phone}
                    address={result.address}
                    isRecommended={result.relevanceScore !== undefined && result.relevanceScore > 8}
                  />
                </Link>
              </div>
              
              {onRemoveResult && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10 bg-white rounded-full shadow-sm hover:bg-gray-100"
                  onClick={() => onRemoveResult(index)}
                  aria-label="Remove result"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
