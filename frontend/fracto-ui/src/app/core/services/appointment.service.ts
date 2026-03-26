import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import {
  Appointment,
  BookAppointmentRequest,
  RescheduleAppointmentRequest,
  UpdateAppointmentStatusRequest
} from '../models/appointment.models';
import { PagedResponse } from '../models/shared.models';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly http = inject(HttpClient);

  fetchAppointments(statusFilter?: string): Observable<PagedResponse<Appointment>> {
    let queryParams = new HttpParams()
      .set('pageNr', 1)
      .set('pageSizeLimit', 50);

    if (statusFilter) {
      queryParams = queryParams.set('appointmentStatus', statusFilter);
    }

    return this.http.get<PagedResponse<Appointment>>(`${API_BASE_URL}/appointments`, { params: queryParams });
  }

  scheduleNewAppointment(data: BookAppointmentRequest): Observable<{ message: string; appointment: Appointment }> {
    return this.http.post<{ message: string; appointment: Appointment }>(
      `${API_BASE_URL}/appointments/book`,
      data
    );
  }

  cancelExistingAppointment(id: number, justification?: string): Observable<{ message: string }> {
    let queryParams = new HttpParams();
    if (justification) {
      queryParams = queryParams.set('cancellationReason', justification);
    }

    return this.http.delete<{ message: string }>(`${API_BASE_URL}/appointments/${id}`, {
      params: queryParams
    });
  }

  updateAppointmentStatus(
    appointmentId: number,
    payload: UpdateAppointmentStatusRequest
  ): Observable<Appointment> {
    return this.http.put<Appointment>(`${API_BASE_URL}/appointments/${appointmentId}/status`, payload);
  }

  rescheduleAppointment(
    appointmentId: number,
    payload: RescheduleAppointmentRequest
  ): Observable<Appointment> {
    return this.http.put<Appointment>(`${API_BASE_URL}/appointments/${appointmentId}/reschedule`, payload);
  }
}
