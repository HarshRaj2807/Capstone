import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return authService.isAdmin() ? true : router.createUrlTree(['/doctors']);
  }

  return authService.ensureSession().pipe(
    map((isValid) => {
      if (!isValid) {
        return router.createUrlTree(['/login']);
      }

      return authService.isAdmin() ? true : router.createUrlTree(['/doctors']);
    }),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};
