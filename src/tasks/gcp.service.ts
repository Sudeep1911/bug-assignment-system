import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GcpService {
  private storage: Storage;
  private bucketName: string;

  constructor() {
    // Instantiate the Storage client.
    // Ensure GOOGLE_APPLICATION_CREDENTIALS environment variable is set.
    this.storage = new Storage();
    // Replace with your actual GCP bucket name.
    this.bucketName = 'bug-tracket-pro-attachment';
  }

  /**
   * Uploads a file buffer to Google Cloud Storage.
   * @param file The file object from Express.
   * @returns The public URL of the uploaded file.
   */
  async uploadFile(file: any): Promise<any> {
    const filename = `${uuidv4()}-${file.originalname}`;
    const fileRef = this.storage.bucket(this.bucketName).file(filename);

    try {
      await fileRef.save(file.buffer, {
        resumable: false,
        metadata: {
          contentType: file.mimetype,
        },
      });

      // Return the file path and name to be stored in the database
      return {
        filePath: filename,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
      };
    } catch (error) {
      console.error('Failed to upload file to GCS:', error);
      throw new HttpException(
        'Failed to upload file.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Extracts the filename from a Google Cloud Storage URL.
   * @param url The public URL of the file.
   * @returns The filename string.
   */
  private getFilenameFromUrl(url: string): string | null {
    try {
      const urlObject = new URL(url);
      return urlObject.pathname.split('/').pop() || null;
    } catch (error) {
      return null;
    }
  }
  /**
   * Deletes a file from Google Cloud Storage.
   * @param url The public URL of the file to delete.
   */
  async deleteFile(url: string): Promise<void> {
    try {
      const filename = url.split('/').pop();
      if (!filename) {
        throw new Error('Invalid file URL.');
      }
      const fileRef = this.storage.bucket(this.bucketName).file(filename);
      await fileRef.delete();
    } catch (error) {
      console.error('Failed to delete file from GCS:', error);
      throw new InternalServerErrorException('Failed to delete file.');
    }
  }
  async getSignedUrl(filePath: string): Promise<string> {
    const fileRef = this.storage.bucket(this.bucketName).file(filePath);

    // Configure the URL to be a V4 signed URL for a 'read' action
    const options = {
      version: 'v4' as const, // Use 'v4' for better security
      action: 'read' as const,
      expires: Date.now() + 15 * 60 * 1000, // URL expires in 15 minutes (in milliseconds)
    };

    try {
      const [url] = await fileRef.getSignedUrl(options);
      return url;
    } catch (error) {
      console.error('Failed to get signed URL:', error);
      throw new InternalServerErrorException('Failed to generate signed URL.');
    }
  }
}
