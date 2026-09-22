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
    return localStorage.getItem(ADMIN_GEMINI_MODEL_STORAGE) || 'gemini-3.8-flash';
  } catch {
    return targetProvider === 'openai' ? 'gpt-4o' : 'gemini-3.8-flash';
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
    let errorMsg = '';
    try {
      const errorData = await response.clone().json();
      if (typeof errorData.error === 'string' && errorData.error) {
        errorMsg = errorData.error;
      } else if (errorData.error?.message) {
        errorMsg = errorData.error.message;
      } else if (errorData.error?.code === 'FUNCTION_INVOCATION_FAILED') {
        errorMsg =
          'Vercel 서버리스 함수 실행 오류 (FUNCTION_INVOCATION_FAILED): Vercel 환경 변수에 GEMINI_API_KEY가 등록되어 있는지 확인해 주세요. 또는 우측 상단 관리자 설정(⚙️)에서 직접 API Key를 입력할 수 있습니다.';
      } else if (typeof errorData.message === 'string' && errorData.message) {
        errorMsg = errorData.message;
      }
    } catch {
      // Body wasn't JSON - try to extract text from response
      try {
        const rawText = await response.text();
        if (rawText) {
          if (rawText.includes('FUNCTION_INVOCATION_FAILED')) {
            errorMsg =
              '서버리스 함수 실행 오류 (FUNCTION_INVOCATION_FAILED): Vercel 환경 변수(Settings > Environment Variables)에 GEMINI_API_KEY를 등록하시거나 우측 상단 관리자 설정(⚙️)에서 직접 API Key를 입력해 주세요.';
          } else if (rawText.includes('FUNCTION_INVOCATION_TIMEOUT') || rawText.includes('Task timed out')) {
            errorMsg =
              '서버 응답 시간 초과: 메뉴판 분석 시간이 초과되었습니다. 선명한 사진으로 다시 시도해 주세요.';
          } else if (rawText.includes('PAYLOAD_TOO_LARGE')) {
            errorMsg = '사진 용량이 너무 큽니다. 사진 크기를 줄여서 다시 시도해 주세요.';
          } else if (rawText.length < 200 && !rawText.includes('<html')) {
            errorMsg = rawText.trim();
          }
        }
      } catch {
        // ignore
      }
    }

    if (!errorMsg) {
      if (response.status === 504) {
        errorMsg =
          '서버 응답 시간이 초과되었습니다 (타임아웃). 메뉴판 사진을 조금 더 가깝게 촬영하시거나 잠시 후 다시 시도해 주세요.';
      } else if (response.status === 413) {
        errorMsg = '이미지 용량이 너무 큽니다. 사진 크기를 줄여서 다시 시도해 주세요.';
      } else if (response.status === 500) {
        errorMsg =
          '서버 오류 (500): AI 모델을 호출하지 못했습니다. 우측 상단 관리자 설정(⚙️)에서 직접 Gemini API Key 또는 OpenAI API Key를 등록해 주세요.';
      } else {
        errorMsg = `서버 오류 (${response.status}): 메뉴를 분석하지 못했습니다.`;
      }
    }

    throw new Error(errorMsg);
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

