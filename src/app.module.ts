import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { ConfigModule } from './config/config.module.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';

import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { LandlordsModule } from './landlords/landlords.module.js';
import { TenantsModule } from './tenants/tenants.module.js';
import { PropertiesModule } from './properties/properties.module.js';
import { UnitsModule } from './units/units.module.js';
import { LeasesModule } from './leases/leases.module.js';
import { InvoicesModule } from './invoices/invoices.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { ReceiptsModule } from './receipts/receipts.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { AuditModule } from './audit/audit.module.js';
import { ReportsModule } from './reports/reports.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Core infrastructure
    ConfigModule,
    DatabaseModule,
    HealthModule,

    // Rate limiting
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('throttle.ttl') ?? 60,
          limit: config.get<number>('throttle.limit') ?? 100,
        },
      ],
    }),

    // Observability (placeholder credentials – replace in production)
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'Rental_System',
    }),

    // Domain modules
    AuthModule,
    UsersModule,
    LandlordsModule,
    TenantsModule,
    PropertiesModule,
    UnitsModule,
    LeasesModule,
    InvoicesModule,
    PaymentsModule,
    ReceiptsModule,
    NotificationsModule,
    AuditModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
