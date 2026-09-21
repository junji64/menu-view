import React from 'react';
import { Search, Filter, Sparkles, Flame, Leaf, Utensils, X } from 'lucide-react';

interface FilterBarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDietTag: string | null;
  onSelectDietTag: (tag: string | null) => void;
  totalDishes: number;
  filteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  selectedDietTag,
  onSelectDietTag,
  totalDishes,
  filteredCount,
}) => {
  const dietFilterOptions = [
    { label: '전체 보기', value: null, icon: null },
    { label: '안 매운 요리', value: 'non-spicy', icon: '🌶️' },
    { label: '채식/비건', value: 'vegetarian', icon: '🌿' },
    { label: '해산물', value: 'seafood', icon: '🦐' },
    { label: '돼지고기', value: 'pork', icon: '🥩' },
    { label: '소고기', value: 'beef', icon: '🥩' },
    { label: '달걀/유제품', value: 'dairy', icon: '🧀' },
  ];

  return (
    <div id="filter-bar-container" className="space-y-4 mb-6">
      {/* Top Search & Stats */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Box */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            id="dish-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="음식 이름, 한글 발음, 재료명으로 검색..."
            className="w-full bg-stone-800/90 border border-stone-700 focus:border-emerald-500 rounded-xl pl-10 pr-10 py-2.5 text-sm text-stone-100 placeholder-stone-400 outline-none transition"
          />
          {searchQuery && (
            <button
              id="clear-search-btn"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Count Pill */}
        <div className="flex items-center gap-2 self-end sm:self-center text-xs text-stone-400 bg-stone-800/60 px-3 py-2 rounded-xl border border-stone-700/60">
          <span>
            총 <strong className="text-emerald-400">{filteredCount}</strong>개 / {totalDishes}개 메뉴
          </span>
        </div>
      </div>

      {/* Category Pills */}
      {categories.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            id="cat-all-btn"
            onClick={() => onSelectCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'bg-stone-800/90 text-stone-300 hover:bg-stone-700 border border-stone-700'
            }`}
          >
            전체 카테고리
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              id={`cat-btn-${cat.replace(/\s+/g, '-')}`}
              onClick={() => onSelectCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                  : 'bg-stone-800/90 text-stone-300 hover:bg-stone-700 border border-stone-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Dietary & Ingredient Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <div className="text-[11px] text-stone-400 font-medium px-1 flex items-center gap-1 shrink-0">
          <Filter className="w-3 h-3 text-emerald-400" />
          <span>식이 필터:</span>
        </div>
        {dietFilterOptions.map((opt) => {
          const isSelected = selectedDietTag === opt.value;
          return (
            <button
              key={opt.label}
              id={`diet-filter-${opt.label}`}
              onClick={() => onSelectDietTag(isSelected ? null : opt.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center gap-1 ${
                isSelected
                  ? 'bg-amber-600/90 text-white border border-amber-400'
                  : 'bg-stone-900/80 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              {opt.icon && <span>{opt.icon}</span>}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
