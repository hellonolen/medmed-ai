/**
 * useVoice — Web Speech API hook for MedMed.AI
 * Provides:
 *  - startListening / stopListening  (SpeechRecognition → text)
 *  - speak(text)                     (SpeechSynthesis → voice)
 *  - stopSpeaking()
 *  - isListening, isSpeaking state
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { bus, AGENT_EVENTS } from "@/lib/eventBus";

// Browser typings for SpeechRecognition (not in standard TS lib)
interface SpeechRecognitionWindow extends Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}
const w = window as unknown as SpeechRecognitionWindow;

interface UseVoiceOptions {
  lang?: string;
  onTranscript?: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  autoSpeak?: boolean; // auto-read agent responses via TTS
}

export function useVoice(options: UseVoiceOptions = {}) {
  const { lang = "en-US", onTranscript, onError, autoSpeak = true } = options;

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Detect browser support on mount
  useEffect(() => {
    const SpeechRecog = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(!!SpeechRecog);
    setTtsSupported(!!window.speechSynthesis);
    synthRef.current = window.speechSynthesis || null;
  }, []);

  // Auto-TTS: subscribe to agent responses
  useEffect(() => {
    if (!autoSpeak || !ttsSupported) return;
    return bus.on<string>(AGENT_EVENTS.AGENT_RESPONSE, (text) => {
      speak(text);
    });
  }, [autoSpeak, ttsSupported]);

  const startListening = useCallback(() => {
    const SpeechRecog = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecog) {
      onError?.("Speech recognition not supported in this browser.");
      return;
    }
    // Stop any existing session
    recognitionRef.current?.stop();

    const recognition = new SpeechRecog();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e) => {
      setIsListening(false);
      if (e.error !== "no-speech") onError?.(e.error);
    };
    recognition.onresult = (e) => {
      const result = e.results[e.results.length - 1];
      const transcript = result[0].transcript;
      const isFinal = result.isFinal;
      onTranscript?.(transcript, isFinal);
      if (isFinal) bus.emit(AGENT_EVENTS.USER_SPOKE, transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [lang, onTranscript, onError]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const speak = useCallback((text: string, voice?: string) => {
    if (!synthRef.current) return;

    // Strip HTML tags for speech
    const clean = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    if (!clean) return;

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = lang;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Pick a good voice if available
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(v =>
      v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Alex")
    ) || voices.find(v => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => { setIsSpeaking(true); bus.emit(AGENT_EVENTS.AGENT_SPEAKING); };
    utterance.onend = () => { setIsSpeaking(false); bus.emit(AGENT_EVENTS.AGENT_SILENT); };
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, [lang]);

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    isSpeaking,
    supported,
    ttsSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
