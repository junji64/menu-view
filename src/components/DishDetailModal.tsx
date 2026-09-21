import React, { useState, useEffect } from 'react';
import { DishItem } from '../types';
import {
  X,
  Volume2,
  Sparkles,
  Search,
  ShoppingBag,
  Plus,
  Minus,
  Check,
  Flame,
  AlertTriangle,
  GlassWater,
  ChefHat,
  MessageSquare,
  Sparkle,
  UtensilsCrossed
} from 'lucide-react';
import { speakText, generateFoodImage } from '../services/api';
import { findRepresentativeFoodImage } from '../services/foodImageFinder';

interface DishDetailModalProps {
  dish: DishItem;
  languageCode?: string;
  onClose: () => void;
  onAddToOrder: (dish: DishItem, quantity: number, specialRequests: string[]) => void;
}

export const DishDetailModal: React.FC<DishDetailModalProps> = ({
  dish,
  languageCode = 'ko-KR',
  onClose,
  onAddToOrder,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [currentImage, setCurrentImage] = useState<string>(
    dish.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [showOrderCard, setShowOrderCard] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    let active = true;
    const isGenericOrMissing =
      !dish.imageUrl ||
      dish.imageUrl.includes('photo-1546069901-ba9599a7e63c') ||
      dish.imageUrl.trim() === '';

    if (isGenericOrMissing) {
      findRepresentativeFoodImage(dish.originalName, dish.koreanName, dish.category).then((url) => {
        if (active && url) {
          setCurrentImage(url);
        }
      });
    } else if (dish.imageUrl) {
      setCurrentImage(dish.imageUrl);
    }
    return () => {
      active = false;
    };
  }, [dish.imageUrl, dish.originalName, dish.koreanName, dish.category]);

  const customOptions = [
    { label: '고수 빼주세요', tag: 'No Coriander' },
    { label: '덜 맵게 해주세요', tag: 'Less Spicy' },
    { label: '안 맵게 해주세요', tag: 'Non Spicy' },
    { label: '견과류 빼주세요', tag: 'No Peanuts' },
    { label: '소스 따로 주세요', tag: 'Sauce on side' },
    { label: '얼음 많이 주세요', tag: 'Extra Ice' },
  ];

  const toggleRequest = (req: string) => {
    setSelectedRequests((prev) =>
      prev.includes(req) ? prev.filter((r) => r !== req) : [...prev, req]
    );
  };

  const handleSearchWebImage = async () => {
    if (isSearchingWeb) return;
    setIsSearchingWeb(true);
    try {
      const found = await findRepresentativeFoodImage(
        dish.originalName,
        dish.koreanName,
        dish.category,
        Math.floor(Math.random() * 5) + 1
      );
      if (found) {
        setCurrentImage(found);
      }
    } catch (err) {
      console.warn('Web image search failed:', err);
    } finally {
      setIsSearchingWeb(false);
    }
  };

  const handleGenerateImage = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const generated = await generateFoodImage(
        dish.visualPrompt || dish.koreanName,
        dish.koreanName,
        dish.originalName
      );
      setCurrentImage(generated);
    } catch (err) {
      console.error('Image generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSpeak = (textToSpeak: string) => {
    speakText(textToSpeak, languageCode);
  };

  const handleOrderSubmit = () => {
    onAddToOrder(dish, quantity, selectedRequests);
    setIsAdded(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div
      id="dish-detail-modal-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="dish-detail-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-stone-900 border border-stone-700 rounded-3xl overflow-hidden shadow-2xl my-auto text-stone-100"
      >
        {/* Close Button */}
        <button
          id="close-detail-modal-btn"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-stone-300 hover:text-white backdrop-blur-md transition active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Food Image OR Clean No-Image Banner */}
        {currentImage && currentImage.trim() !== '' ? (
          <div className="relative w-full h-64 sm:h-72 bg-stone-950">
            <img
              src={currentImage}
              alt={dish.koreanName}
              onError={() => {
                // If image fails to load, gracefully reset to empty string
                setCurrentImage('');
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-black/40" />

            {/* Image Action Buttons */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button
                id="search-web-image-modal-btn"
                onClick={handleSearchWebImage}
                disabled={isSearchingWeb}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/85 hover:bg-sky-600 backdrop-blur-md text-sky-300 hover:text-white text-xs font-semibold border border-stone-700/60 transition shadow-lg"
                title={`메뉴 원어('${dish.originalName}')로 인터넷 대표 사진 검색`}
              >
                <Search className={`w-3.5 h-3.5 ${isSearchingWeb ? 'animate-spin' : ''}`} />
                <span>{isSearchingWeb ? '검색 중...' : '원어 웹 사진 검색'}</span>
              </button>

              <button
                id="regen-dish-image-btn"
                onClick={handleGenerateImage}
                disabled={isGenerating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/85 hover:bg-emerald-600 backdrop-blur-md text-amber-300 hover:text-white text-xs font-semibold border border-stone-700/60 transition shadow-lg"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'AI 생성 중...' : 'AI 실사 생성'}</span>
              </button>
            </div>

            {/* Category Tag */}
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-emerald-400 text-xs font-medium border border-emerald-500/30">
              {dish.category}
            </div>
          </div>
        ) : (
          /* Graceful banner when dish has no appropriate photo */
          <div className="relative w-full py-8 px-6 bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 border-b border-stone-800 flex flex-col items-center justify-center text-center">
            {/* Category Tag */}
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-stone-800 text-emerald-400 text-xs font-medium border border-stone-700">
              {dish.category}
            </div>

            <div className="w-12 h-12 rounded-2xl bg-stone-800/90 border border-stone-700 flex items-center justify-center text-stone-500 mb-2.5 shadow-inner">
              <UtensilsCrossed className="w-6 h-6" />
            </div>

            <p className="text-xs font-medium text-stone-400">
              이 요리는 별도의 대표 실사 사진이 등록되지 않은 항목입니다.
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              원하실 경우 원어로 웹 사진을 검색하거나 AI로 실사 이미지를 생성할 수 있습니다.
            </p>

            <div className="flex items-center gap-2 mt-4">
              <button
                id="search-web-image-modal-btn"
                onClick={handleSearchWebImage}
                disabled={isSearchingWeb}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-sky-600 text-sky-300 hover:text-white text-xs font-semibold border border-stone-700 transition"
              >
                <Search className={`w-3.5 h-3.5 ${isSearchingWeb ? 'animate-spin' : ''}`} />
                <span>{isSearchingWeb ? '원어 검색 중...' : '원어로 웹 사진 검색'}</span>
              </button>

              <button
                id="regen-dish-image-btn"
                onClick={handleGenerateImage}
                disabled={isGenerating}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-emerald-600 text-amber-300 hover:text-white text-xs font-semibold border border-stone-700 transition"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'AI 생성 중...' : 'AI 실사 사진 생성'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-18rem)] overflow-y-auto">
          {/* Header titles */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-semibold text-stone-400">{dish.originalName}</span>
              <button
                id="listen-original-audio-btn"
                onClick={() => handleSpeak(dish.originalName)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900 transition text-xs font-semibold"
                title="현지어 발음 듣기"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>원어 음성 듣기</span>
              </button>
            </div>

            {/* Pronunciation Badge Box */}
            <div className="p-3 bg-emerald-950/50 rounded-xl border border-emerald-500/40 mb-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-emerald-400 font-semibold block">현지 원어 한글 발음</span>
                <span className="text-lg font-black text-emerald-300">[{dish.originalPronunciation}]</span>
              </div>
              <span className="text-[11px] text-stone-400 bg-stone-900/80 px-2 py-1 rounded-md border border-stone-800">
                식당 직원에게 그대로 읽어주세요
              </span>
            </div>

            <div className="flex items-baseline justify-between flex-wrap gap-2 pt-1 border-t border-stone-800">
              <h2 className="text-2xl font-extrabold text-stone-100">{dish.koreanName}</h2>
              <div className="text-right">
                <div className="text-xl font-bold text-amber-400">{dish.priceOriginal}</div>
                <div className="text-xs text-emerald-300 font-bold">
                  한화 환산: 약 {dish.priceKRW.toLocaleString()}원
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Korean Description */}
          <div className="bg-stone-800/70 p-4 rounded-2xl border border-stone-700/70">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ChefHat className="w-4 h-4 text-emerald-400" />
              <span>요리 특징 & 맛 설명</span>
            </h4>
            <p className="text-sm text-stone-200 leading-relaxed">{dish.koreanDescription}</p>
          </div>

          {/* Taste Profile Radar / Meters (if available) */}
          {dish.tasteProfile && (
            <div className="bg-stone-800/50 p-4 rounded-2xl border border-stone-700/50 space-y-2">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">
                맛 프로필 (Taste Profile)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="bg-stone-900/60 p-2.5 rounded-xl border border-stone-800">
                  <div className="text-xs text-stone-400 mb-1">단맛</div>
                  <div className="font-bold text-amber-300">
                    {'●'.repeat(dish.tasteProfile.sweetness || 1)}
                    <span className="text-stone-700">{'○'.repeat(5 - (dish.tasteProfile.sweetness || 1))}</span>
                  </div>
                </div>
                <div className="bg-stone-900/60 p-2.5 rounded-xl border border-stone-800">
                  <div className="text-xs text-stone-400 mb-1">짠맛</div>
                  <div className="font-bold text-blue-300">
                    {'●'.repeat(dish.tasteProfile.saltiness || 1)}
                    <span className="text-stone-700">{'○'.repeat(5 - (dish.tasteProfile.saltiness || 1))}</span>
                  </div>
                </div>
                <div className="bg-stone-900/60 p-2.5 rounded-xl border border-stone-800">
                  <div className="text-xs text-stone-400 mb-1">매운맛</div>
                  <div className="font-bold text-rose-400">
                    {'●'.repeat(dish.tasteProfile.spiciness || 0)}
                    <span className="text-stone-700">{'○'.repeat(5 - (dish.tasteProfile.spiciness || 0))}</span>
                  </div>
                </div>
                <div className="bg-stone-900/60 p-2.5 rounded-xl border border-stone-800">
                  <div className="text-xs text-stone-400 mb-1">풍미/감칠맛</div>
                  <div className="font-bold text-emerald-300">
                    {'●'.repeat(dish.tasteProfile.richness || 1)}
                    <span className="text-stone-700">{'○'.repeat(5 - (dish.tasteProfile.richness || 1))}</span>
                  </div>
                </div>
                <div className="bg-stone-900/60 p-2.5 rounded-xl border border-stone-800">
                  <div className="text-xs text-stone-400 mb-1">산미(새콤)</div>
                  <div className="font-bold text-yellow-300">
                    {'●'.repeat(dish.tasteProfile.acidity || 0)}
                    <span className="text-stone-700">{'○'.repeat(5 - (dish.tasteProfile.acidity || 0))}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Ingredients */}
          <div>
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              주요 식재료 (Ingredients)
            </h4>
            <div className="flex flex-wrap gap-2">
              {dish.ingredients.map((ing, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-stone-800 text-xs font-medium text-stone-200 border border-stone-700"
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>

          {/* Recommended Drink */}
          {dish.recommendedDrink && (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-200">
              <GlassWater className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-semibold text-amber-300 mr-1">어울리는 추천 음료:</span>
                <span>{dish.recommendedDrink}</span>
              </div>
            </div>
          )}

          {/* Order Helper Card (Show to Waiter Mode) */}
          <div className="bg-gradient-to-br from-emerald-950/60 to-stone-900 p-5 rounded-2xl border border-emerald-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <MessageSquare className="w-4 h-4" />
                <span>현지 점원에게 보여주며 주문하기 (Order Card)</span>
              </div>
              <button
                id="listen-order-phrase-btn"
                onClick={() => handleSpeak(dish.orderPhrase)}
                className="px-2.5 py-1 rounded-lg bg-emerald-800/60 hover:bg-emerald-700 text-xs text-white flex items-center gap-1 transition"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>주문 문장 발음</span>
              </button>
            </div>

            {/* Big Prominent Phrase Box */}
            <div className="p-4 bg-stone-950/90 rounded-xl border border-emerald-500/30 text-center space-y-1">
              <div className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                {dish.orderPhrase}
              </div>
              <div className="text-xs text-emerald-400">
                (이 문장을 손가락으로 가리키거나 들려주시면 됩니다)
              </div>
            </div>

            {/* Custom Request Options */}
            <div>
              <div className="text-xs text-stone-300 mb-2 font-medium">요청 사항 선택:</div>
              <div className="flex flex-wrap gap-1.5">
                {customOptions.map((opt, i) => {
                  const active = selectedRequests.includes(opt.label);
                  return (
                    <button
                      key={i}
                      id={`custom-req-opt-${i}`}
                      type="button"
                      onClick={() => toggleRequest(opt.label)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                        active
                          ? 'bg-emerald-600 text-white border border-emerald-400'
                          : 'bg-stone-800 text-stone-300 border border-stone-700 hover:bg-stone-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Order Actions */}
        <div className="p-4 sm:p-6 bg-stone-950 border-t border-stone-800 flex items-center justify-between gap-4">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2 bg-stone-900 px-3 py-1.5 rounded-2xl border border-stone-700">
            <button
              id="dec-modal-qty-btn"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-base text-stone-100">{quantity}</span>
            <button
              id="inc-modal-qty-btn"
              onClick={() => setQuantity((q) => q + 1)}
              className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Submit Button */}
          <button
            id="add-to-order-sheet-btn"
            onClick={handleOrderSubmit}
            className={`flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition active:scale-98 ${
              isAdded
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>주문표에 추가되었습니다!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>
                  주문표에 담기 • {(dish.priceKRW * quantity).toLocaleString()}원
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
