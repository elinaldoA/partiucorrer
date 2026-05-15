
import { useCallback } from 'react';

export const useHaptic = () => {
  const trigger = useCallback((type = 'light') => {

    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      switch (type) {
        case 'light':

          window.navigator.vibrate(10);
          break;
        case 'medium':

          window.navigator.vibrate(20);
          break;
        case 'heavy':

          window.navigator.vibrate(40);
          break;
        case 'success':

          window.navigator.vibrate([15, 50, 15]);
          break;
        case 'error':

          window.navigator.vibrate([20, 40, 20, 40, 20]);
          break;
        case 'warning':

          window.navigator.vibrate([30, 50, 10]);
          break;
        default:
          window.navigator.vibrate(15);
      }
    }
  }, []);

  return trigger;
};
