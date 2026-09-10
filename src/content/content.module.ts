import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { LocalDiskStorageService } from './local-disk-storage.service';
import { StorageService } from './storage.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [ContentController],
  // Swap LocalDiskStorageService here for a durable provider (Cloudinary/S3) in prod.
  providers: [ContentService, { provide: StorageService, useClass: LocalDiskStorageService }],
})
export class ContentModule {}
