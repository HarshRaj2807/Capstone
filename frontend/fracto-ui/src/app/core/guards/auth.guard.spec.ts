import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter
} from '@angular/router';
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

  it('allows navigation when the user is authenticated', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'login', component: LoginDummyComponent }]),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: () => true
          }
        }
      ]
    });

    expect(runGuard() as boolean).toBeTrue();
  });

  it('redirects to /login when the user is not authenticated', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'login', component: LoginDummyComponent }]),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: () => false
          }
        }
      ]
    });

    const result = runGuard() as UrlTree;

    expect(result instanceof UrlTree).toBeTrue();
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/login');
  });
});
