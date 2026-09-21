/**
 * High-quality culinary image finder and representative web image matcher.
 * Automatically searches Wikipedia/Wikimedia Commons and pairs with an authentic curated food photo directory.
 */

// Curated high-resolution culinary photography library for distinct dishes
export const CULINARY_PHOTO_DATABASE: Record<string, string> = {
  // Thai & Southeast Asian (Original Native + Romanized)
  'ผัดไทย': 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80',
  'pad thai': 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80',
  '팟타이': 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80',
  'ต้มยำ': 'https://images.unsplash.com/photo-1548946526-f69e2424cf45?auto=format&fit=crop&w=800&q=80',
  'tom yum': 'https://images.unsplash.com/photo-1548946526-f69e2424cf45?auto=format&fit=crop&w=800&q=80',
  '똠얌': 'https://images.unsplash.com/photo-1548946526-f69e2424cf45?auto=format&fit=crop&w=800&q=80',
  'แกง': 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80',
  'curry': 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80',
  '커리': 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80',
  '카레': 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80',
  'ส้มตำ': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
  'som tum': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
  '쏨땀': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
  'phở': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
  'pho': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
  '쌀국수': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
  'gỏi cuốn': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
  'spring roll': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
  '스프링롤': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
  'bánh mì': 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=800&q=80',
  'banh mi': 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=800&q=80',
  '반미': 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=800&q=80',

  // Italian & European (Original Native)
  'carbonara': 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80',
  '까르보나라': 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80',
  'pasta': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
  'spaghetti': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
  'bolognese': 'https://images.unsplash.com/photo-1621996346565-e3d5d628198f?auto=format&fit=crop&w=800&q=80',
  'ragù': 'https://images.unsplash.com/photo-1621996346565-e3d5d628198f?auto=format&fit=crop&w=800&q=80',
  'pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  'margherita': 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
  'risotto': 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80',
  'tiramisù': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
  'tiramisu': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
  'croissant': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
  'bistecca': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  'steak': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  'paella': 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=800&q=80',
  '빠에야': 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=800&q=80',
  'tapas': 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',

  // Japanese (Original Kanji / Kana)
  '寿司': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
  '鮨': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
  'すし': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
  'sushi': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
  '刺身': 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=800&q=80',
  'さしみ': 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=800&q=80',
  'sashimi': 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=800&q=80',
  'ラーメン': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
  'らーめん': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
  '拉麺': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
  'ramen': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
  'うどん': 'https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?auto=format&fit=crop&w=800&q=80',
  '饂飩': 'https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?auto=format&fit=crop&w=800&q=80',
  'udon': 'https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?auto=format&fit=crop&w=800&q=80',
  '天ぷら': 'https://images.unsplash.com/photo-1615361200141-f45040f367be?auto=format&fit=crop&w=800&q=80',
  '天婦羅': 'https://images.unsplash.com/photo-1615361200141-f45040f367be?auto=format&fit=crop&w=800&q=80',
  'tempura': 'https://images.unsplash.com/photo-1615361200141-f45040f367be?auto=format&fit=crop&w=800&q=80',
  '鰻': 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80',
  'うなぎ': 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80',
  'うな重': 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80',
  'unagi': 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80',
  '丼': 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
  'とんかつ': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80',
  '豚カツ': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80',
  'tonkatsu': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80',
  '焼き鳥': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
  'やきとり': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
  'yakitori': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
  'そば': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  '蕎麦': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  'soba': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',

  // Chinese & Asian (Original Hanzi)
  '点心': 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=800&q=80',
  'dim sum': 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=800&q=80',
  '饺子': 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80',
  'dumpling': 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80',
  'gyoza': 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80',
  '北京烤鸭': 'https://images.unsplash.com/photo-1514944298352-78d128df61cb?auto=format&fit=crop&w=800&q=80',
  'peking duck': 'https://images.unsplash.com/photo-1514944298352-78d128df61cb?auto=format&fit=crop&w=800&q=80',
  '炒饭': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
  'fried rice': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
  '麻婆豆腐': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  'mapo tofu': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  '小笼包': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
  'xiaolongbao': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
  '火锅': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
  'hot pot': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',

  // Western & Global
  'burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  'hamburger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  'taco': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
  'tacos': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
  'salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  'insalata': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  'soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
  'zuppa': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
  'seafood': 'https://images.unsplash.com/photo-1539136788836-5699e78bfc75?auto=format&fit=crop&w=800&q=80',
  'frutti di mare': 'https://images.unsplash.com/photo-1539136788836-5699e78bfc75?auto=format&fit=crop&w=800&q=80',
  'gamberi': 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80',
  'shrimp': 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80',
  'prawn': 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80',
  'pesce': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
  'fish': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
  'pollo': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
  'chicken': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
  'maiale': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  'pork': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',

  // Desserts & Beverages (Native Original)
  'dessert': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
  'dolce': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
  'caffè': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
  'coffee': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
  'espresso': 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=800&q=80',
  'thé': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
  'tea': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
  'birra': 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=800&q=80',
  'cerveza': 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=800&q=80',
  'beer': 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=800&q=80',
  'vino': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
  'wine': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
  'vin': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
};

// Array of diverse appetizing culinary photos to guarantee varied fallbacks
const DIVERSE_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=800&q=80',
];

/**
 * Clean search query specifically prioritizing the original menu dish name.
 * Strips pricing, numbers, extra symbols, and isolates the native dish name or romanized version.
 */
export function extractCleanSearchQuery(originalName: string, koreanName: string): string {
  if (!originalName || originalName.trim() === '') {
    return koreanName ? koreanName.replace(/[^\w\s가-힣]/gi, ' ').trim() : '';
  }

  // 1. If originalName contains parentheses, check if native or romanized name is inside
  const parenMatch = originalName.match(/\(([^)]+)\)/);
  const withoutParen = originalName.replace(/\([^)]+\)/g, '').trim();

  // Prefer the primary portion outside parentheses if non-empty, otherwise parenthesis content
  const candidate = withoutParen.length >= 2 ? withoutParen : (parenMatch ? parenMatch[1] : originalName);

  // Strip obvious noise: prices (e.g., 180B, €12, $15, 12000), numbers, bullet points, asterisks
  const cleaned = candidate
    .replace(/\b\d+([.,]\d+)?\s*(฿|€|\$|¥|원|₩|krw|thb|eur|usd|yen|vnd)?\b/gi, '')
    .replace(/[#*•·\-_/\\:;"'~!?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length >= 2) {
    return cleaned;
  }

  return originalName.trim();
}

/**
 * Detect language code or Wikipedia sub-domain prefix from original name characters.
 */
function detectWikiLang(text: string): string {
  // Japanese: Hiragana / Katakana / Kanji
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja';
  // Thai script
  if (/[\u0E00-\u0E7F]/.test(text)) return 'th';
  // Chinese characters without Japanese kana
  if (/[\u4E00-\u9FFF]/.test(text)) return 'zh';
  // Vietnamese specific accents
  if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text)) return 'vi';
  // Cyrillic
  if (/[\u0400-\u04FF]/.test(text)) return 'ru';
  // Default to English/International
  return 'en';
}

/**
 * Search Wikipedia REST API for lead food photo using native/original language title.
 */
async function searchWikipediaImage(searchTerm: string, lang = 'en'): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2400);

    const formattedTitle = encodeURIComponent(searchTerm.trim().replace(/\s+/g, '_'));
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${formattedTitle}`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'TravelMenuLens/1.0 (culinary-assistant@example.com)',
        Accept: 'application/json',
      },
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
    // Network or abort error
  }
  return null;
}

/**
 * Search Wikimedia Commons API using the original menu dish name.
 */
async function searchWikimediaCommons(query: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2400);

    const clean = query.replace(/[^\w\s\u0E00-\u0E7F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF가-힣]/gi, ' ').trim();
    if (!clean) return null;

    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      clean + ' food'
    )}&gsrlimit=1&prop=pageimages&pithumbsize=800&format=json&origin=*`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.query && data.query.pages) {
        const pages = Object.values(data.query.pages) as any[];
        if (pages.length > 0 && pages[0].thumbnail?.source) {
          return pages[0].thumbnail.source;
        }
      }
    }
  } catch {
    // Silent fallback
  }
  return null;
}

/**
 * Match against our curated culinary photo database using fuzzy keywords.
 */
export function matchCuratedPhoto(text: string): string | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const [key, url] of Object.entries(CULINARY_PHOTO_DATABASE)) {
    if (lower.includes(key.toLowerCase())) {
      return url;
    }
  }
  return null;
}

/**
 * Primary function to locate a representative food image for a dish.
 * ALWAYS prioritizes the original language name (메뉴 원어) for authentic culinary image discovery.
 */
export async function findRepresentativeFoodImage(
  originalName: string,
  koreanName: string,
  category: string = '',
  index: number = 0
): Promise<string> {
  // 1. Clean and isolate the original menu name
  const originalQuery = extractCleanSearchQuery(originalName, '');
  const nativeLang = detectWikiLang(originalName || '');

  // 2. Search Wikipedia in native language using originalName
  if (originalQuery && originalQuery.length >= 2) {
    // Native Wikipedia search (e.g. ja.wikipedia for Japanese, th.wikipedia for Thai, en.wikipedia for English)
    if (nativeLang !== 'en') {
      const nativeWikiImg = await searchWikipediaImage(originalQuery, nativeLang);
      if (nativeWikiImg) return nativeWikiImg;
    }

    // English / Global Wikipedia search with original term
    const enWikiImg = await searchWikipediaImage(originalQuery, 'en');
    if (enWikiImg) return enWikiImg;

    // Wikimedia Commons search with original menu name
    const commonsImg = await searchWikimediaCommons(originalQuery);
    if (commonsImg) return commonsImg;
  }

  // 3. Match against curated culinary database using original name first
  const curatedOriginalMatch = matchCuratedPhoto(originalName) || (originalQuery ? matchCuratedPhoto(originalQuery) : null);
  if (curatedOriginalMatch) {
    return curatedOriginalMatch;
  }

  // 4. Secondary fallback: check Korean name and category only if specific match exists
  if (koreanName && koreanName.trim()) {
    const korWikiImg = await searchWikipediaImage(koreanName.trim(), 'ko');
    if (korWikiImg) return korWikiImg;

    const curatedKorMatch = matchCuratedPhoto(koreanName);
    if (curatedKorMatch) return curatedKorMatch;
  }

  // 5. If no authentic or appropriate food image was found, return empty string ("")
  // User explicitly requested: "적절한 요리 이미지가 없다면 이미지 없는 항목으로 해도 좋아."
  return '';
}

/**
 * Optional helper if the user specifically requests a generic culinary placeholder.
 */
export function getRandomFoodFallbackImage(seed: string = '', index: number = 0): string {
  const hash = Math.abs(
    seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  );
  const fallbackIndex = (hash + index) % DIVERSE_FALLBACK_IMAGES.length;
  return DIVERSE_FALLBACK_IMAGES[fallbackIndex];
}
