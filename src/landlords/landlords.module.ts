import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LandlordsService } from './landlords.service.js';
import { LandlordsController } from './landlords.controller.js';
import { Landlord } from './entities/landlord.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Landlord])],
  controllers: [LandlordsController],
  providers: [LandlordsService],
  exports: [LandlordsService],
})
export class LandlordsModule {}
