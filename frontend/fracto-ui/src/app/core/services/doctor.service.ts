import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Doctor, DoctorFormValue, DoctorRatingsResponse } from '../models/doctor.models';
import { PagedResponse } from '../models/shared.models';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private readonly http = inject(HttpClient);

  /**
   * Retrieves a paginated list of all medical professionals.
   */
  retrieveAllDoctors(pIndex = 1, pSize = 10): Observable<PagedResponse<Doctor>> {
    const queryParams = new HttpParams()
      .set('pIndex', pIndex)
      .set('pSize', pSize);

    return this.http.get<PagedResponse<Doctor>>(`${API_BASE_URL}/doctors`, { params: queryParams });
  }

  /**
   * Filters doctors based on location, specialization, rating, and availability.
   */
  findDoctorsWithFilters(criteria: {
    location?: string;
    specId?: number;
    ratingFloor?: number;
    preferredDate?: string;
    pIndex?: number;
    pSize?: number;
  }): Observable<PagedResponse<Doctor>> {
    let queryParams = new HttpParams()
      .set('pIndex', criteria.pIndex ?? 1)
      .set('pSize', criteria.pSize ?? 12);

    if (criteria.location) {
      queryParams = queryParams.set('location', criteria.location);
    }

    if (criteria.specId) {
      queryParams = queryParams.set('specId', criteria.specId);
    }

    if (criteria.ratingFloor) {
      queryParams = queryParams.set('ratingFloor', criteria.ratingFloor);
    }

    if (criteria.preferredDate) {
      queryParams = queryParams.set('preferredDate', criteria.preferredDate);
    }

    return this.http.get<PagedResponse<Doctor>>(`${API_BASE_URL}/doctors/search`, { params: queryParams });
  }

  /**
   * Submits a request to create a new doctor profile.
   */
  addNewDoctorRecord(entry: DoctorFormValue): Observable<Doctor> {
    return this.http.post<Doctor>(`${API_BASE_URL}/doctors`, entry);
  }

  /**
   * Updates an existing doctor's information.
   */
  modifyDoctorDetails(id: number, entry: DoctorFormValue): Observable<Doctor> {
    return this.http.put<Doctor>(`${API_BASE_URL}/doctors/${id}`, entry);
  }

  /**
   * Deletes a doctor's profile from the database.
   */
  removeDoctorProfile(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_BASE_URL}/doctors/${id}`);
  }

  /**
   * Fetches ratings and reviews for a specific doctor.
   */
  fetchRatingsByDoctorId(id: number): Observable<DoctorRatingsResponse> {
    return this.http.get<DoctorRatingsResponse>(`${API_BASE_URL}/doctors/${id}/ratings`);
  }

  /**
   * Retrieves full details for a single doctor by their record ID.
   */
  fetchSingleDoctorDetails(id: number): Observable<Doctor> {
    return this.http.get<Doctor>(`${API_BASE_URL}/doctors/${id}`);
  }
}
