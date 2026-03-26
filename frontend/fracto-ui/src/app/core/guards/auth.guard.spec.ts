import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter
} from '@angular/router';
import { Observable, firstValueFrom, isObservable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

@Component({
  selector: 'app-login-dummy',
  standalone: true,
  template: ''
})
class LoginDummyComponent {}

describe('authGuard', () => {
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  function runGuard() {
    return TestBed.runInInjectionContext(() => authGuard(route, state));
  }

  async function resolveGuardResult(
    result: boolean | UrlTree | Observable<boolean | UrlTree>
  ) {
    if (isObservable(result)) {
      return firstValueFrom(result);
    }
    return result;
  }

  it('allows navigation when the user is authenticated', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'login', component: LoginDummyComponent }]),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: () => true,
            ensureSession: () => of(true)
          }
        }
      ]
    });

    const result = await resolveGuardResult(
      runGuard() as boolean | UrlTree | Observable<boolean | UrlTree>
    );

    expect(result as boolean).toBeTrue();
  });

  it('redirects to /login when the user is not authenticated', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'login', component: LoginDummyComponent }]),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: () => false,
            ensureSession: () => of(false)
          }
        }
      ]
    });

    const result = (await resolveGuardResult(
      runGuard() as boolean | UrlTree | Observable<boolean | UrlTree>
    )) as UrlTree;

    expect(result instanceof UrlTree).toBeTrue();
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/login');
  });
});
