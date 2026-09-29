import { supabase } from "@/integrations/supabase/client";

/** Downscales an image in the browser so uploads stay small (phone photos are often 5+ MB). */
export async function downscaleImage(file: File, maxSize = 1600, quality = 0.82): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  return blob && blob.size < file.size ? blob : file;
}

/** Uploads an image to the public `site-media` bucket (admins only) and returns its public URL. */
export async function uploadSiteMedia(file: File, folder: "projects" | "team"): Promise<string> {
  const blob = await downscaleImage(file);
  const ext = blob.type === "image/jpeg" ? "jpg" : file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from("site-media")
    .upload(path, blob, { contentType: blob.type || file.type, upsert: false });
  if (error) throw error;

  return supabase.storage.from("site-media").getPublicUrl(path).data.publicUrl;
}

/** Downloads rows as a CSV file (Excel-friendly, UTF-8 with BOM). */
export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) => {
    const s = value === null || value === undefined ? "" : String(value);
    // Neutralise spreadsheet formula injection (but leave phone numbers like +256... alone).
    const risky = /^[=@\t\r]/.test(s) || (/^[+-]/.test(s) && !/^[+-][\d\s()-]*$/.test(s));
    const safe = risky ? `'${s}` : s;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}
