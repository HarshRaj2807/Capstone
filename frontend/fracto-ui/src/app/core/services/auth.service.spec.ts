import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { API_BASE_URL } from '../config/api.config';
import { AuthResponse } from '../models/auth.models';

describe('AuthService', () => {
  const storageKey = 'fracto.auth.session';
  const sessionResponse: AuthResponse = {
    message: 'Login successful',
    token: 'sample-token',
    expiresAtUtc: '2099-03-20T10:30:00Z',
    user: {
      userId: 42,
      fullName: 'Rhea Thomas',
      email: 'rhea@example.com',
      role: 'User',
      city: 'Kochi',
      profileImagePath: null
    }
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.clear();
  });

  it('restores an existing session from local storage', () => {
    localStorage.setItem(storageKey, JSON.stringify(sessionResponse));

    const service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.currentUser()).toEqual(sessionResponse.user);
    expect(service.token()).toBe(sessionResponse.token);
  });

  it('removes malformed stored session data during startup', () => {
    localStorage.setItem(storageKey, '{invalid json');

    const service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem(storageKey)).toBeNull();
  });

  it('stores the returned session after login', () => {
    const service = TestBed.inject(AuthService);
    const httpTesting = TestBed.inject(HttpTestingController);

    service.login({ email: 'rhea@example.com', password: 'secret' }).subscribe((response) => {
      expect(response).toEqual(sessionResponse);
    });

    const request = httpTesting.expectOne(`${API_BASE_URL}/auth/login`);
    expect(request.request.method).toBe('POST');
    request.flush(sessionResponse);

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.currentUser()).toEqual(sessionResponse.user);
    expect(localStorage.getItem(storageKey)).toBe(JSON.stringify(sessionResponse));
  });

  it('clears the session on logout', () => {
    localStorage.setItem(storageKey, JSON.stringify(sessionResponse));

    const service = TestBed.inject(AuthService);
    const httpTesting = TestBed.inject(HttpTestingController);

    service.logout();

    const request = httpTesting.expectOne(`${API_BASE_URL}/auth/logout`);
    expect(request.request.method).toBe('POST');
    request.flush({});

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem(storageKey)).toBeNull();
  });
});
