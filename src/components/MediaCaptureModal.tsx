import { useRef, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const WORKER = import.meta.env.VITE_WORKER_URL as string;

type MediaType = "image" | "video";

interface Props {
  type: MediaType;
  onAnalysis: (text: string) => void;
  onClose: () => void;
}

export function MediaCaptureModal({ type, onAnalysis, onClose }: Props) {
  const { user } = useAuth();
  const token = localStorage.getItem("mm_token");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [phase, setPhase] = useState<"preview" | "recording" | "processing" | "done">("preview");
  const [countdown, setCountdown] = useState(45);
  const [error, setError] = useState("");

  const MAX_SECS = 45;

  /* ── Open camera on mount ── */
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: type === "video" });
        if (!active) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch {
        setError("Camera access denied. Please allow camera permissions and try again.");
      }
    })();
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [type]);

  /* ── Capture photo ── */
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const vid = videoRef.current;
    canvas.width = vid.videoWidth;
    canvas.height = vid.videoHeight;
    canvas.getContext("2d")!.drawImage(vid, 0, 0);
    setPhase("processing");
    streamRef.current?.getTracks().forEach((t) => t.stop());

    canvas.toBlob(async (blob) => {
      if (!blob) { setError("Failed to capture image."); return; }
      await uploadAndAnalyze(blob, "image/jpeg", "image");
    }, "image/jpeg", 0.92);
  };

  /* ── Record video ── */
  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, { mimeType: "video/webm;codecs=vp9" });
    recorderRef.current = recorder;
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = async () => {
      setPhase("processing");
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      await uploadAndAnalyze(blob, "video/webm", "video");
    };
    recorder.start(250);
    setPhase("recording");

    let secs = MAX_SECS;
    const tick = setInterval(() => {
      secs -= 1;
      setCountdown(secs);
      if (secs <= 0) { clearInterval(tick); stopRecording(); }
    }, 1000);
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  /* ── Upload → Analyze ── */
  const uploadAndAnalyze = async (blob: Blob, contentType: string, mediaType: MediaType) => {
    try {
      const upRes = await fetch(`${WORKER}/api/media/upload`, {
        method: "POST",
        headers: { "Content-Type": contentType, Authorization: `Bearer ${token}` },
        body: blob,
      });
      const { id } = await upRes.json<{ id: string }>();

      const anRes = await fetch(`${WORKER}/api/media/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, type: mediaType }),
      });
      const { analysis } = await anRes.json<{ analysis: string }>();
      setPhase("done");
      onAnalysis(analysis);
    } catch {
      setError("Upload or analysis failed. Please try again.");
      setPhase("preview");
    }
  };

  const overlayStyle: React.CSSProperties = {
    position: "fixed", inset: 0, zIndex: 100,
    backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#fdf9f2", border: "1px solid #e0d8cc",
    borderRadius: "20px", padding: "24px", width: "100%", maxWidth: "480px",
    margin: "16px",
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[17px] font-semibold text-gray-900">
            {type === "image" ? "Take a Photo" : "Record Video"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 text-[20px] leading-none">&times;</button>
        </div>

        {error ? (
          <p className="text-[14px] text-red-600 text-center py-6">{error}</p>
        ) : phase === "processing" ? (
          <div className="flex flex-col items-center py-12 gap-4">
            <div className="flex gap-1.5">
              {[0, 150, 300].map((d) => (
                <span key={d} className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
            <p className="text-[14px] text-gray-500">Analyzing{type === "image" ? " image" : " video"}...</p>
          </div>
        ) : (
          <>
            {/* Live preview */}
            <div className="relative rounded-xl overflow-hidden bg-black mb-4" style={{ aspectRatio: "4/3" }}>
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              {phase === "recording" && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  {countdown}s
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />

            {/* Controls */}
            <div className="flex gap-3">
              {type === "image" ? (
                <button
                  onClick={capturePhoto}
                  className="flex-1 py-3 rounded-xl bg-primary text-white text-[14px] font-semibold hover:bg-primary/90 transition-colors"
                >
                  Capture Photo
                </button>
              ) : phase === "recording" ? (
                <button
                  onClick={stopRecording}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white text-[14px] font-semibold hover:bg-red-700 transition-colors"
                >
                  Stop Recording ({countdown}s left)
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  className="flex-1 py-3 rounded-xl bg-primary text-white text-[14px] font-semibold hover:bg-primary/90 transition-colors"
                >
                  Start Recording (max 45s)
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-3 rounded-xl text-[14px] text-gray-600 transition-colors"
                style={{ backgroundColor: "#e8e0d0" }}
              >
                Cancel
              </button>
            </div>
            <p className="text-[11px] text-gray-400 text-center mt-3">
              {type === "image" ? "Take a live photo — no uploads from your camera roll." : "Max 45 seconds. Audio is included."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
