import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './entities/unit.entity.js';
import { CreateUnitDto } from './dto/create-unit.dto.js';
import { UpdateUnitDto } from './dto/update-unit.dto.js';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitsRepository: Repository<Unit>,
  ) {}

  async create(dto: CreateUnitDto): Promise<Unit> {
    const unit = this.unitsRepository.create(dto);
    return this.unitsRepository.save(unit);
  }

  async findAll(): Promise<Unit[]> {
    return this.unitsRepository.find({
      relations: ['property', 'property.landlord'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Unit> {
    const unit = await this.unitsRepository.findOne({
      where: { id },
      relations: ['property', 'property.landlord'],
    });
    if (!unit) {
      throw new NotFoundException(`Unit ${id} not found`);
    }
    return unit;
  }

  async findByProperty(propertyId: string): Promise<Unit[]> {
    return this.unitsRepository.find({
      where: { propertyId },
      order: { unitNumber: 'ASC' },
    });
  }

  async update(id: string, dto: UpdateUnitDto): Promise<Unit> {
    const unit = await this.findOne(id);
    Object.assign(unit, dto);
    return this.unitsRepository.save(unit);
  }

  async remove(id: string): Promise<void> {
    const unit = await this.findOne(id);
    await this.unitsRepository.remove(unit);
  }
}
