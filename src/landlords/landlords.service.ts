import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Landlord } from './entities/landlord.entity.js';
import { CreateLandlordDto } from './dto/create-landlord.dto.js';
import { UpdateLandlordDto } from './dto/update-landlord.dto.js';

@Injectable()
export class LandlordsService {
  constructor(
    @InjectRepository(Landlord)
    private readonly landlordsRepository: Repository<Landlord>,
  ) {}

  async create(dto: CreateLandlordDto): Promise<Landlord> {
    const existing = await this.landlordsRepository.findOne({
      where: { userId: dto.userId },
    });
    if (existing) {
      throw new ConflictException('Landlord profile already exists for this user');
    }

    const landlord = this.landlordsRepository.create(dto);
    return this.landlordsRepository.save(landlord);
  }

  async findAll(): Promise<Landlord[]> {
    return this.landlordsRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Landlord> {
    const landlord = await this.landlordsRepository.findOne({
      where: { id },
      relations: ['user', 'properties'],
    });
    if (!landlord) {
      throw new NotFoundException(`Landlord ${id} not found`);
    }
    return landlord;
  }

  async findByUserId(userId: string): Promise<Landlord | null> {
    return this.landlordsRepository.findOne({
      where: { userId },
      relations: ['user', 'properties'],
    });
  }

  async update(id: string, dto: UpdateLandlordDto): Promise<Landlord> {
    const landlord = await this.findOne(id);
    Object.assign(landlord, dto);
    return this.landlordsRepository.save(landlord);
  }

  async remove(id: string): Promise<void> {
    const landlord = await this.findOne(id);
    await this.landlordsRepository.remove(landlord);
  }
}
