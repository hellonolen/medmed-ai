
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, AlertCircle, WifiOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface VoiceSearchButtonProps {
  onResult: (text: string) => void;
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
  className?: string;
}

export const VoiceSearchButton = ({ 
  onResult, 
  isListening,
  setIsListening,
  className
}: VoiceSearchButtonProps) => {
  const [error, setError] = React.useState<string | null>(null);
  const [networkError, setNetworkError] = React.useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  // Check if network is available
  useEffect(() => {
    const handleNetworkChange = () => {
      setNetworkError(!navigator.onLine);
      if (navigator.onLine && networkError) {
        setError(null);
      }
    };

    // Set initial state
    setNetworkError(!navigator.onLine);
    
    // Add event listeners
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
    
    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, [networkError]);

  const toggleListening = React.useCallback(() => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    
    setError(null);
    
    if (networkError) {
      toast({
        title: t("voice.error.network", "Network Error"),
        description: t("voice.error.network.description", "Please check your internet connection and try again."),
        variant: "destructive",
      });
      return;
    }
    
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setError('Speech recognition not supported');
        toast({
          title: t("voice.error.unsupported", "Speech Recognition Unsupported"),
          description: t("voice.error.unsupported.description", "Your browser doesn't support speech recognition."),
          variant: "destructive",
        });
        return;
      }
      
      const recognition = new SpeechRecognition();
      
      recognition.lang = language === 'en' ? 'en-US' : 
                        language === 'es' ? 'es-ES' : 
                        language === 'fr' ? 'fr-FR' : 
                        language === 'de' ? 'de-DE' :
                        language === 'ja' ? 'ja-JP' :
                        language === 'zh' ? 'zh-CN' :
                        language === 'ar' ? 'ar-SA' :
                        language === 'ru' ? 'ru-RU' :
                        language === 'pt' ? 'pt-BR' :
                        language === 'hi' ? 'hi-IN' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
          
        if (event.results[0].isFinal) {
          onResult(transcript);
          setIsListening(false);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        if (event.error === 'network') {
          setNetworkError(true);
          toast({
            title: t("voice.error.network", "Network Error"),
            description: t("voice.error.network.description", "Please check your internet connection and try again."),
            variant: "destructive",
          });
        } else if (event.error === 'not-allowed') {
          setError('microphone-blocked');
          toast({
            title: t("voice.error", "Microphone not available"),
            description: t("voice.permission", "Please allow microphone access in your browser settings."),
            variant: "destructive",
          });
        } else {
          setError(event.error);
          toast({
            title: t("voice.error.generic", "Speech Recognition Error"),
            description: t("voice.error.generic.description", "There was an error with speech recognition. Please try again."),
            variant: "destructive",
          });
        }
        
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
      setIsListening(true);
      
      toast({
        title: t("voice.listening", "Listening..."),
        description: t("voice.placeholder", "Speak to search..."),
        duration: 3000,
      });
      
    } catch (err) {
      console.error('Error initializing speech recognition:', err);
      setError('Failed to initialize speech recognition');
      setIsListening(false);
      
      toast({
        title: t("voice.error.initialization", "Initialization Error"),
        description: t("voice.error.initialization.description", "Failed to initialize speech recognition."),
        variant: "destructive",
      });
    }
  }, [isListening, language, networkError, onResult, setIsListening, t, toast]);

  return (
    <Button
      variant="outline"
      size="icon"
      className={`relative ${isListening ? 'bg-primary/10' : ''} ${className || ''}`}
      onClick={toggleListening}
      aria-label={isListening ? t("button.voice.stop", "Stop voice search") : t("button.voice.start", "Start voice search")}
      disabled={!!error && error !== 'microphone-blocked'}
      title={error || ''}
    >
      {networkError ? (
        <WifiOff className="h-4 w-4 text-destructive" />
      ) : error === 'microphone-blocked' ? (
        <MicOff className="h-4 w-4 text-destructive" />
      ) : error ? (
        <AlertCircle className="h-4 w-4 text-destructive" />
      ) : isListening ? (
        <>
          <Mic className="h-4 w-4 text-primary animate-pulse" />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary"></span>
        </>
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
};
