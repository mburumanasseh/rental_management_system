import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { LandlordsService } from './landlords.service.js';
import { CreateLandlordDto } from './dto/create-landlord.dto.js';
import { UpdateLandlordDto } from './dto/update-landlord.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../common/enums/role.enum.js';

@Controller('landlords')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LandlordsController {
  constructor(private readonly landlordsService: LandlordsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.LANDLORD)
  create(@Body() dto: CreateLandlordDto) {
    return this.landlordsService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.AGENT)
  findAll() {
    return this.landlordsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.landlordsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.LANDLORD)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLandlordDto,
  ) {
    return this.landlordsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.landlordsService.remove(id);
  }
}
