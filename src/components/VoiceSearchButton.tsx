
import React, { useEffect, useState } from 'react';
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
  const [error, setError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  // Check if speech recognition is supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('speech-recognition-not-supported');
    }
  }, []);

  // Check if network is available
  useEffect(() => {
    const handleNetworkChange = () => {
      const isOffline = !navigator.onLine;
      setNetworkError(isOffline);
      
      if (navigator.onLine && networkError) {
        setError(null);
      }
      
      // Stop listening if network becomes unavailable
      if (isOffline && isListening) {
        stopListening();
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
      
      // Cleanup recognition on unmount
      if (recognition) {
        try {
          recognition.stop();
        } catch (err) {
          console.error("Error stopping recognition on unmount:", err);
        }
      }
    };
  }, [networkError, isListening, recognition]);

  const stopListening = () => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (err) {
        console.error("Error stopping recognition:", err);
      }
    }
    setIsListening(false);
  };

  const initializeRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('speech-recognition-not-supported');
      return null;
    }
    
    const recognitionInstance = new SpeechRecognition();
    
    recognitionInstance.lang = language === 'en' ? 'en-US' : 
                         language === 'es' ? 'es-ES' : 
                         language === 'fr' ? 'fr-FR' : 
                         language === 'de' ? 'de-DE' :
                         language === 'ja' ? 'ja-JP' :
                         language === 'zh' ? 'zh-CN' :
                         language === 'ar' ? 'ar-SA' :
                         language === 'ru' ? 'ru-RU' :
                         language === 'pt' ? 'pt-BR' :
                         language === 'hi' ? 'hi-IN' : 'en-US';
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = true;
    
    recognitionInstance.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
        
      if (event.results[0].isFinal) {
        onResult(transcript);
        stopListening();
      }
    };
    
    recognitionInstance.onerror = (event: any) => {
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
      
      stopListening();
    };
    
    recognitionInstance.onend = () => {
      setIsListening(false);
    };
    
    return recognitionInstance;
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
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
      const recognitionInstance = initializeRecognition();
      if (!recognitionInstance) {
        toast({
          title: t("voice.error.unsupported", "Speech Recognition Unsupported"),
          description: t("voice.error.unsupported.description", "Your browser doesn't support speech recognition."),
          variant: "destructive",
        });
        return;
      }
      
      setRecognition(recognitionInstance);
      recognitionInstance.start();
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
  };

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

// Add TypeScript interface for the Window object to include SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
  }
}
