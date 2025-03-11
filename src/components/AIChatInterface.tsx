
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, User, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { aiService } from '@/services/AIService';
import { VoiceSearchButton } from './VoiceSearchButton';
import { useNavigate } from 'react-router-dom';
import { useMedicalSearch } from '@/contexts/MedicalSearchContext';
import { AccessibilityPanel } from './AccessibilityPanel';

interface Message {
  content: string;
  type: 'ai' | 'user' | 'error';
  timestamp: Date;
}

interface SearchResult {
  name: string;
  details: string;
  price: string;
  type?: string;
  source?: string;
  phone?: string;
  address?: string;
}

export const AIChatInterface = ({ 
  onSearch 
}: { 
  onSearch: (query: string, results: SearchResult[]) => void 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { searchWithContext, loading: isSearching } = useMedicalSearch();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length === 0) {
      const initialMessage = {
        content: "How can I help you with your healthcare search today?",
        type: 'ai' as const,
        timestamp: new Date()
      };
      setMessages([initialMessage]);
    }
  }, [messages.length, t]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      content: inputValue,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Parse what kind of search we might be doing based on keywords
      const normalizedInput = inputValue.toLowerCase();
      
      // Detect pharmacy/med spa searches for potential redirection
      const isPharmacySearch = /pharmacy|drugstore|chemist|near|around|locate/.test(normalizedInput);
      const isMedSpaSearch = /med\s*spa|medi\s*spa|med-spa|spa|cosmetic|aesthetic|beauty/.test(normalizedInput);
      const isLocationSearch = /in|near|at|around/.test(normalizedInput) && /[a-zA-Z]+/.test(normalizedInput);
      
      // Use the centralized medical search context
      const searchResults = await searchWithContext(inputValue);
      
      // Pass search results to the parent component
      onSearch(inputValue, searchResults);
      
      // Special handling for location-based searches
      if ((isPharmacySearch || isMedSpaSearch) && isLocationSearch) {
        // Check if it's a clear request for the pharmacy/med spa finder
        const hasSearchIntent = /find|locate|list|show|search|where|what/.test(normalizedInput);
        
        if (hasSearchIntent) {
          // Add message before redirecting
          const redirectMessage: Message = {
            content: t("ai.redirect", `Taking you to search results for ${isMedSpaSearch ? 'med spas' : 'pharmacies'}...`),
            type: 'ai',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, redirectMessage]);
          
          // Redirect with a slight delay so user sees the message
          setTimeout(() => {
            navigate(`/pharmacy-finder?query=${encodeURIComponent(inputValue)}`);
          }, 1000);
          
          setIsTyping(false);
          return;
        }
      }

      // Process AI response - with improved error handling
      try {
        const response = await aiService.getHealthAdvice(inputValue);
        
        if (response.success) {
          const aiMessage: Message = {
            content: response.content,
            type: 'ai',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
        } else {
          throw new Error('AI service error');
        }
      } catch (aiError) {
        console.error('AI Chat Error:', aiError);
        
        // Add a fallback AI response that includes search results
        let fallbackResponse = t("ai.error.with_results", 
          "I found these results for you while my answering system is being updated:");
        
        if (searchResults.length > 0) {
          const topResults = searchResults.slice(0, 3);
          fallbackResponse += "\n\n" + topResults.map(r => 
            `• ${r.name}: ${r.details}`
          ).join("\n");
        } else {
          fallbackResponse = t("ai.error", 
            "I apologize, but I'm having trouble processing that. Could you try rephrasing your question?");
        }
        
        const errorMessage: Message = {
          content: fallbackResponse,
          type: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Search system error:', error);
      
      // Add error message
      const errorMessage: Message = {
        content: t("search.error", "I'm sorry, but I encountered an error with the search system. Please try again."),
        type: 'error',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast.error(t("search.error.toast", "Search system error. Please try again."));
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceResult = (text: string) => {
    if (text) {
      setInputValue(text);
      const syntheticEvent = {
        preventDefault: () => {}
      } as React.FormEvent;
      handleSubmit(syntheticEvent);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="h-[200px] overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-2 ${
              message.type === 'user' ? 'items-start flex-row-reverse' : 'items-start'
            }`}
          >
            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
              message.type === 'ai' ? 'bg-primary/10' : 
              message.type === 'error' ? 'bg-destructive/10' : 'bg-secondary'
            }`}>
              {message.type === 'ai' ? (
                <MessageCircle className="h-4 w-4 text-primary" />
              ) : message.type === 'error' ? (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <div className={`rounded-lg px-4 py-2 max-w-[80%] ${
              message.type === 'ai' 
                ? 'bg-primary/10 text-foreground' 
                : message.type === 'error'
                ? 'bg-destructive/10 text-destructive-foreground'
                : 'bg-secondary text-secondary-foreground'
            }`}>
              {message.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2 items-start">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-primary" />
            </div>
            <div className="rounded-lg px-4 py-2 bg-primary/10 text-foreground">
              <span className="inline-flex gap-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t("ai.input_placeholder", "Search medications, med spas, doctors, symptoms, find pharmacies worldwide...")}
          className="flex-1 px-4 py-2 rounded-lg border border-input bg-background"
          disabled={isTyping || isSearching}
        />
        <AccessibilityPanel />
        <VoiceSearchButton
          onResult={handleVoiceResult}
          isListening={false}
          setIsListening={() => {}}
        />
        <Button type="submit" size="icon" disabled={isTyping || isSearching}>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
};
