import React, { useState, useRef, useEffect } from 'react';
import ScratchCard from './ScratchCard';
import Typewriter from './Typewriter';

interface MessageScreenProps {
  onGoToWorld: () => void;
}

const MEMORY_IMAGES = [
  "/pic1.jpg",
  "/pic2.jpg",
  "/pic3.jpg",
  "/pic4.jpg",
  "/pic5.jpg",
];

const MessageScreen: React.FC<MessageScreenProps> = ({ onGoToWorld }) => {
  const [isScratched, setIsScratched] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [hasCompletedOneCycle, setHasCompletedOneCycle] = useState(false);

  // Touch swipe cho mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > minSwipeDistance) handleNextImage();
    else if (distance < -minSwipeDistance) handlePrevImage();
  };

  const handleNextImage = () => {
    setCurrentImgIndex((prev) => (prev + 1) % MEMORY_IMAGES.length);
  };

  const handlePrevImage = () => {
    setCurrentImgIndex((prev) => (prev - 1 + MEMORY_IMAGES.length) % MEMORY_IMAGES.length);
  };

  // Auto-play + detect hoàn thành 1 vòng
  useEffect(() => {
    if (!isScratched) return;

    const interval = setInterval(() => {
      setCurrentImgIndex((prev) => {
        const next = (prev + 1) % MEMORY_IMAGES.length;
        // Hoàn thành 1 vòng khi quay về 0 từ vị trí khác 0
        if (next === 0 && prev !== 0) {
          setHasCompletedOneCycle(true);
        }
        return next;
      });
    }, 3000); // 3 giây mỗi ảnh, chỉnh nếu muốn nhanh/chậm hơn

    return () => clearInterval(interval);
  }, [isScratched]);

  const message = "Chúc bạn một Valentine thật ngọt ngào như kẹo, rực rỡ như hoa và luôn cười thật tươi nhé! 14/2 vui vẻ nha! Mong bạn luôn xinh đẹp, hạnh phúc và được yêu thương thật nhiều 💕 Valanetine này chúc bạn nhận được thật nhiều Chocolate nha 😆";

  const showExploreButton = isScratched && isTypingComplete && hasCompletedOneCycle;

  return (
    <div className="flex flex-col lg:flex-row items-center justify-start lg:justify-center w-full h-full max-w-6xl mx-auto px-4 py-8 gap-8 lg:gap-20 overflow-y-auto lg:overflow-hidden animate-fadeIn">
      
      {/* Khung ảnh sang trọng */}
      <div className="w-full max-w-[320px] lg:max-w-[400px] flex-shrink-0 relative flex justify-center order-1 lg:order-2">
        <div className="relative w-full aspect-[3/4] p-1.5 bg-white/5 backdrop-blur-sm border border-[#c5a059]/30 rounded-xl shadow-2xl overflow-hidden group">
          
          {/* Slideshow ảnh - chỉ hiện sau khi cào xong */}
          <div 
            className={`relative w-full h-full bg-[#1a1a1a] rounded-lg overflow-hidden cursor-pointer touch-pan-y transition-all duration-1000 ${
              isScratched ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {MEMORY_IMAGES.map((img, idx) => (
              <div 
                key={idx} 
                className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
                  idx === currentImgIndex ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105'
                }`}
              >
                <img src={img} alt={`Memory ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}

            {isScratched && (
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent z-20 flex justify-center">
                <div className="flex gap-1.5">
                  {MEMORY_IMAGES.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentImgIndex ? 'w-5 bg-[#c5a059]' : 'w-1.5 bg-white/40'
                      }`} 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Lớp cào - chỉ hiện SAU KHI chữ gõ xong */}
          <div 
            className={`absolute inset-0 z-40 p-1.5 transition-all duration-1000 ${
              isTypingComplete && !isScratched ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="w-full h-full rounded-lg overflow-hidden shadow-inner">
              <ScratchCard onComplete={() => setIsScratched(true)} />
            </div>
          </div>

          {/* Nút mũi tên trái/phải - chỉ hiện sau khi cào xong */}
          {isScratched && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-black/40 hover:bg-[#c5a059]/70 text-white hover:text-black rounded-full transition-all duration-300 opacity-70 hover:opacity-100 shadow-lg backdrop-blur-sm"
                aria-label="Ảnh trước"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-black/40 hover:bg-[#c5a059]/70 text-white hover:text-black rounded-full transition-all duration-300 opacity-70 hover:opacity-100 shadow-lg backdrop-blur-sm"
                aria-label="Ảnh tiếp theo"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Phần chữ bên phải */}
      <div className="flex-1 max-w-lg space-y-6 order-2 lg:order-1 text-center lg:text-left pb-12 lg:pb-0">
        <h1 className="text-3xl md:text-5xl font-display italic text-[#c5a059]">
          Valentine DAY
        </h1>

        <div className="min-h-[140px] border-l-2 border-[#c5a059]/20 pl-4 text-left">
          <Typewriter text={message} speed={30} onComplete={() => setIsTypingComplete(true)} />
        </div>

        {/* Nút Khám phá - hiện sau khi hoàn thành 1 vòng slideshow */}
        {showExploreButton && (
          <div className="transition-all duration-1000 opacity-0 translate-y-4 animate-[fadeInUp_1s_ease-out_forwards] delay-500">
            <button 
              onClick={onGoToWorld}
              className="group relative w-full lg:w-auto px-6 py-3 bg-transparent border border-[#c5a059] text-[#c5a059] overflow-hidden rounded-full transition-all duration-500 active:scale-95 hover:scale-105"
            >
              <div className="absolute inset-0 w-0 bg-[#c5a059] transition-all duration-[400ms] group-hover:w-full opacity-10" />
              <div className="relative flex items-center justify-center gap-3">
                <span className="font-serif-luxury text-base font-bold tracking-wider">Khám phá vũ trụ Vanetine thì ấn zô </span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageScreen;