
import React, { useEffect, useRef } from 'react';

const Background: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let stars: Star[] = [];
    let shootingStars: ShootingStar[] = [];
    let particles: Particle[] = [];
    
    class Star {
      x: number; y: number; size: number; opacity: number; speed: number;
      constructor(w: number, h: number) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 1.5;
        this.opacity = Math.random();
        this.speed = Math.random() * 0.02 + 0.005;
      }
      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 200, 220, ${this.opacity})`;
        ctx.fill();
        this.opacity += this.speed;
        if (this.opacity > 1 || this.opacity < 0.2) this.speed = -this.speed;
      }
    }

    class ShootingStar {
      x: number; y: number; len: number; speed: number; size: number; active: boolean;
      constructor(w: number) {
        this.x = Math.random() * w;
        this.y = 0;
        this.len = Math.random() * 80 + 20;
        this.speed = Math.random() * 10 + 5;
        this.size = Math.random() * 1 + 0.5;
        this.active = true;
      }
      draw() {
        if (!ctx || !this.active) return;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = this.size;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.len, this.y + this.len);
        ctx.stroke();
        this.x -= this.speed;
        this.y += this.speed;
        if (this.y > canvas!.height || this.x < 0) this.active = false;
      }
    }

    class Particle {
      x: number; y: number; size: number; speedY: number; speedX: number; opacity: number;
      constructor(w: number, h: number) {
        this.x = Math.random() * w;
        this.y = h + Math.random() * 100;
        this.size = Math.random() * 3 + 1;
        this.speedY = -(Math.random() * 1 + 0.5);
        this.speedX = Math.random() * 1 - 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
      }
      draw() {
        if (!ctx) return;
        ctx.beginPath();
        // Draw a small soft circle that looks like a petal or floating heart-dust
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 182, 193, ${this.opacity})`;
        ctx.fill();
        this.y += this.speedY;
        this.x += this.speedX;
        if (this.y < -10) {
          this.y = canvas!.height + 10;
          this.x = Math.random() * canvas!.width;
        }
      }
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = Array.from({ length: 150 }, () => new Star(canvas.width, canvas.height));
      particles = Array.from({ length: 40 }, () => new Particle(canvas.width, canvas.height));
    };

    const animate = () => {
      // Create a romantic gradient background
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#0c0c1e'); // Deep Space
      grad.addColorStop(0.5, '#1a0b2e'); // Deep Purple
      grad.addColorStop(1, '#2d0b25'); // Deep Rose/Wine
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => star.draw());
      particles.forEach(p => p.draw());
      
      if (Math.random() < 0.01) {
        shootingStars.push(new ShootingStar(canvas.width));
      }
      shootingStars = shootingStars.filter(s => s.active);
      shootingStars.forEach(s => s.draw());

      requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div className="fixed inset-0 z-0">
      <canvas ref={canvasRef} className="block" />
      <div className="absolute inset-0 bg-gradient-to-t from-pink-500/5 to-transparent pointer-events-none" />
    </div>
  );
};

export default Background;
