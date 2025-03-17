
import React from 'react';
import { motion } from 'framer-motion';

interface VoiceIndicatorProps {
  isActive: boolean;
  type: 'listening' | 'speaking' | 'processing';
}

const VoiceIndicator: React.FC<VoiceIndicatorProps> = ({ isActive, type }) => {
  if (!isActive) return null;

  return (
    <div className="flex items-center justify-center">
      {type === 'listening' && (
        <div className="relative flex items-center justify-center">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-green-500/80"
              initial={{ width: 30, height: 30, opacity: 0.3 }}
              animate={{ 
                width: [30, 60, 30], 
                height: [30, 60, 30], 
                opacity: [0.3, 0.6, 0.3] 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2, 
                delay: i * 0.4,
                ease: "easeInOut" 
              }}
            />
          ))}
          <div className="w-4 h-4 rounded-full bg-green-500 z-10" />
        </div>
      )}

      {type === 'speaking' && (
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 h-8 bg-primary/80 rounded-full"
              animate={{ 
                height: [8, 24, 16, 32, 8],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.2, 
                delay: i * 0.1,
                ease: "easeInOut",
                repeatType: "reverse"
              }}
            />
          ))}
        </div>
      )}

      {type === 'processing' && (
        <div className="flex items-center justify-center">
          <motion.div
            className="w-10 h-10 border-4 border-t-primary rounded-full"
            animate={{ rotate: 360 }}
            transition={{ 
              repeat: Infinity, 
              duration: 1, 
              ease: "linear"
            }}
          />
        </div>
      )}
    </div>
  );
};

export default VoiceIndicator;
