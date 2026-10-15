import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from './entities/audit-log.entity.js';

export interface CreateAuditLogInput {
  userId?: string | null;
  userEmail?: string | null;
  action: AuditAction;
  resource: string;
  resourceId?: string | null;
  description?: string | null;
  oldValues?: Record<string, any> | null;
  newValues?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  async log(input: CreateAuditLogInput): Promise<AuditLog> {
    const entry = this.auditRepository.create({
      userId: input.userId ?? null,
      userEmail: input.userEmail ?? null,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId ?? null,
      description: input.description ?? null,
      oldValues: input.oldValues ?? null,
      newValues: input.newValues ?? null,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    });
    return this.auditRepository.save(entry);
  }

  async findAll(filters?: {
    userId?: string;
    resource?: string;
    action?: AuditAction;
    limit?: number;
  }): Promise<AuditLog[]> {
    const qb = this.auditRepository
      .createQueryBuilder('log')
      .orderBy('log.createdAt', 'DESC')
      .take(filters?.limit ?? 100);

    if (filters?.userId) {
      qb.andWhere('log.userId = :userId', { userId: filters.userId });
    }
    if (filters?.resource) {
      qb.andWhere('log.resource = :resource', { resource: filters.resource });
    }
    if (filters?.action) {
      qb.andWhere('log.action = :action', { action: filters.action });
    }
    return qb.getMany();
  }

  async findOne(id: string): Promise<AuditLog | null> {
    return this.auditRepository.findOne({ where: { id } });
  }
}
