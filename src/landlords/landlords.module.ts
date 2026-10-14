import { Module } from '@nestjs/common';
import { LandlordsController } from './landlords.controller.js';
import { LandlordsService } from './landlords.service.js';

@Module({
  controllers: [LandlordsController],
  providers: [LandlordsService]
})
export class LandlordsModule {}
