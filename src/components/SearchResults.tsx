
import React from 'react';
import { Link } from 'react-router-dom';
import { SearchResult } from '@/services/SearchService';
import { MedicationCardWrapper } from '@/components/MedicationCardWrapper';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

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
        <p className="text-gray-500">Searching...</p>
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
      <div className="text-center py-8 mb-8 bg-card/50 rounded-lg">
        <p className="text-gray-500">
          No results found matching your search. Try different keywords.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
          
          {result.relevanceScore !== undefined && result.relevanceScore > 5 && (
            <Badge className="absolute top-2 left-2 z-10" variant="secondary">
              Best Match
            </Badge>
          )}
        </Card>
      ))}
    </div>
  );
};
