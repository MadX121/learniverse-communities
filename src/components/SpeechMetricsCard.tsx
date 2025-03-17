
import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Mic, MessageSquare, Clock } from 'lucide-react';

interface SpeechMetricsProps {
  metrics: {
    wordsPerMinute?: number | null;
    fillerWords?: number | null;
    pauses?: number | null;
    duration?: number | null;
    confidence?: number | null;
    fluency?: number | null;
    clarity?: number | null;
  };
  className?: string;
}

const SpeechMetricsCard: React.FC<SpeechMetricsProps> = ({ metrics, className = '' }) => {
  const getSpeedRating = (wpm: number) => {
    if (wpm < 120) return 'Slow';
    if (wpm > 180) return 'Fast';
    return 'Good';
  };

  const getFillerRating = (count: number, duration: number) => {
    const fillerPerMinute = (count / duration) * 60;
    if (fillerPerMinute > 10) return 'High';
    if (fillerPerMinute > 5) return 'Moderate';
    return 'Low';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-black/30 rounded-lg border border-white/10 p-4 ${className}`}
    >
      <h3 className="text-sm font-medium text-primary/80 mb-3 flex items-center gap-2">
        <Mic className="w-4 h-4" />
        Speech Analysis
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.wordsPerMinute && (
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Speaking Rate
            </div>
            <div className="font-medium">{metrics.wordsPerMinute} WPM</div>
            <div className={`text-xs ${
              getSpeedRating(metrics.wordsPerMinute) === 'Good' 
                ? 'text-green-500' 
                : 'text-yellow-500'
            }`}>
              {getSpeedRating(metrics.wordsPerMinute)}
            </div>
          </div>
        )}

        {metrics.fillerWords !== undefined && metrics.duration && (
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              Filler Words
            </div>
            <div className="font-medium">{metrics.fillerWords}</div>
            <div className={`text-xs ${
              getFillerRating(metrics.fillerWords, metrics.duration) === 'Low' 
                ? 'text-green-500' 
                : getFillerRating(metrics.fillerWords, metrics.duration) === 'Moderate'
                  ? 'text-yellow-500'
                  : 'text-red-500'
            }`}>
              {getFillerRating(metrics.fillerWords, metrics.duration)}
            </div>
          </div>
        )}

        {metrics.confidence !== null && metrics.confidence !== undefined && (
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              Confidence
            </div>
            <div className="font-medium">{metrics.confidence}/100</div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full"
                style={{ width: `${metrics.confidence}%` }}
              />
            </div>
          </div>
        )}

        {metrics.clarity !== null && metrics.clarity !== undefined && (
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              Clarity
            </div>
            <div className="font-medium">{metrics.clarity}/100</div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${metrics.clarity}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SpeechMetricsCard;
