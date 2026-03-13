import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { CreateRatingRequest, Rating } from '../models/rating.models';

@Injectable({ providedIn: 'root' })
export class RatingService {
  private readonly http = inject(HttpClient);

  createRating(payload: CreateRatingRequest): Observable<{ message: string; rating: Rating }> {
    return this.http.post<{ message: string; rating: Rating }>(`${API_BASE_URL}/ratings`, payload);
  }
}
