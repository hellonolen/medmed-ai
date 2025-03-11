
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AIKeySetup } from "@/components/AIKeySetup";
import { aiService } from "@/services/AIService";
import { Loader2, Send, Bot, User } from "lucide-react";

interface Message {
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  title?: string;
  initialSystemPrompt?: string;
  initialMessages?: Message[];
  placeholder?: string;
  maxHeight?: string;
  onMessageSent?: (message: string, response: string) => void;
}

export const AIChat: React.FC<AIChatProps> = ({
  title = "AI Assistant",
  initialSystemPrompt = "",
  initialMessages = [],
  placeholder = "Ask me anything about healthcare...",
  maxHeight = "400px",
  onMessageSent
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fix: Pass 'perplexity' as the default provider to getApiKey
    setHasApiKey(!!aiService.getApiKey('perplexity'));
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Get context from previous messages
      const context = messages
        .slice(-5)
        .map(msg => `${msg.role}: ${msg.content}`)
        .join("\n");

      const response = await aiService.askAI({
        query: inputValue,
        context,
        systemPrompt: initialSystemPrompt
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response.success ? response.content : "I'm having trouble connecting to my AI services. Please try again later or check your API key.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (onMessageSent) {
        onMessageSent(userMessage.content, assistantMessage.content);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      
      const errorMessage: Message = {
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <CardTitle className="text-lg">{title}</CardTitle>
        <AIKeySetup onKeySet={() => setHasApiKey(true)} />
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className={`px-4 py-2`} style={{ maxHeight }}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Bot className="mx-auto h-8 w-8 text-primary/70 mb-2" />
                <p>Ask me anything about medications, symptoms, specialists, or healthcare in general.</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "assistant" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-lg ${
                      message.role === "assistant"
                        ? "bg-primary/10 text-primary-foreground rounded-tl-none"
                        : "bg-secondary text-secondary-foreground rounded-tr-none"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      {message.role === "assistant" ? (
                        <Bot className="h-4 w-4 text-primary" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                      <span className="text-xs opacity-70">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="pt-2">
        <div className="relative w-full">
          <Input
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || !hasApiKey}
            className="pr-14"
          />
          <Button
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim() || !hasApiKey}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
