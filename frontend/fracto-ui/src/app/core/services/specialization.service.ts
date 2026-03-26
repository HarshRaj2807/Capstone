import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Specialization, SpecializationFormValue } from '../models/doctor.models';

@Injectable({ providedIn: 'root' })
export class SpecializationService {
  private readonly http = inject(HttpClient);

  /**
   * Retrieves all available medical specialties from the system.
   * @returns An observable array of Specialization.
   */
  retrieveMedicalSpecialties(): Observable<Specialization[]> {
    return this.http.get<Specialization[]>(`${API_BASE_URL}/specializations`);
  }

  createSpecialization(payload: SpecializationFormValue): Observable<Specialization> {
    return this.http.post<Specialization>(`${API_BASE_URL}/specializations`, payload);
  }

  updateSpecialization(id: number, payload: SpecializationFormValue): Observable<Specialization> {
    return this.http.put<Specialization>(`${API_BASE_URL}/specializations/${id}`, payload);
  }

  deleteSpecialization(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_BASE_URL}/specializations/${id}`);
  }
}
