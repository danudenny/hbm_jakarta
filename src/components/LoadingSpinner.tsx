import React, { useEffect, useState } from 'react';

interface LoadingSpinnerProps {
  onLoadComplete?: () => void;
  minDisplayTime?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  onLoadComplete, 
  minDisplayTime = 2500 
}) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const startTime = Date.now();
    
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 - prev) * 0.1;
        return newProgress > 99 ? 100 : newProgress;
      });
    }, 100);
    
    // Handle window load event
    const handleLoad = () => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime);
      
      // Ensure the spinner is shown for at least minDisplayTime
      setTimeout(() => {
        setProgress(100);
        
        // Fade out animation before calling onLoadComplete
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            if (onLoadComplete) onLoadComplete();
          }, 500);
        }, 800);
      }, remainingTime);
    };
    
    // Listen for window load event
    window.addEventListener('load', handleLoad);
    
    // If window already loaded, call handleLoad directly
    if (document.readyState === 'complete') {
      handleLoad();
    }
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('load', handleLoad);
    };
  }, [minDisplayTime, onLoadComplete]);
  
  // Calculate clip path based on progress
  const clipPathValue = `inset(${100 - progress}% 0 0 0)`;
  
  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-primary to-primary-dark transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="relative w-full max-w-md px-4 flex flex-col items-center">
        <div className="relative h-32 md:h-40 w-full flex items-center justify-center overflow-hidden">
          {/* Background HBM Text */}
          <div className="hbm-loading-text text-7xl md:text-9xl font-black text-white/20 text-center">
            HBM
          </div>
          
          {/* Clipped HBM Text with Background Image */}
          <div 
            className="absolute inset-0 flex items-center justify-center overflow-hidden"
            style={{
              clipPath: clipPathValue,
              WebkitClipPath: clipPathValue,
              transition: 'clip-path 0.5s ease-out, -webkit-clip-path 0.5s ease-out'
            }}
          >
            <div className="hbm-loading-text text-7xl md:text-9xl font-black text-white text-center relative">
              HBM
              {/* Background image clipped inside text */}
              <div 
                className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-80"
                style={{ 
                  backgroundImage: "url('/images/hero-bg.jpg')",
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                HBM
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-white/20 mt-8 rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Loading text */}
        <div className="text-white/70 text-center mt-4 text-sm font-medium tracking-wider">
          {progress < 100 ? 'LOADING YOUR EXPERIENCE' : 'WELCOME TO HBM JAKARTA'}
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
