
import React, { useState, useEffect, useRef } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

const Typewriter: React.FC<TypewriterProps> = ({ text, speed = 50, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);
  const hasCompleted = useRef(false);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      if (!hasCompleted.current && onComplete) {
        hasCompleted.current = true;
        onComplete();
      }
    }
  }, [index, text, speed, onComplete]);

  return (
    <div className="whitespace-pre-wrap font-serif-luxury text-lg md:text-2xl leading-relaxed text-gray-100 drop-shadow-md tracking-wide">
      {displayedText}
      <span className={`inline-block w-[2px] h-4 md:h-5 bg-[#c5a059] ml-1 ${index < text.length ? 'animate-pulse' : 'hidden'}`}></span>
    </div>
  );
};

export default Typewriter;
