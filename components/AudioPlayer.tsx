import React, { useEffect, useRef, useState } from 'react';

interface AudioPlayerProps {
  audioBuffer: ArrayBuffer | null;
  autoPlay?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioBuffer, autoPlay = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const stopAudio = () => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const playAudio = async () => {
    if (!audioBuffer) return;

    // Stop any current playback
    stopAudio();

    try {
      if (!audioContextRef.current) {
        // Fix: Use type assertion for webkitAudioContext as it's not on standard Window interface
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
      }

      // Resume context if suspended (browser policy)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Decode audio
      // Note: We copy the buffer because decodeAudioData detaches it
      const bufferCopy = audioBuffer.slice(0);
      const decodedBuffer = await audioContextRef.current.decodeAudioData(bufferCopy);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = decodedBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => setIsPlaying(false);
      
      sourceRef.current = source;
      source.start();
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (autoPlay && audioBuffer) {
      playAudio();
    }
    return () => {
      stopAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioBuffer]); // Re-run if buffer changes

  if (!audioBuffer) return null;

  return (
    <button
      onClick={isPlaying ? stopAudio : playAudio}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-md transition-all
        ${isPlaying 
          ? 'bg-red-400 text-white hover:bg-red-500' 
          : 'bg-green-400 text-white hover:bg-green-500 animate-pulse'
        }
      `}
    >
      <i className={`fa-solid ${isPlaying ? 'fa-stop' : 'fa-volume-high'}`}></i>
      {isPlaying ? 'Stop' : 'Read to Me!'}
    </button>
  );
};

export default AudioPlayer;