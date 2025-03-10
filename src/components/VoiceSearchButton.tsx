
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
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
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const toggleListening = React.useCallback(() => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    
    setError(null);
    
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setError('Speech recognition not supported');
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
        setError(event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          toast({
            title: t("voice.error", "Microphone not available"),
            description: t("voice.permission", "Please allow microphone access"),
            variant: "destructive",
          });
        }
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
    }
  }, [isListening, language, onResult, setIsListening, t, toast]);

  return (
    <Button
      variant="outline"
      size="icon"
      className={`relative ${isListening ? 'bg-primary/10' : ''} ${className || ''}`}
      onClick={toggleListening}
      aria-label={isListening ? t("button.voice.stop", "Stop voice search") : t("button.voice.start", "Start voice search")}
      disabled={!!error}
      title={error || ''}
    >
      {error ? (
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
