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
import { NotificationsService } from './notifications.service.js';
import { SendNotificationDto } from './dto/send-notification.dto.js';
import {
  NotificationChannel,
  NotificationStatus,
} from './entities/notification.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../common/enums/role.enum.js';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  @Roles(Role.ADMIN, Role.AGENT)
  send(@Body() dto: SendNotificationDto) {
    return this.notificationsService.send(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.AGENT)
  findAll(
    @Query('userId') userId?: string,
    @Query('channel') channel?: NotificationChannel,
    @Query('status') status?: NotificationStatus,
  ) {
    return this.notificationsService.findAll({ userId, channel, status });
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.AGENT)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.findOne(id);
  }
}
