import { Injectable, Logger } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { envs } from 'src/config';
import * as path from 'path';

@Injectable()
export class GcsStorageService {
    private readonly logger = new Logger(GcsStorageService.name);
    private readonly storage: Storage;
    private readonly bucketName: string;

    constructor() {
        this.storage = new Storage({
            projectId: envs.gcsProjectId,
            keyFilename: path.resolve(envs.gcsKeyFile),
        });
        this.bucketName = envs.gcsBucketName;
    }

    /**
     * Sube un archivo a Google Cloud Storage
     * @param fileBuffer - Buffer del archivo
     * @param fileName - Nombre del archivo
     * @param folder - Carpeta dentro del bucket (ej: 'proyecto-archivos')
     * @param mimeType - Tipo MIME del archivo
     * @returns Path del archivo en GCS
     */
    async uploadFile(
        fileBuffer: Buffer,
        fileName: string,
        folder: string,
        mimeType: string,
    ): Promise<string> {
        const bucket = this.storage.bucket(this.bucketName);
        const filePath = `${folder}/${Date.now()}-${fileName}`;
        const file = bucket.file(filePath);

        await file.save(fileBuffer, {
            metadata: {
                contentType: mimeType,
            },
        });

        this.logger.log(`File uploaded successfully: ${filePath}`);
        return filePath;
    }

    /**
     * Sube un archivo desde base64 a Google Cloud Storage
     * @param base64Data - Datos del archivo en base64
     * @param fileName - Nombre del archivo
     * @param folder - Carpeta dentro del bucket
     * @param mimeType - Tipo MIME del archivo
     * @returns Path del archivo en GCS
     */
    async uploadFileFromBase64(
        base64Data: string,
        fileName: string,
        folder: string,
        mimeType: string,
    ): Promise<string> {
        const fileBuffer = Buffer.from(base64Data, 'base64');
        return this.uploadFile(fileBuffer, fileName, folder, mimeType);
    }

    /**
     * Genera una URL firmada para acceder a un archivo
     * @param filePath - Path del archivo en GCS
     * @param expirationMinutes - Minutos de expiración (default: 60)
     * @returns URL firmada
     */
    async getSignedUrl(
        filePath: string,
        expirationMinutes: number = 60,
    ): Promise<string> {
        const bucket = this.storage.bucket(this.bucketName);
        const file = bucket.file(filePath);

        const [url] = await file.getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + expirationMinutes * 60 * 1000,
        });

        return url;
    }

    /**
     * Elimina un archivo de Google Cloud Storage
     * @param filePath - Path del archivo en GCS
     */
    async deleteFile(filePath: string): Promise<void> {
        const bucket = this.storage.bucket(this.bucketName);
        const file = bucket.file(filePath);

        try {
            await file.delete();
            this.logger.log(`File deleted successfully: ${filePath}`);
        } catch (error) {
            this.logger.error(`Error deleting file: ${filePath}`, error);
            throw error;
        }
    }

    /**
     * Verifica si un archivo existe en GCS
     * @param filePath - Path del archivo en GCS
     * @returns true si existe, false si no
     */
    async fileExists(filePath: string): Promise<boolean> {
        const bucket = this.storage.bucket(this.bucketName);
        const file = bucket.file(filePath);
        const [exists] = await file.exists();
        return exists;
    }
}
