import { supabase } from "@/integrations/supabase/client";

export type TenantAssetKind = "profile" | "gallery" | "brand";

export async function uploadTenantAsset(tenantId: string, kind: TenantAssetKind, file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Images must be smaller than 10 MB.");
  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "webp";
  const path = `${tenantId}/${kind}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("tenant-assets").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw new Error(error.message);
  return supabase.storage.from("tenant-assets").getPublicUrl(path).data.publicUrl;
}
