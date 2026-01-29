import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SnakeCaseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.transformToSnakeCase(data)));
  }

  private transformToSnakeCase(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.transformToSnakeCase(item));
    }

    if (typeof data === 'object' && data.constructor === Object) {
      const transformed: any = {};
      
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          // Manter createdAt, updatedAt, deletedAt
          if (key === 'createdAt' || key === 'updatedAt' || key === 'deletedAt') {
            transformed[key] = this.transformToSnakeCase(data[key]);
          } else {
            const snakeKey = this.camelToSnake(key);
            transformed[snakeKey] = this.transformToSnakeCase(data[key]);
          }
        }
      }
      
      return transformed;
    }

    return data;
  }

  private camelToSnake(str: string): string {
    // Converte camelCase para snake_case
    return str.replace(/([A-Z])/g, '_$1').toLowerCase();
  }
}
