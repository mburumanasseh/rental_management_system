import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity.js';
import { Role } from '../common/enums/role.enum.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(data: {
    email: string;
    password: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    role?: Role;
  }): Promise<User> {
    const existing = await this.usersRepository.findOne({
      where: { email: data.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = this.usersRepository.create({
      email: data.email.toLowerCase(),
      passwordHash,
      phone: data.phone ?? null,
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      role: data.role ?? Role.TENANT,
    });

    return this.usersRepository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    const refreshTokenHash = refreshToken
      ? await bcrypt.hash(refreshToken, 12)
      : null;
    await this.usersRepository.update(userId, { refreshTokenHash });
  }

  async validateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user?.refreshTokenHash) return false;
    return bcrypt.compare(refreshToken, user.refreshTokenHash);
  }
}
