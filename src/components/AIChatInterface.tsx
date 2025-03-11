
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, User, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { aiService } from '@/services/AIService';
import { VoiceSearchButton } from './VoiceSearchButton';
import { useNavigate } from 'react-router-dom';
import { intelligentPharmacySearch } from '@/utils/pharmacySearch';
import { AccessibilityPanel } from './AccessibilityPanel';
import { useMedicalSearch } from '@/contexts/MedicalSearchContext';

interface Message {
  content: string;
  type: 'ai' | 'user';
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
  const { searchWithContext } = useMedicalSearch();

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
      // Check for pharmacy/med spa related queries
      const normalizedInput = inputValue.toLowerCase();
      const isPharmacySearch = /pharmacy|drugstore|chemist|near|around|locate/.test(normalizedInput);
      const isMedSpaSearch = /med\s*spa|medi\s*spa|med-spa|spa|cosmetic|aesthetic|beauty/.test(normalizedInput);
      
      // Use the centralized medical search context
      const searchResults = await searchWithContext(inputValue);
      
      // Determine if we should redirect based on the query type
      if ((isPharmacySearch || isMedSpaSearch) && searchResults.length > 0) {
        // Check if it's a clear request for the pharmacy finder
        if (isPharmacySearch && /find|locate|list|show|search/.test(normalizedInput)) {
          navigate(`/pharmacy-finder?query=${encodeURIComponent(inputValue)}`);
          // Add message before redirecting
          const redirectMessage: Message = {
            content: t("ai.redirect", "Taking you to pharmacy finder with your search results..."),
            type: 'ai',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, redirectMessage]);
          setIsTyping(false);
          return;
        }
      }

      // Process AI response
      const response = await aiService.getHealthAdvice(inputValue);
      
      if (response.success) {
        const aiMessage: Message = {
          content: response.content,
          type: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Trigger search for relevant results
        onSearch(inputValue, searchResults); 
      } else {
        throw new Error('AI service error');
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      const errorMessage: Message = {
        content: t("ai.error", "I apologize, but I'm having trouble processing that. Could you try rephrasing your question?"),
        type: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error(t("ai.error", "I encountered an error. Please try again."));
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
              message.type === 'ai' ? 'items-start' : 'items-start flex-row-reverse'
            }`}
          >
            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
              message.type === 'ai' ? 'bg-primary/10' : 'bg-secondary'
            }`}>
              {message.type === 'ai' ? (
                <MessageCircle className="h-4 w-4 text-primary" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <div className={`rounded-lg px-4 py-2 max-w-[80%] ${
              message.type === 'ai' 
                ? 'bg-primary/10 text-foreground' 
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
          placeholder={t("ai.input_placeholder", "Ask about medications, symptoms, find pharmacies, med spas worldwide...")}
          className="flex-1 px-4 py-2 rounded-lg border border-input bg-background"
        />
        <AccessibilityPanel />
        <VoiceSearchButton
          onResult={handleVoiceResult}
          isListening={false}
          setIsListening={() => {}}
        />
        <Button type="submit" size="icon">
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
};
