import { useRef, useState, useEffect } from "react";

const WORKER = "https://medmed-agent.hellonolen.workers.dev";

type MediaType = "image" | "video";

interface Props {
  type: MediaType;
  onAnalysis: (text: string) => void;
  onClose: () => void;
}

export function MediaCaptureModal({ type, onAnalysis, onClose }: Props) {
  const token = localStorage.getItem("medmed_token") || localStorage.getItem("mm_token");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [phase, setPhase] = useState<"loading" | "live" | "flash" | "recording" | "processing" | "error">("loading");
  const [countdown, setCountdown] = useState(45);
  const [errorMsg, setErrorMsg] = useState("");
  const [cameraReady, setCameraReady] = useState(false);

  /* ── Start camera on mount ── */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const constraints: MediaStreamConstraints = {
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: type === "video",
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!alive) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        const vid = videoRef.current;
        if (vid) {
          vid.srcObject = stream;
          vid.onloadedmetadata = () => {
            vid.play().then(() => {
              if (alive) { setPhase("live"); setCameraReady(true); }
            }).catch(() => setError("Camera failed to start."));
          };
        }
      } catch (e: unknown) {
        const msg = (e as Error)?.message || "";
        if (msg.includes("Permission") || msg.includes("denied") || msg.includes("NotAllowed")) {
          setError("Camera access denied. Please allow camera access in your browser settings and try again.");
        } else if (msg.includes("NotFound") || msg.includes("DevicesNotFound")) {
          setError("No camera found. Please connect a camera and try again.");
        } else {
          setError("Could not start camera. Please check your browser permissions.");
        }
      }
    })();
    return () => {
      alive = false;
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [type]);

  const setError = (msg: string) => { setErrorMsg(msg); setPhase("error"); };

  /* ── Capture photo → Gemini ── */
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    // Flash animation
    setPhase("flash");
    await new Promise(r => setTimeout(r, 120));

    const vid = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = vid.videoWidth || 640;
    canvas.height = vid.videoHeight || 480;
    const ctx = canvas.getContext("2d")!;
    // Mirror the capture to match what user sees
    ctx.scale(-1, 1);
    ctx.drawImage(vid, -canvas.width, 0);

    setPhase("processing");
    streamRef.current?.getTracks().forEach(t => t.stop());

    const base64 = canvas.toDataURL("image/jpeg", 0.9).split(",")[1];
    await analyzeBase64(base64, "image");
  };

  /* ── Record video → Gemini ── */
  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];

    // Pick supported mime
    const mime = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"]
      .find(m => MediaRecorder.isTypeSupported(m)) ?? "video/webm";

    const recorder = new MediaRecorder(streamRef.current, { mimeType: mime });
    recorderRef.current = recorder;
    recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = async () => {
      setPhase("processing");
      streamRef.current?.getTracks().forEach(t => t.stop());
      const blob = new Blob(chunksRef.current, { type: mime });
      // For video: capture the last frame from canvas instead of uploading full video
      // (Gemini Flash doesn't accept base64 video well without R2, so we capture a snapshot)
      const canvas = canvasRef.current;
      const vid = videoRef.current;
      if (canvas && vid) {
        canvas.width = vid.videoWidth || 640;
        canvas.height = vid.videoHeight || 480;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(vid, 0, 0);
        const base64 = canvas.toDataURL("image/jpeg", 0.9).split(",")[1];
        await analyzeBase64(base64, "video", blob);
      } else {
        setError("Failed to capture frame.");
      }
    };
    recorder.start(500);
    setPhase("recording");
    setCountdown(45);

    let secs = 45;
    timerRef.current = setInterval(() => {
      secs -= 1;
      setCountdown(secs);
      if (secs <= 0) { clearInterval(timerRef.current!); recorder.stop(); }
    }, 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    recorderRef.current?.stop();
  };

  /* ── Send base64 → Worker → Gemini ── */
  const analyzeBase64 = async (base64: string, captureType: "image" | "video", _blob?: Blob) => {
    try {
      const systemPrompt = captureType === "video"
        ? "You are MedMed AI, a health information assistant. The user has shared a video recording with you. Analyze what you observe — their appearance, any visible physical characteristics, skin, eyes, or anything health-relevant. Describe clearly and provide educational context. Always note this is not a medical diagnosis."
        : "You are MedMed AI, a health information assistant. The user has shared a photo with you. Analyze what you observe — any visible physical characteristics, skin conditions, eyes, or anything health-relevant. Describe clearly and provide educational health context. Always note this is not a medical diagnosis.";

      // Call our worker which calls Gemini with the image
      const res = await fetch(`${WORKER}/api/media/visual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ base64, mimeType: "image/jpeg", systemPrompt }),
      });

      if (!res.ok) throw new Error(`Worker returned ${res.status}`);
      const data = await res.json() as { analysis: string; error?: string };
      if (data.error) throw new Error(data.error);
      onAnalysis(data.analysis || "Analysis complete.");
    } catch (e) {
      console.error("Gemini vision error:", e);
      setError("Gemini couldn't analyze the image. Please try again.");
    }
  };

  const isActive = phase === "live" || phase === "recording";
  const showVideo = phase !== "error" && phase !== "processing";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col rounded-3xl overflow-hidden shadow-2xl"
        style={{
          backgroundColor: "#0a0a0a",
          border: "1px solid rgba(255,255,255,0.1)",
          width: "min(90vw, 640px)",
          maxHeight: "90vh",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3">
            {phase === "recording" && (
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
            )}
            <h2 className="text-[15px] font-semibold text-white">
              {type === "image" ? "Visual Analysis" : "Video Analysis"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-[20px] leading-none"
          >
            &times;
          </button>
        </div>

        {/* Camera viewport */}
        <div className="relative bg-black" style={{ aspectRatio: "16/9" }}>
          {/* Live video — mirrored so user sees themselves naturally */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ transform: "scaleX(-1)", display: showVideo ? "block" : "none" }}
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Loading state */}
          {phase === "loading" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="flex gap-1.5">
                {[0, 150, 300].map(d => (
                  <span key={d} className="h-2 w-2 rounded-full bg-white animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
              <p className="text-[13px] text-gray-400">Requesting camera access…</p>
            </div>
          )}

          {/* Flash frame */}
          {phase === "flash" && (
            <div className="absolute inset-0 bg-white opacity-80 pointer-events-none" />
          )}

          {/* Processing state */}
          {phase === "processing" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black">
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
                <div className="absolute inset-0 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-white text-[15px] font-medium mb-1">Gemini is analyzing…</p>
                <p className="text-gray-400 text-[12px]">This takes a few seconds</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {phase === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 bg-black">
              <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(239,68,68,0.15)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.75" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <p className="text-[14px] text-center text-gray-300 leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* Recording badge */}
          {phase === "recording" && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              REC {countdown}s
            </div>
          )}

          {/* Gemini badge */}
          {isActive && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold text-white"
              style={{ backgroundColor: "rgba(124,58,237,0.85)" }}>
              ✦ Powered by Gemini
            </div>
          )}

          {/* Viewfinder corners */}
          {isActive && (
            <div className="absolute inset-0 pointer-events-none">
              {/* TL */}
              <div className="absolute top-4 left-4 h-6 w-6 border-t-2 border-l-2 rounded-tl-sm border-white/50" />
              {/* TR */}
              <div className="absolute top-4 right-4 h-6 w-6 border-t-2 border-r-2 rounded-tr-sm border-white/50" />
              {/* BL */}
              <div className="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 rounded-bl-sm border-white/50" />
              {/* BR */}
              <div className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 rounded-br-sm border-white/50" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="px-5 py-4 flex items-center justify-between gap-3">
          {phase === "error" ? (
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-[14px] font-semibold text-white transition-colors"
              style={{ backgroundColor: "#333" }}
            >
              Close
            </button>
          ) : phase === "processing" ? (
            <div className="flex-1 py-3 text-center text-[13px] text-gray-400">
              Analyzing with Gemini Vision…
            </div>
          ) : type === "image" ? (
            <>
              <button
                onClick={capturePhoto}
                disabled={!cameraReady || phase === "flash"}
                className="flex-1 py-3 rounded-xl text-[14px] font-semibold text-white transition-all disabled:opacity-40"
                style={{ backgroundColor: "#7c3aed" }}
              >
                {phase === "flash" ? "Capturing…" : "Capture & Analyze"}
              </button>
              <button onClick={onClose} className="px-5 py-3 rounded-xl text-[13px] text-gray-400 hover:text-white transition-colors" style={{ backgroundColor: "#1a1a1a" }}>
                Cancel
              </button>
            </>
          ) : phase === "recording" ? (
            <>
              <button
                onClick={stopRecording}
                className="flex-1 py-3 rounded-xl text-[14px] font-semibold text-white transition-colors"
                style={{ backgroundColor: "#dc2626" }}
              >
                Stop & Analyze ({countdown}s left)
              </button>
            </>
          ) : (
            <>
              <button
                onClick={startRecording}
                disabled={!cameraReady}
                className="flex-1 py-3 rounded-xl text-[14px] font-semibold text-white transition-all disabled:opacity-40"
                style={{ backgroundColor: "#7c3aed" }}
              >
                Start Recording
              </button>
              <button onClick={onClose} className="px-5 py-3 rounded-xl text-[13px] text-gray-400 hover:text-white transition-colors" style={{ backgroundColor: "#1a1a1a" }}>
                Cancel
              </button>
            </>
          )}
        </div>

        {/* Footer hint */}
        {isActive && (
          <p className="text-center text-[11px] text-gray-500 pb-4 -mt-1 px-4">
            {type === "image"
              ? "Gemini will analyze your photo and provide health context. Not a diagnosis."
              : "Record up to 45 seconds. Gemini will analyze based on a frame capture."}
          </p>
        )}
      </div>
    </div>
  );
}
