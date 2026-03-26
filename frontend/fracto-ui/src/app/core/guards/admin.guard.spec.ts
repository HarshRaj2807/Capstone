import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { Observable, firstValueFrom, isObservable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { adminGuard } from './admin.guard';

@Component({
  selector: 'app-login-dummy',
  standalone: true,
  template: ''
})
class LoginDummyComponent {}

describe('adminGuard', () => {
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  function runGuard() {
    return TestBed.runInInjectionContext(() => adminGuard(route, state));
  }

  async function resolveGuardResult(result: unknown) {
    if (isObservable(result)) {
      return firstValueFrom(result);
    }
    return result;
  }

  it('allows navigation for authenticated admins', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'login', component: LoginDummyComponent }, { path: 'doctors', component: LoginDummyComponent }]),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: () => true,
            isAdmin: () => true,
            ensureSession: () => of(true)
          }
        }
      ]
    });

    const result = await resolveGuardResult(runGuard());

    expect(result as boolean).toBeTrue();
  });

  it('redirects non-admins to /doctors', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'login', component: LoginDummyComponent }, { path: 'doctors', component: LoginDummyComponent }]),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: () => true,
            isAdmin: () => false,
            ensureSession: () => of(true)
          }
        }
      ]
    });

    const result = (await resolveGuardResult(runGuard())) as UrlTree;

    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/doctors');
  });

  it('redirects to /login when session refresh fails', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'login', component: LoginDummyComponent }]),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: () => false,
            isAdmin: () => false,
            ensureSession: () => of(false)
          }
        }
      ]
    });

    const result = (await resolveGuardResult(runGuard())) as UrlTree;

    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/login');
  });
});
