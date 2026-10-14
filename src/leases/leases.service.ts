import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lease, LeaseStatus } from './entities/lease.entity.js';
import { CreateLeaseDto } from './dto/create-lease.dto.js';
import { UpdateLeaseDto } from './dto/update-lease.dto.js';
import { TerminateLeaseDto } from './dto/terminate-lease.dto.js';
import { Unit, UnitStatus } from '../units/entities/unit.entity.js';

@Injectable()
export class LeasesService {
  constructor(
    @InjectRepository(Lease)
    private readonly leasesRepository: Repository<Lease>,
    @InjectRepository(Unit)
    private readonly unitsRepository: Repository<Unit>,
  ) {}

  async create(dto: CreateLeaseDto): Promise<Lease> {
    if (new Date(dto.endDate) <= new Date(dto.startDate)) {
      throw new BadRequestException('endDate must be after startDate');
    }

    const unit = await this.unitsRepository.findOne({
      where: { id: dto.unitId },
    });
    if (!unit) {
      throw new NotFoundException(`Unit ${dto.unitId} not found`);
    }

    // Prevent overlapping active leases on the same unit
    const overlapping = await this.leasesRepository
      .createQueryBuilder('lease')
      .where('lease.unitId = :unitId', { unitId: dto.unitId })
      .andWhere('lease.status IN (:...statuses)', {
        statuses: [LeaseStatus.ACTIVE, LeaseStatus.DRAFT],
      })
      .andWhere('lease.startDate <= :endDate', { endDate: dto.endDate })
      .andWhere('lease.endDate >= :startDate', { startDate: dto.startDate })
      .getOne();

    if (overlapping) {
      throw new ConflictException(
        'An active or draft lease already exists for this unit in the given period',
      );
    }

    const lease = this.leasesRepository.create({
      ...dto,
      depositAmount: dto.depositAmount ?? 0,
      paymentDayOfMonth: dto.paymentDayOfMonth ?? 1,
      status: dto.status ?? LeaseStatus.DRAFT,
    });

    return this.leasesRepository.save(lease);
  }

  async findAll(filters?: {
    unitId?: string;
    tenantId?: string;
    status?: LeaseStatus;
  }): Promise<Lease[]> {
    const qb = this.leasesRepository
      .createQueryBuilder('lease')
      .leftJoinAndSelect('lease.unit', 'unit')
      .leftJoinAndSelect('unit.property', 'property')
      .leftJoinAndSelect('lease.tenant', 'tenant')
      .leftJoinAndSelect('tenant.user', 'user')
      .orderBy('lease.createdAt', 'DESC');

    if (filters?.unitId) {
      qb.andWhere('lease.unitId = :unitId', { unitId: filters.unitId });
    }
    if (filters?.tenantId) {
      qb.andWhere('lease.tenantId = :tenantId', { tenantId: filters.tenantId });
    }
    if (filters?.status) {
      qb.andWhere('lease.status = :status', { status: filters.status });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<Lease> {
    const lease = await this.leasesRepository.findOne({
      where: { id },
      relations: ['unit', 'unit.property', 'tenant', 'tenant.user'],
    });
    if (!lease) {
      throw new NotFoundException(`Lease ${id} not found`);
    }
    return lease;
  }

  async update(id: string, dto: UpdateLeaseDto): Promise<Lease> {
    const lease = await this.findOne(id);

    if (lease.status === LeaseStatus.TERMINATED) {
      throw new BadRequestException('Cannot update a terminated lease');
    }

    if (dto.startDate && dto.endDate && new Date(dto.endDate) <= new Date(dto.startDate)) {
      throw new BadRequestException('endDate must be after startDate');
    }

    Object.assign(lease, dto);
    return this.leasesRepository.save(lease);
  }

  async activate(id: string): Promise<Lease> {
    const lease = await this.findOne(id);

    if (lease.status !== LeaseStatus.DRAFT) {
      throw new BadRequestException('Only draft leases can be activated');
    }

    // Mark unit as occupied
    await this.unitsRepository.update(lease.unitId, {
      status: UnitStatus.OCCUPIED,
    });

    lease.status = LeaseStatus.ACTIVE;
    return this.leasesRepository.save(lease);
  }

  async terminate(id: string, dto: TerminateLeaseDto): Promise<Lease> {
    const lease = await this.findOne(id);

    if (lease.status === LeaseStatus.TERMINATED) {
      throw new BadRequestException('Lease is already terminated');
    }

    lease.status = LeaseStatus.TERMINATED;
    lease.terminatedAt = new Date();
    lease.terminationReason = dto.reason ?? null;

    // Free the unit
    await this.unitsRepository.update(lease.unitId, {
      status: UnitStatus.VACANT,
    });

    return this.leasesRepository.save(lease);
  }

  async remove(id: string): Promise<void> {
    const lease = await this.findOne(id);
    if (lease.status === LeaseStatus.ACTIVE) {
      throw new BadRequestException(
        'Cannot delete an active lease. Terminate it first.',
      );
    }
    await this.leasesRepository.remove(lease);
  }
}
