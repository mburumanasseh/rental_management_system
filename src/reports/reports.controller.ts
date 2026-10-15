import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../common/enums/role.enum.js';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT)
  dashboard() {
    return this.reportsService.getDashboard();
  }

  @Get('occupancy')
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT)
  occupancy() {
    return this.reportsService.getOccupancySummary();
  }

  @Get('arrears')
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT)
  arrears() {
    return this.reportsService.getArrearsSummary();
  }

  @Get('cash-flow')
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT)
  cashFlow(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.getCashFlowSummary(from, to);
  }

  @Get('leases')
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT)
  leases() {
    return this.reportsService.getLeaseSummary();
  }
}
