import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GcsStorageService } from './gcs-storage.service';

interface UploadFilePayload {
    base64Data: string;
    fileName: string;
    folder: string;
    mimeType: string;
}

interface GetSignedUrlPayload {
    filePath: string;
    expirationMinutes?: number;
}

interface DeleteFilePayload {
    filePath: string;
}

@Controller()
export class GcsStorageController {
    constructor(private readonly gcsStorageService: GcsStorageService) { }

    @MessagePattern('gcsStorage.uploadFile')
    async uploadFile(@Payload() payload: UploadFilePayload) {
        const { base64Data, fileName, folder, mimeType } = payload;
        const filePath = await this.gcsStorageService.uploadFileFromBase64(
            base64Data,
            fileName,
            folder,
            mimeType,
        );
        return { filePath };
    }

    @MessagePattern('gcsStorage.getSignedUrl')
    async getSignedUrl(@Payload() payload: GetSignedUrlPayload) {
        const { filePath, expirationMinutes } = payload;
        const signedUrl = await this.gcsStorageService.getSignedUrl(
            filePath,
            expirationMinutes,
        );
        return { signedUrl };
    }

    @MessagePattern('gcsStorage.deleteFile')
    async deleteFile(@Payload() payload: DeleteFilePayload) {
        const { filePath } = payload;
        await this.gcsStorageService.deleteFile(filePath);
        return { deleted: true };
    }
}
