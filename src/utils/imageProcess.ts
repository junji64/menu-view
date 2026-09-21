/**
 * Utility for processing and optimizing uploaded menu images
 * Scales down overly large phone photos (e.g. 12MP+) to optimal ~1600px width/height
 * to ensure lightning-fast upload, high text legibility, and no payload limit issues.
 */
export async function optimizeImageFile(file: File, maxDimension: number = 1800, quality: number = 0.88): Promise<{
  base64: string;
  mimeType: string;
  fileName: string;
  fileSizeKB: number;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));

    reader.onload = (e) => {
      const result = e.target?.result;
      if (!result || typeof result !== 'string') {
        return reject(new Error('이미지 데이터를 읽을 수 없습니다.'));
      }

      const img = new Image();
      img.onerror = () => reject(new Error('유효한 이미지 형식이 아닙니다.'));
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // If image is already within reasonable bounds, return as is or compress slightly
        if (width <= maxDimension && height <= maxDimension && file.size < 1.5 * 1024 * 1024) {
          const sizeKB = Math.round(file.size / 1024);
          resolve({
            base64: result,
            mimeType: file.type || 'image/jpeg',
            fileName: file.name,
            fileSizeKB: sizeKB,
          });
          return;
        }

        // Calculate scaled dimensions while preserving aspect ratio
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          // Fallback to original
          resolve({
            base64: result,
            mimeType: file.type || 'image/jpeg',
            fileName: file.name,
            fileSizeKB: Math.round(file.size / 1024),
          });
          return;
        }

        // High quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const targetMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const compressedBase64 = canvas.toDataURL(targetMime, quality);
        const approxSizeKB = Math.round((compressedBase64.length * 3) / 4 / 1024);

        resolve({
          base64: compressedBase64,
          mimeType: targetMime,
          fileName: file.name,
          fileSizeKB: approxSizeKB,
        });
      };

      img.src = result;
    };

    reader.readAsDataURL(file);
  });
}
