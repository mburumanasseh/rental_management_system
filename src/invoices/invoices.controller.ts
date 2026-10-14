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
import { InvoicesService } from './invoices.service.js';
import { CreateInvoiceDto } from './dto/create-invoice.dto.js';
import { UpdateInvoiceDto } from './dto/update-invoice.dto.js';
import { GenerateRentInvoicesDto } from './dto/generate-rent-invoices.dto.js';
import { InvoiceStatus, InvoiceType } from './entities/invoice.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../common/enums/role.enum.js';

@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT)
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(dto);
  }

  @Post('generate-rent')
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT)
  generateRent(@Body() dto: GenerateRentInvoicesDto) {
    return this.invoicesService.generateRentInvoices(dto);
  }

  @Post('mark-overdue')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN, Role.AGENT)
  markOverdue() {
    return this.invoicesService.markOverdue().then((count) => ({
      message: `${count} invoice(s) marked as overdue`,
      count,
    }));
  }

  @Get()
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT, Role.TENANT)
  findAll(
    @Query('leaseId') leaseId?: string,
    @Query('status') status?: InvoiceStatus,
    @Query('type') type?: InvoiceType,
  ) {
    return this.invoicesService.findAll({ leaseId, status, type });
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT, Role.TENANT)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.invoicesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.update(id, dto);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT)
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.invoicesService.cancel(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.invoicesService.remove(id);
  }
}
