import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Camera, Image as ImageIcon, CheckCircle2, RefreshCw, Sparkles, Clipboard } from 'lucide-react';
import { optimizeImageFile } from '../utils/imageProcess';

interface FileUploadProps {
  onImageSelected: (base64Image: string, fileName?: string, mimeType?: string) => void;
  isLoading?: boolean;
  uploadedPreview?: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onImageSelected,
  isLoading = false,
  uploadedPreview,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(uploadedPreview || null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Update local preview if uploadedPreview changes from parent
  useEffect(() => {
    if (uploadedPreview) {
      setPreviewUrl(uploadedPreview);
    }
  }, [uploadedPreview]);

  // Handle image file selection/drop
  const processAndUploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일(JPG, PNG, WEBP 등)만 업로드 가능합니다.');
      return;
    }

    setIsProcessingFile(true);
    setSelectedFileName(file.name);

    try {
      const optimized = await optimizeImageFile(file);
      setPreviewUrl(optimized.base64);
      // Automatically trigger analysis
      onImageSelected(optimized.base64, file.name, optimized.mimeType);
    } catch (err: any) {
      console.error('Error reading image:', err);
      alert(err.message || '이미지를 불러오는 중 문제가 발생했습니다.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processAndUploadFile(e.dataTransfer.files[0]);
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processAndUploadFile(e.target.files[0]);
      // Reset input value so same file can be chosen again if needed
      e.target.value = '';
    }
  };

  // Clipboard paste listener (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            processAndUploadFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, []);

  return (
    <div className="space-y-3">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        id="menu-file-input"
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        id="menu-camera-native-input"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFileChange}
        className="hidden"
      />

      {/* Main Dropzone */}
      <div
        id="file-dropzone"
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => {
          if (!isLoading && !isProcessingFile) {
            fileInputRef.current?.click();
          }
        }}
        className={`relative w-full border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 group overflow-hidden ${
          isLoading || isProcessingFile
            ? 'border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-950/40 cursor-wait'
            : isDragging
            ? 'border-emerald-400 bg-emerald-950/40 scale-[1.01]'
            : 'border-stone-700/80 hover:border-emerald-500/80 bg-stone-900/70 hover:bg-stone-900/90'
        }`}
      >
        {/* Subtle background glow effect when active */}
        {(isLoading || isProcessingFile) && (
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 animate-pulse pointer-events-none" />
        )}

        <div className="relative z-10 flex flex-col items-center justify-center space-y-3">
          {/* Status Icon */}
          {isLoading || isProcessingFile ? (
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-inner">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
              </span>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-stone-800/90 group-hover:bg-emerald-950/80 flex items-center justify-center text-stone-300 group-hover:text-emerald-400 border border-stone-700 group-hover:border-emerald-500/50 transition duration-300 shadow-sm">
              <UploadCloud className="w-8 h-8 group-hover:scale-110 transition-transform" />
            </div>
          )}

          {/* Text Title & Subtitle */}
          <div>
            {isLoading || isProcessingFile ? (
              <div>
                <p className="text-base sm:text-lg font-extrabold text-emerald-300 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400 animate-spin" />
                  <span>사진 업로드 완료! AI 자동 분석 진행 중...</span>
                </p>
                <p className="text-xs text-stone-300 mt-1">
                  메뉴 텍스트 해독과 한국어 요리 번역이 자동으로 진행되고 있습니다.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-base sm:text-lg font-bold text-stone-100 group-hover:text-emerald-300 transition-colors">
                  메뉴판 사진을 올리면 즉시 자동 분석됩니다
                </p>
                <p className="text-xs sm:text-sm text-stone-400 mt-1">
                  사진 파일을 이곳에 끌어다 놓거나 클릭하여 선택하세요 (클립보드 붙여넣기 Ctrl+V 지원)
                </p>
              </div>
            )}
          </div>

          {/* Preview Thumbnail if selected */}
          {previewUrl && (
            <div className="mt-2 flex items-center gap-3 p-2 bg-stone-950/80 rounded-2xl border border-stone-800 max-w-md w-full">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-800 shrink-0 border border-stone-700">
                <img
                  src={previewUrl}
                  alt="업로드된 메뉴판 미리보기"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-xs font-bold text-stone-200 truncate">
                  {selectedFileName || '선택된 메뉴판 사진'}
                </div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isLoading ? '자동 분석 진행 중...' : '분석 완료됨'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Action Buttons Row */}
          {!isLoading && !isProcessingFile && (
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                id="select-file-btn"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-stone-700 transition active:scale-95"
              >
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>앨범 / 파일 선택</span>
              </button>

              <button
                type="button"
                id="camera-snap-native-btn"
                onClick={() => cameraInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/40 transition active:scale-95"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>카메라로 촬영</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
