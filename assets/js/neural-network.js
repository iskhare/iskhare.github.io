/**
 * Brownian Motion Particle Animation
 * Creates an ambient background with floating particles
 */

class BrownianParticles {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.isVisible = false;

    // Configuration
    this.config = {
      particleCount: 60,
      particleMinSize: 2,
      particleMaxSize: 5,
      maxSpeed: 0.8,
      acceleration: 0.05,
      friction: 0.98,
      colors: [
        'rgba(37, 99, 235, 0.4)',   // Bright blue
        'rgba(6, 182, 212, 0.45)',  // Vibrant cyan
        'rgba(16, 185, 129, 0.4)',  // Bright teal/emerald
        'rgba(139, 92, 246, 0.4)'   // Vibrant purple
      ]
    };

    this.init();
  }

  init() {
    this.setupCanvas();
    this.createParticles();
    this.setupIntersectionObserver();
    this.setupResizeObserver();
  }

  setupCanvas() {
    const container = this.canvas.parentElement;
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    this.ctx.scale(dpr, dpr);

    this.width = rect.width;
    this.height = rect.height;
  }

  createParticles() {
    this.particles = [];

    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * this.config.maxSpeed,
        vy: (Math.random() - 0.5) * this.config.maxSpeed,
        size: this.config.particleMinSize + Math.random() * (this.config.particleMaxSize - this.config.particleMinSize),
        color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  updateParticles() {
    this.particles.forEach(p => {
      // Brownian motion: add random acceleration
      p.vx += (Math.random() - 0.5) * this.config.acceleration;
      p.vy += (Math.random() - 0.5) * this.config.acceleration;

      // Apply friction
      p.vx *= this.config.friction;
      p.vy *= this.config.friction;

      // Clamp velocity
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > this.config.maxSpeed) {
        p.vx = (p.vx / speed) * this.config.maxSpeed;
        p.vy = (p.vy / speed) * this.config.maxSpeed;
      }

      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < -p.size) p.x = this.width + p.size;
      if (p.x > this.width + p.size) p.x = -p.size;
      if (p.y < -p.size) p.y = this.height + p.size;
      if (p.y > this.height + p.size) p.y = -p.size;

      // Gentle size pulsing
      p.phase += 0.02;
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.particles.forEach(p => {
      const pulseScale = 1 + Math.sin(p.phase) * 0.15;
      const size = p.size * pulseScale;

      // Soft glow
      const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2.5);
      gradient.addColorStop(0, p.color);
      gradient.addColorStop(1, 'transparent');

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, size * 2.5, 0, Math.PI * 2);
      this.ctx.fillStyle = gradient;
      this.ctx.fill();

      // Core particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
    });
  }

  animate() {
    if (!this.isVisible) return;

    this.updateParticles();
    this.draw();

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  start() {
    if (this.animationId) return;
    this.isVisible = true;
    this.animate();
  }

  stop() {
    this.isVisible = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.start();
        } else {
          this.stop();
        }
      });
    }, { threshold: 0.1 });

    observer.observe(this.canvas);
  }

  setupResizeObserver() {
    const resizeObserver = new ResizeObserver(() => {
      this.setupCanvas();
      this.createParticles();
    });

    resizeObserver.observe(this.canvas.parentElement);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new BrownianParticles('neural-network-canvas');
});
