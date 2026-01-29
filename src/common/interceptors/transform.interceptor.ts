import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => {
        // Se já for um objeto com estrutura de resposta, retorna como está
        if (data && typeof data === 'object' && ('data' in data || 'pagination' in data)) {
          return data;
        }
        // Caso contrário, envolve em { data }
        return { data };
      }),
    );
  }
}
