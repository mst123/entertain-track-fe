import ePub from "epubjs";

export interface EpubMeta {
  title: string;
  description: string;
  coverBlob: Blob | null;
  coverExt: string;
}

function guessExt(mime: string, fallback = "jpg") {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("gif")) return "gif";
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  return fallback;
}

/** 从本地 EPUB 文件解析书名、简介、封面 */
export async function extractEpubMeta(file: File | Blob): Promise<EpubMeta> {
  const buffer = await file.arrayBuffer();
  const book = ePub(buffer);
  try {
    await book.ready;
    const meta = book.packaging?.metadata || {};
    const title = String(meta.title || "").trim();
    const description = String(meta.description || "").trim();

    let coverBlob: Blob | null = null;
    let coverExt = "jpg";
    const coverUrl = await book.coverUrl();
    if (coverUrl) {
      const res = await fetch(coverUrl);
      if (res.ok) {
        coverBlob = await res.blob();
        coverExt = guessExt(coverBlob.type);
      }
    }

    return { title, description, coverBlob, coverExt };
  } finally {
    book.destroy?.();
  }
}

/** 把封面 Blob 上传到文件服务，返回 longurl */
export async function uploadCoverBlob(
  blob: Blob,
  fileName: string
): Promise<string> {
  const form = new FormData();
  form.append("file", blob, fileName);
  const res = await fetch("/api/files", { method: "POST", body: form });
  if (!res.ok) {
    throw new Error(`封面上传失败: ${res.status}`);
  }
  const data = await res.json();
  if (!data?.longurl) {
    throw new Error("封面上传未返回地址");
  }
  return data.longurl as string;
}
