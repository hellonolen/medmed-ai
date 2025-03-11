
import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, Mic, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { aiService } from '@/services/AIService';
import { VoiceSearchButton } from './VoiceSearchButton';

interface Message {
  content: string;
  type: 'ai' | 'user';
  timestamp: Date;
}

export const AIChatInterface = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Initial greeting
    if (messages.length === 0) {
      const initialMessage = {
        content: t("ai.greeting", "Hello! I'm your medical assistant. I can help you find medications, check symptoms, locate pharmacies, or answer health-related questions. How can I help you today?"),
        type: 'ai' as const,
        timestamp: new Date()
      };
      setMessages([initialMessage]);
    }
  }, []);

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
      const response = await aiService.getHealthAdvice(inputValue);
      
      if (response.success) {
        const aiMessage: Message = {
          content: response.content,
          type: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // If the response contains actionable information, trigger a search
        if (inputValue.toLowerCase().includes('find') || 
            inputValue.toLowerCase().includes('search') ||
            inputValue.toLowerCase().includes('look')) {
          onSearch(inputValue);
        }
      } else {
        toast.error(t("ai.error", "I'm having trouble understanding. Could you rephrase that?"));
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      toast.error(t("ai.error", "Sorry, I encountered an error. Please try again."));
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceResult = (text: string) => {
    if (text) {
      setInputValue(text);
      handleSubmit(new Event('submit') as any);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="h-[300px] overflow-y-auto p-4 space-y-4">
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
                <Bot className="h-4 w-4 text-primary" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <div className={`rounded-lg px-4 py-2 max-w-[80%] ${
              message.type === 'ai' 
                ? 'bg-primary/10 text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground'
            }`}>
              {message.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2 items-start">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="rounded-lg px-4 py-2 bg-primary/10 text-primary-foreground">
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
          placeholder={t("ai.input_placeholder", "Ask me anything about medications, symptoms, or healthcare...")}
          className="flex-1 px-4 py-2 rounded-lg border border-input bg-background"
        />
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
