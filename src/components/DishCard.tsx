import React, { useState, useEffect } from 'react';
import { DishItem } from '../types';
import { Volume2, Sparkles, Plus, Check, Heart, Info, Flame, Utensils, UtensilsCrossed, RefreshCw, Search } from 'lucide-react';
import { speakText, generateFoodImage } from '../services/api';
import { findRepresentativeFoodImage } from '../services/foodImageFinder';

interface DishCardProps {
  dish: DishItem;
  languageCode?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (dishId: string) => void;
  onOpenDetail: (dish: DishItem) => void;
  onAddToOrder: (dish: DishItem) => void;
  isOrdered?: boolean;
}

export const DishCard: React.FC<DishCardProps> = ({
  dish,
  languageCode = 'ko-KR',
  isFavorite = false,
  onToggleFavorite,
  onOpenDetail,
  onAddToOrder,
  isOrdered = false,
}) => {
  const [currentImage, setCurrentImage] = useState<string | undefined>(dish.imageUrl);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isSearchingWebImage, setIsSearchingWebImage] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Automatically lookup authentic representative image from internet if missing or generic
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
    } else {
      setCurrentImage(dish.imageUrl);
    }
    return () => {
      active = false;
    };
  }, [dish.imageUrl, dish.originalName, dish.koreanName, dish.category]);

  // Handle on-demand internet search for representative food image
  const handleSearchWebImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSearchingWebImage) return;
    setIsSearchingWebImage(true);
    try {
      const foundImage = await findRepresentativeFoodImage(
        dish.originalName,
        dish.koreanName,
        dish.category,
        Math.floor(Math.random() * 5) + 1
      );
      if (foundImage) {
        setCurrentImage(foundImage);
      }
    } catch (err) {
      console.warn('Web image search failed:', err);
    } finally {
      setIsSearchingWebImage(false);
    }
  };

  // Generate or regenerate food image using AI
  const handleGenerateImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGeneratingImage) return;
    setIsGeneratingImage(true);
    try {
      const generated = await generateFoodImage(
        dish.visualPrompt || dish.koreanName,
        dish.koreanName,
        dish.originalName
      );
      setCurrentImage(generated);
    } catch (err) {
      console.error('Failed to generate image:', err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlayingAudio(true);
    speakText(dish.originalName, languageCode);
    setTimeout(() => setIsPlayingAudio(false), 1500);
  };

  const handleImageError = () => {
    // If the image fails to load, gracefully reset to empty rather than forcing a random photo
    setCurrentImage('');
  };

  const hasImage = Boolean(currentImage && currentImage.trim() !== '');

  return (
    <div
      id={`dish-card-${dish.id}`}
      onClick={() => onOpenDetail(dish)}
      className="group relative flex flex-col bg-stone-800/90 hover:bg-stone-800 rounded-2xl overflow-hidden border border-stone-700/80 hover:border-emerald-500/50 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
    >
      {/* Visual Header: Authentic Food Image OR Refined No-Image State */}
      {hasImage ? (
        <div className="relative w-full h-48 bg-stone-900 overflow-hidden">
          <img
            src={currentImage}
            alt={dish.koreanName}
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-black/30" />

          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full bg-stone-900/85 backdrop-blur-md text-emerald-300 text-xs font-medium border border-emerald-500/30">
              {dish.category}
            </span>

            <div className="flex items-center gap-1.5">
              {/* Search Web Image Button */}
              <button
                id={`search-web-img-${dish.id}`}
                onClick={handleSearchWebImage}
                disabled={isSearchingWebImage}
                title={`메뉴 원어('${dish.originalName}')로 인터넷 대표 요리 사진 검색`}
                className="p-1.5 rounded-full bg-stone-900/80 hover:bg-sky-600 backdrop-blur-md text-sky-300 hover:text-white transition active:scale-95"
              >
                <Search className={`w-3.5 h-3.5 ${isSearchingWebImage ? 'animate-spin' : ''}`} />
              </button>

              {/* Generate Image Button */}
              <button
                id={`gen-img-btn-${dish.id}`}
                onClick={handleGenerateImage}
                disabled={isGeneratingImage}
                title="AI로 실사 음식 이미지 생성"
                className="p-1.5 rounded-full bg-stone-900/80 hover:bg-emerald-600 backdrop-blur-md text-amber-300 hover:text-white transition active:scale-95"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGeneratingImage ? 'animate-spin' : ''}`} />
              </button>

              {/* Favorite Bookmark */}
              {onToggleFavorite && (
                <button
                  id={`fav-btn-${dish.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(dish.id);
                  }}
                  className="p-1.5 rounded-full bg-stone-900/80 hover:bg-stone-700 backdrop-blur-md text-stone-200 transition active:scale-95"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      isFavorite ? 'fill-rose-500 text-rose-500' : 'text-stone-300'
                    }`}
                  />
                </button>
              )}
            </div>
          </div>

          {/* Spice indicator on image if spicy */}
          {(dish.spiceLevel || 0) > 0 && (
            <div className="absolute bottom-2 left-2.5 flex items-center gap-1 bg-rose-950/80 backdrop-blur-md border border-rose-500/30 px-2 py-0.5 rounded-md text-[11px] text-rose-300 font-medium">
              <Flame className="w-3 h-3 text-rose-400" />
              <span>{'🌶️'.repeat(dish.spiceLevel || 1)}</span>
            </div>
          )}

          {/* Price tag */}
          <div className="absolute bottom-2 right-2.5 text-right bg-stone-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-stone-700">
            <div className="text-xs font-bold text-amber-300">{dish.priceOriginal || ''}</div>
            <div className="text-[10px] text-stone-400">약 {(dish.priceKRW || 0).toLocaleString()}원</div>
          </div>
        </div>
      ) : (
        /* Clean Elegant Header when No Image is Provided */
        <div className="relative w-full bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 p-3.5 border-b border-stone-700/60">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full bg-stone-800 text-emerald-400 text-xs font-medium border border-stone-700">
              {dish.category || '기타'}
            </span>

            <div className="flex items-center gap-1.5">
              {/* Optional Search Web Image Button */}
              <button
                id={`search-web-img-${dish.id}`}
                onClick={handleSearchWebImage}
                disabled={isSearchingWebImage}
                title={`메뉴 원어('${dish.originalName}')로 인터넷 대표 요리 사진 검색`}
                className="p-1.5 rounded-full bg-stone-800 hover:bg-sky-600 text-stone-400 hover:text-white transition active:scale-95"
              >
                <Search className={`w-3.5 h-3.5 ${isSearchingWebImage ? 'animate-spin' : ''}`} />
              </button>

              {/* Optional Generate Image Button */}
              <button
                id={`gen-img-btn-${dish.id}`}
                onClick={handleGenerateImage}
                disabled={isGeneratingImage}
                title="AI로 실사 음식 이미지 생성"
                className="p-1.5 rounded-full bg-stone-800 hover:bg-emerald-600 text-stone-400 hover:text-white transition active:scale-95"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGeneratingImage ? 'animate-spin' : ''}`} />
              </button>

              {onToggleFavorite && (
                <button
                  id={`fav-btn-${dish.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(dish.id);
                  }}
                  className="p-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 transition active:scale-95"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      isFavorite ? 'fill-rose-500 text-rose-500' : 'text-stone-400'
                    }`}
                  />
                </button>
              )}
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-[11px] text-stone-500 flex items-center gap-1">
              <UtensilsCrossed className="w-3.5 h-3.5 text-stone-600" />
              <span>사진 미등록 메뉴</span>
            </span>

            {(dish.spiceLevel || 0) > 0 && (
              <span className="text-rose-400 font-medium text-[11px] flex items-center gap-0.5">
                <Flame className="w-3 h-3" />
                <span>{'🌶️'.repeat(dish.spiceLevel || 1)}</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Original Name & Pronunciation */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs text-stone-400 font-medium truncate" title={dish.originalName}>
              {dish.originalName}
            </span>
            <button
              id={`tts-btn-${dish.id}`}
              onClick={handleSpeak}
              title="원어 발음 듣기"
              className={`p-1 rounded-md text-stone-400 hover:text-emerald-300 hover:bg-stone-700 transition ${
                isPlayingAudio ? 'text-emerald-400 animate-pulse' : ''
              }`}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Phonetic Pronunciation in Korean */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-300 mb-2">
            <span className="text-[11px] text-emerald-400/90 font-medium">원어 발음:</span>
            <span className="font-extrabold text-emerald-300">[{dish.originalPronunciation || dish.koreanName}]</span>
          </div>

          {/* Korean Translated Name */}
          <h3 className="text-base font-bold text-stone-100 group-hover:text-emerald-300 transition-colors line-clamp-1">
            {dish.koreanName}
          </h3>

          {/* Price breakdown */}
          <div className="mt-2 flex items-center justify-between bg-stone-900/90 px-2.5 py-1.5 rounded-xl border border-stone-700/60">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-stone-400">현지:</span>
              <span className="text-xs font-bold text-amber-300">{dish.priceOriginal || '-'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-emerald-400">환율 적용:</span>
              <span className="text-xs font-extrabold text-white">
                약 {(dish.priceKRW || 0).toLocaleString()}원
              </span>
            </div>
          </div>

          {/* Korean Description */}
          <p className="mt-2 text-xs text-stone-300 leading-relaxed line-clamp-3">
            {dish.koreanDescription}
          </p>
        </div>

        {/* Dietary & Ingredient Tags */}
        <div className="space-y-2 pt-2 border-t border-stone-700/60">
          <div className="flex flex-wrap gap-1">
            {(dish.dietaryTags || []).slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-stone-900/80 text-[11px] text-stone-300 border border-stone-700/50"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Bottom Action Row */}
          <div className="flex items-center justify-between pt-1">
            <button
              id={`detail-btn-${dish.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail(dish);
              }}
              className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-stone-200 transition"
            >
              <Info className="w-3.5 h-3.5" />
              <span>상세 정보 & 맛 프로필</span>
            </button>

            <button
              id={`order-add-btn-${dish.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onAddToOrder(dish);
              }}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                isOrdered
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30'
              }`}
            >
              {isOrdered ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>주문표에 담김</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>주문 담기</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
