import React, { useEffect, useRef, useState } from 'react';

interface ScratchCardProps {
  children: React.ReactNode; // Nội dung ẩn bên dưới (Ảnh, Lời chúc, v.v.)
  coverColor?: string;
  brushSize?: number;
  finishThreshold?: number; // % cào để tự mở (mặc định 40)
  onComplete?: () => void;
}

const ScratchCard: React.FC<ScratchCardProps> = ({
  children,
  brushSize = 40,
  finishThreshold = 40,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const prevPoint = useRef<{ x: number; y: number } | null>(null); // Để curve mượt

  // Cursor đồng xu cute (đã chỉnh size + vị trí center tốt hơn)
  const coinCursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%23FFD700" stroke="%23DAA520" stroke-width="1.5"/><text x="12" y="17" font-size="11" text-anchor="middle" fill="%23B8860B" font-weight="bold">$</text></svg>') 22 22, auto`;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Hỗ trợ retina / màn hình sắc nét
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();

    const resizeCanvas = () => {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);

      // Gradient hồng phấn lãng mạn
      const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      gradient.addColorStop(0, '#ff9a9e');
      gradient.addColorStop(0.5, '#fad0c4');
      gradient.addColorStop(1, '#dec0f1');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Text hướng dẫn cute
      ctx.font = 'bold 26px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 6;
      ctx.fillText('✨ Cào nhẹ nha ✨', rect.width / 2, rect.height / 2);
      ctx.shadowBlur = 0;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height),
      };
    };

    const scratch = (currentPos: { x: number; y: number }) => {
      if (!ctx) return;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = brushSize;
      ctx.globalAlpha = 0.95; // Hơi mờ nhẹ cho tự nhiên

      ctx.beginPath();
      if (prevPoint.current && lastPoint.current) {
        const midX = (prevPoint.current.x + lastPoint.current.x) / 2;
        const midY = (prevPoint.current.y + lastPoint.current.y) / 2;
        ctx.moveTo(midX, midY);
        ctx.quadraticCurveTo(lastPoint.current.x, lastPoint.current.y, currentPos.x, currentPos.y);
      } else {
        ctx.moveTo(currentPos.x, currentPos.y);
      }
      ctx.stroke();

      // Thêm hiệu ứng viền mềm (như cào thật)
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = brushSize * 1.5;
      ctx.beginPath();
      ctx.arc(currentPos.x, currentPos.y, brushSize / 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      prevPoint.current = lastPoint.current;
      lastPoint.current = currentPos;
    };

    const handleStart = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      setIsDrawing(true);
      const pos = getPos(e);
      lastPoint.current = pos;
      prevPoint.current = pos;
      scratch(pos); // Vẽ ngay điểm đầu
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      scratch(pos);
    };

    const handleEnd = () => {
      if (isDrawing) {
        setIsDrawing(false);
        lastPoint.current = null;
        prevPoint.current = null;
        checkCompletion();
      }
    };

    const checkCompletion = () => {
      if (!ctx || isCompleted) return;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let transparentCount = 0;

      // Sample nhanh (bước 8 để tối ưu)
      for (let i = 3; i < data.length; i += 32) { // 8*4 = 32
        if (data[i] === 0) transparentCount++;
      }

      const totalSamples = Math.floor(data.length / 32);
      const percent = (transparentCount / totalSamples) * 100;

      if (percent >= finishThreshold) {
        setIsCompleted(true);
        onComplete?.();
      }
    };

    // Events
    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    canvas.addEventListener('touchstart', handleStart, { passive: false });
    canvas.addEventListener('touchmove', handleMove, { passive: false });
    canvas.addEventListener('touchend', handleEnd);
    canvas.addEventListener('touchcancel', handleEnd);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', handleStart);
      canvas.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      canvas.removeEventListener('touchstart', handleStart);
      canvas.removeEventListener('touchmove', handleMove);
      canvas.removeEventListener('touchend', handleEnd);
      canvas.removeEventListener('touchcancel', handleEnd);
    };
  }, [isDrawing, isCompleted, brushSize, finishThreshold, onComplete]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-pink-100 to-purple-100 select-none"
      style={{ touchAction: 'none' }}
    >
      {/* Nội dung ẩn (ảnh + lời chúc) */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-800 ${
          isCompleted ? 'blur-none scale-100' : 'blur-[3px] scale-105'
        }`}
      >
        {children}
      </div>

      {/* Lớp cào */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 z-10 transition-opacity duration-1000 ${
          isCompleted ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        style={{ cursor: isCompleted ? 'default' : coinCursor }}
      />
    </div>
  );
};

export default ScratchCard;