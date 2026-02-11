import { env } from "@/env";

/**
 
Construct full URL for file storage
@param path - Key or path of the file (e.g., "products/image.png")
@returns Full URL (e.g., "https://domain.com/bucket/products/image.png")*/
export function getFileUrl(path: string | null | undefined): string {
  if (!path) return "/images/placeholder.png";

  // If path is already a full URL, return it (backward compatibility)
  if (path.startsWith("http")) return path;

  // Use configured public domain or fallback
  // Use configured public domain or fallback
  const domain = env.NEXT_PUBLIC_S3_DOMAIN ?? "http://localhost:9000/";
  const bucket = env.NEXT_PUBLIC_S3_BUCKET ?? "pos-butter-beer";

  // Ensure no double slashes between domain and bucket
  const cleanDomain = domain.replace(/\/+$/, "");

  // Clean path (remove leading slash)
  const cleanPath = path.replace(/^\/+/, "");

  // In production (Docker), localhost:9000 is not reachable by Next.js server.
  // We must use the internal service name 'minio'.
  // We only replace if the domain is literally localhost, avoiding accidental replacements of real domains.
  let finalDomain = cleanDomain;
  if (
    process.env.NODE_ENV === "production" &&
    finalDomain.includes("localhost")
  ) {
    finalDomain = finalDomain.replace("localhost", "minio");
  }

  return `${finalDomain}/${bucket}/${cleanPath}`;
}