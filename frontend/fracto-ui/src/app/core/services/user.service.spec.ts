import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { API_BASE_URL } from '../config/api.config';

describe('UserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), UserService]
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('retrieves users with pagination params', () => {
    const service = TestBed.inject(UserService);
    const http = TestBed.inject(HttpTestingController);

    service.retrieveRegisteredUsers().subscribe();

    const request = http.expectOne((req) => req.url === `${API_BASE_URL}/users`);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('pNum')).toBe('1');
    expect(request.request.params.get('pSize')).toBe('50');
    request.flush({ items: [] });
  });

  it('toggles user status', () => {
    const service = TestBed.inject(UserService);
    const http = TestBed.inject(HttpTestingController);

    service.updateUserAccountStatus(15).subscribe();

    const request = http.expectOne(`${API_BASE_URL}/users/15/toggle-status`);
    expect(request.request.method).toBe('PATCH');
    request.flush({ message: 'ok' });
  });
});
