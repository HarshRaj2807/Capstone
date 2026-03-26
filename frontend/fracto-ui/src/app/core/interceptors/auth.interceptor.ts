import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { API_BASE_URL } from '../config/api.config';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const token = authService.token();
  const isApiRequest = request.url.startsWith(API_BASE_URL);
  const isAuthCall = request.url.includes('/auth/login')
    || request.url.includes('/auth/register')
    || request.url.includes('/auth/refresh')
    || request.url.includes('/auth/logout');

  let authRequest = request;
  if (isApiRequest) {
    authRequest = request.clone({
      withCredentials: true,
      setHeaders: token
        ? {
            Authorization: `Bearer ${token}`
          }
        : {}
    });
  }

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!isApiRequest || isAuthCall || error.status !== 401) {
        return throwError(() => error);
      }

      return authService.refreshSession().pipe(
        switchMap(() => {
          const refreshedToken = authService.token();
          const retryRequest = authRequest.clone({
            withCredentials: true,
            setHeaders: refreshedToken
              ? {
                  Authorization: `Bearer ${refreshedToken}`
                }
              : {}
          });

          return next(retryRequest);
        }),
        catchError(() => {
          authService.clearSession();
          return throwError(() => error);
        })
      );
    })
  );
};
