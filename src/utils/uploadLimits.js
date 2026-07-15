export const ARTWORK_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
export const ARTWORK_UPLOAD_ACCEPT = "image/png,image/jpeg,image/webp,application/pdf";

export function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${Math.ceil(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getArtworkUploadError(file) {
  if (!file) return "";

  if (file.size > ARTWORK_UPLOAD_MAX_BYTES) {
    return `File is too large. Maximum upload size is ${formatFileSize(ARTWORK_UPLOAD_MAX_BYTES)}.`;
  }

  return "";
}
