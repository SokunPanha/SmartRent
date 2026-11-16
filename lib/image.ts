/**
 * Shrinks a photo before upload: phone camera shots are often 3–8 MB, while an
 * ID card stays perfectly legible at ~1600px. Re-encodes as JPEG (which also
 * drops EXIF such as GPS location). If the browser can't decode the file
 * (e.g. HEIC outside Safari), the original is returned and the server decides.
 */
export async function downscaleImage(
  file: File,
  maxDim = 1600,
  quality = 0.85
): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    return file;
  }

  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality)
  );
  return blob ?? file;
}
