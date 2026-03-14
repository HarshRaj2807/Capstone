import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Doctor, DoctorFormValue, DoctorRatingsResponse } from '../models/doctor.models';
import { PagedResponse } from '../models/shared.models';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private readonly http = inject(HttpClient);

  getDoctors(pageNumber = 1, pageSize = 10): Observable<PagedResponse<Doctor>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    return this.http.get<PagedResponse<Doctor>>(`${API_BASE_URL}/doctors`, { params });
  }

  searchDoctors(filters: {
    city?: string;
    specializationId?: number;
    minRating?: number;
    appointmentDate?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Observable<PagedResponse<Doctor>> {
    let params = new HttpParams()
      .set('pageNumber', filters.pageNumber ?? 1)
      .set('pageSize', filters.pageSize ?? 12);

    if (filters.city) {
      params = params.set('city', filters.city);
    }

    if (filters.specializationId) {
      params = params.set('specializationId', filters.specializationId);
    }

    if (filters.minRating) {
      params = params.set('minRating', filters.minRating);
    }

    if (filters.appointmentDate) {
      params = params.set('appointmentDate', filters.appointmentDate);
    }

    return this.http.get<PagedResponse<Doctor>>(`${API_BASE_URL}/doctors/search`, { params });
  }

  createDoctor(payload: DoctorFormValue): Observable<Doctor> {
    return this.http.post<Doctor>(`${API_BASE_URL}/doctors`, payload);
  }

  updateDoctor(doctorId: number, payload: DoctorFormValue): Observable<Doctor> {
    return this.http.put<Doctor>(`${API_BASE_URL}/doctors/${doctorId}`, payload);
  }

  deleteDoctor(doctorId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_BASE_URL}/doctors/${doctorId}`);
  }

  getDoctorRatings(doctorId: number): Observable<DoctorRatingsResponse> {
    return this.http.get<DoctorRatingsResponse>(`${API_BASE_URL}/doctors/${doctorId}/ratings`);
  }

  getDoctorById(doctorId: number): Observable<Doctor> {
    return this.http.get<Doctor>(`${API_BASE_URL}/doctors/${doctorId}`);
  }
}
