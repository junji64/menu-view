export interface DietaryTag {
  id: string;
  label: string;
  icon?: string;
  type: 'allergy' | 'diet' | 'taste';
}

export interface DishItem {
  id: string;
  category: string;
  originalName: string;
  originalPronunciation: string;
  koreanName: string;
  koreanDescription: string;
  tasteProfile?: {
    sweetness: number; // 0-5
    saltiness: number; // 0-5
    spiciness: number; // 0-5
    richness: number; // 0-5
    acidity: number; // 0-5
  };
  ingredients: string[];
  dietaryTags: string[];
  spiceLevel: number; // 0 to 3
  priceOriginal: string;
  priceKRW: number;
  imageUrl?: string;
  visualPrompt?: string;
  orderPhrase: string; // e.g. "Vorrei questo: Spaghetti Carbonara"
  recommendedDrink?: string;
}

export interface RestaurantInfo {
  name: string;
  cuisineType: string;
  sourceLanguage: string;
  languageCode: string;
  currencyCode: string;
  currencySymbol: string;
  exchangeRateToKRW: number;
  country: string;
  summary: string;
}

export interface MenuAnalysisResult {
  restaurant: RestaurantInfo;
  categories: string[];
  dishes: DishItem[];
  rawImagePreview?: string;
}

export interface OrderItem {
  dish: DishItem;
  quantity: number;
  specialRequests: string[];
}

export type LLMProvider = 'gemini' | 'openai';

export interface LLMModelOption {
  id: string;
  name: string;
  provider: LLMProvider;
  description: string;
  badge?: string;
}

