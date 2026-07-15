import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";
import { db, pool } from "@/db";

export const uploadedImageIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function ensureUploadedImagesTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS uploaded_images (
      id VARCHAR(36) PRIMARY KEY,
      file_name TEXT NOT NULL,
      mime_type VARCHAR(100) NOT NULL,
      data BYTEA NOT NULL,
      size_bytes INTEGER NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

export async function saveUploadedImage(file: File) {
  await ensureUploadedImagesTable();

  const id = randomUUID();
  const buffer = Buffer.from(await file.arrayBuffer());

  await pool.query(
    `
      INSERT INTO uploaded_images (id, file_name, mime_type, data, size_bytes)
      VALUES ($1, $2, $3, $4, $5)
    `,
    [id, file.name || "image", file.type, buffer, file.size],
  );

  return id;
}

export async function getUploadedImage(id: string) {
  if (!uploadedImageIdPattern.test(id)) {
    return null;
  }

  await ensureUploadedImagesTable();

  const result = await pool.query<{
    data: Buffer;
    mime_type: string;
    size_bytes: number;
  }>(
    `
      SELECT data, mime_type, size_bytes
      FROM uploaded_images
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  return result.rows[0] ?? null;
}
