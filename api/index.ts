import express, { Request, Response } from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set high payload limit for base64 photos from camera/file upload
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Normalize request URL for Vercel Serverless Function rewrites
app.use((req, res, next) => {
  const matchedPath = (req.headers["x-vercel-matched-path"] || req.headers["x-now-route-matches"]) as string;
  if (matchedPath && matchedPath.startsWith("/api") && req.url !== matchedPath) {
    req.url = matchedPath;
  } else if (req.url.startsWith("/api/index.ts")) {
    req.url = req.url.replace(/^\/api\/index\.ts/, "") || "/";
  }
  next();
});

// Standard current exchange rates against KRW (Korean Won)
const STANDARD_EXCHANGE_RATES: Record<string, number> = {
  EUR: 1485,  // 1 유로 ≈ 1,485원
  USD: 1380,  // 1 미국 달러 ≈ 1,380원
  JPY: 9.3,   // 1 일본 엔화 ≈ 9.3원 (100엔 ≈ 930원)
  THB: 39,    // 1 태국 바트 ≈ 39원
  VND: 0.055, // 1 베트남 동 ≈ 0.055원 (10,000동 ≈ 550원)
  CNY: 192,   // 1 중국 위안 ≈ 192원
  GBP: 1780,  // 1 영국 파운드 ≈ 1,780원
  TWD: 43,    // 1 대만 달러 ≈ 43원
  HKD: 177,   // 1 홍콩 달러 ≈ 177원
  SGD: 1040,  // 1 싱가포르 달러 ≈ 1,040원
  AUD: 910,   // 1 호주 달러 ≈ 910원
  CHF: 1580,  // 1 스위스 프랑 ≈ 1,580원
  PHP: 24.5,  // 1 필리핀 페소 ≈ 24.5원
  MYR: 310,   // 1 말레이시아 링깃 ≈ 310원
  CAD: 1010,  // 1 캐나다 달러 ≈ 1,010원
  NZD: 830,   // 1 뉴질랜드 달러 ≈ 830원
  TRY: 40,    // 1 튀르키예 리라 ≈ 40원
  IDR: 0.088, // 1 인도네시아 루피아 ≈ 0.088원
  KRW: 1,     // 1 원
};

// Priority candidate models to bypass 503 high demand spikes with fallback
const CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
];

// Curated authentic culinary image library for instant 0ms matching
const CULINARY_PHOTO_DATABASE: Record<string, string> = {
  // Southeast Asian & Thai
  'ผัดไทย': 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80',
  'pad thai': 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80',
  '팟타이': 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80',
  'ต้มยำ': 'https://images.unsplash.com/photo-1548946526-f69e2424cf45?auto=format&fit=crop&w=800&q=80',
  'tom yum': 'https://images.unsplash.com/photo-1548946526-f69e2424cf45?auto=format&fit=crop&w=800&q=80',
  '똠얌': 'https://images.unsplash.com/photo-1548946526-f69e2424cf45?auto=format&fit=crop&w=800&q=80',
  'curry': 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80',
  '커리': 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80',
  'som tum': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
  '쏨땀': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
  'pho': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
  '쌀국수': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
  'banh mi': 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=800&q=80',
  '반미': 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=800&q=80',
  'spring roll': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
  '스프링롤': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
  // Italian & European
  'carbonara': 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80',
  '까르보나라': 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80',
  'pasta': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
  '파스타': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
  'spaghetti': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
  '스파게티': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
  'pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  '피자': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  'risotto': 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80',
  '리조또': 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80',
  'tiramisu': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
  '티라미수': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
  'steak': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  '스테이크': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  'paella': 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=800&q=80',
  '빠에야': 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=800&q=80',
  // Japanese
  'sushi': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
  '초밥': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
  'sashimi': 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=800&q=80',
  '사시미': 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=800&q=80',
  'ramen': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
  '라멘': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
  'udon': 'https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?auto=format&fit=crop&w=800&q=80',
  '우동': 'https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?auto=format&fit=crop&w=800&q=80',
  'tempura': 'https://images.unsplash.com/photo-1615361200141-f45040f367be?auto=format&fit=crop&w=800&q=80',
  '튀김': 'https://images.unsplash.com/photo-1615361200141-f45040f367be?auto=format&fit=crop&w=800&q=80',
  'unagi': 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80',
  '장어': 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80',
  'tonkatsu': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80',
  '돈까스': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80',
  '돈카츠': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80',
  'yakitori': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
  '야키토리': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
  'soba': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  '소바': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  // Chinese
  'dim sum': 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=800&q=80',
  '딤섬': 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=800&q=80',
  'dumpling': 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80',
  '만두': 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80',
  'peking duck': 'https://images.unsplash.com/photo-1514944298352-78d128df61cb?auto=format&fit=crop&w=800&q=80',
  '북경오리': 'https://images.unsplash.com/photo-1514944298352-78d128df61cb?auto=format&fit=crop&w=800&q=80',
  'fried rice': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
  '볶음밥': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
  'mapo tofu': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  '마파두부': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  'hot pot': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
  '훠궈': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
  // Western & Drinks
  'burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  '버거': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  'taco': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
  '타코': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
  'salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  '샐러드': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  'soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
  '스프': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
  'dessert': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
  '디저트': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
  'coffee': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
  '커피': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
  'beer': 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=800&q=80',
  '맥주': 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=800&q=80',
  'wine': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
  '와인': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
};

function matchCuratedPhoto(name1: string = "", name2: string = ""): string {
  const target = `${name1} ${name2}`.toLowerCase();
  for (const [key, url] of Object.entries(CULINARY_PHOTO_DATABASE)) {
    if (target.includes(key.toLowerCase())) {
      return url;
    }
  }
  return "";
}

// Lazy GoogleGenAI client with custom admin API key support
function getGeminiClient(customKey?: string): GoogleGenAI {
  const apiKey = customKey?.trim() || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY가 서버(Vercel 환경변수)에 설정되어 있지 않습니다. Vercel 대시보드(Settings > Environment Variables)에 GEMINI_API_KEY를 추가하시거나, 화면 우측 상단 '관리자 설정(⚙️)'에서 직접 API Key를 입력해 주세요."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Resilient model invocation with retry, model cascade, and automatic fallback to system key if custom key is invalid
async function generateContentWithRetryAndFallback(
  ai: GoogleGenAI,
  requestConfig: any,
  preferredModels: string[] = CANDIDATE_MODELS,
  customKeyUsed?: string
): Promise<{ text: string; modelUsed: string }> {
  let lastError: any = null;

  // Try across candidate models; if temporary spike (503/429), try next model immediately
  for (let round = 1; round <= 2; round++) {
    for (const model of preferredModels) {
      try {
        console.log(`[Gemini Request] Invoking model '${model}' (round ${round})...`);
        const response = await ai.models.generateContent({
          ...requestConfig,
          model,
        });

        if (response?.text) {
          console.log(`[Gemini Success] Successfully completed with model '${model}'`);
          return { text: response.text, modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);
        console.warn(`[Gemini Warning] Model '${model}' round ${round} failed: ${msg}`);

        // If custom key failed due to invalid API key/auth error, and system key exists, fall back to system key
        if (
          customKeyUsed &&
          process.env.GEMINI_API_KEY &&
          customKeyUsed !== process.env.GEMINI_API_KEY &&
          (msg.includes("API key not valid") ||
            msg.includes("API_KEY_INVALID") ||
            msg.includes("400") ||
            msg.includes("401") ||
            msg.includes("403") ||
            msg.includes("PERMISSION_DENIED"))
        ) {
          console.warn("[Gemini Auth Fallback] Custom API key rejected. Falling back to default system key...");
          try {
            const fallbackAi = new GoogleGenAI({
              apiKey: process.env.GEMINI_API_KEY,
              httpOptions: { headers: { "User-Agent": "aistudio-build" } },
            });
            const fallbackRes = await fallbackAi.models.generateContent({
              ...requestConfig,
              model: "gemini-3.1-flash-lite",
            });
            if (fallbackRes?.text) {
              console.log("[Gemini Fallback Success] Succeeded using system GEMINI_API_KEY");
              return { text: fallbackRes.text, modelUsed: "gemini-3.1-flash-lite (시스템 키)" };
            }
          } catch (fallbackErr) {
            console.error("[Gemini Fallback Error]:", fallbackErr);
          }
        }

        // If 404, continue immediately to next model
        if (msg.includes("404") || msg.includes("NOT_FOUND")) {
          continue;
        }
      }
    }

    if (round === 1) {
      // If all models in round 1 were busy, pause 1000ms before round 2
      console.log("[Gemini Fallback] All candidate models busy, waiting 1000ms before retry round...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw lastError || new Error("현재 AI 모델 서버가 일시적으로 매우 혼잡합니다. 잠시 후 다시 시도해 주세요.");
}

// Resilient OpenAI Vision invocation
async function analyzeMenuWithOpenAI(
  apiKey: string,
  model: string,
  imageBase64: string,
  mimeType: string,
  systemPrompt: string,
  userPrompt: string
): Promise<{ text: string; modelUsed: string }> {
  const targetModel = model || "gpt-4o";
  console.log(`[OpenAI Request] Analyzing menu with model '${targetModel}'...`);

  const requestBody: any = {
    model: targetModel,
    messages: [
      {
        role: "system",
        content:
          systemPrompt +
          "\n\n[중요 응답 규칙]: 반드시 유효한 단일 JSON 객체만을 출력하세요. 마크다운 코드블록(```json 등)이나 설명 문장 없이 순수한 JSON 텍스트만을 반환해야 합니다.",
      },
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
              detail: "high",
            },
          },
        ],
      },
    ],
  };

  // Only models supporting json_object response_format
  if (!targetModel.startsWith("o1-mini")) {
    requestBody.response_format = { type: "json_object" };
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errData: any = await response.json().catch(() => ({}));
    const errMsg = errData.error?.message || `OpenAI API 오류 (상태 코드: ${response.status})`;
    throw new Error(errMsg);
  }

  const data: any = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  if (!text) {
    throw new Error("OpenAI 모델로부터 유효한 텍스트 응답을 수신하지 못했습니다.");
  }

  return { text, modelUsed: targetModel };
}

// Health check
app.get(["/api/health", "/health"], (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Robust JSON parser that handles markdown code-blocks and repairs cut-off/truncated outputs
function parseOrRepairJSON(raw: string): any {
  if (!raw || typeof raw !== "string") {
    throw new Error("AI 모델로부터 빈 응답을 수신했습니다.");
  }

  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // 1. Direct JSON parse attempt
  try {
    return JSON.parse(cleaned);
  } catch (initialErr) {
    // 2. Substring between first { and last }
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
      } catch {
        // Continue to partial repair
      }
    }

    // 3. Repair cut-off JSON (e.g., token limit reached mid-array)
    let text = firstBrace !== -1 ? cleaned.substring(firstBrace) : cleaned;
    text = text.replace(/,\s*$/, "");

    let openBraces = 0;
    let openBrackets = 0;
    let inString = false;
    let escaped = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === "{") openBraces++;
        else if (char === "}") openBraces = Math.max(0, openBraces - 1);
        else if (char === "[") openBrackets++;
        else if (char === "]") openBrackets = Math.max(0, openBrackets - 1);
      }
    }

    if (inString) text += '"';

    const lastCompleteObj = text.lastIndexOf("}");
    if (lastCompleteObj !== -1 && openBraces > 0) {
      text = text.substring(0, lastCompleteObj + 1);
      openBraces = 0;
      openBrackets = 0;
      inString = false;
      escaped = false;
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (escaped) { escaped = false; continue; }
        if (c === "\\") { escaped = true; continue; }
        if (c === '"') { inString = !inString; continue; }
        if (!inString) {
          if (c === "{") openBraces++;
          else if (c === "}") openBraces = Math.max(0, openBraces - 1);
          else if (c === "[") openBrackets++;
          else if (c === "]") openBrackets = Math.max(0, openBrackets - 1);
        }
      }
    }

    while (openBrackets > 0) {
      text += "]";
      openBrackets--;
    }
    while (openBraces > 0) {
      text += "}";
      openBraces--;
    }

    return JSON.parse(text);
  }
}

// Endpoint: Analyze Menu Image
app.post(["/api/analyze-menu", "/analyze-menu"], async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", targetCurrency = "KRW" } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "No image provided for menu analysis." });
    }

    // Clean base64 string if data URL prefix exists
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+-]+;base64,/, "");

    const providerHeader = (req.headers["x-llm-provider"] as string) || req.body.provider;
    const customApiKey =
      (req.headers["x-llm-api-key"] as string) ||
      (req.headers["x-openai-api-key"] as string) ||
      (req.headers["x-gemini-api-key"] as string) ||
      (req.body.customApiKey as string);
    const customModel =
      (req.headers["x-llm-model"] as string) ||
      (req.headers["x-openai-model"] as string) ||
      (req.headers["x-gemini-model"] as string) ||
      (req.body.customModel as string);

    const isOpenAI =
      providerHeader === "openai" ||
      customModel?.startsWith("gpt-") ||
      customModel?.startsWith("o1") ||
      customModel?.startsWith("o3") ||
      customApiKey?.startsWith("sk-");

    const systemPrompt = `
당신은 전 세계 모든 언어의 식당 메뉴판을 완벽하게 분석하고 번역하는 '최고의 미식 통역가이자 셰프 전문가'입니다.
사용자가 촬영하거나 업로드한 메뉴판 이미지를 분석하여 한국인 여행자/식도락가가 현지에서 바로 주문하고 이해할 수 있도록 구조화된 JSON 데이터로 출력하세요.

반드시 다음 규칙을 엄격히 지켜주세요:
1. [메뉴판의 모든 메뉴 전수 파싱 원칙 - 누락 절대 금지]:
   - 메뉴판 이미지에 보이는 **모든 요리 및 메뉴 항목(전채 요리, 메인 요리, 단품, 사이드, 밥/면류, 수프, 세트 메뉴, 토핑, 디저트, 음료 및 주류 등)**을 단 하나도 빠뜨리지 말고 100% 전부 파싱하여 dishes 배열에 담으세요.
   - 일부 대표 요리 몇 개만 추려서 반환하지 마시고, 메뉴판에 적힌 모든 메뉴 항목 각각을 독립된 요리 객체로 생성하세요.

2. [모든 메뉴에 대한 구체적이고 생생한 상세 설명(koreanDescription) 필수 작성]:
   - 메뉴판에 적힌 **모든 메뉴 각각에 대해** 절대로 설명을 생략하거나 비워두지 마세요.
   - 메뉴판에 짧은 요리명만 적혀 있더라도, 해당 요리가 정확히 어떤 요리인지, 어떤 주요 식재료와 양념/소스가 들어가는지, 맛의 조화(단맛, 짠맛, 고소함, 매운맛, 감칠맛, 향신료 등)와 식감은 어떤지, 어떻게 조리되어 현지에서 어떻게 먹는 음식인지(예: 밥과 곁들이는지, 특정 소스에 찍어 먹는지, 따뜻할 때 바로 먹어야 하는지)를 최소 2~4문장의 친절하고 군침 도는 한국어로 정성껏 설명하세요.
   - 음료나 디저트, 사이드 메뉴 역시 맛과 풍미, 청량감 등을 구체적으로 설명하세요.

3. [필수 - 음식 이름의 원어 발음을 한글로 완벽 표기]:
   - originalPronunciation: 한국인이 현지 식당에서 직원에게 소리 내어 말하거나 읽을 수 있는 가장 정확하고 자연스러운 '한글 발음 표기'.
   - 예시: 
     * 태국어: 'ผัดไทยกุ้ง' -> '팟타이 꿍', 'ต้มยำกุ้ง' -> '똠얌꿍', 'ปูผัดผงกะหรี่' -> '뿌팟퐁커리'
     * 이탈리아어: 'Spaghetti alla Carbonara' -> '스파게티 알라 카르보나라'
     * 일본어: '鰻重' -> '우나쥬', 'とんかつ' -> '돈카츠', '天ぷら' -> '덴푸라'
     * 프랑스어: 'Bœuf Bourguignon' -> '뵈프 부르기뇽', 'Croissant' -> '크루아상'
     * 베트남어: 'Phở Bò' -> '퍼보', 'Bánh Mì' -> '반미'
     * 스페인어: 'Paella de Mariscos' -> '파에야 데 마리스코스'
     * 중국어: '麻婆豆腐' -> '마포더우푸'
   - 절대 빈칸으로 두거나 영어 알파벳으로 적지 말고 순수 한글 소리 표기로 적으세요.

4. [필수 - 현재 환율 적용 및 원화(KRW) 환산 가격 병행 표시]:
   - 현재 기준 환율 참고표:
     * 1 EUR(유로) ≈ 1,485원
     * 1 USD(미국 달러) ≈ 1,380원
     * 1 JPY(일본 엔) ≈ 9.3원 (100엔 ≈ 930원)
     * 1 THB(태국 바트) ≈ 39원
     * 1 VND(베트남 동) ≈ 0.055원 (10,000동 ≈ 550원)
     * 1 CNY(중국 위안) ≈ 192원
     * 1 GBP(영국 파운드) ≈ 1,780원
     * 1 TWD(대만 달러) ≈ 43원
     * 1 HKD(홍콩 달러) ≈ 177원
     * 1 SGD(싱가포르 달러) ≈ 1,040원
     * 1 AUD(호주 달러) ≈ 910원
     * 1 CHF(스위스 프랑) ≈ 1,580원
     * 1 PHP(필리핀 페소) ≈ 24.5원
     * 1 MYR(말레이시아 링깃) ≈ 310원
   - priceOriginal: 메뉴판 원본 가격 표기 (예: '180 ฿', '€14.50', '¥1,200', '$18.00', '65,000 ₫')
   - priceKRW: 위 현재 환율을 곱해 산출한 정수 단위의 정확한 한화(KRW) 가격 (예: €14.50 -> 21500, 180 ฿ -> 7020, ¥1,200 -> 11160)
   - restaurant.exchangeRateToKRW: 해당 화폐 1단위당 원화 환율 (예: EUR -> 1485, USD -> 1380, JPY -> 9.3, THB -> 39, VND -> 0.055)

5. 각 요리별 상세 정보:
   - category: 카테고리 (예: 전채 요리, 메인 요리, 파스타/면류, 밥류, 수프, 디저트, 음료 등)
   - originalName: 메뉴판에 적힌 원어 그대로의 요리 이름
   - koreanName: 한국인이 직관적으로 이해할 수 있는 명확하고 맛깔스러운 한국어 번역 요리명
   - koreanDescription: 모든 메뉴마다 맛(단맛, 짠맛, 고소함 등), 식감, 조리법, 특징, 포션 크기, 어떻게 먹으면 맛있는지 등을 2~4문장으로 친절하고 생생하게 설명
   - ingredients: 주요 재료 목록 (한국어 배열, 예: ['새우', '쌀국수', '타마린드 소스', '숙주'])
   - dietaryTags: 알레르기 및 식이 태그 (예: ['해산물 포함 🦐', '견과류 포함 🥜', '매운맛 🌶️', '채식 가능 🌿', '돼지고기 🥩', '달걀 포함 🥚'])
   - spiceLevel: 0 (안 매움) ~ 3 (매우 매움)
   - orderPhrase: 현지 직원에게 보여주거나 말할 때 바로 쓸 수 있는 현지어 주문 문장과 한글 발음 (예: "ขอ ผัดไทยกุ้ง 1 ที่ ครับ/ค่ะ (커 팟타이 꿍 능 티 캅/카)")
   - visualPrompt: 이 음식의 실제 먹음직스러운 대표 사진을 고화질로 묘사하는 영어 프롬프트
   - recommendedDrink: 이 요리와 가장 잘 어울리는 추천 음료/주류 (한국어)
   - tasteProfile: sweetness (1-5), saltiness (1-5), spiciness (1-5), richness (1-5), acidity (1-5)

한국어로 정중하고 정확하게 작성하세요.
`;

    const userPrompt = `이 메뉴판 사진에 인쇄된 모든 메뉴(요리, 식사, 사이드, 음료 등)를 하나도 빠짐없이 전수 추출해 주세요. 각 메뉴마다 원어 이름, [한글 발음(originalPronunciation)], 한국어 번역명, [모든 메뉴에 대한 2~4문장의 생생하고 친절한 상세 설명(koreanDescription)], 주요 재료, 식이/알레르기 정보, [원어 가격(priceOriginal) 및 현재 환율 적용 원화 가격(priceKRW)], 주문 문장, 대표 비주얼 프롬프트를 작성해 주세요.`;

    const requestConfig = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType,
              },
            },
            {
              text: userPrompt,
            },
          ],
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            restaurant: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "식당 이름 또는 메뉴판 헤더" },
                cuisineType: { type: Type.STRING, description: "요리 장르 (예: 정통 이탈리안, 태국 로컬, 도쿄 스시 등)" },
                sourceLanguage: { type: Type.STRING, description: "메뉴판 원본 언어명 (예: 이탈리아어, 태국어, 일본어, 프랑스어 등)" },
                languageCode: { type: Type.STRING, description: "언어 코드 (예: it-IT, th-TH, ja-JP, fr-FR, es-ES, vi-VN, en-US, zh-CN 등)" },
                currencyCode: { type: Type.STRING, description: "화폐 코드 (예: EUR, THB, JPY, USD, VND 등)" },
                currencySymbol: { type: Type.STRING, description: "화폐 기호 (예: €, ฿, ¥, $, ₫ 등)" },
                exchangeRateToKRW: { type: Type.NUMBER, description: "해당 화폐 1단위당 현재 한화(KRW) 환율" },
                country: { type: Type.STRING, description: "추정 국가/지역" },
                summary: { type: Type.STRING, description: "메뉴판 전반의 특징과 추천 사항 요약" },
              },
              required: ["name", "cuisineType", "sourceLanguage", "currencyCode", "currencySymbol", "exchangeRateToKRW", "summary"],
            },
            categories: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "추출된 메뉴 카테고리 목록",
            },
            dishes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "고유 ID (예: dish-1)" },
                  category: { type: Type.STRING, description: "소속 카테고리" },
                  originalName: { type: Type.STRING, description: "메뉴판 원어 요리명" },
                  originalPronunciation: { type: Type.STRING, description: "한국인이 읽을 수 있는 정확한 한글 발음 표기" },
                  koreanName: { type: Type.STRING, description: "한국어 번역/이해 요리명" },
                  koreanDescription: { type: Type.STRING, description: "맛과 특징에 대한 상세 한글 설명" },
                  ingredients: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "주요 식재료 목록",
                  },
                  dietaryTags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "식이 및 알레르기 태그",
                  },
                  spiceLevel: { type: Type.INTEGER, description: "매운맛 정도 (0~3)" },
                  priceOriginal: { type: Type.STRING, description: "원본 가격 표기 (예: 180 ฿, €12.50)" },
                  priceKRW: { type: Type.NUMBER, description: "현재 환율 적용 한화(KRW) 환산 가격 (정수)" },
                  orderPhrase: { type: Type.STRING, description: "현지 주문용 문장과 한글 발음" },
                  visualPrompt: { type: Type.STRING, description: "음식 실사 이미지 생성을 위한 고품질 영어 프롬프트" },
                  recommendedDrink: { type: Type.STRING, description: "어울리는 추천 음료" },
                  tasteProfile: {
                    type: Type.OBJECT,
                    properties: {
                      sweetness: { type: Type.INTEGER },
                      saltiness: { type: Type.INTEGER },
                      spiciness: { type: Type.INTEGER },
                      richness: { type: Type.INTEGER },
                      acidity: { type: Type.INTEGER },
                    },
                  },
                },
                required: [
                  "id",
                  "category",
                  "originalName",
                  "originalPronunciation",
                  "koreanName",
                  "koreanDescription",
                  "ingredients",
                  "dietaryTags",
                  "priceOriginal",
                  "priceKRW",
                  "orderPhrase",
                  "visualPrompt",
                ],
              },
            },
          },
          required: ["restaurant", "categories", "dishes"],
        },
      },
    };

    let textOutput: string = "";
    let modelUsed: string = "";

    if (isOpenAI) {
      const openAiKey = customApiKey || process.env.OPENAI_API_KEY;
      if (!openAiKey) {
        return res.status(400).json({
          error: "OpenAI API Key가 설정되지 않았습니다. 관리자 설정(우측 상단 톱니바퀴 아이콘)에서 OpenAI API Key를 등록해 주세요.",
        });
      }
      const openAiResult = await analyzeMenuWithOpenAI(
        openAiKey,
        customModel || "gpt-4o",
        cleanBase64,
        mimeType,
        systemPrompt,
        userPrompt
      );
      textOutput = openAiResult.text;
      modelUsed = openAiResult.modelUsed;
    } else {
      const ai = getGeminiClient(customApiKey);
      const modelsToUse = customModel
        ? [customModel, ...CANDIDATE_MODELS.filter((m) => m !== customModel)]
        : CANDIDATE_MODELS;

      // Use multi-model retry & fallback cascade to prevent 503 errors
      const geminiResult = await generateContentWithRetryAndFallback(
        ai,
        requestConfig,
        modelsToUse,
        customApiKey
      );
      textOutput = geminiResult.text;
      modelUsed = geminiResult.modelUsed;
    }

    let parsedData: any;
    try {
      parsedData = parseOrRepairJSON(textOutput);
    } catch (parseErr) {
      console.error("JSON parsing error:", parseErr, "Raw output:", textOutput);
      throw new Error("메뉴 데이터 형식을 변환할 수 없습니다. 사진이 흐리거나 인식이 어려울 수 있으니 선명한 사진으로 다시 시도해 주세요.");
    }

    // Determine & calibrate exchange rate
    const currencyCode = (parsedData.restaurant?.currencyCode || "").toUpperCase();
    let currentRate = parsedData.restaurant?.exchangeRateToKRW;

    if (!currentRate || currentRate <= 0) {
      currentRate = STANDARD_EXCHANGE_RATES[currencyCode] || 1;
      if (parsedData.restaurant) {
        parsedData.restaurant.exchangeRateToKRW = currentRate;
      }
    }

    // Process and validate dishes: guarantee Korean pronunciation, accurate KRW price, and representative web image
    if (parsedData.dishes && Array.isArray(parsedData.dishes)) {
      await Promise.all(
        parsedData.dishes.map(async (dish: any, index: number) => {
          if (!dish.id) dish.id = `dish-${index + 1}`;

          // 1. Ensure Korean pronunciation is present
          if (!dish.originalPronunciation || dish.originalPronunciation.trim() === "") {
            dish.originalPronunciation = dish.koreanName || dish.originalName;
          }

          // 2. Ensure priceKRW is accurately calculated with the exchange rate
          if (!dish.priceKRW || dish.priceKRW <= 0) {
            const numMatch = dish.priceOriginal?.match(/[\d,]+(\.\d+)?/);
            if (numMatch) {
              const rawNum = parseFloat(numMatch[0].replace(/,/g, ""));
              if (!isNaN(rawNum) && rawNum > 0) {
                dish.priceKRW = Math.round(rawNum * currentRate);
              }
            }
          }

          // 3. If priceOriginal is just a number, attach currency symbol
          if (dish.priceOriginal && !isNaN(Number(dish.priceOriginal.trim()))) {
            const sym = parsedData.restaurant?.currencySymbol || parsedData.restaurant?.currencyCode || "";
            dish.priceOriginal = `${sym} ${dish.priceOriginal}`.trim();
          }

          // 4. Ensure every dish has a meaningful, high quality Korean description
          if (!dish.koreanDescription || dish.koreanDescription.trim().length < 15) {
            const ingText = dish.ingredients && dish.ingredients.length > 0
              ? `주요 식재료인 ${dish.ingredients.slice(0, 3).join(', ')}의 깊은 풍미를 살려 조리되었습니다.`
              : '현지 고유의 조리법으로 식재료의 감칠맛과 풍미를 균형감 있게 담아냈습니다.';
            dish.koreanDescription = `${dish.koreanName || dish.originalName}은(는) 현지 식당에서 사랑받는 대표적인 메뉴입니다. ${ingText} 기호에 맞춰 소스나 곁들임 메뉴와 함께 즐기시면 더욱 맛있습니다.`;
          }

          // 5. Assign authentic representative food image only if a genuine curated match exists
          // User preference: if no appropriate image is found, keep it as no-image ("")
          if (!dish.imageUrl || dish.imageUrl.trim() === "") {
            dish.imageUrl = matchCuratedPhoto(dish.originalName, dish.koreanName) || "";
          }
        })
      );
    }

    return res.json({
      success: true,
      data: parsedData,
      modelUsed,
    });
  } catch (error: any) {
    console.error("Error analyzing menu:", error);
    const msg = error?.message || "메뉴판을 분석하는 도중 오류가 발생했습니다. 사진을 다시 올려주세요.";
    const isApiKeyError =
      msg.includes("GEMINI_API_KEY") ||
      msg.includes("OPENAI_API_KEY") ||
      msg.includes("API Key") ||
      msg.includes("API_KEY_INVALID") ||
      msg.includes("API key not valid");
    const isHighDemand =
      msg.includes("503") ||
      msg.includes("UNAVAILABLE") ||
      msg.includes("high demand") ||
      msg.includes("Resource has been exhausted") ||
      msg.includes("429");

    let statusCode = 500;
    let userFriendlyMsg = msg;

    if (isApiKeyError) {
      statusCode = 400;
      userFriendlyMsg = msg.includes("Vercel")
        ? msg
        : `${msg} (Vercel 환경변수에 GEMINI_API_KEY를 추가하거나 웹화면 우측 상단 '관리자 설정⚙️'에서 직접 입력해 주세요.)`;
    } else if (isHighDemand) {
      statusCode = 503;
      userFriendlyMsg =
        "현재 AI 모델 서버가 일시적으로 매우 혼잡합니다. 잠시 후 다시 시도하시거나, 우측 상단 관리자 설정(⚙️)에서 다른 모델(gemini-3.1-flash-lite 또는 OpenAI)을 선택해 주세요.";
    }

    return res.status(statusCode).json({
      success: false,
      error: userFriendlyMsg,
    });
  }
});

// Endpoint: Dynamic on-demand web search for food image
app.get(["/api/search-food-image", "/search-food-image"], async (req: Request, res: Response) => {
  try {
    const originalName = (req.query.original as string) || "";
    const koreanName = (req.query.ko as string) || (req.query.q as string) || "";

    const imageUrl = matchCuratedPhoto(originalName, koreanName);
    return res.json({ success: true, imageUrl });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint: Admin LLM API Key test & validation
app.post(["/api/admin/verify-key", "/admin/verify-key"], async (req: Request, res: Response) => {
  try {
    const { apiKey, model, provider } = req.body;
    const testKey =
      apiKey?.trim() ||
      (req.headers["x-llm-api-key"] as string) ||
      (req.headers["x-openai-api-key"] as string) ||
      (req.headers["x-gemini-api-key"] as string);

    const isExplicitOpenAI =
      provider === "openai" ||
      model?.startsWith("gpt-") ||
      model?.startsWith("o1") ||
      model?.startsWith("o3") ||
      testKey?.startsWith("sk-");

    if (!testKey) {
      return res.status(400).json({
        success: false,
        error: isExplicitOpenAI
          ? "테스트할 OpenAI API Key를 입력해 주세요."
          : "테스트할 Gemini API Key를 입력해 주세요.",
      });
    }

    if (isExplicitOpenAI) {
      const targetModel = model || "gpt-4o-mini";
      console.log(`[OpenAI Admin Test] Testing API Key with model '${targetModel}'...`);

      const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testKey}`,
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [{ role: "user", content: "Reply 'OK' in 1 word." }],
          max_tokens: 5,
        }),
      });

      if (!openAiRes.ok) {
        const errJson: any = await openAiRes.json().catch(() => ({}));
        const msg = errJson.error?.message || `OpenAI API 인증 오류 (HTTP ${openAiRes.status})`;
        return res.status(401).json({
          success: false,
          error: msg,
        });
      }

      const openAiData: any = await openAiRes.json();
      return res.json({
        success: true,
        message: `OpenAI 인증 성공! (${targetModel} 정상 응답)`,
        reply: openAiData.choices?.[0]?.message?.content?.trim() || "OK",
      });
    }

    const testAi = new GoogleGenAI({
      apiKey: testKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const targetModel = model || "gemini-3.1-flash-lite";
    console.log(`[Admin Test] Testing API Key with model '${targetModel}'...`);

    const response = await testAi.models.generateContent({
      model: targetModel,
      contents: "Confirm API key works. Reply in 5 words or less.",
    });

    return res.json({
      success: true,
      message: `Gemini 인증 성공! (${targetModel} 정상 응답)`,
      reply: response.text?.trim(),
    });
  } catch (err: any) {
    console.error("[Admin Test Error]:", err);
    let userFriendlyError = err.message || "API Key가 유효하지 않거나 권한이 없습니다.";

    if (
      userFriendlyError.includes("ACCESS_TOKEN_TYPE_UNSUPPORTED") ||
      userFriendlyError.includes("UNAUTHENTICATED") ||
      userFriendlyError.includes("invalid authentication credentials") ||
      userFriendlyError.includes("API key not valid") ||
      userFriendlyError.includes("API_KEY_INVALID") ||
      userFriendlyError.includes("400") ||
      userFriendlyError.includes("401") ||
      userFriendlyError.includes("INVALID_ARGUMENT")
    ) {
      userFriendlyError =
        "입력하신 키는 Google AI Studio의 정식 Gemini API Key가 아닙니다 (OAuth 세션 토큰 또는 미지원 인증 형식). Gemini API 키는 보통 'AIzaSy'로 시작하며, Google AI Studio(https://aistudio.google.com/app/apikey)에서 무료로 발급받으실 수 있습니다.";
    } else if (
      userFriendlyError.includes("PERMISSION_DENIED") ||
      userFriendlyError.includes("403")
    ) {
      userFriendlyError =
        "API Key 접근 권한이 없습니다(403). Google AI Studio에서 키의 API 활성화 상태 및 권한을 확인해 주세요.";
    } else if (
      userFriendlyError.includes("RESOURCE_EXHAUSTED") ||
      userFriendlyError.includes("429")
    ) {
      userFriendlyError =
        "해당 API Key의 요청 한도(Quota/Rate limit)를 초과했습니다. 잠시 후 다시 시도하거나 다른 모델을 선택해 주세요.";
    }

    return res.status(401).json({
      success: false,
      error: userFriendlyError,
    });
  }
});

// Endpoint: Generate high-resolution representative food image
app.post(["/api/generate-food-image", "/generate-food-image"], async (req: Request, res: Response) => {
  try {
    const { visualPrompt, koreanName, originalName } = req.body;

    if (!visualPrompt && !koreanName) {
      return res.status(400).json({ error: "Missing prompt or dish name." });
    }

    const customApiKey = (req.headers["x-gemini-api-key"] as string) || (req.body.customApiKey as string);
    const ai = getGeminiClient(customApiKey);

    const fullPrompt = visualPrompt
      ? `Professional culinary food photography: ${visualPrompt}, mouth-watering, appetizing plating, Michelin star presentation, natural warm lighting, macro detail, 4k sharp focus, high-end restaurant table.`
      : `Professional culinary food photography of authentic ${originalName || koreanName}, delicious food presentation, close-up, appetizing, warm studio lighting, 4k resolution`;

    // Generate image using gemini-3.1-flash-lite-image
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "4:3",
        },
      },
    });

    let imageUrl: string | null = null;
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || "image/png";
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      return res.status(404).json({ success: false, error: "No image was returned from image model." });
    }

    return res.json({ success: true, imageUrl });
  } catch (error: any) {
    console.error("Error generating food image:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate food image.",
    });
  }
});

// Endpoint: Text to Speech for native dish pronunciation
app.post(["/api/tts", "/tts"], async (req: Request, res: Response) => {
  try {
    const { text, language = "ko" } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required for TTS." });
    }

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Pronounce naturally: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({ success: true, audioBase64: base64Audio, mimeType: "audio/pcm" });
    }

    return res.json({ success: false, message: "No audio generated" });
  } catch (error: any) {
    console.error("Error in TTS endpoint:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Setup Vite middleware / static serving
export async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
}

export default app;
