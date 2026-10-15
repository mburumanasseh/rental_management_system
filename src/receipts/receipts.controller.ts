import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ReceiptsService } from './receipts.service.js';
import { CreateReceiptDto } from './dto/create-receipt.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../common/enums/role.enum.js';

@Controller('receipts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT)
  create(@Body() dto: CreateReceiptDto) {
    return this.receiptsService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT, Role.TENANT)
  findAll(@Query('paymentId') paymentId?: string) {
    return this.receiptsService.findAll({ paymentId });
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT, Role.TENANT)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.receiptsService.findOne(id);
  }

  @Get('number/:receiptNumber')
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT, Role.TENANT)
  findByNumber(@Param('receiptNumber') receiptNumber: string) {
    return this.receiptsService.findByReceiptNumber(receiptNumber);
  }
}
