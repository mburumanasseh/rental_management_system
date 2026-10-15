import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from '../audit.service.js';
import { AuditAction } from '../entities/audit-log.entity.js';

/**
 * Lightweight interceptor that records successful mutating requests.
 * Attach with @UseInterceptors(AuditInterceptor) on controllers or routes.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const user = request.user;

    // Only log mutating methods
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const actionMap: Record<string, AuditAction> = {
      POST: AuditAction.CREATE,
      PATCH: AuditAction.UPDATE,
      PUT: AuditAction.UPDATE,
      DELETE: AuditAction.DELETE,
    };

    const resource = request.route?.path?.split('/')?.[1] || 'unknown';

    return next.handle().pipe(
      tap({
        next: () => {
          this.auditService
            .log({
              userId: user?.id,
              userEmail: user?.email,
              action: actionMap[method] || AuditAction.OTHER,
              resource,
              resourceId: request.params?.id || null,
              description: `${method} ${request.originalUrl || request.url}`,
              ipAddress: request.ip || request.headers['x-forwarded-for'],
              userAgent: request.headers['user-agent'],
            })
            .catch(() => {
              // never let audit failures break the request
            });
        },
      }),
    );
  }
}
