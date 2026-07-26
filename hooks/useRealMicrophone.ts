'use client';

import { useState, useCallback, useRef } from 'react';

export function useRealMicrophone() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startListening = useCallback(
    async (onAudioRecorded?: (audioBlob: Blob, liveText?: string) => void) => {
      setTranscript('');
      setError(null);

      try {
        // Request actual browser microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        audioChunksRef.current = [];

        // Determine supported MIME type for recording
        let options = {};
        if (typeof MediaRecorder !== 'undefined') {
          if (MediaRecorder.isTypeSupported('audio/webm')) {
            options = { mimeType: 'audio/webm' };
          } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
            options = { mimeType: 'audio/mp4' };
          }
        }

        const mediaRecorder = new MediaRecorder(stream, options);

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          setIsListening(false);

          // Stop all audio stream tracks to release microphone hardware indicator
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }

          const audioBlob = new Blob(audioChunksRef.current, {
            type: mediaRecorder.mimeType || 'audio/webm',
          });

          if (onAudioRecorded) {
            onAudioRecorded(audioBlob, transcript);
          }
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(200); // Collect slice every 200ms
        setIsListening(true);
      } catch (err: any) {
        console.error('Microphone access error:', err);
        setIsListening(false);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('마이크 접근 권한이 거부되었습니다. 브라우저 주소창 왼쪽 아이콘에서 마이크 권한을 허용해 주세요.');
        } else {
          setError('마이크를 연결할 수 없습니다.');
        }
      }
    },
    [transcript]
  );

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error('Error stopping recorder:', e);
      }
    }
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    isSupported: typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia,
  };
}
