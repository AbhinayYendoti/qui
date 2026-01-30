import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import icLogo from '@/assets/ic-logo.png';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Animation duration ~2 seconds, then fade out
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleAnimationComplete = () => {
    if (!isVisible) {
      onComplete();
    }
  };

  return (
    <AnimatePresence onExitComplete={handleAnimationComplete}>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] bg-background flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <motion.div
            className="relative"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
            }}
            transition={{ 
              duration: 0.6, 
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {/* Logo with subtle motion */}
            <motion.img
              src={icLogo}
              alt="IntrovertChatter"
              className="w-24 h-24 md:w-32 md:h-32"
              initial={{ rotate: -5 }}
              animate={{ 
                rotate: 0,
              }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
            
            {/* Subtle pulse effect on the logo */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.1, 0],
              }}
              transition={{
                duration: 1.5,
                times: [0, 0.5, 1],
                ease: 'easeInOut',
              }}
            >
              <img
                src={icLogo}
                alt=""
                className="w-24 h-24 md:w-32 md:h-32 blur-sm"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
