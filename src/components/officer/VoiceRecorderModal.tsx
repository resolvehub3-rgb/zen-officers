import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Sparkles, Check, X, AlertCircle } from 'lucide-react';
import { api } from '../../services/api.ts';

export const VoiceRecorderModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onTranscriptionComplete: (text: string, audioUrl?: string) => void;
  title?: string;
}> = ({ isOpen, onClose, onTranscriptionComplete, title = 'Security Voice Note & AI Transcription' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  if (!isOpen) return null;

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setError('Microphone access denied or unavailable. Please enable microphone permissions.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsRecording(false);
    setIsPaused(false);
    setTranscribedText('');
    setError(null);
  };

  const togglePlayback = () => {
    if (!audioElementRef.current && audioUrl) {
      audioElementRef.current = new Audio(audioUrl);
      audioElementRef.current.onended = () => setIsPlaying(false);
    }

    if (audioElementRef.current) {
      if (isPlaying) {
        audioElementRef.current.pause();
        setIsPlaying(false);
      } else {
        audioElementRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleTranscribe = async () => {
    if (!audioBlob) return;
    setTranscribing(true);
    setError(null);

    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await api.transcribeAudio(base64Data, audioBlob.type || 'audio/webm');
          setTranscribedText(res.transcription);
        } catch (err: any) {
          setError('Transcription failed: ' + err.message);
        } finally {
          setTranscribing(false);
        }
      };
    } catch (e: any) {
      setError('Could not process audio.');
      setTranscribing(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{title}</h3>
              <p className="text-xs text-slate-400">Speak observations, incidents, or routine checks clearly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Recording Studio & Waveform Visualizer */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center flex flex-col items-center justify-center relative overflow-hidden">
            {/* Animated Audio Bars when recording */}
            {isRecording && !isPaused && (
              <div className="flex items-center justify-center gap-1.5 h-12 mb-4">
                {[40, 75, 100, 60, 90, 45, 80, 100, 70, 50, 85, 30].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-blue-500 rounded-full animate-pulse"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '0.6s',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Time display */}
            <div className="text-3xl font-mono font-bold text-white tracking-wider mb-2">
              {formatTime(recordingTime)}
            </div>

            <p className="text-xs text-slate-400">
              {isRecording
                ? isPaused
                  ? 'Recording paused'
                  : 'Listening... (Speak clearly into your microphone)'
                : audioBlob
                ? 'Recording ready for transcription'
                : 'Click Record to start voice note'}
            </p>

            {/* Controls */}
            <div className="flex items-center gap-3 mt-6">
              {!isRecording && !audioBlob && (
                <button
                  onClick={startRecording}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm shadow-lg shadow-red-600/30 transition-all hover:scale-105"
                >
                  <Mic className="w-5 h-5 animate-pulse" />
                  Start Recording
                </button>
              )}

              {isRecording && (
                <>
                  <button
                    onClick={isPaused ? resumeRecording : pauseRecording}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-colors"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    Stop & Process
                  </button>
                </>
              )}

              {audioBlob && !isRecording && (
                <>
                  <button
                    onClick={togglePlayback}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                  <button
                    onClick={resetRecording}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs border border-slate-700"
                    title="Re-record"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleTranscribe}
                    disabled={transcribing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-blue-600/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    {transcribing ? 'Transcribing...' : 'Transcribe with AI'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Transcribed Text Preview & Editor */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Transcribed Report Text
            </label>
            <textarea
              rows={4}
              value={transcribedText}
              onChange={(e) => setTranscribedText(e.target.value)}
              placeholder="Spoken words will be transcribed here. You can also edit and fine-tune before applying..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none text-slate-100 text-sm placeholder:text-slate-600 resize-none font-normal"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onTranscriptionComplete(transcribedText, audioUrl || undefined);
              onClose();
            }}
            disabled={!transcribedText.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Check className="w-4 h-4" />
            Apply Text to Report
          </button>
        </div>
      </div>
    </div>
  );
};
