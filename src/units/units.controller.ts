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
  Query,
} from '@nestjs/common';
import { UnitsService } from './units.service.js';
import { CreateUnitDto } from './dto/create-unit.dto.js';
import { UpdateUnitDto } from './dto/update-unit.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../common/enums/role.enum.js';

@Controller('units')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT)
  create(@Body() dto: CreateUnitDto) {
    return this.unitsService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT, Role.TENANT)
  findAll(@Query('propertyId') propertyId?: string) {
    if (propertyId) {
      return this.unitsService.findByProperty(propertyId);
    }
    return this.unitsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT, Role.TENANT)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.unitsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUnitDto,
  ) {
    return this.unitsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.LANDLORD)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.unitsService.remove(id);
  }
}
