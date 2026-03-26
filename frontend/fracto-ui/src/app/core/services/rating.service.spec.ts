import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RatingService } from './rating.service';
import { API_BASE_URL } from '../config/api.config';

describe('RatingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), RatingService]
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('creates a rating', () => {
    const service = TestBed.inject(RatingService);
    const http = TestBed.inject(HttpTestingController);
    const payload = { appointmentId: 1, doctorId: 2, ratingValue: 5, reviewComment: 'Great' };

    service.createRating(payload).subscribe();

    const request = http.expectOne(`${API_BASE_URL}/ratings`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ message: 'ok', rating: { ratingId: 1 } });
  });
});
