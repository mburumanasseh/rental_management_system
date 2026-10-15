import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditService } from './audit.service.js';
import { AuditController } from './audit.controller.js';
import { AuditLog } from './entities/audit-log.entity.js';
import { AuditInterceptor } from './interceptors/audit.interceptor.js';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  controllers: [AuditController],
  providers: [AuditService, AuditInterceptor],
  exports: [AuditService, AuditInterceptor],
})
export class AuditModule {}
