import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Specialization } from '../models/doctor.models';

@Injectable({ providedIn: 'root' })
export class SpecializationService {
  private readonly http = inject(HttpClient);

  getSpecializations(): Observable<Specialization[]> {
    return this.http.get<Specialization[]>(`${API_BASE_URL}/specializations`);
  }
}
