import { Module } from '@nestjs/common';
import { GcsStorageService } from './gcs-storage.service';
import { GcsStorageController } from './gcs-storage.controller';

@Module({
    controllers: [GcsStorageController],
    providers: [GcsStorageService],
    exports: [GcsStorageService],
})
export class GcsStorageModule { }
