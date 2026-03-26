import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DoctorService } from './doctor.service';
import { API_BASE_URL } from '../config/api.config';

describe('DoctorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), DoctorService]
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('retrieves all doctors with pagination and includeInactive flag', () => {
    const service = TestBed.inject(DoctorService);
    const http = TestBed.inject(HttpTestingController);

    service.retrieveAllDoctors(2, 20, true).subscribe();

    const request = http.expectOne((req) => req.url === `${API_BASE_URL}/doctors`);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('pIndex')).toBe('2');
    expect(request.request.params.get('pSize')).toBe('20');
    expect(request.request.params.get('includeInactive')).toBe('true');
    request.flush({ items: [] });
  });

  it('builds search parameters for doctor filters', () => {
    const service = TestBed.inject(DoctorService);
    const http = TestBed.inject(HttpTestingController);

    service.findDoctorsWithFilters({
      location: 'Chennai',
      specId: 4,
      ratingFloor: 4.5,
      preferredDate: '2099-03-01',
      pIndex: 1,
      pSize: 12
    }).subscribe();

    const request = http.expectOne((req) => req.url === `${API_BASE_URL}/doctors/search`);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('location')).toBe('Chennai');
    expect(request.request.params.get('specId')).toBe('4');
    expect(request.request.params.get('ratingFloor')).toBe('4.5');
    expect(request.request.params.get('preferredDate')).toBe('2099-03-01');
    request.flush({ items: [] });
  });

  it('deletes a doctor profile', () => {
    const service = TestBed.inject(DoctorService);
    const http = TestBed.inject(HttpTestingController);

    service.removeDoctorProfile(5).subscribe();

    const request = http.expectOne(`${API_BASE_URL}/doctors/5`);
    expect(request.request.method).toBe('DELETE');
    request.flush({ message: 'ok' });
  });
});
