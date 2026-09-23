import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  ShoppingBag,
  Globe,
  RefreshCw,
  Search,
  BookOpen,
  Info,
  UtensilsCrossed,
  ChefHat,
  Compass,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Volume2,
  Maximize2,
  X,
  ArrowUp,
  Image as ImageIcon,
  KeyRound,
  Settings,
  Eye,
  EyeOff,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import {
  MenuAnalysisResult,
  DishItem,
  OrderItem,
} from './types';
import {
  analyzeMenuImage,
  speakText,
  getAdminApiKey,
  setAdminApiKey,
  setAdminProvider,
  syncApiKeyFromUrl,
} from './services/api';
import { CameraCapture } from './components/CameraCapture';
import { FileUpload } from './components/FileUpload';
import { DishCard } from './components/DishCard';
import { DishDetailModal } from './components/DishDetailModal';
import { OrderSheetModal } from './components/OrderSheetModal';
import { FilterBar } from './components/FilterBar';
import { AdminSettingsModal } from './components/AdminSettingsModal';

export default function App() {
  // State management
  const [currentResult, setCurrentResult] = useState<MenuAnalysisResult | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);

  // Uploaded photo tracking
  const [uploadedImageInfo, setUploadedImageInfo] = useState<{
    base64: string;
    name: string;
    mimeType: string;
  } | null>(null);
  const [isOriginalPhotoModalOpen, setIsOriginalPhotoModalOpen] = useState(false);

  // Filtering & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDietTag, setSelectedDietTag] = useState<string | null>(null);

  // Modals & Order
  const [selectedDishDetail, setSelectedDishDetail] = useState<DishItem | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [favoriteDishIds, setFavoriteDishIds] = useState<Set<string>>(new Set());
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [hasCustomApiKey, setHasCustomApiKey] = useState(false);
  const [inlineApiKey, setInlineApiKey] = useState('');
  const [showInlineKey, setShowInlineKey] = useState(false);
  const [showVercelGuide, setShowVercelGuide] = useState(false);
  const [keyToast, setKeyToast] = useState<string | null>(null);

  useEffect(() => {
    // 1. Detect if API key was passed via URL hash / query (e.g. from QR code or mobile sync link)
    const syncRes = syncApiKeyFromUrl();
    if (syncRes.synced) {
      setHasCustomApiKey(true);
      setKeyToast('📱 모바일 기기에 Gemini API Key가 성공적으로 연동되었습니다! 메뉴판 사진을 촬영해 보세요.');
      setTimeout(() => setKeyToast(null), 6000);
    } else {
      setHasCustomApiKey(Boolean(getAdminApiKey()));
    }
  }, []);

  // Refs for auto-scroll
  const loadingSectionRef = useRef<HTMLDivElement>(null);
  const resultsSectionRef = useRef<HTMLElement>(null);
  const uploadSectionRef = useRef<HTMLElement>(null);

  // Handle Analysis for captured/uploaded image
  const handleAnalyzeImage = async (
    base64Image: string,
    fileName?: string,
    mimeType: string = 'image/jpeg'
  ) => {
    setIsCameraOpen(false);
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisProgress(15);
    setAnalysisStep('메뉴판 고화질 이미지 스캔 및 전처리 중...');

    const imgInfo = {
      base64: base64Image,
      name: fileName || '업로드된 메뉴판 사진',
      mimeType: mimeType,
    };
    setUploadedImageInfo(imgInfo);

    // Auto-scroll smoothly to loading area
    setTimeout(() => {
      loadingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    // Dynamic progress step timers
    const timer1 = setTimeout(() => {
      setAnalysisProgress(40);
      setAnalysisStep('현지어 텍스트 및 요리명 자동 해독 중...');
    }, 1200);

    const timer2 = setTimeout(() => {
      setAnalysisProgress(70);
      setAnalysisStep('한국어 요리명 번역, 현지 발음 및 식재료 분석 중...');
    }, 2800);

    const timer3 = setTimeout(() => {
      setAnalysisProgress(90);
      setAnalysisStep('메뉴판 내 모든 메뉴의 상세 설명 및 식재료 분석 중...');
    }, 4500);

    try {
      const result = await analyzeMenuImage(base64Image, mimeType);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      setAnalysisProgress(100);
      setAnalysisStep('분석 완료! 메뉴판을 펼치고 있습니다...');
      result.rawImagePreview = base64Image;

      // Small pause so the user sees 100% completion before smooth reveal
      setTimeout(() => {
        setCurrentResult(result);
        setSelectedCategory('ALL');
        setSearchQuery('');
        setSelectedDietTag(null);
        setIsAnalyzing(false);

        // Auto-scroll down to results
        setTimeout(() => {
          resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }, 600);
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      console.error('Menu analysis failed:', err);
      setAnalysisError(
        err.message || '메뉴판을 분석하는 도중 오류가 발생했습니다. 선명한 사진으로 다시 시도해 주세요.'
      );
      setIsAnalyzing(false);
    }
  };

  // Retry analyzing current uploaded image
  const handleRetryAnalysis = () => {
    if (uploadedImageInfo) {
      handleAnalyzeImage(
        uploadedImageInfo.base64,
        uploadedImageInfo.name,
        uploadedImageInfo.mimeType
      );
    }
  };

  // Toggle Favorite
  const toggleFavorite = (dishId: string) => {
    setFavoriteDishIds((prev) => {
      const next = new Set(prev);
      if (next.has(dishId)) {
        next.delete(dishId);
      } else {
        next.add(dishId);
      }
      return next;
    });
  };

  // Add to Order
  const handleAddToOrder = (
    dish: DishItem,
    quantity: number = 1,
    specialRequests: string[] = []
  ) => {
    setOrders((prev) => {
      const existingIndex = prev.findIndex((item) => item.dish.id === dish.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        if (specialRequests.length > 0) {
          updated[existingIndex].specialRequests = Array.from(
            new Set([...updated[existingIndex].specialRequests, ...specialRequests])
          );
        }
        return updated;
      }
      return [...prev, { dish, quantity, specialRequests }];
    });
  };

  const handleUpdateOrderQuantity = (dishId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveOrderItem(dishId);
      return;
    }
    setOrders((prev) =>
      prev.map((item) => (item.dish.id === dishId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveOrderItem = (dishId: string) => {
    setOrders((prev) => prev.filter((item) => item.dish.id !== dishId));
  };

  const handleClearAllOrders = () => {
    setOrders([]);
  };

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    if (!currentResult || !currentResult.dishes) return [];

    return currentResult.dishes.filter((dish) => {
      // Category filter
      if (selectedCategory !== 'ALL' && dish.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchOriginal = (dish.originalName || '').toLowerCase().includes(query);
        const matchKorean = (dish.koreanName || '').toLowerCase().includes(query);
        const matchPronun = (dish.originalPronunciation || '').toLowerCase().includes(query);
        const matchDesc = (dish.koreanDescription || '').toLowerCase().includes(query);
        const matchIng = (dish.ingredients || []).some((ing) => (ing || '').toLowerCase().includes(query));

        if (!matchOriginal && !matchKorean && !matchPronun && !matchDesc && !matchIng) {
          return false;
        }
      }

      // Dietary tag filter
      if (selectedDietTag) {
        const tags = dish.dietaryTags || [];
        if (selectedDietTag === 'non-spicy' && (dish.spiceLevel || 0) > 0) return false;
        if (
          selectedDietTag === 'vegetarian' &&
          !tags.some((t) => t && (t.includes('채식') || t.includes('비건')))
        )
          return false;
        if (
          selectedDietTag === 'seafood' &&
          !tags.some((t) => t && (t.includes('해산물') || t.includes('생선') || t.includes('새우')))
        )
          return false;
        if (
          selectedDietTag === 'pork' &&
          !tags.some((t) => t && t.includes('돼지고기'))
        )
          return false;
        if (
          selectedDietTag === 'beef' &&
          !tags.some((t) => t && t.includes('소고기'))
        )
          return false;
        if (
          selectedDietTag === 'dairy' &&
          !tags.some((t) => t && (t.includes('유제품') || t.includes('치즈') || t.includes('달걀')))
        )
          return false;
      }

      return true;
    });
  }, [currentResult, selectedCategory, searchQuery, selectedDietTag]);

  const totalOrderCount = orders.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-md border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-950 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="font-extrabold text-base tracking-tight text-white cursor-pointer hover:text-emerald-300 transition"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  메뉴 비주얼 가이드
                </span>
                <span className="text-xs text-stone-400 font-medium">
                  by{' '}
                  <a
                    id="author-link-header"
                    href="https://www.youtube.com/@junji-ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 font-bold underline decoration-emerald-500/40 hover:decoration-emerald-400 transition"
                  >
                    Jun Ji
                  </a>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  AI 자동 번역
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block">
                사진 업로드 시 즉시 자동 분석 • 한국어 발음 & 대표 실사
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Admin Settings Button (Custom LLM API Key) */}
            <button
              id="header-admin-settings-btn"
              onClick={() => setIsAdminModalOpen(true)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border active:scale-95 ${
                hasCustomApiKey
                  ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-950'
                  : 'bg-stone-800/90 hover:bg-stone-700 text-stone-300 border-stone-700'
              }`}
              title="관리자 기능: LLM 모델(Gemini / OpenAI) 및 API Key 설정"
            >
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">
                {hasCustomApiKey ? 'LLM 설정 (개인키 적용)' : 'LLM 설정'}
              </span>
              {hasCustomApiKey && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            {/* Quick Upload / Snap Button */}
            <button
              id="header-camera-btn"
              onClick={() => setIsCameraOpen(true)}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-950 active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden xs:inline">메뉴판 촬영</span>
            </button>

            {/* Order Cart Floating Pill */}
            <button
              id="header-order-cart-btn"
              onClick={() => setIsOrderModalOpen(true)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                totalOrderCount > 0
                  ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 border-amber-400 shadow-md shadow-amber-950 animate-bounce'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>주문표</span>
              {totalOrderCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-stone-950 text-amber-300 text-[11px] flex items-center justify-center font-black">
                  {totalOrderCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Mobile Key Sync Success Toast */}
        {keyToast && (
          <div
            id="mobile-key-sync-toast"
            className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs font-semibold flex items-center justify-between gap-3 shadow-lg"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-900 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-300">
                <Smartphone className="w-4 h-4" />
              </div>
              <span>{keyToast}</span>
            </div>
            <button
              onClick={() => setKeyToast(null)}
              className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-100 hover:bg-emerald-900/60 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {/* Upload & Camera Section */}
        <section
          ref={uploadSectionRef}
          id="menu-input-section"
          className="bg-stone-950/70 border border-stone-800 rounded-3xl p-5 sm:p-7 space-y-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-stone-100 flex items-center gap-2">
                  <span>메뉴판 사진을 올리면 즉시 자동 분석됩니다</span>
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </h2>
                <button
                  id="quick-admin-settings-pill"
                  onClick={() => setIsAdminModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-emerald-300 border border-stone-700 text-xs flex items-center gap-1.5 transition"
                >
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{hasCustomApiKey ? '관리자 API KEY 활성화됨' : '관리자 LLM API KEY 추가'}</span>
                </button>
              </div>
              <p className="text-sm text-stone-400 mt-1">
                사진을 드래그하거나 선택하면 별도 클릭 없이 <strong>AI가 자동으로 번역과 각 요리의 대표 실사 사진을 검색/매칭</strong>하여 보여드립니다.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="main-camera-snap-btn"
                onClick={() => setIsCameraOpen(true)}
                className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950 active:scale-95"
              >
                <Camera className="w-5 h-5" />
                <span>카메라로 즉시 촬영</span>
              </button>
            </div>
          </div>

          {/* Dropzone File Upload with Auto-analyze */}
          <FileUpload
            onImageSelected={handleAnalyzeImage}
            isLoading={isAnalyzing}
            uploadedPreview={uploadedImageInfo?.base64}
          />
        </section>

        {/* Loading Progress State Card */}
        {isAnalyzing && (
          <div
            ref={loadingSectionRef}
            id="analysis-loading-box"
            className="p-8 sm:p-10 rounded-3xl bg-stone-950 border border-emerald-500/50 text-center space-y-6 shadow-2xl relative overflow-hidden"
          >
            {/* Ambient background beam */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

            <div className="relative flex flex-col items-center">
              {/* Image Preview with Scanner Beam Effect if available */}
              {uploadedImageInfo?.base64 ? (
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border-2 border-emerald-500/60 shadow-xl mb-4 group bg-stone-900">
                  <img
                    src={uploadedImageInfo.base64}
                    alt="분석 중인 메뉴판 사진"
                    className="w-full h-full object-cover opacity-85"
                  />
                  {/* Laser scanning beam line */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-bounce" />
                  <div className="absolute bottom-2 inset-x-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] text-emerald-300 font-bold truncate">
                    {uploadedImageInfo.name}
                  </div>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-3xl bg-emerald-950/90 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-inner mb-3">
                  <RefreshCw className="w-10 h-10 animate-spin" />
                </div>
              )}

              <div className="space-y-2 max-w-lg">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>사진 업로드 감지됨 • AI 자동 분석 진행 중</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-stone-100">
                  {analysisStep}
                </h3>

                {/* Progress bar */}
                <div className="w-full bg-stone-800 rounded-full h-2.5 overflow-hidden border border-stone-700/60 mt-3">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${analysisProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-stone-400 px-1 pt-1">
                  <span>스캔 & OCR 해독</span>
                  <span className="text-emerald-400 font-bold">{analysisProgress}%</span>
                  <span>한국어 번역 & 비주얼</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Error Alert with Quick Retry & Mobile Key Setup */}
        {analysisError && (() => {
          const isKeyError =
            analysisError.includes('GEMINI_API_KEY') ||
            analysisError.includes('API Key') ||
            analysisError.includes('API_KEY') ||
            analysisError.includes('Vercel') ||
            analysisError.includes('설정되어 있지 않습니다') ||
            analysisError.includes('인증에 실패');

          return (
            <div
              id="analysis-error-alert"
              className="p-6 rounded-3xl bg-rose-950/70 border border-rose-500/60 text-rose-200 space-y-4 shadow-xl"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold text-base text-rose-100">메뉴판 분석에 실패했습니다</div>
                  <div className="text-xs text-rose-300 mt-1 leading-relaxed">{analysisError}</div>
                </div>
              </div>

              {/* Mobile Quick Key Input Form (when API key is missing on mobile or Vercel) */}
              {isKeyError && (
                <div
                  id="mobile-quick-key-card"
                  className="p-4 rounded-2xl bg-stone-900/95 border border-amber-500/40 space-y-3 shadow-inner"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      <span>모바일 빠른 Gemini API Key 등록</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      1회 등록 시 자동 저장
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    모바일 브라우저 환경에서는 아래 입력창에 Gemini API Key를 붙여넣으시면, 다른 설정 창으로 이동할 필요 없이 <strong>즉시 사진 분석이 시작</strong>됩니다.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <input
                        id="inline-mobile-api-key-input"
                        type={showInlineKey ? 'text' : 'password'}
                        value={inlineApiKey}
                        onChange={(e) => setInlineApiKey(e.target.value)}
                        placeholder="AIzaSy... (Gemini API Key를 붙여넣으세요)"
                        className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 font-mono pr-10"
                      />
                      <button
                        type="button"
                        id="toggle-inline-key-visibility"
                        onClick={() => setShowInlineKey(!showInlineKey)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 p-1"
                        title={showInlineKey ? '숨기기' : '보기'}
                      >
                        {showInlineKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <button
                      id="save-key-and-retry-btn"
                      onClick={() => {
                        const trimmed = inlineApiKey.trim();
                        if (!trimmed) {
                          alert('Gemini API Key를 입력해 주세요.');
                          return;
                        }
                        setAdminApiKey(trimmed, 'gemini');
                        setAdminProvider('gemini');
                        setHasCustomApiKey(true);
                        setAnalysisError(null);
                        setKeyToast('✅ API Key가 성공적으로 저장되었습니다! 재분석을 진행합니다.');
                        setTimeout(() => setKeyToast(null), 4000);
                        // Trigger immediate retry with already uploaded image
                        handleRetryAnalysis();
                      }}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>키 저장하고 바로 분석하기 🚀</span>
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-stone-400 pt-1 border-t border-stone-800">
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>Google AI Studio에서 무료 Key 발급 (1분 소요)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      type="button"
                      id="toggle-vercel-guide-btn"
                      onClick={() => setShowVercelGuide(!showVercelGuide)}
                      className="text-amber-400 hover:underline text-left"
                    >
                      {showVercelGuide ? '▲ Vercel 설정 가이드 접기' : '▼ Vercel 배포 시 모든 방문자 자동 적용 방법'}
                    </button>
                  </div>

                  {showVercelGuide && (
                    <div className="p-3.5 rounded-xl bg-stone-950/90 border border-stone-800 text-[11px] text-stone-300 space-y-1.5 leading-relaxed mt-2 animate-fade-in">
                      <p className="font-semibold text-amber-300">
                        💡 Vercel에 배포하여 모든 사용자에게 키 입력 없이 서비스하려면:
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-stone-400">
                        <li>
                          <span className="text-stone-200">Vercel 대시보드</span>(vercel.com)에서 해당 프로젝트를 클릭합니다.
                        </li>
                        <li>
                          <strong className="text-stone-200">Settings &gt; Environment Variables</strong> 메뉴로 이동합니다.
                        </li>
                        <li>
                          Key에 <code className="bg-stone-900 text-amber-300 px-1 py-0.5 rounded font-mono">GEMINI_API_KEY</code>, Value에 발급받은 키를 넣고 <span className="text-emerald-400 font-bold">Save</span>를 누릅니다.
                        </li>
                        <li>
                          <strong className="text-stone-200">Deployments</strong> 탭에서 최신 빌드의 <span className="text-stone-200 font-bold">Redeploy</span>를 클릭하면 완료됩니다.
                        </li>
                      </ol>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {uploadedImageInfo && (
                  <button
                    id="retry-analysis-btn"
                    onClick={handleRetryAnalysis}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>같은 사진으로 다시 분석하기</span>
                  </button>
                )}

                <button
                  id="open-settings-from-error-btn"
                  onClick={() => setIsAdminModalOpen(true)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>API Key / 모델 설정</span>
                </button>

                <button
                  id="reupload-analysis-btn"
                  onClick={() => {
                    setAnalysisError(null);
                    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl transition"
                >
                  다른 사진으로 다시 업로드
                </button>
              </div>
            </div>
          );
        })()}

        {/* Menu Results Display */}
        {currentResult && !isAnalyzing && (
          <section ref={resultsSectionRef} id="menu-results-section" className="space-y-6">
            {/* Uploaded Menu Photo Banner (if uploaded by user) */}
            {uploadedImageInfo && (
              <div
                id="uploaded-menu-photo-banner"
                className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md"
              >
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div
                    onClick={() => setIsOriginalPhotoModalOpen(true)}
                    className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-800 border border-emerald-500/60 shrink-0 cursor-pointer group shadow"
                    title="클릭하여 원본 크게 보기"
                  >
                    <img
                      src={uploadedImageInfo.base64}
                      alt="분석된 메뉴판 원본"
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center text-white">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-emerald-300">
                        ✅ 방금 업로드된 메뉴판 사진 분석 결과
                      </span>
                      <span className="text-[11px] text-stone-400 bg-stone-900/80 px-2 py-0.5 rounded border border-stone-800">
                        {currentResult?.dishes?.length || 0}개 메뉴 추출됨
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 mt-0.5">
                      {uploadedImageInfo.name} • 원본 사진을 클릭하면 크게 확대하여 비교할 수 있습니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    id="view-original-photo-btn"
                    onClick={() => setIsOriginalPhotoModalOpen(true)}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-stone-700 transition"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>원본 사진 확대</span>
                  </button>

                  <button
                    id="upload-another-photo-btn"
                    onClick={() => {
                      uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                    <span>다른 메뉴판 올리기</span>
                  </button>
                </div>
              </div>
            )}

            {/* Restaurant & Cuisine Summary Banner */}
            <div className="bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 p-6 rounded-3xl border border-stone-800 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                      {currentResult?.restaurant?.cuisineType || '다이닝'}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-stone-800 text-stone-300 text-xs font-medium border border-stone-700">
                      원어: {currentResult?.restaurant?.sourceLanguage || '현지어'}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-amber-950/80 text-amber-300 text-xs font-medium border border-amber-500/30">
                      환율 기준: 1 {currentResult?.restaurant?.currencyCode || ''} ≈ 약 {currentResult?.restaurant?.exchangeRateToKRW?.toLocaleString() || 1}원 (원화 환산 적용)
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-stone-100">
                    {currentResult?.restaurant?.name || '현지 레스토랑'}
                  </h1>

                  <p className="text-sm text-stone-300 leading-relaxed max-w-4xl">
                    {currentResult?.restaurant?.summary || '메뉴판 요리 목록입니다.'}
                  </p>
                </div>

                {/* Quick Waiter Phrase Button */}
                <button
                  id="open-full-ordersheet-banner-btn"
                  onClick={() => setIsOrderModalOpen(true)}
                  className="self-start md:self-auto px-4 py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-100 text-xs font-bold flex items-center gap-2 border border-stone-700 transition active:scale-95 shrink-0"
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  <span>주문표 확인하기 ({totalOrderCount}개 선택됨)</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <FilterBar
              categories={currentResult?.categories || []}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedDietTag={selectedDietTag}
              onSelectDietTag={setSelectedDietTag}
              totalDishes={currentResult?.dishes?.length || 0}
              filteredCount={filteredDishes?.length || 0}
            />

            {/* Dishes Grid */}
            {filteredDishes.length === 0 ? (
              <div
                id="no-dishes-found"
                className="py-16 text-center bg-stone-950/50 rounded-3xl border border-stone-800 space-y-3"
              >
                <HelpCircle className="w-12 h-12 text-stone-600 mx-auto" />
                <h3 className="text-lg font-bold text-stone-300">조건에 맞는 메뉴가 없습니다</h3>
                <p className="text-xs text-stone-500">
                  검색어나 식이 필터를 변경하거나 [전체 카테고리]를 선택해 보세요.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('ALL');
                    setSearchQuery('');
                    setSelectedDietTag(null);
                  }}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-xs font-semibold rounded-xl text-stone-300"
                >
                  필터 초기화
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredDishes.map((dish) => {
                  const isOrdered = orders.some((item) => item.dish.id === dish.id);
                  const isFav = favoriteDishIds.has(dish.id);

                  return (
                    <DishCard
                      key={dish.id}
                      dish={dish}
                      languageCode={currentResult.restaurant.languageCode}
                      isFavorite={isFav}
                      onToggleFavorite={toggleFavorite}
                      onOpenDetail={setSelectedDishDetail}
                      onAddToOrder={(d) => handleAddToOrder(d, 1)}
                      isOrdered={isOrdered}
                    />
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Empty State / Guide before menu upload */}
        {!currentResult && !isAnalyzing && (
          <div
            id="empty-menu-guide"
            className="bg-stone-950/50 border border-stone-800 rounded-3xl p-8 sm:p-12 text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-inner">
              <UtensilsCrossed className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className="text-xl font-bold text-stone-100">
                메뉴판 사진을 등록해 주세요
              </h3>
              <p className="text-sm text-stone-400 leading-relaxed">
                해외 여행지 식당의 현지어 메뉴판 사진을 촬영하거나 갤러리에서 업로드하면, AI가 한국어 번역, 음식 상세 설명, 대표 실사 사진, 알레르기 및 식이 정보를 즉시 분석해 드립니다.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-2 text-left">
              <div className="bg-stone-900/60 border border-stone-800 p-4 rounded-2xl space-y-1.5">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Camera className="w-4 h-4" />
                  <span>카메라 촬영 & 갤러리</span>
                </div>
                <p className="text-xs text-stone-400">실시간 카메라 촬영 및 스마트폰 갤러리 사진 드래그&드롭 지원</p>
              </div>
              <div className="bg-stone-900/60 border border-stone-800 p-4 rounded-2xl space-y-1.5">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  <span>한국어 번역 & 환율</span>
                </div>
                <p className="text-xs text-stone-400">현지 발음 오디오 및 실시간 원화(KRW) 환산 금액 자동 계산</p>
              </div>
              <div className="bg-stone-900/60 border border-stone-800 p-4 rounded-2xl space-y-1.5">
                <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4" />
                  <span>대표 사진 & 현지 주문서</span>
                </div>
                <p className="text-xs text-stone-400">대표 실사 사진 확인 및 종업원에게 바로 보여줄 주문 카드 제공</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Camera Capture Fullscreen View */}
      {isCameraOpen && (
        <CameraCapture
          onCapture={(photoBase64) => handleAnalyzeImage(photoBase64, '실시간 카메라 촬영 사진')}
          onClose={() => setIsCameraOpen(false)}
        />
      )}

      {/* Original Photo Lightbox Modal */}
      {isOriginalPhotoModalOpen && uploadedImageInfo && (
        <div
          id="original-photo-modal-overlay"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsOriginalPhotoModalOpen(false)}
        >
          <div
            id="original-photo-modal-box"
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-stone-900 border border-stone-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="p-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-stone-100">
                  업로드한 원본 메뉴판 사진
                </h4>
                <p className="text-xs text-stone-400">{uploadedImageInfo.name}</p>
              </div>
              <button
                id="close-original-photo-modal-btn"
                onClick={() => setIsOriginalPhotoModalOpen(false)}
                className="p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/50">
              <img
                src={uploadedImageInfo.base64}
                alt="원본 메뉴판"
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Dish Detail & Order Helper Modal */}
      {selectedDishDetail && currentResult && (
        <DishDetailModal
          dish={selectedDishDetail}
          languageCode={currentResult.restaurant.languageCode}
          onClose={() => setSelectedDishDetail(null)}
          onAddToOrder={handleAddToOrder}
        />
      )}

      {/* Order Sheet Modal (Presentation Mode to Waiter) */}
      {isOrderModalOpen && currentResult && (
        <OrderSheetModal
          orders={orders}
          restaurant={currentResult.restaurant}
          onClose={() => setIsOrderModalOpen(false)}
          onUpdateQuantity={handleUpdateOrderQuantity}
          onRemoveItem={handleRemoveOrderItem}
          onClearAll={handleClearAllOrders}
        />
      )}

      {/* Admin Settings Modal (Custom LLM API Key & Model) */}
      <AdminSettingsModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onKeyUpdated={(hasKey) => setHasCustomApiKey(hasKey)}
      />

      {/* Footer */}
      <footer className="bg-stone-950 border-t border-stone-800 py-6 mt-12 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-stone-400 flex-wrap justify-center sm:justify-start">
            <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">다국어 메뉴 번역기 및 음식 비주얼 가이드</span>
            <span>by</span>
            <a
              id="author-link-footer"
              href="https://www.youtube.com/@junji-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-bold underline decoration-emerald-500/40 hover:decoration-emerald-400 transition"
            >
              Jun Ji
            </a>
          </div>
          <div>전 세계 어디서든 사진만 올리면 AI가 즉시 자동 분석해 드립니다 🍜🍕🥐</div>
        </div>
      </footer>
    </div>
  );
}
