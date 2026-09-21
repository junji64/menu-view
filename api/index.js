// api/index.ts
import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// api/foodImageFinder.ts
var CULINARY_PHOTO_DATABASE = {
  // Thai & Southeast Asian (Original Native + Romanized)
  "\u0E1C\u0E31\u0E14\u0E44\u0E17\u0E22": "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80",
  "pad thai": "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80",
  "\uD31F\uD0C0\uC774": "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80",
  "\u0E15\u0E49\u0E21\u0E22\u0E33": "https://images.unsplash.com/photo-1548946526-f69e2424cf45?auto=format&fit=crop&w=800&q=80",
  "tom yum": "https://images.unsplash.com/photo-1548946526-f69e2424cf45?auto=format&fit=crop&w=800&q=80",
  "\uB620\uC58C": "https://images.unsplash.com/photo-1548946526-f69e2424cf45?auto=format&fit=crop&w=800&q=80",
  "\u0E41\u0E01\u0E07": "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80",
  "curry": "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80",
  "\uCEE4\uB9AC": "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80",
  "\uCE74\uB808": "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80",
  "\u0E2A\u0E49\u0E21\u0E15\u0E33": "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
  "som tum": "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
  "\uC3E8\uB540": "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
  "ph\u1EDF": "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80",
  "pho": "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80",
  "\uC300\uAD6D\uC218": "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80",
  "g\u1ECFi cu\u1ED1n": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
  "spring roll": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
  "\uC2A4\uD504\uB9C1\uB864": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
  "b\xE1nh m\xEC": "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=800&q=80",
  "banh mi": "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=800&q=80",
  "\uBC18\uBBF8": "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=800&q=80",
  // Italian & European (Original Native)
  "carbonara": "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80",
  "\uAE4C\uB974\uBCF4\uB098\uB77C": "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80",
  "pasta": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
  "spaghetti": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
  "bolognese": "https://images.unsplash.com/photo-1621996346565-e3d5d628198f?auto=format&fit=crop&w=800&q=80",
  "rag\xF9": "https://images.unsplash.com/photo-1621996346565-e3d5d628198f?auto=format&fit=crop&w=800&q=80",
  "pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
  "margherita": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80",
  "risotto": "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80",
  "tiramis\xF9": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80",
  "tiramisu": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80",
  "croissant": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80",
  "bistecca": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  "steak": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  "paella": "https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=800&q=80",
  "\uBE60\uC5D0\uC57C": "https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=800&q=80",
  "tapas": "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80",
  // Japanese (Original Kanji / Kana)
  "\u5BFF\u53F8": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
  "\u9BA8": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
  "\u3059\u3057": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
  "sushi": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
  "\u523A\u8EAB": "https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=800&q=80",
  "\u3055\u3057\u307F": "https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=800&q=80",
  "sashimi": "https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=800&q=80",
  "\u30E9\u30FC\u30E1\u30F3": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
  "\u3089\u30FC\u3081\u3093": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
  "\u62C9\u9EBA": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
  "ramen": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
  "\u3046\u3069\u3093": "https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?auto=format&fit=crop&w=800&q=80",
  "\u9942\u98E9": "https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?auto=format&fit=crop&w=800&q=80",
  "udon": "https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?auto=format&fit=crop&w=800&q=80",
  "\u5929\u3077\u3089": "https://images.unsplash.com/photo-1615361200141-f45040f367be?auto=format&fit=crop&w=800&q=80",
  "\u5929\u5A66\u7F85": "https://images.unsplash.com/photo-1615361200141-f45040f367be?auto=format&fit=crop&w=800&q=80",
  "tempura": "https://images.unsplash.com/photo-1615361200141-f45040f367be?auto=format&fit=crop&w=800&q=80",
  "\u9C3B": "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80",
  "\u3046\u306A\u304E": "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80",
  "\u3046\u306A\u91CD": "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80",
  "unagi": "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80",
  "\u4E3C": "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80",
  "\u3068\u3093\u304B\u3064": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80",
  "\u8C5A\u30AB\u30C4": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80",
  "tonkatsu": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80",
  "\u713C\u304D\u9CE5": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
  "\u3084\u304D\u3068\u308A": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
  "yakitori": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
  "\u305D\u3070": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
  "\u854E\u9EA6": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
  "soba": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
  // Chinese & Asian (Original Hanzi)
  "\u70B9\u5FC3": "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=800&q=80",
  "dim sum": "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=800&q=80",
  "\u997A\u5B50": "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80",
  "dumpling": "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80",
  "gyoza": "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80",
  "\u5317\u4EAC\u70E4\u9E2D": "https://images.unsplash.com/photo-1514944298352-78d128df61cb?auto=format&fit=crop&w=800&q=80",
  "peking duck": "https://images.unsplash.com/photo-1514944298352-78d128df61cb?auto=format&fit=crop&w=800&q=80",
  "\u7092\u996D": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80",
  "fried rice": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80",
  "\u9EBB\u5A46\u8C46\u8150": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
  "mapo tofu": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
  "\u5C0F\u7B3C\u5305": "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
  "xiaolongbao": "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
  "\u706B\u9505": "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
  "hot pot": "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
  // Western & Global
  "burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
  "hamburger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
  "taco": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
  "tacos": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
  "salad": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
  "insalata": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
  "soup": "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
  "zuppa": "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
  "seafood": "https://images.unsplash.com/photo-1539136788836-5699e78bfc75?auto=format&fit=crop&w=800&q=80",
  "frutti di mare": "https://images.unsplash.com/photo-1539136788836-5699e78bfc75?auto=format&fit=crop&w=800&q=80",
  "gamberi": "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80",
  "shrimp": "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80",
  "prawn": "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80",
  "pesce": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
  "fish": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
  "pollo": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
  "chicken": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
  "maiale": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  "pork": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  // Desserts & Beverages (Native Original)
  "dessert": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
  "dolce": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
  "caff\xE8": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
  "coffee": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
  "espresso": "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=800&q=80",
  "th\xE9": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
  "tea": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
  "birra": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=800&q=80",
  "cerveza": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=800&q=80",
  "beer": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=800&q=80",
  "vino": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
  "wine": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
  "vin": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80"
};
function extractCleanSearchQuery(originalName, koreanName) {
  if (!originalName || originalName.trim() === "") {
    return koreanName ? koreanName.replace(/[^\w\s가-힣]/gi, " ").trim() : "";
  }
  const parenMatch = originalName.match(/\(([^)]+)\)/);
  const withoutParen = originalName.replace(/\([^)]+\)/g, "").trim();
  const candidate = withoutParen.length >= 2 ? withoutParen : parenMatch ? parenMatch[1] : originalName;
  const cleaned = candidate.replace(/\b\d+([.,]\d+)?\s*(฿|€|\$|¥|원|₩|krw|thb|eur|usd|yen|vnd)?\b/gi, "").replace(/[#*•·\-_/\\:;"'~!?]/g, " ").replace(/\s+/g, " ").trim();
  if (cleaned.length >= 2) {
    return cleaned;
  }
  return originalName.trim();
}
function detectWikiLang(text) {
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return "ja";
  if (/[\u0E00-\u0E7F]/.test(text)) return "th";
  if (/[\u4E00-\u9FFF]/.test(text)) return "zh";
  if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text)) return "vi";
  if (/[\u0400-\u04FF]/.test(text)) return "ru";
  return "en";
}
async function searchWikipediaImage(searchTerm, lang = "en") {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2400);
    const formattedTitle = encodeURIComponent(searchTerm.trim().replace(/\s+/g, "_"));
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${formattedTitle}`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "TravelMenuLens/1.0 (culinary-assistant@example.com)",
        Accept: "application/json"
      }
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.thumbnail && data.thumbnail.source) {
        return data.thumbnail.source;
      }
      if (data.originalimage && data.originalimage.source) {
        return data.originalimage.source;
      }
    }
  } catch {
  }
  return null;
}
async function searchWikimediaCommons(query) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2400);
    const clean = query.replace(/[^\w\s\u0E00-\u0E7F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF가-힣]/gi, " ").trim();
    if (!clean) return null;
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      clean + " food"
    )}&gsrlimit=1&prop=pageimages&pithumbsize=800&format=json&origin=*`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.query && data.query.pages) {
        const pages = Object.values(data.query.pages);
        if (pages.length > 0 && pages[0].thumbnail?.source) {
          return pages[0].thumbnail.source;
        }
      }
    }
  } catch {
  }
  return null;
}
function matchCuratedPhoto(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const [key, url] of Object.entries(CULINARY_PHOTO_DATABASE)) {
    if (lower.includes(key.toLowerCase())) {
      return url;
    }
  }
  return null;
}
async function findRepresentativeFoodImage(originalName, koreanName, category = "", index = 0) {
  const originalQuery = extractCleanSearchQuery(originalName, "");
  const nativeLang = detectWikiLang(originalName || "");
  if (originalQuery && originalQuery.length >= 2) {
    if (nativeLang !== "en") {
      const nativeWikiImg = await searchWikipediaImage(originalQuery, nativeLang);
      if (nativeWikiImg) return nativeWikiImg;
    }
    const enWikiImg = await searchWikipediaImage(originalQuery, "en");
    if (enWikiImg) return enWikiImg;
    const commonsImg = await searchWikimediaCommons(originalQuery);
    if (commonsImg) return commonsImg;
  }
  const curatedOriginalMatch = matchCuratedPhoto(originalName) || (originalQuery ? matchCuratedPhoto(originalQuery) : null);
  if (curatedOriginalMatch) {
    return curatedOriginalMatch;
  }
  if (koreanName && koreanName.trim()) {
    const korWikiImg = await searchWikipediaImage(koreanName.trim(), "ko");
    if (korWikiImg) return korWikiImg;
    const curatedKorMatch = matchCuratedPhoto(koreanName);
    if (curatedKorMatch) return curatedKorMatch;
  }
  return "";
}

// api/index.ts
dotenv.config();
var app = express();
var PORT = 3e3;
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
var STANDARD_EXCHANGE_RATES = {
  EUR: 1485,
  // 1 유로 ≈ 1,485원
  USD: 1380,
  // 1 미국 달러 ≈ 1,380원
  JPY: 9.3,
  // 1 일본 엔화 ≈ 9.3원 (100엔 ≈ 930원)
  THB: 39,
  // 1 태국 바트 ≈ 39원
  VND: 0.055,
  // 1 베트남 동 ≈ 0.055원 (10,000동 ≈ 550원)
  CNY: 192,
  // 1 중국 위안 ≈ 192원
  GBP: 1780,
  // 1 영국 파운드 ≈ 1,780원
  TWD: 43,
  // 1 대만 달러 ≈ 43원
  HKD: 177,
  // 1 홍콩 달러 ≈ 177원
  SGD: 1040,
  // 1 싱가포르 달러 ≈ 1,040원
  AUD: 910,
  // 1 호주 달러 ≈ 910원
  CHF: 1580,
  // 1 스위스 프랑 ≈ 1,580원
  PHP: 24.5,
  // 1 필리핀 페소 ≈ 24.5원
  MYR: 310,
  // 1 말레이시아 링깃 ≈ 310원
  CAD: 1010,
  // 1 캐나다 달러 ≈ 1,010원
  NZD: 830,
  // 1 뉴질랜드 달러 ≈ 830원
  TRY: 40,
  // 1 튀르키예 리라 ≈ 40원
  IDR: 0.088,
  // 1 인도네시아 루피아 ≈ 0.088원
  KRW: 1
  // 1 원
};
var CANDIDATE_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
  "gemini-flash-latest"
];
function getGeminiClient(customKey) {
  const apiKey = customKey?.trim() || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY\uAC00 \uC11C\uBC84(Vercel \uD658\uACBD\uBCC0\uC218)\uC5D0 \uC124\uC815\uB418\uC5B4 \uC788\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. Vercel \uB300\uC2DC\uBCF4\uB4DC(Settings > Environment Variables)\uC5D0 GEMINI_API_KEY\uB97C \uCD94\uAC00\uD558\uC2DC\uAC70\uB098, \uD654\uBA74 \uC6B0\uCE21 \uC0C1\uB2E8 '\uAD00\uB9AC\uC790 \uC124\uC815(\u2699\uFE0F)'\uC5D0\uC11C \uC9C1\uC811 API Key\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
async function generateContentWithRetryAndFallback(ai, requestConfig, preferredModels = CANDIDATE_MODELS) {
  let lastError = null;
  for (let round = 1; round <= 2; round++) {
    for (const model of preferredModels) {
      try {
        console.log(`[Gemini Request] Invoking model '${model}' (round ${round})...`);
        const response = await ai.models.generateContent({
          ...requestConfig,
          model
        });
        if (response?.text) {
          console.log(`[Gemini Success] Successfully completed with model '${model}'`);
          return { text: response.text, modelUsed: model };
        }
      } catch (err) {
        lastError = err;
        const msg = err?.message || String(err);
        console.warn(`[Gemini Warning] Model '${model}' round ${round} failed: ${msg}`);
        if (msg.includes("404") || msg.includes("NOT_FOUND")) {
          continue;
        }
      }
    }
    if (round === 1) {
      console.log("[Gemini Fallback] All candidate models busy, waiting 1000ms before retry round...");
      await new Promise((resolve) => setTimeout(resolve, 1e3));
    }
  }
  throw lastError || new Error("\uD604\uC7AC AI \uBAA8\uB378 \uC11C\uBC84\uAC00 \uC77C\uC2DC\uC801\uC73C\uB85C \uB9E4\uC6B0 \uD63C\uC7A1\uD569\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.");
}
async function analyzeMenuWithOpenAI(apiKey, model, imageBase64, mimeType, systemPrompt, userPrompt) {
  const targetModel = model || "gpt-4o";
  console.log(`[OpenAI Request] Analyzing menu with model '${targetModel}'...`);
  const requestBody = {
    model: targetModel,
    messages: [
      {
        role: "system",
        content: systemPrompt + "\n\n[\uC911\uC694 \uC751\uB2F5 \uADDC\uCE59]: \uBC18\uB4DC\uC2DC \uC720\uD6A8\uD55C \uB2E8\uC77C JSON \uAC1D\uCCB4\uB9CC\uC744 \uCD9C\uB825\uD558\uC138\uC694. \uB9C8\uD06C\uB2E4\uC6B4 \uCF54\uB4DC\uBE14\uB85D(```json \uB4F1)\uC774\uB098 \uC124\uBA85 \uBB38\uC7A5 \uC5C6\uC774 \uC21C\uC218\uD55C JSON \uD14D\uC2A4\uD2B8\uB9CC\uC744 \uBC18\uD658\uD574\uC57C \uD569\uB2C8\uB2E4."
      },
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
              detail: "high"
            }
          }
        ]
      }
    ]
  };
  if (!targetModel.startsWith("o1-mini")) {
    requestBody.response_format = { type: "json_object" };
  }
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify(requestBody)
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.error?.message || `OpenAI API \uC624\uB958 (\uC0C1\uD0DC \uCF54\uB4DC: ${response.status})`;
    throw new Error(errMsg);
  }
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  if (!text) {
    throw new Error("OpenAI \uBAA8\uB378\uB85C\uBD80\uD130 \uC720\uD6A8\uD55C \uD14D\uC2A4\uD2B8 \uC751\uB2F5\uC744 \uC218\uC2E0\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
  }
  return { text, modelUsed: targetModel };
}
app.get(["/api/health", "/health"], (req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
function parseOrRepairJSON(raw) {
  if (!raw || typeof raw !== "string") {
    throw new Error("AI \uBAA8\uB378\uB85C\uBD80\uD130 \uBE48 \uC751\uB2F5\uC744 \uC218\uC2E0\uD588\uC2B5\uB2C8\uB2E4.");
  }
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (initialErr) {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
      } catch {
      }
    }
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
        if (escaped) {
          escaped = false;
          continue;
        }
        if (c === "\\") {
          escaped = true;
          continue;
        }
        if (c === '"') {
          inString = !inString;
          continue;
        }
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
app.post(["/api/analyze-menu", "/analyze-menu"], async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", targetCurrency = "KRW" } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "No image provided for menu analysis." });
    }
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+-]+;base64,/, "");
    const providerHeader = req.headers["x-llm-provider"] || req.body.provider;
    const customApiKey = req.headers["x-llm-api-key"] || req.headers["x-openai-api-key"] || req.headers["x-gemini-api-key"] || req.body.customApiKey;
    const customModel = req.headers["x-llm-model"] || req.headers["x-openai-model"] || req.headers["x-gemini-model"] || req.body.customModel;
    const isOpenAI = providerHeader === "openai" || customModel?.startsWith("gpt-") || customModel?.startsWith("o1") || customModel?.startsWith("o3") || customApiKey?.startsWith("sk-");
    const systemPrompt = `
\uB2F9\uC2E0\uC740 \uC804 \uC138\uACC4 \uBAA8\uB4E0 \uC5B8\uC5B4\uC758 \uC2DD\uB2F9 \uBA54\uB274\uD310\uC744 \uC644\uBCBD\uD558\uAC8C \uBD84\uC11D\uD558\uACE0 \uBC88\uC5ED\uD558\uB294 '\uCD5C\uACE0\uC758 \uBBF8\uC2DD \uD1B5\uC5ED\uAC00\uC774\uC790 \uC170\uD504 \uC804\uBB38\uAC00'\uC785\uB2C8\uB2E4.
\uC0AC\uC6A9\uC790\uAC00 \uCD2C\uC601\uD558\uAC70\uB098 \uC5C5\uB85C\uB4DC\uD55C \uBA54\uB274\uD310 \uC774\uBBF8\uC9C0\uB97C \uBD84\uC11D\uD558\uC5EC \uD55C\uAD6D\uC778 \uC5EC\uD589\uC790/\uC2DD\uB3C4\uB77D\uAC00\uAC00 \uD604\uC9C0\uC5D0\uC11C \uBC14\uB85C \uC8FC\uBB38\uD558\uACE0 \uC774\uD574\uD560 \uC218 \uC788\uB3C4\uB85D \uAD6C\uC870\uD654\uB41C JSON \uB370\uC774\uD130\uB85C \uCD9C\uB825\uD558\uC138\uC694.

\uBC18\uB4DC\uC2DC \uB2E4\uC74C \uADDC\uCE59\uC744 \uC5C4\uACA9\uD788 \uC9C0\uCF1C\uC8FC\uC138\uC694:
1. [\uBA54\uB274\uD310\uC758 \uBAA8\uB4E0 \uBA54\uB274 \uC804\uC218 \uD30C\uC2F1 \uC6D0\uCE59 - \uB204\uB77D \uC808\uB300 \uAE08\uC9C0]:
   - \uBA54\uB274\uD310 \uC774\uBBF8\uC9C0\uC5D0 \uBCF4\uC774\uB294 **\uBAA8\uB4E0 \uC694\uB9AC \uBC0F \uBA54\uB274 \uD56D\uBAA9(\uC804\uCC44 \uC694\uB9AC, \uBA54\uC778 \uC694\uB9AC, \uB2E8\uD488, \uC0AC\uC774\uB4DC, \uBC25/\uBA74\uB958, \uC218\uD504, \uC138\uD2B8 \uBA54\uB274, \uD1A0\uD551, \uB514\uC800\uD2B8, \uC74C\uB8CC \uBC0F \uC8FC\uB958 \uB4F1)**\uC744 \uB2E8 \uD558\uB098\uB3C4 \uBE60\uB728\uB9AC\uC9C0 \uB9D0\uACE0 100% \uC804\uBD80 \uD30C\uC2F1\uD558\uC5EC dishes \uBC30\uC5F4\uC5D0 \uB2F4\uC73C\uC138\uC694.
   - \uC77C\uBD80 \uB300\uD45C \uC694\uB9AC \uBA87 \uAC1C\uB9CC \uCD94\uB824\uC11C \uBC18\uD658\uD558\uC9C0 \uB9C8\uC2DC\uACE0, \uBA54\uB274\uD310\uC5D0 \uC801\uD78C \uBAA8\uB4E0 \uBA54\uB274 \uD56D\uBAA9 \uAC01\uAC01\uC744 \uB3C5\uB9BD\uB41C \uC694\uB9AC \uAC1D\uCCB4\uB85C \uC0DD\uC131\uD558\uC138\uC694.

2. [\uBAA8\uB4E0 \uBA54\uB274\uC5D0 \uB300\uD55C \uAD6C\uCCB4\uC801\uC774\uACE0 \uC0DD\uC0DD\uD55C \uC0C1\uC138 \uC124\uBA85(koreanDescription) \uD544\uC218 \uC791\uC131]:
   - \uBA54\uB274\uD310\uC5D0 \uC801\uD78C **\uBAA8\uB4E0 \uBA54\uB274 \uAC01\uAC01\uC5D0 \uB300\uD574** \uC808\uB300\uB85C \uC124\uBA85\uC744 \uC0DD\uB7B5\uD558\uAC70\uB098 \uBE44\uC6CC\uB450\uC9C0 \uB9C8\uC138\uC694.
   - \uBA54\uB274\uD310\uC5D0 \uC9E7\uC740 \uC694\uB9AC\uBA85\uB9CC \uC801\uD600 \uC788\uB354\uB77C\uB3C4, \uD574\uB2F9 \uC694\uB9AC\uAC00 \uC815\uD655\uD788 \uC5B4\uB5A4 \uC694\uB9AC\uC778\uC9C0, \uC5B4\uB5A4 \uC8FC\uC694 \uC2DD\uC7AC\uB8CC\uC640 \uC591\uB150/\uC18C\uC2A4\uAC00 \uB4E4\uC5B4\uAC00\uB294\uC9C0, \uB9DB\uC758 \uC870\uD654(\uB2E8\uB9DB, \uC9E0\uB9DB, \uACE0\uC18C\uD568, \uB9E4\uC6B4\uB9DB, \uAC10\uCE60\uB9DB, \uD5A5\uC2E0\uB8CC \uB4F1)\uC640 \uC2DD\uAC10\uC740 \uC5B4\uB5A4\uC9C0, \uC5B4\uB5BB\uAC8C \uC870\uB9AC\uB418\uC5B4 \uD604\uC9C0\uC5D0\uC11C \uC5B4\uB5BB\uAC8C \uBA39\uB294 \uC74C\uC2DD\uC778\uC9C0(\uC608: \uBC25\uACFC \uACC1\uB4E4\uC774\uB294\uC9C0, \uD2B9\uC815 \uC18C\uC2A4\uC5D0 \uCC0D\uC5B4 \uBA39\uB294\uC9C0, \uB530\uB73B\uD560 \uB54C \uBC14\uB85C \uBA39\uC5B4\uC57C \uD558\uB294\uC9C0)\uB97C \uCD5C\uC18C 2~4\uBB38\uC7A5\uC758 \uCE5C\uC808\uD558\uACE0 \uAD70\uCE68 \uB3C4\uB294 \uD55C\uAD6D\uC5B4\uB85C \uC815\uC131\uAECF \uC124\uBA85\uD558\uC138\uC694.
   - \uC74C\uB8CC\uB098 \uB514\uC800\uD2B8, \uC0AC\uC774\uB4DC \uBA54\uB274 \uC5ED\uC2DC \uB9DB\uACFC \uD48D\uBBF8, \uCCAD\uB7C9\uAC10 \uB4F1\uC744 \uAD6C\uCCB4\uC801\uC73C\uB85C \uC124\uBA85\uD558\uC138\uC694.

3. [\uD544\uC218 - \uC74C\uC2DD \uC774\uB984\uC758 \uC6D0\uC5B4 \uBC1C\uC74C\uC744 \uD55C\uAE00\uB85C \uC644\uBCBD \uD45C\uAE30]:
   - originalPronunciation: \uD55C\uAD6D\uC778\uC774 \uD604\uC9C0 \uC2DD\uB2F9\uC5D0\uC11C \uC9C1\uC6D0\uC5D0\uAC8C \uC18C\uB9AC \uB0B4\uC5B4 \uB9D0\uD558\uAC70\uB098 \uC77D\uC744 \uC218 \uC788\uB294 \uAC00\uC7A5 \uC815\uD655\uD558\uACE0 \uC790\uC5F0\uC2A4\uB7EC\uC6B4 '\uD55C\uAE00 \uBC1C\uC74C \uD45C\uAE30'.
   - \uC608\uC2DC: 
     * \uD0DC\uAD6D\uC5B4: '\u0E1C\u0E31\u0E14\u0E44\u0E17\u0E22\u0E01\u0E38\u0E49\u0E07' -> '\uD31F\uD0C0\uC774 \uAFCD', '\u0E15\u0E49\u0E21\u0E22\u0E33\u0E01\u0E38\u0E49\u0E07' -> '\uB620\uC58C\uAFCD', '\u0E1B\u0E39\u0E1C\u0E31\u0E14\u0E1C\u0E07\u0E01\u0E30\u0E2B\u0E23\u0E35\u0E48' -> '\uBFCC\uD31F\uD401\uCEE4\uB9AC'
     * \uC774\uD0C8\uB9AC\uC544\uC5B4: 'Spaghetti alla Carbonara' -> '\uC2A4\uD30C\uAC8C\uD2F0 \uC54C\uB77C \uCE74\uB974\uBCF4\uB098\uB77C'
     * \uC77C\uBCF8\uC5B4: '\u9C3B\u91CD' -> '\uC6B0\uB098\uC96C', '\u3068\u3093\u304B\u3064' -> '\uB3C8\uCE74\uCE20', '\u5929\u3077\u3089' -> '\uB374\uD478\uB77C'
     * \uD504\uB791\uC2A4\uC5B4: 'B\u0153uf Bourguignon' -> '\uBD48\uD504 \uBD80\uB974\uAE30\uB1FD', 'Croissant' -> '\uD06C\uB8E8\uC544\uC0C1'
     * \uBCA0\uD2B8\uB0A8\uC5B4: 'Ph\u1EDF B\xF2' -> '\uD37C\uBCF4', 'B\xE1nh M\xEC' -> '\uBC18\uBBF8'
     * \uC2A4\uD398\uC778\uC5B4: 'Paella de Mariscos' -> '\uD30C\uC5D0\uC57C \uB370 \uB9C8\uB9AC\uC2A4\uCF54\uC2A4'
     * \uC911\uAD6D\uC5B4: '\u9EBB\u5A46\u8C46\u8150' -> '\uB9C8\uD3EC\uB354\uC6B0\uD478'
   - \uC808\uB300 \uBE48\uCE78\uC73C\uB85C \uB450\uAC70\uB098 \uC601\uC5B4 \uC54C\uD30C\uBCB3\uC73C\uB85C \uC801\uC9C0 \uB9D0\uACE0 \uC21C\uC218 \uD55C\uAE00 \uC18C\uB9AC \uD45C\uAE30\uB85C \uC801\uC73C\uC138\uC694.

4. [\uD544\uC218 - \uD604\uC7AC \uD658\uC728 \uC801\uC6A9 \uBC0F \uC6D0\uD654(KRW) \uD658\uC0B0 \uAC00\uACA9 \uBCD1\uD589 \uD45C\uC2DC]:
   - \uD604\uC7AC \uAE30\uC900 \uD658\uC728 \uCC38\uACE0\uD45C:
     * 1 EUR(\uC720\uB85C) \u2248 1,485\uC6D0
     * 1 USD(\uBBF8\uAD6D \uB2EC\uB7EC) \u2248 1,380\uC6D0
     * 1 JPY(\uC77C\uBCF8 \uC5D4) \u2248 9.3\uC6D0 (100\uC5D4 \u2248 930\uC6D0)
     * 1 THB(\uD0DC\uAD6D \uBC14\uD2B8) \u2248 39\uC6D0
     * 1 VND(\uBCA0\uD2B8\uB0A8 \uB3D9) \u2248 0.055\uC6D0 (10,000\uB3D9 \u2248 550\uC6D0)
     * 1 CNY(\uC911\uAD6D \uC704\uC548) \u2248 192\uC6D0
     * 1 GBP(\uC601\uAD6D \uD30C\uC6B4\uB4DC) \u2248 1,780\uC6D0
     * 1 TWD(\uB300\uB9CC \uB2EC\uB7EC) \u2248 43\uC6D0
     * 1 HKD(\uD64D\uCF69 \uB2EC\uB7EC) \u2248 177\uC6D0
     * 1 SGD(\uC2F1\uAC00\uD3EC\uB974 \uB2EC\uB7EC) \u2248 1,040\uC6D0
     * 1 AUD(\uD638\uC8FC \uB2EC\uB7EC) \u2248 910\uC6D0
     * 1 CHF(\uC2A4\uC704\uC2A4 \uD504\uB791) \u2248 1,580\uC6D0
     * 1 PHP(\uD544\uB9AC\uD540 \uD398\uC18C) \u2248 24.5\uC6D0
     * 1 MYR(\uB9D0\uB808\uC774\uC2DC\uC544 \uB9C1\uAE43) \u2248 310\uC6D0
   - priceOriginal: \uBA54\uB274\uD310 \uC6D0\uBCF8 \uAC00\uACA9 \uD45C\uAE30 (\uC608: '180 \u0E3F', '\u20AC14.50', '\xA51,200', '$18.00', '65,000 \u20AB')
   - priceKRW: \uC704 \uD604\uC7AC \uD658\uC728\uC744 \uACF1\uD574 \uC0B0\uCD9C\uD55C \uC815\uC218 \uB2E8\uC704\uC758 \uC815\uD655\uD55C \uD55C\uD654(KRW) \uAC00\uACA9 (\uC608: \u20AC14.50 -> 21500, 180 \u0E3F -> 7020, \xA51,200 -> 11160)
   - restaurant.exchangeRateToKRW: \uD574\uB2F9 \uD654\uD3D0 1\uB2E8\uC704\uB2F9 \uC6D0\uD654 \uD658\uC728 (\uC608: EUR -> 1485, USD -> 1380, JPY -> 9.3, THB -> 39, VND -> 0.055)

5. \uAC01 \uC694\uB9AC\uBCC4 \uC0C1\uC138 \uC815\uBCF4:
   - category: \uCE74\uD14C\uACE0\uB9AC (\uC608: \uC804\uCC44 \uC694\uB9AC, \uBA54\uC778 \uC694\uB9AC, \uD30C\uC2A4\uD0C0/\uBA74\uB958, \uBC25\uB958, \uC218\uD504, \uB514\uC800\uD2B8, \uC74C\uB8CC \uB4F1)
   - originalName: \uBA54\uB274\uD310\uC5D0 \uC801\uD78C \uC6D0\uC5B4 \uADF8\uB300\uB85C\uC758 \uC694\uB9AC \uC774\uB984
   - koreanName: \uD55C\uAD6D\uC778\uC774 \uC9C1\uAD00\uC801\uC73C\uB85C \uC774\uD574\uD560 \uC218 \uC788\uB294 \uBA85\uD655\uD558\uACE0 \uB9DB\uAE54\uC2A4\uB7EC\uC6B4 \uD55C\uAD6D\uC5B4 \uBC88\uC5ED \uC694\uB9AC\uBA85
   - koreanDescription: \uBAA8\uB4E0 \uBA54\uB274\uB9C8\uB2E4 \uB9DB(\uB2E8\uB9DB, \uC9E0\uB9DB, \uACE0\uC18C\uD568 \uB4F1), \uC2DD\uAC10, \uC870\uB9AC\uBC95, \uD2B9\uC9D5, \uD3EC\uC158 \uD06C\uAE30, \uC5B4\uB5BB\uAC8C \uBA39\uC73C\uBA74 \uB9DB\uC788\uB294\uC9C0 \uB4F1\uC744 2~4\uBB38\uC7A5\uC73C\uB85C \uCE5C\uC808\uD558\uACE0 \uC0DD\uC0DD\uD558\uAC8C \uC124\uBA85
   - ingredients: \uC8FC\uC694 \uC7AC\uB8CC \uBAA9\uB85D (\uD55C\uAD6D\uC5B4 \uBC30\uC5F4, \uC608: ['\uC0C8\uC6B0', '\uC300\uAD6D\uC218', '\uD0C0\uB9C8\uB9B0\uB4DC \uC18C\uC2A4', '\uC219\uC8FC'])
   - dietaryTags: \uC54C\uB808\uB974\uAE30 \uBC0F \uC2DD\uC774 \uD0DC\uADF8 (\uC608: ['\uD574\uC0B0\uBB3C \uD3EC\uD568 \u{1F990}', '\uACAC\uACFC\uB958 \uD3EC\uD568 \u{1F95C}', '\uB9E4\uC6B4\uB9DB \u{1F336}\uFE0F', '\uCC44\uC2DD \uAC00\uB2A5 \u{1F33F}', '\uB3FC\uC9C0\uACE0\uAE30 \u{1F969}', '\uB2EC\uAC40 \uD3EC\uD568 \u{1F95A}'])
   - spiceLevel: 0 (\uC548 \uB9E4\uC6C0) ~ 3 (\uB9E4\uC6B0 \uB9E4\uC6C0)
   - orderPhrase: \uD604\uC9C0 \uC9C1\uC6D0\uC5D0\uAC8C \uBCF4\uC5EC\uC8FC\uAC70\uB098 \uB9D0\uD560 \uB54C \uBC14\uB85C \uC4F8 \uC218 \uC788\uB294 \uD604\uC9C0\uC5B4 \uC8FC\uBB38 \uBB38\uC7A5\uACFC \uD55C\uAE00 \uBC1C\uC74C (\uC608: "\u0E02\u0E2D \u0E1C\u0E31\u0E14\u0E44\u0E17\u0E22\u0E01\u0E38\u0E49\u0E07 1 \u0E17\u0E35\u0E48 \u0E04\u0E23\u0E31\u0E1A/\u0E04\u0E48\u0E30 (\uCEE4 \uD31F\uD0C0\uC774 \uAFCD \uB2A5 \uD2F0 \uCE85/\uCE74)")
   - visualPrompt: \uC774 \uC74C\uC2DD\uC758 \uC2E4\uC81C \uBA39\uC74C\uC9C1\uC2A4\uB7EC\uC6B4 \uB300\uD45C \uC0AC\uC9C4\uC744 \uACE0\uD654\uC9C8\uB85C \uBB18\uC0AC\uD558\uB294 \uC601\uC5B4 \uD504\uB86C\uD504\uD2B8
   - recommendedDrink: \uC774 \uC694\uB9AC\uC640 \uAC00\uC7A5 \uC798 \uC5B4\uC6B8\uB9AC\uB294 \uCD94\uCC9C \uC74C\uB8CC/\uC8FC\uB958 (\uD55C\uAD6D\uC5B4)
   - tasteProfile: sweetness (1-5), saltiness (1-5), spiciness (1-5), richness (1-5), acidity (1-5)

\uD55C\uAD6D\uC5B4\uB85C \uC815\uC911\uD558\uACE0 \uC815\uD655\uD558\uAC8C \uC791\uC131\uD558\uC138\uC694.
`;
    const userPrompt = `\uC774 \uBA54\uB274\uD310 \uC0AC\uC9C4\uC5D0 \uC778\uC1C4\uB41C \uBAA8\uB4E0 \uBA54\uB274(\uC694\uB9AC, \uC2DD\uC0AC, \uC0AC\uC774\uB4DC, \uC74C\uB8CC \uB4F1)\uB97C \uD558\uB098\uB3C4 \uBE60\uC9D0\uC5C6\uC774 \uC804\uC218 \uCD94\uCD9C\uD574 \uC8FC\uC138\uC694. \uAC01 \uBA54\uB274\uB9C8\uB2E4 \uC6D0\uC5B4 \uC774\uB984, [\uD55C\uAE00 \uBC1C\uC74C(originalPronunciation)], \uD55C\uAD6D\uC5B4 \uBC88\uC5ED\uBA85, [\uBAA8\uB4E0 \uBA54\uB274\uC5D0 \uB300\uD55C 2~4\uBB38\uC7A5\uC758 \uC0DD\uC0DD\uD558\uACE0 \uCE5C\uC808\uD55C \uC0C1\uC138 \uC124\uBA85(koreanDescription)], \uC8FC\uC694 \uC7AC\uB8CC, \uC2DD\uC774/\uC54C\uB808\uB974\uAE30 \uC815\uBCF4, [\uC6D0\uC5B4 \uAC00\uACA9(priceOriginal) \uBC0F \uD604\uC7AC \uD658\uC728 \uC801\uC6A9 \uC6D0\uD654 \uAC00\uACA9(priceKRW)], \uC8FC\uBB38 \uBB38\uC7A5, \uB300\uD45C \uBE44\uC8FC\uC5BC \uD504\uB86C\uD504\uD2B8\uB97C \uC791\uC131\uD574 \uC8FC\uC138\uC694.`;
    const requestConfig = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType
              }
            },
            {
              text: userPrompt
            }
          ]
        }
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
                name: { type: Type.STRING, description: "\uC2DD\uB2F9 \uC774\uB984 \uB610\uB294 \uBA54\uB274\uD310 \uD5E4\uB354" },
                cuisineType: { type: Type.STRING, description: "\uC694\uB9AC \uC7A5\uB974 (\uC608: \uC815\uD1B5 \uC774\uD0C8\uB9AC\uC548, \uD0DC\uAD6D \uB85C\uCEEC, \uB3C4\uCFC4 \uC2A4\uC2DC \uB4F1)" },
                sourceLanguage: { type: Type.STRING, description: "\uBA54\uB274\uD310 \uC6D0\uBCF8 \uC5B8\uC5B4\uBA85 (\uC608: \uC774\uD0C8\uB9AC\uC544\uC5B4, \uD0DC\uAD6D\uC5B4, \uC77C\uBCF8\uC5B4, \uD504\uB791\uC2A4\uC5B4 \uB4F1)" },
                languageCode: { type: Type.STRING, description: "\uC5B8\uC5B4 \uCF54\uB4DC (\uC608: it-IT, th-TH, ja-JP, fr-FR, es-ES, vi-VN, en-US, zh-CN \uB4F1)" },
                currencyCode: { type: Type.STRING, description: "\uD654\uD3D0 \uCF54\uB4DC (\uC608: EUR, THB, JPY, USD, VND \uB4F1)" },
                currencySymbol: { type: Type.STRING, description: "\uD654\uD3D0 \uAE30\uD638 (\uC608: \u20AC, \u0E3F, \xA5, $, \u20AB \uB4F1)" },
                exchangeRateToKRW: { type: Type.NUMBER, description: "\uD574\uB2F9 \uD654\uD3D0 1\uB2E8\uC704\uB2F9 \uD604\uC7AC \uD55C\uD654(KRW) \uD658\uC728" },
                country: { type: Type.STRING, description: "\uCD94\uC815 \uAD6D\uAC00/\uC9C0\uC5ED" },
                summary: { type: Type.STRING, description: "\uBA54\uB274\uD310 \uC804\uBC18\uC758 \uD2B9\uC9D5\uACFC \uCD94\uCC9C \uC0AC\uD56D \uC694\uC57D" }
              },
              required: ["name", "cuisineType", "sourceLanguage", "currencyCode", "currencySymbol", "exchangeRateToKRW", "summary"]
            },
            categories: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "\uCD94\uCD9C\uB41C \uBA54\uB274 \uCE74\uD14C\uACE0\uB9AC \uBAA9\uB85D"
            },
            dishes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "\uACE0\uC720 ID (\uC608: dish-1)" },
                  category: { type: Type.STRING, description: "\uC18C\uC18D \uCE74\uD14C\uACE0\uB9AC" },
                  originalName: { type: Type.STRING, description: "\uBA54\uB274\uD310 \uC6D0\uC5B4 \uC694\uB9AC\uBA85" },
                  originalPronunciation: { type: Type.STRING, description: "\uD55C\uAD6D\uC778\uC774 \uC77D\uC744 \uC218 \uC788\uB294 \uC815\uD655\uD55C \uD55C\uAE00 \uBC1C\uC74C \uD45C\uAE30" },
                  koreanName: { type: Type.STRING, description: "\uD55C\uAD6D\uC5B4 \uBC88\uC5ED/\uC774\uD574 \uC694\uB9AC\uBA85" },
                  koreanDescription: { type: Type.STRING, description: "\uB9DB\uACFC \uD2B9\uC9D5\uC5D0 \uB300\uD55C \uC0C1\uC138 \uD55C\uAE00 \uC124\uBA85" },
                  ingredients: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "\uC8FC\uC694 \uC2DD\uC7AC\uB8CC \uBAA9\uB85D"
                  },
                  dietaryTags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "\uC2DD\uC774 \uBC0F \uC54C\uB808\uB974\uAE30 \uD0DC\uADF8"
                  },
                  spiceLevel: { type: Type.INTEGER, description: "\uB9E4\uC6B4\uB9DB \uC815\uB3C4 (0~3)" },
                  priceOriginal: { type: Type.STRING, description: "\uC6D0\uBCF8 \uAC00\uACA9 \uD45C\uAE30 (\uC608: 180 \u0E3F, \u20AC12.50)" },
                  priceKRW: { type: Type.NUMBER, description: "\uD604\uC7AC \uD658\uC728 \uC801\uC6A9 \uD55C\uD654(KRW) \uD658\uC0B0 \uAC00\uACA9 (\uC815\uC218)" },
                  orderPhrase: { type: Type.STRING, description: "\uD604\uC9C0 \uC8FC\uBB38\uC6A9 \uBB38\uC7A5\uACFC \uD55C\uAE00 \uBC1C\uC74C" },
                  visualPrompt: { type: Type.STRING, description: "\uC74C\uC2DD \uC2E4\uC0AC \uC774\uBBF8\uC9C0 \uC0DD\uC131\uC744 \uC704\uD55C \uACE0\uD488\uC9C8 \uC601\uC5B4 \uD504\uB86C\uD504\uD2B8" },
                  recommendedDrink: { type: Type.STRING, description: "\uC5B4\uC6B8\uB9AC\uB294 \uCD94\uCC9C \uC74C\uB8CC" },
                  tasteProfile: {
                    type: Type.OBJECT,
                    properties: {
                      sweetness: { type: Type.INTEGER },
                      saltiness: { type: Type.INTEGER },
                      spiciness: { type: Type.INTEGER },
                      richness: { type: Type.INTEGER },
                      acidity: { type: Type.INTEGER }
                    }
                  }
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
                  "visualPrompt"
                ]
              }
            }
          },
          required: ["restaurant", "categories", "dishes"]
        }
      }
    };
    let textOutput = "";
    let modelUsed = "";
    if (isOpenAI) {
      const openAiKey = customApiKey || process.env.OPENAI_API_KEY;
      if (!openAiKey) {
        return res.status(400).json({
          error: "OpenAI API Key\uAC00 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uAD00\uB9AC\uC790 \uC124\uC815(\uC6B0\uCE21 \uC0C1\uB2E8 \uD1B1\uB2C8\uBC14\uD034 \uC544\uC774\uCF58)\uC5D0\uC11C OpenAI API Key\uB97C \uB4F1\uB85D\uD574 \uC8FC\uC138\uC694."
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
      const modelsToUse = customModel ? [customModel, ...CANDIDATE_MODELS.filter((m) => m !== customModel)] : CANDIDATE_MODELS;
      const geminiResult = await generateContentWithRetryAndFallback(ai, requestConfig, modelsToUse);
      textOutput = geminiResult.text;
      modelUsed = geminiResult.modelUsed;
    }
    let parsedData;
    try {
      parsedData = parseOrRepairJSON(textOutput);
    } catch (parseErr) {
      console.error("JSON parsing error:", parseErr, "Raw output:", textOutput);
      throw new Error("\uBA54\uB274 \uB370\uC774\uD130 \uD615\uC2DD\uC744 \uBCC0\uD658\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uC0AC\uC9C4\uC774 \uD750\uB9AC\uAC70\uB098 \uC778\uC2DD\uC774 \uC5B4\uB824\uC6B8 \uC218 \uC788\uC73C\uB2C8 \uC120\uBA85\uD55C \uC0AC\uC9C4\uC73C\uB85C \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.");
    }
    const currencyCode = (parsedData.restaurant?.currencyCode || "").toUpperCase();
    let currentRate = parsedData.restaurant?.exchangeRateToKRW;
    if (!currentRate || currentRate <= 0) {
      currentRate = STANDARD_EXCHANGE_RATES[currencyCode] || 1;
      if (parsedData.restaurant) {
        parsedData.restaurant.exchangeRateToKRW = currentRate;
      }
    }
    if (parsedData.dishes && Array.isArray(parsedData.dishes)) {
      await Promise.all(
        parsedData.dishes.map(async (dish, index) => {
          if (!dish.id) dish.id = `dish-${index + 1}`;
          if (!dish.originalPronunciation || dish.originalPronunciation.trim() === "") {
            dish.originalPronunciation = dish.koreanName || dish.originalName;
          }
          if (!dish.priceKRW || dish.priceKRW <= 0) {
            const numMatch = dish.priceOriginal?.match(/[\d,]+(\.\d+)?/);
            if (numMatch) {
              const rawNum = parseFloat(numMatch[0].replace(/,/g, ""));
              if (!isNaN(rawNum) && rawNum > 0) {
                dish.priceKRW = Math.round(rawNum * currentRate);
              }
            }
          }
          if (dish.priceOriginal && !isNaN(Number(dish.priceOriginal.trim()))) {
            const sym = parsedData.restaurant?.currencySymbol || parsedData.restaurant?.currencyCode || "";
            dish.priceOriginal = `${sym} ${dish.priceOriginal}`.trim();
          }
          if (!dish.koreanDescription || dish.koreanDescription.trim().length < 15) {
            const ingText = dish.ingredients && dish.ingredients.length > 0 ? `\uC8FC\uC694 \uC2DD\uC7AC\uB8CC\uC778 ${dish.ingredients.slice(0, 3).join(", ")}\uC758 \uAE4A\uC740 \uD48D\uBBF8\uB97C \uC0B4\uB824 \uC870\uB9AC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.` : "\uD604\uC9C0 \uACE0\uC720\uC758 \uC870\uB9AC\uBC95\uC73C\uB85C \uC2DD\uC7AC\uB8CC\uC758 \uAC10\uCE60\uB9DB\uACFC \uD48D\uBBF8\uB97C \uADE0\uD615\uAC10 \uC788\uAC8C \uB2F4\uC544\uB0C8\uC2B5\uB2C8\uB2E4.";
            dish.koreanDescription = `${dish.koreanName || dish.originalName}\uC740(\uB294) \uD604\uC9C0 \uC2DD\uB2F9\uC5D0\uC11C \uC0AC\uB791\uBC1B\uB294 \uB300\uD45C\uC801\uC778 \uBA54\uB274\uC785\uB2C8\uB2E4. ${ingText} \uAE30\uD638\uC5D0 \uB9DE\uCDB0 \uC18C\uC2A4\uB098 \uACC1\uB4E4\uC784 \uBA54\uB274\uC640 \uD568\uAED8 \uC990\uAE30\uC2DC\uBA74 \uB354\uC6B1 \uB9DB\uC788\uC2B5\uB2C8\uB2E4.`;
          }
          if (!dish.imageUrl || dish.imageUrl.trim() === "") {
            try {
              const matchedImg = await findRepresentativeFoodImage(
                dish.originalName || "",
                dish.koreanName || "",
                dish.category || "",
                index
              );
              dish.imageUrl = matchedImg || "";
            } catch (imgErr) {
              console.warn(`[Image Finder Warning] Could not find image for ${dish.koreanName}:`, imgErr);
              dish.imageUrl = "";
            }
          }
        })
      );
    }
    return res.json({
      success: true,
      data: parsedData,
      modelUsed
    });
  } catch (error) {
    console.error("Error analyzing menu:", error);
    const msg = error?.message || "\uBA54\uB274\uD310\uC744 \uBD84\uC11D\uD558\uB294 \uB3C4\uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uC0AC\uC9C4\uC744 \uB2E4\uC2DC \uC62C\uB824\uC8FC\uC138\uC694.";
    const isApiKeyError = msg.includes("GEMINI_API_KEY") || msg.includes("OPENAI_API_KEY") || msg.includes("API Key") || msg.includes("API_KEY_INVALID") || msg.includes("API key not valid");
    const isHighDemand = msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand") || msg.includes("Resource has been exhausted") || msg.includes("429");
    let statusCode = 500;
    let userFriendlyMsg = msg;
    if (isApiKeyError) {
      statusCode = 400;
      userFriendlyMsg = msg.includes("Vercel") ? msg : `${msg} (Vercel \uD658\uACBD\uBCC0\uC218\uC5D0 GEMINI_API_KEY\uB97C \uCD94\uAC00\uD558\uAC70\uB098 \uC6F9\uD654\uBA74 \uC6B0\uCE21 \uC0C1\uB2E8 '\uAD00\uB9AC\uC790 \uC124\uC815\u2699\uFE0F'\uC5D0\uC11C \uC9C1\uC811 \uC785\uB825\uD574 \uC8FC\uC138\uC694.)`;
    } else if (isHighDemand) {
      statusCode = 503;
      userFriendlyMsg = "\uD604\uC7AC AI \uBAA8\uB378 \uC11C\uBC84\uAC00 \uC77C\uC2DC\uC801\uC73C\uB85C \uB9E4\uC6B0 \uD63C\uC7A1\uD569\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC2DC\uAC70\uB098, \uC6B0\uCE21 \uC0C1\uB2E8 \uAD00\uB9AC\uC790 \uC124\uC815(\u2699\uFE0F)\uC5D0\uC11C \uB2E4\uB978 \uBAA8\uB378(gemini-3.1-flash-lite \uB610\uB294 OpenAI)\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.";
    }
    return res.status(statusCode).json({
      success: false,
      error: userFriendlyMsg
    });
  }
});
app.get(["/api/search-food-image", "/search-food-image"], async (req, res) => {
  try {
    const originalName = req.query.original || "";
    const koreanName = req.query.ko || req.query.q || "";
    const category = req.query.cat || "";
    const imageUrl = await findRepresentativeFoodImage(originalName, koreanName, category, 0);
    return res.json({ success: true, imageUrl });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
app.post(["/api/admin/verify-key", "/admin/verify-key"], async (req, res) => {
  try {
    const { apiKey, model, provider } = req.body;
    const testKey = apiKey?.trim() || req.headers["x-llm-api-key"] || req.headers["x-openai-api-key"] || req.headers["x-gemini-api-key"];
    const isExplicitOpenAI = provider === "openai" || model?.startsWith("gpt-") || model?.startsWith("o1") || model?.startsWith("o3") || testKey?.startsWith("sk-");
    if (!testKey) {
      return res.status(400).json({
        success: false,
        error: isExplicitOpenAI ? "\uD14C\uC2A4\uD2B8\uD560 OpenAI API Key\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694." : "\uD14C\uC2A4\uD2B8\uD560 Gemini API Key\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694."
      });
    }
    if (isExplicitOpenAI) {
      const targetModel2 = model || "gpt-4o-mini";
      console.log(`[OpenAI Admin Test] Testing API Key with model '${targetModel2}'...`);
      const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testKey}`
        },
        body: JSON.stringify({
          model: targetModel2,
          messages: [{ role: "user", content: "Reply 'OK' in 1 word." }],
          max_tokens: 5
        })
      });
      if (!openAiRes.ok) {
        const errJson = await openAiRes.json().catch(() => ({}));
        const msg = errJson.error?.message || `OpenAI API \uC778\uC99D \uC624\uB958 (HTTP ${openAiRes.status})`;
        return res.status(401).json({
          success: false,
          error: msg
        });
      }
      const openAiData = await openAiRes.json();
      return res.json({
        success: true,
        message: `OpenAI \uC778\uC99D \uC131\uACF5! (${targetModel2} \uC815\uC0C1 \uC751\uB2F5)`,
        reply: openAiData.choices?.[0]?.message?.content?.trim() || "OK"
      });
    }
    const testAi = new GoogleGenAI({
      apiKey: testKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    const targetModel = model || "gemini-3.1-flash-lite";
    console.log(`[Admin Test] Testing API Key with model '${targetModel}'...`);
    const response = await testAi.models.generateContent({
      model: targetModel,
      contents: "Confirm API key works. Reply in 5 words or less."
    });
    return res.json({
      success: true,
      message: `Gemini \uC778\uC99D \uC131\uACF5! (${targetModel} \uC815\uC0C1 \uC751\uB2F5)`,
      reply: response.text?.trim()
    });
  } catch (err) {
    console.error("[Admin Test Error]:", err);
    return res.status(401).json({
      success: false,
      error: err.message || "API Key\uAC00 \uC720\uD6A8\uD558\uC9C0 \uC54A\uAC70\uB098 \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."
    });
  }
});
app.post(["/api/generate-food-image", "/generate-food-image"], async (req, res) => {
  try {
    const { visualPrompt, koreanName, originalName } = req.body;
    if (!visualPrompt && !koreanName) {
      return res.status(400).json({ error: "Missing prompt or dish name." });
    }
    const customApiKey = req.headers["x-gemini-api-key"] || req.body.customApiKey;
    const ai = getGeminiClient(customApiKey);
    const fullPrompt = visualPrompt ? `Professional culinary food photography: ${visualPrompt}, mouth-watering, appetizing plating, Michelin star presentation, natural warm lighting, macro detail, 4k sharp focus, high-end restaurant table.` : `Professional culinary food photography of authentic ${originalName || koreanName}, delicious food presentation, close-up, appetizing, warm studio lighting, 4k resolution`;
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: {
        parts: [{ text: fullPrompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "4:3"
        }
      }
    });
    let imageUrl = null;
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
  } catch (error) {
    console.error("Error generating food image:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate food image."
    });
  }
});
app.post(["/api/tts", "/tts"], async (req, res) => {
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
            prebuiltVoiceConfig: { voiceName: "Kore" }
          }
        }
      }
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({ success: true, audioBase64: base64Audio, mimeType: "audio/pcm" });
    }
    return res.json({ success: false, message: "No audio generated" });
  } catch (error) {
    console.error("Error in TTS endpoint:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u{1F680} Server running on http://0.0.0.0:${PORT}`);
  });
}
var api_default = app;

// server.ts
if (!process.env.VERCEL) {
  startServer();
}
var server_default = api_default;
export {
  server_default as default
};
