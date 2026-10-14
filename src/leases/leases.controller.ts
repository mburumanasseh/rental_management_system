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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LeasesService } from './leases.service.js';
import { CreateLeaseDto } from './dto/create-lease.dto.js';
import { UpdateLeaseDto } from './dto/update-lease.dto.js';
import { TerminateLeaseDto } from './dto/terminate-lease.dto.js';
import { LeaseStatus } from './entities/lease.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../common/enums/role.enum.js';

@Controller('leases')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeasesController {
  constructor(private readonly leasesService: LeasesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT)
  create(@Body() dto: CreateLeaseDto) {
    return this.leasesService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT, Role.TENANT)
  findAll(
    @Query('unitId') unitId?: string,
    @Query('tenantId') tenantId?: string,
    @Query('status') status?: LeaseStatus,
  ) {
    return this.leasesService.findAll({ unitId, tenantId, status });
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT, Role.TENANT)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.leasesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeaseDto,
  ) {
    return this.leasesService.update(id, dto);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT)
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.leasesService.activate(id);
  }

  @Post(':id/terminate')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT)
  terminate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TerminateLeaseDto,
  ) {
    return this.leasesService.terminate(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.leasesService.remove(id);
  }
}
