
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EnhancedSearchBar } from '@/components/EnhancedSearchBar';
import { SearchResults } from '@/components/SearchResults';
import { Card, CardContent } from '@/components/ui/card';
import { SearchParams, SearchResult, searchService } from '@/services/SearchService';
import { Badge } from '@/components/ui/badge';
import { Search, Globe } from 'lucide-react';
import Layout from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { toast } = useToast();
  
  const handleSearch = async (params: SearchParams) => {
    setSearchQuery(params.query);
    
    if (!params.query || params.query.trim().length < 2) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const searchResults = await searchService.searchAll(params);
      setResults(searchResults);
      
      if (searchResults.length === 0) {
        toast({
          title: "No results found",
          description: "Try different keywords or categories",
          variant: "default",
        });
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      
      toast({
        title: "Search Error",
        description: err instanceof Error ? err.message : "Failed to perform search",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const removeResult = (index: number) => {
    setResults(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Search MedMed.AI</h1>
          
          <div className="mb-8">
            <EnhancedSearchBar 
              onSearch={handleSearch} 
              initialQuery={initialQuery}
            />
          </div>
          
          {(results.length > 0 || isLoading || (error && searchQuery)) && (
            <Card className="mb-6 overflow-hidden search-results-container">
              <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-primary" />
                  <h2 className="text-xl font-semibold">
                    {searchQuery ? `Search Results for "${searchQuery}"` : "Search Results"}
                  </h2>
                </div>
                <Badge variant="outline" className="flex items-center text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  {results.length} results
                </Badge>
              </div>
              
              <CardContent className="p-4">
                <SearchResults 
                  results={results}
                  isLoading={isLoading}
                  error={error}
                  onRemoveResult={removeResult}
                  searchQuery={searchQuery}
                />
              </CardContent>
            </Card>
          )}
          
          {!isLoading && !error && results.length === 0 && searchQuery && (
            <div className="text-center py-8 mb-8 bg-card/50 rounded-lg">
              <p className="text-gray-500">
                No results found matching your search. Try different keywords.
              </p>
            </div>
          )}
          
          {!searchQuery && (
            <div className="text-center py-8 mb-8 bg-secondary/50 rounded-lg">
              <p className="text-gray-600">
                Enter a search term to find medications, specialists, or medical conditions.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SearchPage;
