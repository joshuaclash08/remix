'use client';

import { useState, useCallback, useRef } from 'react';

export function useRealMicrophone() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const stopListening = useCallback(() => {
    clearSilenceTimer();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error('Error stopping recorder:', e);
      }
    } else {
      setIsListening(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  }, [clearSilenceTimer]);

  const startListening = useCallback(
    async (onAudioRecorded?: (audioBlob: Blob, liveText?: string) => void) => {
      setTranscript('');
      setError(null);
      clearSilenceTimer();

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        audioChunksRef.current = [];

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
        mediaRecorder.start(200);
        setIsListening(true);

        // Web Speech API for real-time live transcript and 2.5s silence VAD timer
        const SpeechRecognition =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'ko-KR';

          recognition.onresult = (event: any) => {
            let currentText = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              currentText += event.results[i][0].transcript;
            }

            if (currentText.trim()) {
              setTranscript(currentText);

              // 2.5s Silence VAD Timer: Reset timer whenever speech is heard
              clearSilenceTimer();
              silenceTimerRef.current = setTimeout(() => {
                // 2.5s of silence after speech -> Auto submit
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                  mediaRecorderRef.current.stop();
                }
                if (recognitionRef.current) {
                  try {
                    recognitionRef.current.stop();
                  } catch (e) {}
                }
              }, 2500);
            }
          };

          recognition.onerror = (e: any) => {
            console.warn('Speech recognition notice:', e.error);
          };

          try {
            recognition.start();
            recognitionRef.current = recognition;
          } catch (e) {
            // ignore
          }
        }
      } catch (err: any) {
        console.error('Microphone access error:', err);
        setIsListening(false);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('마이크 접근 권한이 거부되었습니다. 브라우저 주소창 마이크 권한을 허용해 주세요.');
        } else {
          setError('마이크를 연결할 수 없습니다.');
        }
      }
    },
    [clearSilenceTimer, transcript]
  );

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    isSupported: typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia,
  };
}
