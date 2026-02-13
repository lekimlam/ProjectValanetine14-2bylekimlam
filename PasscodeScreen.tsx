import React, { useState } from 'react';

interface PasscodeScreenProps {
  onUnlock: (pin: string) => void;
}

const CORRECT_PIN = '1402'; // Mật khẩu cứng (bạn có thể đổi hoặc truyền từ ngoài vào)

const PasscodeScreen: React.FC<PasscodeScreenProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length >= 4) return;

    const newPin = pin + num;
    setPin(newPin);

    // Khi đủ 4 số → check ngay
    if (newPin.length === 4) {
      if (newPin === CORRECT_PIN) {
        // Đúng → mở khóa
        onUnlock(newPin);
      } else {
        // Sai → shake + reset về rỗng
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setPin('');
        }, 500); // Thời gian shake ~0.5s
      }
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div
      className={`bg-white/10 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-2xl border border-white/20 w-[90vw] max-w-[360px] flex flex-col items-center transition-all duration-300 ${
        shake ? 'animate-shake' : ''
      }`}
    >
      <h1 className="text-xl md:text-2xl font-bold italic mb-8 text-pink-100 tracking-wider drop-shadow-md">
        Nhập mật mã đi bạnn!
      </h1>

      {/* PIN Indicators */}
      <div className="flex gap-5 mb-10">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
              i < pin.length
                ? 'bg-pink-400 scale-125 border-pink-400 shadow-[0_0_12px_rgba(244,114,182,0.7)]'
                : 'border-white/40 bg-transparent'
            }`}
          />
        ))}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
        {keys.map((key) => (
          <button
            key={key}
            onClick={() => handleKeyPress(key)}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 hover:bg-white/15 active:bg-pink-500/30 border border-white/10 text-2xl md:text-3xl text-white font-medium flex items-center justify-center transition-all backdrop-blur-sm shadow-sm touch-manipulation"
          >
            {key}
          </button>
        ))}

        {/* Hàng dưới: Backspace - 0 - (spacer) */}
        <button
          onClick={handleBackspace}
          className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-transparent hover:bg-red-500/20 active:bg-red-500/40 border border-white/10 text-white/80 flex items-center justify-center transition-all backdrop-blur-sm"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-9.172a2 2 0 00-1.414.586L3 12z"
            />
          </svg>
        </button>

        <button
          onClick={() => handleKeyPress('0')}
          className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 hover:bg-white/15 active:bg-pink-500/30 border border-white/10 text-2xl md:text-3xl text-white font-medium flex items-center justify-center transition-all backdrop-blur-sm shadow-sm touch-manipulation"
        >
          0
        </button>

        {/* Spacer để cân đối grid */}
        <div className="w-16 h-16 md:w-20 md:h-20" />
      </div>

      <p className="mt-10 text-pink-200/70 text-sm uppercase tracking-widest font-light text-center">
        Gợi ý: Ngày Valentine
      </p>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>
    </div>
  );
};

export default PasscodeScreen;