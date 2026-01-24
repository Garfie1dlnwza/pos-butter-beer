import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

// Create S3 client for MinIO
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT ?? "http://localhost:9000",
  region: process.env.S3_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? "minioadmin",
    secretAccessKey: process.env.S3_SECRET_KEY ?? "minioadmin",
  },
  forcePathStyle: true, // Required for MinIO
});

const BUCKET = process.env.S3_BUCKET ?? "pos-butter-beer";

/**
 * Upload a file to S3/MinIO
 */
export async function uploadFile(
  file: Buffer,
  key: string,
  contentType: string,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: file,
    ContentType: contentType,
    ACL: "public-read",
  });

  await s3Client.send(command);

  return getPublicUrl(key);
}

/**
 * Delete a file from S3/MinIO
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(key: string): string {
  const endpoint = process.env.S3_ENDPOINT ?? "http://localhost:9000";
  return `${endpoint}/${BUCKET}/${key}`;
}

/**
 * Extract key from public URL
 */
export function extractKeyFromUrl(url: string): string | null {
  try {
    const endpoint = process.env.S3_ENDPOINT ?? "http://localhost:9000";
    if (url.startsWith(endpoint)) {
      // Format: http://localhost:9000/bucket/key
      const path = url.slice(endpoint.length + 1); // Remove endpoint + /
      const parts = path.split("/");
      // Remove bucket name, keep the rest as key
      return parts.slice(1).join("/");
    }
    return null;
  } catch {
    return null;
  }
}

export { s3Client, BUCKET };
