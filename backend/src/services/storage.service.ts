import { createClient, SupabaseClient } from '@supabase/supabase-js';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { ENV } from '../config/env';

export class StorageService {
  private supabase: SupabaseClient | null = null;
  private bucketName: string;

  constructor() {
    this.bucketName = ENV.SUPABASE_STORAGE_BUCKET;
    if (ENV.SUPABASE_URL && ENV.SUPABASE_KEY) {
      this.supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_KEY, {
        auth: { persistSession: false },
      });
      this.initBucket();
    }
  }

  /**
   * Ensure bucket exists and is public
   */
  private async initBucket() {
    if (!this.supabase) return;
    try {
      const { data: buckets } = await this.supabase.storage.listBuckets();
      const exists = buckets?.some((b) => b.name === this.bucketName);
      if (!exists) {
        await this.supabase.storage.createBucket(this.bucketName, {
          public: true,
          fileSizeLimit: 5 * 1024 * 1024, // 5MB limit
        });
        console.log(`[StorageService] Created public Supabase bucket: ${this.bucketName}`);
      }
    } catch (err) {
      console.warn('[StorageService] Could not initialize bucket:', err instanceof Error ? err.message : err);
    }
  }

  /**
   * Upload image file buffer to Supabase Storage.
   * Falls back to local disk storage if Supabase key is unconfigured.
   */
  async uploadImage(fileBuffer: Buffer, originalName: string, mimeType: string): Promise<string> {
    const ext = path.extname(originalName).toLowerCase() || '.jpg';
    const uniqueFileName = `thought_${Date.now()}_${crypto.randomBytes(8).toString('hex')}${ext}`;

    // 1. If Supabase is configured, upload to Supabase Storage
    if (this.supabase) {
      try {
        const { error } = await this.supabase.storage
          .from(this.bucketName)
          .upload(uniqueFileName, fileBuffer, {
            contentType: mimeType,
            upsert: false,
          });

        if (error) {
          console.error('[StorageService] Supabase upload failed:', error.message);
          throw new Error(`Failed to upload to Supabase storage: ${error.message}`);
        }

        const { data } = this.supabase.storage.from(this.bucketName).getPublicUrl(uniqueFileName);
        console.log(`[StorageService] Image stored in Supabase: ${data.publicUrl}`);
        return data.publicUrl;
      } catch (err) {
        console.error('[StorageService] Exception uploading to Supabase:', err);
        throw err;
      }
    }

    // In serverless environments, local disk is read-only.
    // If Supabase is not available, write to /tmp or throw an informative error.
    try {
      const uploadDir = process.env.VERCEL ? '/tmp/uploads' : path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, uniqueFileName);
      await fs.promises.writeFile(filePath, fileBuffer);
      return `/uploads/${uniqueFileName}`;
    } catch (fsErr) {
      console.error('[StorageService] Local disk write failed:', fsErr);
      throw new Error('Image storage service is not configured. Please ensure SUPABASE_SERVICE_ROLE_KEY is set in Vercel.');
    }
  }
}

export const storageService = new StorageService();
