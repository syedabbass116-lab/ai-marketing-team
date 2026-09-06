import { useState, useRef, useEffect, useCallback } from 'react';

export type RecorderState = 'idle' | 'recording' | 'paused' | 'processing' | 'complete' | 'error';

interface UseAudioRecorderReturn {
  state: RecorderState;
  duration: number; // in seconds
  formattedTime: string;
  waveformLevels: number[]; // normalized 0..1 audio levels for live waveform
  errorMessage: string | null;
  startRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => Promise<Blob | null>;
  resetRecorder: () => void;
}

export function useAudioRecorder(maxDurationMinutes = 60): UseAudioRecorderReturn {
  const [state, setState] = useState<RecorderState>('idle');
  const [duration, setDuration] = useState<number>(0);
  const [waveformLevels, setWaveformLevels] = useState<number[]>([0.1, 0.1, 0.1, 0.1, 0.1]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Format seconds into HH:MM:SS
  const formatTime = (secs: number): string => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const remSecs = secs % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(mins)}:${pad(remSecs)}`;
  };

  // Audio level visualizer loop
  const startVisualizer = useCallback((stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateWaveform = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          // Pick 8 representative bars
          const step = Math.floor(bufferLength / 8);
          const bars: number[] = [];
          for (let i = 0; i < 8; i++) {
            const val = dataArray[i * step] / 255;
            bars.push(Math.max(0.12, Math.min(1.0, val * 1.5)));
          }
          setWaveformLevels(bars);
        }
        animFrameRef.current = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();
    } catch (e) {
      console.warn('AudioContext visualizer initialization failed:', e);
    }
  }, []);

  const stopVisualizer = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setWaveformLevels([0.1, 0.1, 0.1, 0.1, 0.1]);
  }, []);

  const startRecording = async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Audio recording is not supported in this browser environment.');
      }

      // Explicit permission request
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      streamRef.current = stream;

      // Determine supported mime type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : (MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : ''));

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(1000); // 1s slices
      setState('recording');
      setDuration(0);

      // Start timer
      timerIntervalRef.current = window.setInterval(() => {
        setDuration((prev) => {
          const next = prev + 1;
          if (next >= maxDurationMinutes * 60) {
            stopRecording();
          }
          return next;
        });
      }, 1000);

      startVisualizer(stream);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Microphone permission denied or unavailable.';
      setErrorMessage(msg);
      setState('error');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setState('paused');
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setState('recording');
      timerIntervalRef.current = window.setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(null);
        return;
      }

      setState('processing');

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      stopVisualizer();

      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        // Clean up tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        setState('complete');
        resolve(audioBlob);
      };

      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      } else {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setState('complete');
        resolve(audioBlob);
      }
    });
  };

  const resetRecorder = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    stopVisualizer();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    setDuration(0);
    setState('idle');
    setErrorMessage(null);
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      stopVisualizer();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stopVisualizer]);

  return {
    state,
    duration,
    formattedTime: formatTime(duration),
    waveformLevels,
    errorMessage,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecorder
  };
}
