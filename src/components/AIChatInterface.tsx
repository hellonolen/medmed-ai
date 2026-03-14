import React, { useState, useEffect, useRef } from 'react';
import { Send, User, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { aiService } from '@/services/AIService';
import { VoiceSearchButton } from './VoiceSearchButton';
import { useNavigate } from 'react-router-dom';
import { useMedicalSearch } from '@/contexts/MedicalSearchContext';

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

// Lightweight markdown renderer — no external deps
function renderMarkdown(text: string): string {
  return text
    // Bold **text**
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic *text*
    .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>')
    // Bullet points: lines starting with * or -
    .replace(/^[\*\-] (.+)$/gm, '<li>$1</li>')
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>.*<\/li>\n?)+/gs, (match) => `<ul class="list-disc pl-5 my-2 space-y-1">${match}</ul>`)
    // Numbered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Headings ###
    .replace(/^### (.+)$/gm, '<h3 class="font-semibold text-base mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-bold text-lg mt-3 mb-1">$2</h2>')
    // Double newlines → paragraph breaks
    .replace(/\n{2,}/g, '</p><p class="mt-2">')
    // Single newlines → <br>
    .replace(/\n/g, '<br />');
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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { searchWithContext, loading: isSearching } = useMedicalSearch();
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        content: "What's going on? Ask me about medications, symptoms, nearby pharmacies, or anything healthcare-related.",
        type: 'ai',
        timestamp: new Date()
      }]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isTyping || isSearching) return;

    const userMessage: Message = {
      content: inputValue,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const query = inputValue;
    setInputValue('');
    setIsTyping(true);

    // Reset textarea height
    if (inputRef.current) inputRef.current.style.height = 'auto';

    try {
      const normalizedInput = query.toLowerCase();

      const isLocationSearch = /\b(in|near|at|around)\b\s+([a-zA-Z]+)/.test(normalizedInput) ||
        /\b(new york|los angeles|chicago|houston|phoenix|philadelphia|san antonio|san diego|dallas|san jose|austin|jacksonville|fort worth|columbus|chicago|seattle|denver|miami|boston|atlanta|las vegas|portland|memphis|detroit|nashville|baltimore)\b/i.test(normalizedInput);

      const searchResults = await searchWithContext(query, isLocationSearch ? 'location' : undefined);
      onSearch(query, searchResults);

      const response = await aiService.getHealthAdvice(query);

      if (response.success && response.content) {
        setMessages(prev => [...prev, {
          content: response.content,
          type: 'ai',
          timestamp: new Date()
        }]);
      } else {
        throw new Error('No response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        content: "I had trouble connecting. Please try again.",
        type: 'error',
        timestamp: new Date()
      }]);
      toast.error("Connection error. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Auto-grow
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  const handleVoiceResult = (text: string) => {
    if (text) {
      setInputValue(text);
      setTimeout(() => handleSubmit(), 100);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col">
      {/* Messages */}
      <div className="space-y-5 mb-4 px-1">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type !== 'user' && (
              <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-0.5 ${
                message.type === 'error' ? 'bg-destructive/10' : 'bg-primary/10'
              }`}>
                {message.type === 'error'
                  ? <AlertTriangle className="h-4 w-4 text-destructive" />
                  : <Sparkles className="h-4 w-4 text-primary" />
                }
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                message.type === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-sm'
                  : message.type === 'error'
                  ? 'bg-destructive/10 text-destructive rounded-tl-sm'
                  : 'bg-white/80 backdrop-blur border border-gray-100 shadow-sm text-foreground rounded-tl-sm'
              }`}
              dangerouslySetInnerHTML={{
                __html: message.type === 'user'
                  ? message.content.replace(/\n/g, '<br/>')
                  : `<p>${renderMarkdown(message.content)}</p>`
              }}
            />

            {message.type === 'user' && (
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-secondary flex items-center justify-center mt-0.5">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-white/80 backdrop-blur border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="bg-white/90 backdrop-blur border border-gray-200 shadow-md rounded-2xl px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={t("ai.input_placeholder", "Ask about medications, symptoms, pharmacies...")}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-gray-400 max-h-40 leading-relaxed py-0.5"
            disabled={isTyping || isSearching}
          />
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <VoiceSearchButton
              onResult={handleVoiceResult}
              isListening={isListening}
              setIsListening={setIsListening}
            />
            <Button
              type="button"
              size="icon"
              className="h-8 w-8 rounded-xl"
              onClick={() => handleSubmit()}
              disabled={isTyping || isSearching || !inputValue.trim()}
            >
              {isTyping || isSearching
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Send className="h-3.5 w-3.5" />
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
