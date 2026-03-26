import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SpecializationService } from './specialization.service';
import { API_BASE_URL } from '../config/api.config';

describe('SpecializationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), SpecializationService]
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('retrieves specializations', () => {
    const service = TestBed.inject(SpecializationService);
    const http = TestBed.inject(HttpTestingController);

    service.retrieveMedicalSpecialties().subscribe();

    const request = http.expectOne(`${API_BASE_URL}/specializations`);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('creates a specialization', () => {
    const service = TestBed.inject(SpecializationService);
    const http = TestBed.inject(HttpTestingController);

    service.createSpecialization({ specializationName: 'Cardiology', description: null, isActive: true }).subscribe();

    const request = http.expectOne(`${API_BASE_URL}/specializations`);
    expect(request.request.method).toBe('POST');
    request.flush({ specializationId: 1 });
  });
});
