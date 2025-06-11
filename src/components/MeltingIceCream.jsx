import React, { useState, useEffect, useRef } from 'react';
import '../styles/MeltingIceCream.css';

const MeltingIceCream = ({ duration = 15, onMelted, onWarning }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [meltProgress, setMeltProgress] = useState(0);
  const [isWarning, setIsWarning] = useState(false);
  const svgRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        
        if (newTime <= 0) {
          setMeltProgress(1);
          onMelted && onMelted();
          return 0;
        }

        const progress = 1 - (newTime / (duration * 60));
        setMeltProgress(progress);

        // Warning at 75%
        if (progress > 0.75 && !isWarning) {
          setIsWarning(true);
          onWarning && onWarning();
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [duration, onMelted, onWarning, isWarning]);

  // Update SVG based on melt progress
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const scoops = svg.querySelectorAll('.scoop');
    const drips = svg.querySelectorAll('.drip');
    const puddle = svg.querySelector('.puddle');

    // Animate scoops melting
    scoops.forEach((scoop, index) => {
      const meltAmount = Math.max(0, meltProgress - (index * 0.15));
      const originalRy = scoop.getAttribute('data-original-ry') || scoop.getAttribute('ry');
      const originalCy = scoop.getAttribute('data-original-cy') || scoop.getAttribute('cy');
      
      if (!scoop.getAttribute('data-original-ry')) {
        scoop.setAttribute('data-original-ry', originalRy);
        scoop.setAttribute('data-original-cy', originalCy);
      }

      const newRy = parseFloat(originalRy) + (meltAmount * 8);
      const newCy = parseFloat(originalCy) + (meltAmount * 5);
      
      scoop.setAttribute('ry', newRy);
      scoop.setAttribute('cy', newCy);
      scoop.style.opacity = Math.max(0.2, 1 - (meltAmount * 0.6));
    });

    // Show drips
    drips.forEach((drip, index) => {
      if (meltProgress > 0.3 + (index * 0.1)) {
        drip.style.opacity = Math.min(0.8, meltProgress - 0.2);
        const originalRy = drip.getAttribute('data-original-ry') || drip.getAttribute('ry');
        if (!drip.getAttribute('data-original-ry')) {
          drip.setAttribute('data-original-ry', originalRy);
        }
        const newRy = parseFloat(originalRy) + (meltProgress * 12);
        drip.setAttribute('ry', newRy);
      }
    });

    // Show puddle
    if (puddle && meltProgress > 0.85) {
      puddle.style.opacity = (meltProgress - 0.85) * 6.67; // Scale to 1.0 at 100%
    }
  }, [meltProgress]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="melting-ice-cream-container">
      <svg 
        ref={svgRef}
        width="70" 
        height="100" 
        viewBox="0 0 70 100" 
        className={`ice-cream-svg ${isWarning ? 'warning' : ''} ${meltProgress >= 1 ? 'melted' : ''}`}
      >
        {/* Cone */}
        <polygon 
          points="25,65 45,65 35,90" 
          fill="#D2691E" 
          stroke="#A0522D" 
          strokeWidth="1"
        />
        
        {/* Ice cream scoops */}
        <ellipse className="scoop" cx="35" cy="55" rx="15" ry="12" fill="#FFB6C1" />
        <ellipse className="scoop" cx="35" cy="42" rx="12" ry="10" fill="#FFFFFF" />
        <ellipse className="scoop" cx="35" cy="32" rx="10" ry="8" fill="#FFB6C1" />
        
        {/* Melting drips */}
        <ellipse className="drip" cx="28" cy="70" rx="2" ry="6" fill="#FFB6C1" opacity="0" />
        <ellipse className="drip" cx="42" cy="72" rx="1.5" ry="5" fill="#FFFFFF" opacity="0" />
        <ellipse className="drip" cx="35" cy="75" rx="1" ry="4" fill="#FFB6C1" opacity="0" />
        
        {/* Final puddle */}
        <ellipse className="puddle" cx="35" cy="85" rx="25" ry="5" fill="#E6E6FA" opacity="0" />
      </svg>
      
      {timeLeft > 0 && (
        <div className="timer-display">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </div>
      )}
      
      {meltProgress >= 1 && (
        <div className="melted-message">
          Time for a break! 🧠💤
        </div>
      )}
    </div>
  );
};

export default MeltingIceCream;