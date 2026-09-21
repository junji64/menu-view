import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, X, Zap, AlertCircle } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    stopStream();
    setErrorMessage(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCamera(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setHasCamera(false);
      setErrorMessage(
        '카메라에 접근할 수 없습니다. 브라우저의 카메라 권한을 확인하시거나 파일 업로드를 이용해 주세요.'
      );
    }
  }, [facingMode, stopStream]);

  useEffect(() => {
    startCamera();
    return () => {
      stopStream();
    };
  }, [startCamera, stopStream]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      stopStream();
      onCapture(dataUrl);
    }
  };

  return (
    <div id="camera-modal" className="fixed inset-0 z-50 bg-black flex flex-col justify-between items-center p-4">
      {/* Top Header */}
      <div className="w-full max-w-2xl flex items-center justify-between z-10 pt-2 px-2">
        <div className="flex items-center gap-2 text-stone-200 bg-stone-900/80 px-3 py-1.5 rounded-full backdrop-blur-md text-sm">
          <Camera className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>메뉴판을 프레임 안에 맞춰 촬영하세요</span>
        </div>
        <button
          id="close-camera-btn"
          onClick={() => {
            stopStream();
            onClose();
          }}
          className="p-2.5 rounded-full bg-stone-800/80 text-stone-200 hover:bg-stone-700 active:scale-95 transition"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Video Viewfinder */}
      <div className="relative w-full max-w-2xl flex-1 my-4 rounded-2xl overflow-hidden bg-stone-950 flex items-center justify-center border border-stone-800">
        {errorMessage ? (
          <div className="text-center px-6 py-8 max-w-md text-stone-300">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <p className="text-base font-medium mb-4">{errorMessage}</p>
            <button
              id="retry-camera-btn"
              onClick={startCamera}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition"
            >
              카메라 다시 시도
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Target Alignment Box */}
            <div className="absolute inset-8 pointer-events-none border-2 border-emerald-400/60 rounded-xl">
              {/* Corner markers */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-sm"></div>
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-sm"></div>
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-sm"></div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-sm"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/40 text-stone-300 text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                글자가 선명하게 보이도록 맞춰주세요
              </div>
            </div>
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Bottom Controls */}
      <div className="w-full max-w-2xl flex items-center justify-around pb-6 px-4 z-10">
        <button
          id="switch-camera-mode-btn"
          type="button"
          onClick={toggleCamera}
          className="p-3.5 rounded-full bg-stone-800 text-stone-300 hover:bg-stone-700 active:scale-95 transition"
          title="카메라 전환"
        >
          <RefreshCw className="w-5 h-5" />
        </button>

        {/* Shutter Button */}
        <button
          id="shutter-snap-btn"
          type="button"
          onClick={capturePhoto}
          disabled={!hasCamera || isCapturing}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 bg-stone-900 active:scale-90 transition disabled:opacity-50 hover:border-emerald-400"
          aria-label="사진 촬영"
        >
          <div className="w-full h-full rounded-full bg-emerald-500 hover:bg-emerald-400 transition flex items-center justify-center">
            <Camera className="w-8 h-8 text-white" />
          </div>
        </button>

        <div className="w-12 h-12 flex items-center justify-center">
          <span className="text-xs text-stone-400">HD Ready</span>
        </div>
      </div>
    </div>
  );
};
