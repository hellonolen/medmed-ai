
import { useState, useRef, useEffect } from 'react';
import { Send, ChevronDown, Bot, X, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { VoiceSearch } from '@/components/VoiceSearch';

type ChatMessage = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

export const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! I\'m MedMed AI Assistant. I can help you find information about medications, symptoms, and specialists. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      // In a production app, this would call an AI API
      // For now, we'll simulate a response
      setTimeout(() => {
        let botResponse = '';
        const query = inputMessage.toLowerCase();
        
        if (query.includes('medication') || query.includes('drug') || query.includes('medicine')) {
          botResponse = "I can help you find information about medications. Please try our global medication search at the top of the page.";
        } else if (query.includes('symptom') || query.includes('pain') || query.includes('feeling')) {
          botResponse = "If you're experiencing symptoms, our Symptom Checker can help you understand what might be causing them.";
        } else if (query.includes('doctor') || query.includes('specialist')) {
          botResponse = "You can find specialists based on your condition using our specialist directory.";
        } else if (query.includes('pharmacy') || query.includes('drugstore')) {
          botResponse = "Our Global Pharmacy Finder can help you locate pharmacies near you.";
        } else {
          botResponse = "I'm here to help with medical information. You can ask about medications, symptoms, specialists, or pharmacies.";
        }
        
        const botMessage: ChatMessage = {
          id: Date.now().toString(),
          text: botResponse,
          sender: 'bot',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: "Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleVoiceResult = (text: string) => {
    setInputMessage(text);
  };

  return (
    <>
      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)} 
          className="fixed bottom-4 right-4 rounded-full w-12 h-12 shadow-lg p-0 bg-primary hover:bg-primary/90"
          aria-label="Open chat"
        >
          <Bot className="h-6 w-6 text-white" />
        </Button>
      )}
      
      {isOpen && (
        <Card className="fixed bottom-4 right-4 w-[350px] h-[500px] shadow-xl rounded-lg flex flex-col z-50 border border-gray-200">
          <div className="flex items-center justify-between bg-primary text-white p-3 rounded-t-lg">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <Bot className="h-5 w-5" />
              </Avatar>
              <div>
                <h3 className="font-medium">MedMed AI Assistant</h3>
                <p className="text-xs opacity-80">Available 24/7</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-primary/90">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-3 overflow-y-auto">
            <div className="space-y-4">
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === 'user' 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-gray-100 text-gray-800 rounded-tl-none'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 rounded-tl-none">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <form onSubmit={handleSendMessage} className="p-3 border-t">
            <div className="flex items-center">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 mr-2"
                disabled={isLoading}
              />
              <VoiceSearch 
                onResult={handleVoiceResult} 
                isListening={isListening}
                setIsListening={setIsListening}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!inputMessage.trim() || isLoading}
                className="ml-1"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      )}
    </>
  );
};
