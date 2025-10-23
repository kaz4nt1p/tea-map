'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface LocationButtonProps {
  onLocationFound: (lat: number, lng: number) => void;
  onError: (error: string) => void;
}

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

export default function LocationButton({ onLocationFound, onError }: LocationButtonProps) {
  const [state, setState] = useState<ButtonState>('idle');

  const handleClick = async () => {
    if (state === 'loading') return;

    setState('loading');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!('geolocation' in navigator)) {
          reject(new Error('Ваш браузер не поддерживает геолокацию'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          (err) => {
            let message = 'Произошла ошибка при получении геолокации';
            switch (err.code) {
              case err.PERMISSION_DENIED:
                message = 'Разрешите доступ к геолокации в настройках браузера';
                break;
              case err.POSITION_UNAVAILABLE:
                message = 'Не удалось определить местоположение';
                break;
              case err.TIMEOUT:
                message = 'Превышено время ожидания геолокации';
                break;
            }
            reject(new Error(message));
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      });

      onLocationFound(position.coords.latitude, position.coords.longitude);
      setState('success');

      // Return to idle after 2 seconds
      setTimeout(() => setState('idle'), 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка геолокации';
      onError(message);
      setState('error');

      // Return to idle after 3 seconds
      setTimeout(() => setState('idle'), 3000);
    }
  };

  const getIcon = () => {
    switch (state) {
      case 'loading':
        return <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />;
      default:
        return <Crosshair className="w-5 h-5 sm:w-6 sm:h-6" />;
    }
  };

  const getBackgroundColor = () => {
    switch (state) {
      case 'loading':
        return 'from-tea-400 to-sage-500';
      case 'success':
        return 'from-green-500 to-green-600';
      case 'error':
        return 'from-red-500 to-red-600';
      default:
        return 'from-tea-500 to-sage-600';
    }
  };

  const getLabel = () => {
    switch (state) {
      case 'loading':
        return 'Определяем...';
      case 'success':
        return 'Готово!';
      case 'error':
        return 'Ошибка';
      default:
        return 'Моя локация';
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={state === 'loading'}
      initial={false}
      whileHover={{ scale: state === 'loading' ? 1 : 1.05 }}
      whileTap={{ scale: state === 'loading' ? 1 : 0.95 }}
      transition={{ duration: 0.2 }}
      className={`
        fixed bottom-20 sm:bottom-24 right-3 sm:right-4 z-[9999]
        flex items-center justify-center
        w-12 h-12 sm:w-14 sm:h-14
        bg-gradient-to-r ${getBackgroundColor()}
        text-white
        rounded-full shadow-lg hover:shadow-xl
        transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:ring-offset-2
        disabled:opacity-70 disabled:cursor-not-allowed
        backdrop-blur-sm
        border-2 border-white/20
      `}
      aria-label={getLabel()}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ duration: 0.3 }}
        >
          {getIcon()}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}
