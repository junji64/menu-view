import { MenuAnalysisResult, LLMProvider } from '../types';

export const ADMIN_ACTIVE_PROVIDER_STORAGE = 'llm_custom_active_provider';
export const ADMIN_GEMINI_KEY_STORAGE = 'gemini_custom_admin_api_key';
export const ADMIN_GEMINI_MODEL_STORAGE = 'gemini_custom_admin_model';
export const ADMIN_OPENAI_KEY_STORAGE = 'openai_custom_admin_api_key';
export const ADMIN_OPENAI_MODEL_STORAGE = 'openai_custom_admin_model';

export function getAdminProvider(): LLMProvider {
  try {
    const val = localStorage.getItem(ADMIN_ACTIVE_PROVIDER_STORAGE);
    if (val === 'openai' || val === 'gemini') return val;
    // If user has openai key but no gemini key, default to openai
    if (localStorage.getItem(ADMIN_OPENAI_KEY_STORAGE) && !localStorage.getItem(ADMIN_GEMINI_KEY_STORAGE)) {
      return 'openai';
    }
    return 'gemini';
  } catch {
    return 'gemini';
  }
}

export function setAdminProvider(provider: LLMProvider): void {
  try {
    localStorage.setItem(ADMIN_ACTIVE_PROVIDER_STORAGE, provider);
  } catch {
    // Ignore storage errors
  }
}

export function getAdminApiKey(targetProvider?: LLMProvider): string {
  try {
    const provider = targetProvider || getAdminProvider();
    if (provider === 'openai') {
      return localStorage.getItem(ADMIN_OPENAI_KEY_STORAGE) || '';
    }
    return localStorage.getItem(ADMIN_GEMINI_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function setAdminApiKey(key: string, targetProvider?: LLMProvider): void {
  try {
    const provider = targetProvider || getAdminProvider();
    const storageKey = provider === 'openai' ? ADMIN_OPENAI_KEY_STORAGE : ADMIN_GEMINI_KEY_STORAGE;
    if (key.trim()) {
      localStorage.setItem(storageKey, key.trim());
    } else {
      localStorage.removeItem(storageKey);
    }
  } catch {
    // Ignore storage errors
  }
}

export function getAdminPreferredModel(targetProvider?: LLMProvider): string {
  try {
    const provider = targetProvider || getAdminProvider();
    if (provider === 'openai') {
      return localStorage.getItem(ADMIN_OPENAI_MODEL_STORAGE) || 'gpt-4o';
    }
    return localStorage.getItem(ADMIN_GEMINI_MODEL_STORAGE) || 'gemini-3.6-flash';
  } catch {
    return targetProvider === 'openai' ? 'gpt-4o' : 'gemini-3.6-flash';
  }
}

export function setAdminPreferredModel(model: string, targetProvider?: LLMProvider): void {
  try {
    const provider = targetProvider || getAdminProvider();
    const storageKey = provider === 'openai' ? ADMIN_OPENAI_MODEL_STORAGE : ADMIN_GEMINI_MODEL_STORAGE;
    localStorage.setItem(storageKey, model);
  } catch {
    // Ignore storage errors
  }
}

function getRequestHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const provider = getAdminProvider();
  const apiKey = getAdminApiKey(provider);
  const model = getAdminPreferredModel(provider);

  headers['x-llm-provider'] = provider;
  if (apiKey) {
    headers['x-llm-api-key'] = apiKey;
    if (provider === 'gemini') {
      headers['x-gemini-api-key'] = apiKey;
    } else if (provider === 'openai') {
      headers['x-openai-api-key'] = apiKey;
    }
  }
  if (model) {
    headers['x-llm-model'] = model;
    if (provider === 'gemini') {
      headers['x-gemini-model'] = model;
    } else if (provider === 'openai') {
      headers['x-openai-model'] = model;
    }
  }
  return headers;
}

export async function verifyAdminApiKey(
  apiKey: string,
  model?: string,
  provider: LLMProvider = 'gemini'
): Promise<{ success: boolean; message?: string; reply?: string }> {
  const response = await fetch('/api/admin/verify-key', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiKey: apiKey.trim(),
      model: model || getAdminPreferredModel(provider),
      provider,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'API Key 검증에 실패했습니다. 키를 다시 확인해 주세요.');
  }

  return data;
}

export async function searchRepresentativeFoodImage(
  originalName: string,
  koreanName: string,
  category: string = ''
): Promise<string> {
  const params = new URLSearchParams({
    original: originalName,
    ko: koreanName,
    cat: category,
  });

  const response = await fetch(`/api/search-food-image?${params.toString()}`);
  if (!response.ok) {
    throw new Error('대표 이미지 검색 실패');
  }
  const data = await response.json();
  if (data.success && data.imageUrl) {
    return data.imageUrl;
  }
  throw new Error('이미지를 찾을 수 없습니다.');
}

export async function analyzeMenuImage(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<MenuAnalysisResult> {
  const response = await fetch('/api/analyze-menu', {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify({
      imageBase64,
      mimeType,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `서버 오류 (${response.status}): 메뉴를 분석하지 못했습니다.`);
  }

  const result = await response.json();
  if (!result.success || !result.data) {
    throw new Error(result.error || '메뉴 데이터 분석에 실패했습니다.');
  }

  return result.data;
}

export async function generateFoodImage(
  visualPrompt: string,
  koreanName: string,
  originalName: string
): Promise<string> {
  const response = await fetch('/api/generate-food-image', {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify({
      visualPrompt,
      koreanName,
      originalName,
    }),
  });

  if (!response.ok) {
    throw new Error('음식 이미지 생성에 실패했습니다.');
  }

  const data = await response.json();
  if (data.success && data.imageUrl) {
    return data.imageUrl;
  }
  throw new Error(data.error || '이미지를 불러올 수 없습니다.');
}

// Speak text using Web Speech API or Server TTS fallback
export function speakText(text: string, langCode: string = 'ko-KR') {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Stop previous
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.9; // Slightly slower for clarity
    window.speechSynthesis.speak(utterance);
    return;
  }
}

