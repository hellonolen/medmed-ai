import React, { useState, useEffect, useRef } from 'react';
import { Send, User, AlertTriangle, Loader2, Sparkles, ArrowUp } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { aiService } from '@/services/AIService';
import { VoiceSearchButton } from './VoiceSearchButton';
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

// Lightweight markdown → HTML renderer
function renderMd(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>')
    .replace(/^#{3}\s+(.+)$/gm, '<h3 class="font-semibold text-[15px] mt-4 mb-1 text-foreground">$1</h3>')
    .replace(/^#{2}\s+(.+)$/gm, '<h2 class="font-bold text-base mt-4 mb-1 text-foreground">$1</h2>')
    .replace(/^[-*]\s+(.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/gs, m => `<ul class="my-2 space-y-1">${m}</ul>`)
    .replace(/\n{2,}/g, '</p><p class="mt-3">')
    .replace(/\n/g, '<br />');
}

const STARTER_PROMPTS = [
  "What are the side effects of ibuprofen?",
  "Find pharmacies near Chicago",
  "What medications treat high blood pressure?",
  "Compare Ozempic vs Wegovy",
];

export const AIChatInterface = ({
  onSearch,
}: {
  onSearch: (query: string, results: SearchResult[]) => void;
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useLanguage();
  const { searchWithContext, loading: isSearching } = useMedicalSearch();
  const [isListening, setIsListening] = useState(false);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const submit = async (query: string) => {
    if (!query.trim() || isTyping || isSearching) return;

    setMessages(prev => [...prev, { content: query, type: 'user', timestamp: new Date() }]);
    setInputValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsTyping(true);

    try {
      const normalizedInput = query.toLowerCase();
      const isLocationSearch =
        /\b(in|near|at|around)\b/.test(normalizedInput) ||
        /\b(new york|los angeles|chicago|houston|miami|boston|atlanta|seattle|denver|dallas|phoenix)\b/i.test(normalizedInput);

      const results = await searchWithContext(query, isLocationSearch ? 'location' : undefined);
      onSearch(query, results);

      const response = await aiService.getHealthAdvice(query);
      setMessages(prev => [
        ...prev,
        {
          content: response.success && response.content
            ? response.content
            : "I had trouble connecting. Please try again.",
          type: response.success ? 'ai' : 'error',
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { content: "Something went wrong. Please try again.", type: 'error', timestamp: new Date() },
      ]);
      toast.error("Connection error.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit(inputValue);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 180) + 'px';
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col">

      {/* ── Empty state: starter prompts ── */}
      {!hasMessages && (
        <div className="mb-8">
          <div className="grid grid-cols-2 gap-2">
            {STARTER_PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => submit(p)}
                className="text-left text-sm px-4 py-3 rounded-xl border border-[#e8e0d0] bg-[#fdf9f2] hover:bg-[#f5ede0] hover:border-primary/30 hover:shadow-sm transition-all text-gray-600 hover:text-gray-900"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Message thread ── */}
      {hasMessages && (
        <div className="mb-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i}>
              {msg.type === 'user' ? (
                /* User pill — right-aligned */
                <div className="flex justify-end">
                  <div className="max-w-[75%] bg-[#ede8de] text-foreground text-[15px] leading-relaxed px-4 py-2.5 rounded-2xl rounded-br-sm">
                    {msg.content}
                  </div>
                </div>
              ) : msg.type === 'error' ? (
                /* Error — inline warning */
                <div className="flex gap-3 items-start">
                  <div className="flex-shrink-0 mt-1 h-7 w-7 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                  </div>
                  <p className="text-[15px] text-destructive leading-relaxed pt-0.5">{msg.content}</p>
                </div>
              ) : (
                /* AI — plain flowing text with icon */
                <div className="flex gap-3 items-start">
                  <div className="flex-shrink-0 mt-1 h-7 w-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div
                    className="flex-1 text-[15px] leading-relaxed text-foreground prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: `<p>${renderMd(msg.content)}</p>` }}
                  />
                </div>
              )}
            </div>
          ))}

          {/* Typing dots */}
          {isTyping && (
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 mt-1 h-7 w-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="flex items-center gap-1 pt-2">
                {[0, 150, 300].map(d => (
                  <span
                    key={d}
                    className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* ── Input bar — Claude style ── */}
      <div className="relative bg-[#fdf9f2] border border-[#e0d8cc] rounded-2xl shadow-sm focus-within:border-[#c8b89a] focus-within:shadow-md transition-all">
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={t('ai.input_placeholder', 'Ask about medications, symptoms, pharmacies...')}
          rows={1}
          disabled={isTyping || isSearching}
          className="w-full resize-none bg-transparent text-[15px] text-foreground placeholder:text-gray-400 outline-none px-4 pt-3.5 pb-12 max-h-[180px] leading-relaxed"
        />

        {/* Bottom toolbar */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
          <VoiceSearchButton
            onResult={text => { setInputValue(text); setTimeout(() => submit(text), 100); }}
            isListening={isListening}
            setIsListening={setIsListening}
          />
          <button
            onClick={() => submit(inputValue)}
            disabled={!inputValue.trim() || isTyping || isSearching}
            className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center disabled:opacity-30 transition-opacity hover:bg-primary/90"
          >
            {isTyping || isSearching
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <ArrowUp className="h-4 w-4" />
            }
          </button>
        </div>
      </div>
    </div>
  );
};
