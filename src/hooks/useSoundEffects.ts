import { useCallback } from 'react';

interface SoundOptions {
  volume?: number;
  effectsVolume?: number;
  masterVolume?: number;
}

const createAudio = (url: string, volume = 1, master = 1) => {
  const audio = new Audio(url);
  audio.volume = Math.min(1, Math.max(0, volume * master));
  audio.preload = 'auto';
  return audio;
};

export const useSoundEffects = ({ effectsVolume = 0.5, masterVolume = 0.7 }: SoundOptions) => {
  const playSound = useCallback((url: string, volume = 1) => {
    const audio = createAudio(url, volume * effectsVolume, masterVolume);
    audio.play().catch(() => {});
  }, [effectsVolume, masterVolume]);

  const playExplosion = useCallback(() => {
    playSound('/sounds/explosion.mp3', 0.9);
  }, [playSound]);

  const playMissile = useCallback(() => {
    playSound('/sounds/missile.mp3', 0.85);
  }, [playSound]);

  const playMoney = useCallback(() => {
    playSound('/sounds/victory.mp3', 0.8);
  }, [playSound]);

  return {
    playSound,
    playExplosion,
    playMissile,
    playMoney
  };
};
