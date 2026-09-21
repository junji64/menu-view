# [PRD] 다국어 메뉴 번역기 및 음식 비주얼 가이드 (Menu Visual Guide)
**Multilingual Menu Translator & Culinary Visual Guide by Jun Ji**

---

## 1. 문서 개요 (Document Overview)

| 항목 | 내용 |
| :--- | :--- |
| **문서명** | 제품 요구사항 정의서 (PRD: Product Requirements Document) |
| **프로젝트명** | 다국어 메뉴 번역기 및 음식 비주얼 가이드 (`menu-visual-guide`) |
| **작성자 / 기획자** | Jun Ji ([YouTube @junji-ai](https://www.youtube.com/@junji-ai)) |
| **문서 버전** | v1.0.0 |
| **최종 수정일** | 2026-09-20 |
| **문서 목적** | 본 문서는 다국어 메뉴 번역기 및 비주얼 미식 가이드 웹 애플리케이션의 기획 배경, 비즈니스 목표, 시스템 아키텍처, 데이터 모델, 세부 기능 스펙 및 UI/UX 규칙을 명세하여, 개발팀이 동일한 품질과 기능을 처음부터 완벽하게 재개발(Rebuild)할 수 있도록 가이드를 제공함. |

---

## 2. 제품 비전 및 핵심 가치 (Product Vision & Core Value)

### 2.1 문제 정의 (Problem Statement)
1. **외국어 메뉴판의 주문 장벽**: 해외여행이나 현지 식당에서 텍스트 기반 번역기를 사용하면 직역투 번역("부서진 돼지 발", "차가운 기름 국수" 등)으로 인해 실제 어떤 요리인지, 어떤 맛인지 파악하기 어렵다.
2. **비주얼 정보 부재**: 텍스트만 있는 메뉴판의 경우 실제 조리된 요리의 비주얼, 플레이팅, 양을 전혀 가늠할 수 없어 주문 실패(원치 않는 식재료, 과도한 매운맛, 향신료 등)가 빈번히 발생한다.
3. **발음 및 현지 소통 곤란**: 현지 언어를 모르면 종업원에게 주문을 발음하기 두렵고, 손짓 발짓으로 소통하다가 주문 실수가 발생한다.
4. **가격 체감 어려움**: 현지 화폐 단위가 익숙하지 않아 한국 돈으로 얼마인지 매번 계산기를 켜서 환율을 계산해야 하는 번거로움이 있다.

### 2.2 해결책 (Solution)
- **원스톱 사진 분석**: 메뉴판 사진을 찍거나 업로드하기만 하면 별도 클릭 없이 **메뉴 전수 파싱, 한국인 맞춤 요리명, 상세 맛 설명, 현지어 한글 발음, 원화 환산 가격, 대표 실사 사진 매칭**을 원스톱으로 제공한다.
- **듀얼 LLM 엔진 지원**: Google Gemini와 OpenAI(GPT-4o 등) 모델을 관리자 모드에서 자유롭게 선택하여 고품질 멀티모달 비전 인식을 수행한다.
- **주문 소통 모드**: 장바구니에 요리를 담고 "점원에게 보여주기" 모드를 켜면 현지어 요리명과 수량, 요청 사항이 큰 글씨로 표시되어 스마트폰을 점원에게 보여주는 것만으로 주문을 완료할 수 있다.

---

## 3. 시스템 아키텍처 및 기술 스택 (System Architecture & Tech Stack)

### 3.1 기술 스택
- **프론트엔드 (Frontend)**:
  - React 19 (Functional Components, Hooks)
  - TypeScript (Strict Mode)
  - Vite 8+ (Single Page Application)
  - Tailwind CSS v4 (미식 테마 다크 모드 `#0c0a09`, `#1c1917`, 에메랄드/앰버 포인트)
  - Lucide React (공식 아이콘 세트)
  - Motion / Framer Motion (부드러운 모달 진입 및 트랜지션)
- **백엔드 (Backend / BFF Server)**:
  - Node.js (v20+) with TypeScript (`tsx` in dev, `esbuild` bundled CJS in prod)
  - Express v4+ (API Gateway, 정적 SPA 호스팅, 외부 API 중계 및 보안 키 은닉)
  - 포트 설정: Container Port `3000`, Host `0.0.0.0`
- **AI / 멀티모달 서비스 (AI Integration)**:
  - **Google Gen AI SDK (`@google/genai`)**:
    - 메뉴 비전 분석: `gemini-3.6-flash` (권장), `gemini-3.1-flash-lite`, `gemini-3.8-flash`
    - 음식 실사 생성: `gemini-3.1-flash-lite-image`
    - 원어 발음 TTS: `gemini-3.1-flash-tts-preview`
  - **OpenAI API (Direct REST)**:
    - 메뉴 비전 분석: `gpt-4o`, `gpt-4o-mini`, `o1`, `o3-mini`, `chatgpt-4o-latest`
- **외부 미디어 데이터**:
  - Unsplash API / Food Photography CDN 매칭 알고리즘

### 3.2 데이터 흐름 (Data Flow)
```
[사용자 (카메라 촬영 / 파일 드롭)]
          │
          ▼
[React Client (App.tsx)]
  - 이미지 Base64 변환
  - 로컬 스토리지에서 활성 LLM Provider & Custom Key 추출
  - Header에 x-llm-provider, x-llm-api-key, x-llm-model 부착
          │
          ▼ POST /api/analyze-menu
[Express Backend (server.ts)]
  ├─ Provider 분기 (OpenAI vs Gemini)
  ├─ 다중 모델 캐스케이드 장애 복구 (503/429 발생 시 fallback 모델 자동 호출)
  ├─ 구조화된 JSON 파싱 및 데이터 정제 (전수 파싱 검증, KRW 환율 계산, 기본 설명 보정)
  └─ 요리별 고해상도 대표 실사 이미지 매칭
          │
          ▼ Response (MenuAnalysisResult)
[React Client 렌더링]
  - 식당 요약 헤더 (국가, 언어, 환율, 분위기)
  - 카테고리 탭 & 알레르기/식이 필터링 바
  - 메뉴 카드 그리드 (실사, 발음, 한국어 설명, 원화 가격, 담기)
  - 상세 모달 (원어 TTS 오디오, 5각 맛 프로필, 주문 문장)
  - 주문서 모달 (현지 점원 제시용 화면)
```

---

## 4. 핵심 기능 요구사항 명세 (Functional Requirements)

### 4.1 [FR-1] 메뉴판 이미지 입력 및 자동 분석
- **카메라 실시간 캡처 (`CameraCapture.tsx`)**:
  - `navigator.mediaDevices.getUserMedia`를 활용한 풀스크린 비디오 뷰파인더 제공.
  - 가이드 라인 오버레이, 전면/후면 카메라 전환 토글, 플래시/화각 최적화.
  - 캡처 즉시 고화질 JPEG Base64 추출 후 모달 자동 닫힘 및 분석 파이프라인 진입.
- **드래그 앤 드롭 파일 업로드 (`FileUpload.tsx`)**:
  - 드래그 앤 드롭 및 클릭 선택 지원 (`image/*`).
  - 파일 드롭/선택 즉시 별도 "분석 시작" 버튼을 누르지 않아도 **자동 분석 트리거**.
- **분석 진행 로딩 피드백**:
  - 스캔 중인 이미지 썸네일 위에 **레이저 스캐닝 빔 애니메이션** 작동.
  - 실시간 진행 단계 메시지 ("이미지 전처리" → "AI 미식 분석" → "환율 계산 및 실사 매칭" → "완료").

### 4.2 [FR-2] AI 멀티모달 비전 기반 메뉴 분석 엔진
- **전수 파싱 원칙 (No Omission Rule)**:
  - 대표 메뉴 몇 개만 추리는 것이 아니라, 메뉴판에 기재된 **모든 요리/음료/주류/사이드/토핑/세트 항목을 100% 누락 없이** 파싱.
- **한국인 친화적 정보 추출**:
  - `originalName`: 메뉴판 원어 텍스트.
  - `originalPronunciation`: 한글로 정확하게 읽을 수 있는 발음 (예: "스파게티 알라 카르보나라").
  - `koreanName`: 직관적인 한국어 이해 요리명 (예: "베이컨 노른자 크림 파스타").
  - `koreanDescription`: 주재료, 조리 방식, 소스, 식감, 향미를 아우르는 **2~4문장의 상세한 한국어 미식 해설**.
  - `priceOriginal` & `priceKRW`: 현지 통화 기호 표기 및 현재 환율을 반영한 정수 단위 원화 환산 가격.
  - `orderPhrase`: 현지에서 바로 읽거나 보여줄 수 있는 주문용 문장 ("Vorrei questo: Spaghetti Carbonara").
  - `tasteProfile`: 당도, 염도, 매운맛, 풍미, 산미 (0~5 정수 척도).
  - `ingredients` & `dietaryTags`: 식재료 목록 및 알레르기/식이 태그 (`vegetarian`, `pork`, `beef`, `seafood`, `dairy`, `spicy`, `halal` 등).
  - `recommendedDrink`: 해당 요리와 어울리는 현지 음료/주류 페어링 추천.

### 4.3 [FR-3] 다중 LLM 프로바이더 및 모델 관리자 설정 (`AdminSettingsModal.tsx`)
- **공급자 (Provider) 전환 지원**:
  - **Google Gemini**: 기본 탑재 (시스템 키 사용 가능, 개인 AI Studio 키 등록 가능).
  - **OpenAI**: 플러그인 지원 (사용자 개인 `sk-...` API 키 등록).
- **지원 모델 라인업**:
  - Gemini: `gemini-3.6-flash` (권장), `gemini-3.1-flash-lite`, `gemini-3.8-flash`
  - OpenAI: `gpt-4o` (권장 플래그십), `gpt-4o-mini` (초고속 가성비), `o1` (심층 추론), `o3-mini` (고성능 추론), `chatgpt-4o-latest`
- **보안 및 키 관리**:
  - 사용자가 입력한 API 키는 브라우저 `localStorage`에만 보관되며 클라이언트 노출 없이 서버 요청 헤더(`x-llm-api-key`)를 통해서만 전달.
  - 모달 내에서 **"실시간 API 키 유효성 테스트"** 버튼 제공 (`POST /api/admin/verify-key`).
  - 언제든 시스템 기본 키로 초기화할 수 있는 "키 삭제" 버튼 제공.

### 4.4 [FR-4] 요리 대표 실사 이미지 매칭 및 생성
- **1차 매칭 (High-Quality Food Image Matching)**:
  - 요리의 원어명, 카테고리, 대표 식재료를 기반으로 Unsplash 미식 큐레이션 데이터베이스에서 고화질 실사 매칭.
  - 출처가 불분명하거나 엉뚱한 이미지가 매칭되지 않도록 필터링 규칙 적용.
- **2차 온디맨드 AI 생성 (`POST /api/generate-food-image`)**:
  - 이미지가 없거나 사용자가 재생성을 원할 경우, `gemini-3.1-flash-lite-image` 모델을 통해 Michelin 가이드 스타일의 고화질 요리 실사 즉시 생성.

### 4.5 [FR-5] 네이티브 현지어 발음 TTS 오디오 (`POST /api/tts`)
- 요리 상세 모달에서 스피커 버튼 클릭 시, Gemini의 TTS 전용 모델(`gemini-3.1-flash-tts-preview`)을 호출하여 현지어 네이티브 억양의 오디오(Base64 PCM) 스트림을 브라우저 Web Audio API로 즉시 재생.

### 4.6 [FR-6] 미식 브라우징 및 필터링 시스템
- **카테고리 탭**: 메뉴판에서 자동 분류된 카테고리(전채, 메인, 파스타, 피자, 디저트, 음료 등) 탭.
- **식이 / 알레르기 원클릭 필터**:
  - `안 매운 요리 (Non-spicy)`: 매운맛 0인 요리만 노출.
  - `채식 / 비건 (Vegetarian)`: 육류/생선이 배제된 요리 필터.
  - `해산물 요리 (Seafood)`: 새우, 생선, 조개류 포함 요리.
  - `돼지고기 제외 (No Pork)`: 종교/기호에 따른 필터.
  - `소고기 요리 (Beef)`
  - `유제품 제외 (Dairy-free)`
- **키워드 실시간 검색**: 요리명(한국어/원어), 식재료명, 맛 키워드로 즉시 인덱싱 검색.

### 4.7 [FR-7] 인터랙티브 요리 상세 모달 (`DishDetailModal.tsx`)
- 고화질 실사 확대 보기 및 원본 프롬프트 확인.
- 원어 발음 TTS 재생 및 현지어 주문 문장 복사/표시.
- 5각 맛 프로필(당도, 염도, 매운맛, 풍미, 산미) 비주얼 게이지.
- 주요 식재료 칩 및 알레르기 주의 경고.
- 추천 음료 페어링 카드 및 수량 선택 후 주문서 담기.

### 4.8 [FR-8] 점원 소통용 주문서 화면 (`OrderSheetModal.tsx`)
- 주문에 담긴 요리 목록 및 수량 조절 (+/-), 단일 삭제, 전체 비우기.
- 현지 통화 합계 및 원화 환산 총 예상 금액 실시간 집계.
- **"점원에게 보여주기" 모드**:
  - 화면 밝기를 최적화하고 폰트 크기를 대폭 확대.
  - 외국인 점원이 한눈에 파악할 수 있도록 **원어 요리명 + 수량** 중심 레이아웃 제공.
  - 상단에 "점원에게 보여주는 화면입니다 (Please show this to the server)" 영문/현지어 배너 표시.

### 4.9 [FR-9] 원본 메뉴판 사진 팝업 모달
- 분석된 결과 화면 상단에 "촬영 원본 사진 보기" 버튼 제공.
- 언제든 사용자가 업로드했던 실제 메뉴판 원본 사진을 팝업으로 띄워 비교 대조 가능.

---

## 5. 데이터 모델 및 인터페이스 명세 (Data Models & Schemas)

### 5.1 TypeScript 타입 정의 (`src/types.ts`)

```typescript
export type LLMProvider = 'gemini' | 'openai';

export interface LLMModelOption {
  id: string;
  name: string;
  provider: LLMProvider;
  description: string;
  badge?: string;
}

export interface DietaryTag {
  id: string;
  label: string;
  icon?: string;
  type: 'allergy' | 'diet' | 'taste';
}

export interface DishItem {
  id: string;                          // 고유 ID (예: "dish-1")
  category: string;                    // 소속 카테고리 (예: "Primi Piatti")
  originalName: string;                // 메뉴판 원어 요리명 (예: "Spaghetti alla Carbonara")
  originalPronunciation: string;       // 한국어 발음 표기 (예: "스파게티 알라 카르보나라")
  koreanName: string;                  // 한국어 번역 요리명 (예: "정통 베이컨 노른자 파스타")
  koreanDescription: string;           // 2~4문장 상세 미식 설명 (맛, 식감, 소스 등)
  tasteProfile?: {
    sweetness: number;                 // 0 ~ 5
    saltiness: number;                 // 0 ~ 5
    spiciness: number;                 // 0 ~ 5
    richness: number;                  // 0 ~ 5 (고소함/풍미)
    acidity: number;                   // 0 ~ 5 (산미)
  };
  ingredients: string[];               // 주요 식재료 목록
  dietaryTags: string[];               // 식이/알레르기 태그 목록
  spiceLevel: number;                  // 0 ~ 3 (순한맛 ~ 아주 매운맛)
  priceOriginal: string;               // 원어 가격 표기 (예: "€ 14.00")
  priceKRW: number;                    // 환율 적용 원화 환산 가격 (예: 20720)
  imageUrl?: string;                   // 대표 실사 이미지 URL (없으면 빈값)
  visualPrompt?: string;               // Imagen 생성용 고해상도 영문 프롬프트
  orderPhrase: string;                 // 현지 주문용 문장 (예: "Vorrei questo: Spaghetti alla Carbonara")
  recommendedDrink?: string;           // 추천 페어링 음료
}

export interface RestaurantInfo {
  name: string;                        // 식당명 (추정 또는 메뉴판 기재)
  cuisineType: string;                 // 요리 분류 (예: "이탈리안", "프렌치 비스트로")
  sourceLanguage: string;              // 메뉴판 원어 (예: "이탈리아어")
  languageCode: string;                // 언어 코드 (예: "it", "ja", "fr")
  currencyCode: string;                // 통화 코드 (예: "EUR", "JPY")
  currencySymbol: string;              // 통화 기호 (예: "€", "¥")
  exchangeRateToKRW: number;           // 1단위당 원화 환율 (예: 1480)
  country: string;                     // 국가명
  summary: string;                     // 식당 및 메뉴판 스타일 요약 설명
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
```

---

## 6. 백엔드 API 엔드포인트 명세 (Backend API Specification)

### 6.1 `POST /api/analyze-menu`
- **설명**: 업로드된 메뉴판 이미지를 비전 LLM(Gemini 또는 OpenAI)으로 전수 분석하여 구조화된 데이터로 변환.
- **Headers**:
  - `Content-Type: application/json`
  - `x-llm-provider`: `gemini` 또는 `openai` (선택)
  - `x-llm-api-key`: 사용자 커스텀 API Key (선택)
  - `x-llm-model`: 사용할 모델명 (선택)
- **Request Body**:
  ```json
  {
    "imageBase64": "data:image/jpeg;base64,/9j/4AAQ...",
    "mimeType": "image/jpeg",
    "targetCurrency": "KRW"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "modelUsed": "gemini-3.6-flash",
    "restaurant": { ... },
    "categories": [ ... ],
    "dishes": [ ... ]
  }
  ```

### 6.2 `POST /api/admin/verify-key`
- **설명**: 관리자가 입력한 Gemini 또는 OpenAI API 키의 유효성을 경량 테스트 호출로 즉시 검증.
- **Request Body**:
  ```json
  {
    "apiKey": "AIzaSy... 또는 sk-...",
    "model": "gemini-3.1-flash-lite 또는 gpt-4o-mini",
    "provider": "gemini 또는 openai"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "인증 성공! (gpt-4o-mini 정상 응답)",
    "reply": "OK"
  }
  ```

### 6.3 `POST /api/generate-food-image`
- **설명**: 요리의 미식 프롬프트를 바탕으로 Gemini Imagen 모델을 호출하여 고해상도 실사 생성.
- **Request Body**:
  ```json
  {
    "visualPrompt": "Professional culinary food photography: Handmade pasta with guanciale...",
    "koreanName": "카르보나라",
    "originalName": "Spaghetti Carbonara"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "imageUrl": "data:image/png;base64,iVBORw..."
  }
  ```

### 6.4 `POST /api/tts`
- **설명**: 요리의 원어명을 네이티브 억양으로 읽어주는 오디오 스트림 반환.
- **Request Body**:
  ```json
  {
    "text": "Spaghetti alla Carbonara",
    "language": "it"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "audioBase64": "UklGR...",
    "mimeType": "audio/pcm"
  }
  ```

---

## 7. 비기능 요구사항 (Non-Functional Requirements)

### 7.1 복원력 및 장애 극복 (Resilience & Fallback Cascade)
- **API 레이트 리밋 및 일시적 503 극복**:
  - Gemini 호출 시 주 모델이 503 또는 429 에러를 반환하면, 즉시 다음 후보 모델(`gemini-3.1-flash-lite` → `gemini-3.8-flash`)로 2라운드에 걸쳐 자동 폴백.
- **JSON 응답 견고성 (Robust Parsing)**:
  - 모델이 반환한 텍스트에 마크다운 블록(````json ... ````)이 포함되거나 전후 공백이 있더라도 정규식으로 안전하게 추출하여 `JSON.parse` 수행.

### 7.2 보안 및 프라이버시 (Security & Privacy)
- 사용자의 개인 API 키는 절대 브라우저 공용 쿠키나 서버 영구 DB에 저장되지 않으며, 사용자 로컬 브라우저의 `localStorage`에만 보관되고 요청 시 일회성 헤더로만 전달됨.
- 서버 환경 변수(`process.env.GEMINI_API_KEY`, `process.env.OPENAI_API_KEY`)는 절대 클라이언트로 번들링되거나 노출되지 않음.

### 7.3 성능 및 반응형 모바일 UX (Mobile-First Precision)
- 해외여행 환경(스마트폰 한 손 조작)을 감안하여 모든 핵심 버튼(촬영, 필터, 수량 조절, 주문서)은 최소 **44px 이상의 터치 타겟**을 보장.
- 이미지 파일 업로드 시 클라이언트 측에서 불필요한 고용량 팽창을 방지하고 빠른 처리를 위해 적절한 캔버스 리사이징 적용.

---

## 8. UI / UX 디자인 가이드라인 (UI/UX Guidelines)

1. **컬러 시스템 (Culinary Dark Theme)**:
   - 배경 (Canvas): Stone-900 (`#1c1917`), Stone-950 (`#0c0a09`)
   - 카드 및 컨테이너: Stone-900 with Stone-800 borders
   - 포인트 컬러 (Accent): 에메랄드 (`#10b981`, 신뢰/주문/성공), 앰버 (`#f59e0b`, 맛/추천/별점), 로즈 (`#f43f5e`, 매운맛/경고)
2. **타이포그래피 (Typography)**:
   - 국문 폰트: `Noto Sans KR` (가독성 중심)
   - 영문/숫자 폰트: `Plus Jakarta Sans` (현대적인 기하학적 산세리프)
   - 가격 표기: 현지 가격(연회색)과 원화 환산 가격(에메랄드 볼드)을 명확한 위계로 나란히 배치.
3. **브랜딩 및 출처 표기**:
   - 앱 상단 헤더 및 하단 푸터에 **`by Jun Ji`** 표기 및 [Jun Ji YouTube 채널](https://www.youtube.com/@junji-ai) 아웃링크 연결 (`target="_blank"`).

---

## 9. 단계별 재개발 로드맵 (Implementation Roadmap)

| 단계 | 주요 구현 작업 | 산출물 |
| :--- | :--- | :--- |
| **Phase 1: 기반 설정 및 스키마** | 프로젝트 초기화 (Vite + React 19 + Express + Tailwind v4), `types.ts` 스키마 구축 | 구동 가능한 베이스라인 |
| **Phase 2: 백엔드 AI 파이프라인** | Express 서버 구축, Gemini 및 OpenAI 비전 분석 프롬프트 및 파서 작성, Fallback 캐스케이드 | `/api/analyze-menu`, `/api/admin/verify-key` |
| **Phase 3: 이미지 입력 & UI 구축** | 실시간 카메라 캡처 모달, 드래그앤드롭 업로더, 레이저 스캔 로딩 화면 | `CameraCapture`, `FileUpload` |
| **Phase 4: 미식 결과 대시보드** | 요리 카드 그리드, 카테고리/식이 필터바, 실사 이미지 매칭 및 재생성 | `DishCard`, `FilterBar` |
| **Phase 5: 상세 & 주문 인터랙션** | 5각 맛 프로필, 현지어 TTS 오디오 재생, 점원 소통용 주문서 화면 | `DishDetailModal`, `OrderSheetModal` |
| **Phase 6: 관리자 설정 & 테스트** | OpenAI/Gemini 모델 선택기, API 키 검증 모달, 프로덕션 빌드 및 배포 | `AdminSettingsModal`, 배포 완료 |

---

> **기획자**: Jun Ji ([https://www.youtube.com/@junji-ai](https://www.youtube.com/@junji-ai))  
> **버전**: v1.0.0  
> **상태**: 구현 완료 및 프로덕션 배포 완료
