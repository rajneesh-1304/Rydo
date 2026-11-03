export interface UploadResponse {
  success: boolean;
  url: string;
  public_id?: string;
  provider?: "cloudinary" | "local_preview";
  message?: string;
}

export async function uploadImage(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Upload failed with status ${res.status}`);
  }

  const data: UploadResponse = await res.json();
  return data;
}

export default uploadImage;
