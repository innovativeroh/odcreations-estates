import { Response } from "express";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, R2_BUCKET, R2_PUBLIC_URL } from "../config/r2";
import { AuthRequest } from "../middleware/auth";
import crypto from "crypto";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

// Returns a presigned PUT URL — client uploads directly to R2
export async function getUploadUrl(req: AuthRequest, res: Response): Promise<void> {
  const { filename, contentType, folder = "properties" } = req.body as {
    filename: string;
    contentType: string;
    folder?: string;
  };

  if (!ALLOWED_TYPES.includes(contentType)) {
    res.status(400).json({ error: "File type not allowed" });
    return;
  }

  const ext = path.extname(filename);
  const key = `${folder}/${crypto.randomUUID()}${ext}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 });
  const publicUrl = `${R2_PUBLIC_URL}/${key}`;

  res.json({ uploadUrl, publicUrl, key });
}

export async function deleteFile(req: AuthRequest, res: Response): Promise<void> {
  const { key } = req.body as { key: string };
  if (!key) {
    res.status(400).json({ error: "Key required" });
    return;
  }

  await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
  res.json({ message: "Deleted" });
}
