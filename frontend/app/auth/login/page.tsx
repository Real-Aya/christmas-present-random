"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState<string[]>(["", "", "", "", ""]);
  const [isMuted, setIsMuted] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioStartedRef = useRef(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const studentId = pin.join("");
    if (studentId.length === 5) {
      router.push("/plays/card");
    }
  };

  const handlePinChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (value && index < 4) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const numbers = text.replace(/\D/g, "").slice(0, 5);
        const newPin = [...pin];
        numbers.split("").forEach((num, i) => {
          if (index + i < 5) newPin[index + i] = num;
        });
        setPin(newPin);
        inputRefs.current[Math.min(index + numbers.length, 4)]?.focus();
      });
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      setIsMuted(prev => {
        audioRef.current!.muted = !prev;
        return !prev;
      });
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.25;
    audio.loop = true;
    audio.muted = true;
    
    const startAudio = async () => {
      if (audioStartedRef.current || !audio.paused) return;
      try {
        await audio.play();
        if (!isMuted) audio.muted = false;
        audioStartedRef.current = true;
      } catch (error) {
        console.error("Audio play failed:", error);
      }
    };
    
    const tryAutoplay = () => audio.readyState >= 2 && startAudio();
    const handleUserInteraction = () => {
      if (!audioStartedRef.current && audio.paused) {
        if (!isMuted) audio.muted = false;
        startAudio();
        events.forEach(e => document.removeEventListener(e, handleUserInteraction));
      }
    };
    
    audio.addEventListener("canplay", tryAutoplay);
    audio.addEventListener("loadeddata", tryAutoplay);
    if (audio.readyState >= 2) tryAutoplay();
    
    const events = ["click", "keydown", "touchstart", "mousedown", "pointerdown"];
    events.forEach(e => document.addEventListener(e, handleUserInteraction, { once: true }));

    return () => {
      audio.pause();
      audio.removeEventListener("canplay", tryAutoplay);
      audio.removeEventListener("loadeddata", tryAutoplay);
      events.forEach(e => document.removeEventListener(e, handleUserInteraction));
    };
  }, []);

  useEffect(() => {
    if (audioRef.current && audioStartedRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    class Particle {
      x: number; y: number; size: number; speed: number; opacity: number; drift: number;
      canvasWidth: number; canvasHeight: number;

      constructor(w: number, h: number) {
        this.canvasWidth = w; this.canvasHeight = h;
        this.x = Math.random() * w; this.y = Math.random() * h;
        this.size = Math.random() * 0.5 + 0.4;
        this.speed = Math.random() * 1.5 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.drift = Math.random() * 2 - 1;
      }

      update() {
        this.y += this.speed; this.x += this.drift;
        if (this.y > this.canvasHeight) { this.y = 0; this.x = Math.random() * this.canvasWidth; }
        if (this.x < 0) this.x = this.canvasWidth;
        if (this.x > this.canvasWidth) this.x = 0;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
      }
    }

    const particles = Array.from({ length: 52 }, () => new Particle(canvas.width, canvas.height));
    let animationId: number;

    const animate = () => {
      particles.forEach(p => { p.canvasWidth = canvas.width; p.canvasHeight = canvas.height; });
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(ctx); });
      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-red-950 via-red-900 to-red-950 overflow-hidden">
      {/* Background music */}
      <audio
        ref={audioRef}
        src="/assets/sound/Jingle-Bells-3(chosic.com).mp3"
        preload="auto"
        autoPlay
        muted
        onError={(e) => {
          console.error("Audio loading error:", e);
        }}
        onLoadedData={() => {
          console.log("Audio loaded successfully");
        }}
      />
      
      {/* Snow particles canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: "transparent" }}
      />
      <div className="relative z-10 w-full max-w-2xl px-6 mx-auto">
        <div className="rounded-2xl border-2 border-red-500/30 bg-white p-12 shadow-2xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="mb-3 text-4xl font-bold text-black">
              เข้าสู่ระบบ
            </h1>
            <p className="text-lg text-gray-700">
              กรุณาใส่เลขประจำตัวนักเรียน
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label 
                className="block mb-3 text-base font-medium text-black text-center"
              >
                เลขประจำตัวนักเรียน 5 หลัก
              </label>
              <div className="flex gap-3 justify-center">
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-16 h-16 rounded-lg border-2 border-red-300 bg-gray-50 text-center text-2xl font-bold text-black focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-400/30 transition-colors"
                    required
                  />
                ))}
              </div>
            </div>
            
            <button
              type="submit"
              className="group relative w-full rounded-xl px-6 py-5 font-bold text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-white shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] overflow-hidden border-2 border-red-600/20"
            >
              {/* Candy cane background with blur */}
              <div 
                className="absolute inset-0"
                style={{
                  background: 'repeating-linear-gradient(45deg, #ef4444 0px, #ef4444 16px, #ffffff 16px, #ffffff 32px)',
                  filter: 'blur(0.4px)',
                }}
              ></div>
              
              {/* Glossy overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
              
              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              <span 
                className="relative z-10 text-xl font-extrabold tracking-wide text-white text-stroke-black"
                style={{
                  WebkitTextStroke: '4px black',
                  paintOrder: 'stroke fill'
                }}
              >
                ไปสุ่มการ์ดกันเลย
              </span>
            </button>
          </form>
        </div>
        
        <div className="mt-6 flex justify-center">
          <button
            onClick={toggleMute}
            className="flex items-center gap-3 px-6 py-4 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 border-2 border-red-200"
            aria-label={isMuted ? "เปิดเสียง" : "ปิดเสียง"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {isMuted ? (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              )}
            </svg>
            <span className="text-red-600 font-semibold text-lg">{isMuted ? "เปิดเสียง" : "ปิดเสียง"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

