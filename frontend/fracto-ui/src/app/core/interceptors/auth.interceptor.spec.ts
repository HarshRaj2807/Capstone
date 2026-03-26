import { TestBed } from '@angular/core/testing';
import { HttpClient, withInterceptors, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { API_BASE_URL } from '../config/api.config';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let tokenValue = 'initial-token';

  const refreshResponse = {
    message: 'refreshed',
    token: 'refreshed-token',
    expiresAtUtc: '2099-01-01T00:00:00Z',
    user: {
      userId: 1,
      fullName: 'Test User',
      email: 'test@example.com',
      role: 'User',
      city: 'City',
      profileImagePath: null
    }
  };

  const authStub = {
    token: () => tokenValue,
    refreshSession: jasmine.createSpy('refreshSession').and.callFake(() => {
      tokenValue = 'refreshed-token';
      return of(refreshResponse);
    }),
    clearSession: jasmine.createSpy('clearSession')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authStub }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    tokenValue = 'initial-token';
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('adds bearer token to API requests', () => {
    http.get(`${API_BASE_URL}/doctors`).subscribe();

    const request = httpMock.expectOne(`${API_BASE_URL}/doctors`);
    expect(request.request.headers.get('Authorization')).toBe('Bearer initial-token');
    request.flush({});
  });

  it('refreshes the session on 401 and retries the request', () => {
    http.get(`${API_BASE_URL}/doctors`).subscribe();

    const firstAttempt = httpMock.expectOne(`${API_BASE_URL}/doctors`);
    firstAttempt.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(authStub.refreshSession).toHaveBeenCalled();

    const retryAttempt = httpMock.expectOne(`${API_BASE_URL}/doctors`);
    expect(retryAttempt.request.headers.get('Authorization')).toBe('Bearer refreshed-token');
    retryAttempt.flush({});
  });
});
