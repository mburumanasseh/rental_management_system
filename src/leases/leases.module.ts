import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeasesService } from './leases.service.js';
import { LeasesController } from './leases.controller.js';
import { Lease } from './entities/lease.entity.js';
import { Unit } from '../units/entities/unit.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Lease, Unit])],
  controllers: [LeasesController],
  providers: [LeasesService],
  exports: [LeasesService],
})
export class LeasesModule {}
