import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronsLeftRight, Sparkles } from 'lucide-react';
import type { Language } from '../types';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  language?: Language;
  className?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel,
  afterLabel,
  language = 'ru',
  className = '',
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const defaultBefore = language === 'kz' ? 'БҰРЫН' : language === 'en' ? 'BEFORE' : 'БЫЛО';
  const defaultAfter = language === 'kz' ? 'ҚАЗІР (ШЕШІЛДІ)' : language === 'en' ? 'AFTER (RESOLVED)' : 'СТАЛО (РЕШЕНО)';

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    };

    const handleGlobalTouchEnd = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('touchmove', handleGlobalTouchMove);
      window.addEventListener('touchend', handleGlobalTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging, handleMove]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`relative overflow-hidden select-none rounded-2xl cursor-ew-resize group ${className}`}
      style={{ touchAction: 'none' }}
    >
      {/* After Image (Background) */}
      <img
        src={afterImage}
        alt="After result"
        className="w-full h-full object-cover pointer-events-none"
        draggable={false}
      />

      {/* After Tag */}
      <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white font-bold text-[10px] tracking-wider uppercase backdrop-blur-md shadow-lg flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-amber-300" />
        <span>{afterLabel || defaultAfter}</span>
      </div>

      {/* Before Image (Clipped Overlay) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={beforeImage}
          alt="Before problem"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
            maxWidth: 'none',
          }}
          draggable={false}
        />

        {/* Before Tag */}
        <div className="absolute bottom-3 left-3 z-10 px-2.5 py-1 rounded-full bg-rose-600/90 text-white font-bold text-[10px] tracking-wider uppercase backdrop-blur-md shadow-lg">
          {beforeLabel || defaultBefore}
        </div>
      </div>

      {/* Draggable Divider Line */}
      <div
        className="absolute top-0 bottom-0 z-20 w-1 bg-white/90 shadow-[0_0_15px_rgba(255,255,255,0.7)] pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Handle Button */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white text-slate-900 shadow-2xl flex items-center justify-center border-2 border-rose-500 group-hover:scale-110 transition-transform">
          <ChevronsLeftRight className="w-4 h-4 text-slate-900" />
        </div>
      </div>

      {/* Instruction hint (fades on hover) */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-950/75 text-slate-200 text-[10px] font-semibold backdrop-blur-md border border-white/10 opacity-70 group-hover:opacity-0 transition-opacity pointer-events-none">
        {language === 'kz' ? 'Салыстыру үшін сырғытыңыз ↔' : language === 'en' ? 'Drag slider to compare ↔' : 'Потяните ползунок ↔'}
      </div>
    </div>
  );
};
