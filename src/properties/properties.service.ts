import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './entities/property.entity.js';
import { CreatePropertyDto } from './dto/create-property.dto.js';
import { UpdatePropertyDto } from './dto/update-property.dto.js';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private readonly propertiesRepository: Repository<Property>,
  ) {}

  async create(dto: CreatePropertyDto): Promise<Property> {
    const property = this.propertiesRepository.create(dto);
    return this.propertiesRepository.save(property);
  }

  async findAll(): Promise<Property[]> {
    return this.propertiesRepository.find({
      relations: ['landlord', 'landlord.user', 'units'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Property> {
    const property = await this.propertiesRepository.findOne({
      where: { id },
      relations: ['landlord', 'landlord.user', 'units'],
    });
    if (!property) {
      throw new NotFoundException(`Property ${id} not found`);
    }
    return property;
  }

  async findByLandlord(landlordId: string): Promise<Property[]> {
    return this.propertiesRepository.find({
      where: { landlordId },
      relations: ['units'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, dto: UpdatePropertyDto): Promise<Property> {
    const property = await this.findOne(id);
    Object.assign(property, dto);
    return this.propertiesRepository.save(property);
  }

  async remove(id: string): Promise<void> {
    const property = await this.findOne(id);
    await this.propertiesRepository.remove(property);
  }
}
