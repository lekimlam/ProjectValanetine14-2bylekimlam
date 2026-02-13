
import React, { useState, useRef, useEffect } from 'react';
import Background from './components/Background';
import PasscodeScreen from './components/PasscodeScreen';
import MessageScreen from './components/MessageScreen';
import ValentineWorld from './components/ValentineWorld';

const App: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [show3DWorld, setShow3DWorld] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false); // Trạng thái đã bấm nút bắt đầu chưa
  const [isPortrait, setIsPortrait] = useState(false); // Kiểm tra màn hình dọc

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const CORRECT_PIN = "1402";

  // Kiểm tra xoay màn hình
  useEffect(() => {
    const checkOrientation = () => {
      // Logic đơn giản: Nếu chiều cao lớn hơn chiều rộng => Dọc
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const handleStart = async () => {
    try {
      // Yêu cầu Fullscreen
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        await (document.documentElement as any).webkitRequestFullscreen();
      } else if ((document.documentElement as any).msRequestFullscreen) {
        await (document.documentElement as any).msRequestFullscreen();
      }
    } catch (err) {
      console.log("Fullscreen request failed or denied", err);
    }
    
    setHasInteracted(true);
    // Tự động bật nhạc khi bắt đầu để tạo cảm xúc
    toggleMusic(true);
  };

  const handleUnlock = (pin: string) => {
    if (pin === CORRECT_PIN) {
      setIsUnlocked(true);
    } else {
      const screen = document.getElementById('passcode-container');
      screen?.classList.add('animate-shake');
      setTimeout(() => screen?.classList.remove('animate-shake'), 500);
    }
  };

  const toggleMusic = async (forcePlay = false) => {
    if (!audioRef.current) {
      // Ưu tiên sử dụng file local `/nguoiamphu.mp3` nếu người dùng thêm vào thư mục `public/`;
      // Nếu không có thì fallback về bản nhạc remote.
      const localSrc = '/nguoiamphu.mp3';
      const remoteSrc = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-111580.mp3';
      let src = remoteSrc;
      try {
        const resp = await fetch(localSrc, { method: 'HEAD' });
        if (resp.ok) src = localSrc;
      } catch (e) {
        // Nếu fetch thất bại (ví dụ CORS hoặc file không tồn tại), dùng remote
      }

      audioRef.current = new Audio(src);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.6;
    }

    if (forcePlay || !isPlaying) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.log("Audio play blocked", e));
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Màn hình nhắc nhở xoay ngang
  if (hasInteracted && isPortrait) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center text-center p-6 animate-fadeIn">
        <div className="w-20 h-20 mb-6 border-4 border-[#c5a059] rounded-xl flex items-center justify-center animate-spin-slow">
            <svg className="w-10 h-10 text-[#c5a059] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
        </div>
        <h2 className="text-2xl font-display text-[#c5a059] mb-4">Vui lòng xoay ngang điện thoại</h2>
        <p className="text-white/60 font-serif-luxury text-lg">Để có trải nghiệm tuyệt vời nhất cùng anh ❤️</p>
        <div className="mt-8 relative w-16 h-28 border-2 border-white/20 rounded-2xl flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-shimmer"></div>
            <svg className="w-8 h-8 text-white/50 transform rotate-90" fill="currentColor" viewBox="0 0 24 24"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/></svg>
        </div>
      </div>
    );
  }

  // Màn hình bắt đầu (Intro)
  if (!hasInteracted) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
        <Background />
        <div className="z-10 flex flex-col items-center gap-8 animate-fadeInUp">
          <div className="space-y-2">
            <p className="text-[#c5a059] tracking-[0.3em] uppercase text-xs">Valanetine 14/2</p>
            <h1 className="text-4xl md:text-6xl font-display italic text-white">Tui có một món quà tặng bạn nè 💕</h1>
          </div>
          
          <button 
            onClick={handleStart}
            className="group relative px-10 py-4 bg-transparent border border-[#c5a059]/50 text-[#c5a059] overflow-hidden rounded-full transition-all duration-500 hover:scale-105 hover:border-[#c5a059] hover:shadow-[0_0_30px_rgba(197,160,89,0.3)]"
          >
            <div className="absolute inset-0 w-0 bg-[#c5a059] transition-all duration-[400ms] ease-out group-hover:w-full opacity-10" />
            <span className="relative font-serif-luxury text-xl font-bold tracking-wider flex items-center gap-3">
              Mở điiii
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </span>
          </button>
          
          <p className="text-white/30 text-xs mt-4">Trước khi xem thì bạn phải bật xoay ngang màn hình á nhaa!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden text-white selection:bg-pink-500/30 bg-[#050505]">
      {/* Chỉ hiện Background 2D khi không ở trong thế giới 3D */}
      {!show3DWorld && <Background />}
      
      <div className="relative z-10 w-full h-full">
        {show3DWorld ? (
          <ValentineWorld onBack={() => setShow3DWorld(false)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4 animate-fadeIn">
            {!isUnlocked ? (
              <div id="passcode-container">
                <PasscodeScreen onUnlock={handleUnlock} />
              </div>
            ) : (
              <MessageScreen onGoToWorld={() => setShow3DWorld(true)} />
            )}
          </div>
        )}
      </div>

      {/* Luxury Music Control - Always Visible */}
      <button 
        onClick={() => toggleMusic()}
        className="fixed bottom-8 left-8 z-50 group flex items-center gap-4 bg-black/40 hover:bg-white/10 backdrop-blur-2xl border border-white/10 p-2 pr-6 rounded-full transition-all duration-500 hover:scale-105"
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-700 ${isPlaying ? 'bg-[#c5a059] rotate-[360deg]' : 'bg-white/10'}`}>
          {isPlaying ? (
             <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          ) : (
             <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          )}
        </div>
        <div className="flex flex-col items-start">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Bật Nhạc</span>
          <span className="text-sm font-semibold text-[#c5a059]">{isPlaying ? 'Người Âm Phủ' : 'Play Music'}</span>
        </div>
      </button>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
        @keyframes fadeIn {
            from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 1s ease-out; }
        .animate-fadeInUp { animation: fadeInUp 1.2s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .animate-spin-slow { animation: spin 4s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default App;
