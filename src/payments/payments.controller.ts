import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { InitiateStkPushDto } from './dto/initiate-stk-push.dto.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import {
  MpesaStkCallbackDto,
  MpesaC2BCallbackDto,
} from './dto/mpesa-callback.dto.js';
import { PaymentStatus } from './entities/payment.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../common/enums/role.enum.js';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /** Initiate M-Pesa STK Push for an invoice */
  @Post('mpesa/stk-push')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT, Role.TENANT)
  initiateStkPush(@Body() dto: InitiateStkPushDto) {
    return this.paymentsService.initiateStkPush(dto);
  }

  /** Daraja STK callback – public (no JWT) */
  @Post('mpesa/callback')
  @HttpCode(HttpStatus.OK)
  async stkCallback(@Body() payload: MpesaStkCallbackDto) {
    await this.paymentsService.handleStkCallback(payload);
    return { ResultCode: 0, ResultDesc: 'Accepted' };
  }

  /** Daraja C2B confirmation – public */
  @Post('mpesa/c2b/confirmation')
  @HttpCode(HttpStatus.OK)
  async c2bConfirmation(@Body() payload: MpesaC2BCallbackDto) {
    await this.paymentsService.handleC2BCallback(payload);
    return { ResultCode: 0, ResultDesc: 'Success' };
  }

  /** Manual payment recording (cash / bank) */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT)
  createManual(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.createManual(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT, Role.TENANT)
  findAll(
    @Query('invoiceId') invoiceId?: string,
    @Query('status') status?: PaymentStatus,
  ) {
    return this.paymentsService.findAll({ invoiceId, status });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.LANDLORD, Role.AGENT, Role.TENANT)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.findOne(id);
  }
}
