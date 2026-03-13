import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import {
  Appointment,
  BookAppointmentRequest,
  UpdateAppointmentStatusRequest
} from '../models/appointment.models';
import { PagedResponse } from '../models/shared.models';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly http = inject(HttpClient);

  getAppointments(status?: string): Observable<PagedResponse<Appointment>> {
    let params = new HttpParams().set('pageNumber', 1).set('pageSize', 50);

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PagedResponse<Appointment>>(`${API_BASE_URL}/appointments`, { params });
  }

  bookAppointment(payload: BookAppointmentRequest): Observable<{ message: string; appointment: Appointment }> {
    return this.http.post<{ message: string; appointment: Appointment }>(
      `${API_BASE_URL}/appointments/book`,
      payload
    );
  }

  cancelAppointment(appointmentId: number, reason?: string): Observable<{ message: string }> {
    let params = new HttpParams();
    if (reason) {
      params = params.set('reason', reason);
    }

    return this.http.delete<{ message: string }>(`${API_BASE_URL}/appointments/${appointmentId}`, {
      params
    });
  }

  updateAppointmentStatus(
    appointmentId: number,
    payload: UpdateAppointmentStatusRequest
  ): Observable<Appointment> {
    return this.http.put<Appointment>(`${API_BASE_URL}/appointments/${appointmentId}/status`, payload);
  }
}
