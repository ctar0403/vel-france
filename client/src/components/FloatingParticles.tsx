import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
}

export default function FloatingParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [viewportHeight, setViewportHeight] = useState(1000); // Default fallback

  useEffect(() => {
    // Calculate viewport height once to avoid forced reflows during animations
    const calculateViewportHeight = () => {
      setViewportHeight(window.innerHeight);
    };
    
    // Set initial viewport height
    calculateViewportHeight();
    
    // Update on resize (debounced to prevent excessive calculations)
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(calculateViewportHeight, 150);
    };
    
    window.addEventListener('resize', handleResize);
    const createParticle = (): Particle => ({
      id: Math.random(),
      x: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 4 + 4,
      delay: Math.random() * 2,
    });

    // Create initial particles
    const initialParticles = Array.from({ length: 5 }, createParticle);
    setParticles(initialParticles);

    // Create new particles periodically
    const interval = setInterval(() => {
      setParticles(prev => {
        const newParticle = createParticle();
        // Keep only recent particles to prevent memory issues
        const recentParticles = prev.slice(-4);
        return [...recentParticles, newParticle];
      });
    }, 2000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-1 overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: `rgba(212, 175, 55, 0.3)`,
              bottom: 0,
            }}
            initial={{ 
              y: 0, 
              opacity: 0, 
              rotate: 0 
            }}
            animate={{ 
              y: -viewportHeight - 100, 
              opacity: [0, 1, 1, 0], 
              rotate: 360 
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              ease: "easeInOut",
              opacity: {
                times: [0, 0.1, 0.9, 1],
                duration: particle.duration
              }
            }}
            onAnimationComplete={() => {
              setParticles(prev => 
                prev.filter(p => p.id !== particle.id)
              );
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
