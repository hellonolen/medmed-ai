import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, User, ArrowRight, AlertTriangle, Map } from 'lucide-react';
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
  const [isListening, setIsListening] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length === 0) {
      const initialMessage = {
        content: "What's going on?",
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
      const normalizedInput = inputValue.toLowerCase();
      
      const isLocationSearch = /\b(in|near|at|around)\b\s+([a-zA-Z]+)/.test(normalizedInput) || 
                              /\b(new york|los angeles|chicago|houston|phoenix|philadelphia|san antonio|san diego|dallas|san jose|austin|jacksonville|fort worth|columbus|indianapolis|charlotte|san francisco|seattle|denver|washington|boston|el paso|nashville|detroit|portland|las vegas|oklahoma city|memphis|louisville|baltimore|milwaukee|albuquerque|tucson|fresno|sacramento|atlanta|kansas city|colorado springs|miami|raleigh|omaha|long beach|virginia beach|oakland|minneapolis|tampa|tulsa|arlington)\b/i.test(normalizedInput) ||
                              /^[a-z\s]+$/.test(normalizedInput) && normalizedInput.length > 3 && !/\b(what|how|why|when|where|who|which|is|are|do|does|did|can|could|would|should|may|might)\b/.test(normalizedInput);
      
      const isPharmacySearch = /pharmacy|drugstore|chemist|near|around|locate/.test(normalizedInput);
      const isMedSpaSearch = /med\s*spa|medi\s*spa|med-spa|spa|cosmetic|aesthetic|beauty/.test(normalizedInput);
      
      const searchResults = await searchWithContext(inputValue, isLocationSearch ? 'location' : undefined);
      
      onSearch(inputValue, searchResults);
      
      if ((isPharmacySearch || isMedSpaSearch || isLocationSearch)) {
        const hasSearchIntent = /find|locate|list|show|search|where|what/.test(normalizedInput) || isLocationSearch;
        
        if (hasSearchIntent) {
          const redirectMessage: Message = {
            content: t("ai.location_search", `I found some results that might be near ${inputValue}. Would you like to see the pharmacy and med spa locations on a map?`),
            type: 'ai',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, redirectMessage]);
          
          setTimeout(() => {
            const mapButtonMessage: Message = {
              content: `<button class="map-redirect-btn" data-location="${encodeURIComponent(inputValue)}">
                <span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/></svg> View on Map</span>
              </button>`,
              type: 'ai',
              timestamp: new Date()
            };
            setMessages(prev => [...prev, mapButtonMessage]);
            
            setTimeout(() => {
              const mapButtons = document.querySelectorAll('.map-redirect-btn');
              mapButtons.forEach(btn => {
                if (btn instanceof HTMLElement) {
                  btn.addEventListener('click', () => {
                    const location = btn.getAttribute('data-location');
                    if (location) {
                      navigate(`/pharmacy-finder?query=${location}`);
                    }
                  });
                }
              });
            }, 100);
          }, 1000);
          
          setIsTyping(false);
          return;
        }
      }

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
        
        let fallbackResponse = "";
        
        if (isLocationSearch) {
          fallbackResponse = t("ai.location_fallback", 
            `I noticed you're looking for information about "${inputValue}". Would you like to see local healthcare services in this area?`);
            
          const errorMessage: Message = {
            content: fallbackResponse,
            type: 'ai',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
          
          setTimeout(() => {
            const mapButtonMessage: Message = {
              content: `<button class="map-redirect-btn" data-location="${encodeURIComponent(inputValue)}">
                <span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/></svg> Find Healthcare Services</span>
              </button>`,
              type: 'ai',
              timestamp: new Date()
            };
            setMessages(prev => [...prev, mapButtonMessage]);
            
            setTimeout(() => {
              const mapButtons = document.querySelectorAll('.map-redirect-btn');
              mapButtons.forEach(btn => {
                if (btn instanceof HTMLElement) {
                  btn.addEventListener('click', () => {
                    const location = btn.getAttribute('data-location');
                    if (location) {
                      navigate(`/pharmacy-finder?query=${location}`);
                    }
                  });
                }
              });
            }, 100);
          }, 1000);
        } else if (searchResults.length > 0) {
          const resultTypes = new Set(searchResults.slice(0, 3).map(r => r.type));
          const typeDescription = Array.from(resultTypes).join(", ");
          
          fallbackResponse = t("ai.error.with_results", 
            `I found these results related to your search while my answering system is being updated:`);
          
          fallbackResponse += "\n\n" + searchResults.slice(0, 3).map(r => 
            `• ${r.name}: ${r.details}`
          ).join("\n");
          
          const errorMessage: Message = {
            content: fallbackResponse,
            type: 'ai',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
        } else {
          fallbackResponse = t("ai.error", 
            "I apologize, but I'm having trouble processing that. Could you try rephrasing your question?");
            
          const errorMessage: Message = {
            content: fallbackResponse,
            type: 'ai',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      }
    } catch (error) {
      console.error('Search system error:', error);
      
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
    <Card className="w-full max-w-full md:max-w-2xl mx-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="h-[200px] sm:h-[250px] md:h-[300px] overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-2 ${
              message.type === 'user' ? 'items-start flex-row-reverse' : 'items-start'
            }`}
          >
            <div className={`flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8 rounded-full flex items-center justify-center ${
              message.type === 'ai' ? 'bg-primary/10' : 
              message.type === 'error' ? 'bg-destructive/10' : 'bg-secondary'
            }`}>
              {message.type === 'ai' ? (
                <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              ) : message.type === 'error' ? (
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
              ) : (
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </div>
            <div 
              className={`rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 max-w-[75%] sm:max-w-[80%] text-sm sm:text-base ${
                message.type === 'ai' 
                  ? 'bg-primary/10 text-foreground' 
                  : message.type === 'error'
                  ? 'bg-destructive/10 text-destructive-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
              dangerouslySetInnerHTML={{ __html: message.content }}
            >
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2 items-start">
            <div className="flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </div>
            <div className="rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 bg-primary/10 text-foreground">
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
      
      <form onSubmit={handleSubmit} className="p-2 sm:p-4 border-t flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t("ai.input_placeholder", "Search medications, med spas, doctors, symptoms, find pharmacies worldwide...")}
          className="flex-1 px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg border border-input bg-background"
          disabled={isTyping || isSearching}
        />
        <div className="flex gap-2 justify-end">
          <AccessibilityPanel />
          <VoiceSearchButton
            onResult={handleVoiceResult}
            isListening={isListening}
            setIsListening={setIsListening}
          />
          <Button type="submit" size="icon" disabled={isTyping || isSearching}>
            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
};
