import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AppointmentService } from './appointment.service';
import { API_BASE_URL } from '../config/api.config';

describe('AppointmentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AppointmentService]
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('fetches appointments with paging and optional status filter', () => {
    const service = TestBed.inject(AppointmentService);
    const http = TestBed.inject(HttpTestingController);

    service.fetchAppointments('Booked').subscribe();

    const request = http.expectOne((req) => req.url === `${API_BASE_URL}/appointments`);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('pageNr')).toBe('1');
    expect(request.request.params.get('pageSizeLimit')).toBe('50');
    expect(request.request.params.get('appointmentStatus')).toBe('Booked');
    request.flush({ items: [] });
  });

  it('schedules a new appointment', () => {
    const service = TestBed.inject(AppointmentService);
    const http = TestBed.inject(HttpTestingController);
    const payload = { doctorId: 1, appointmentDate: '2099-03-12', timeSlot: '10:00', reasonForVisit: 'Checkup' };

    service.scheduleNewAppointment(payload).subscribe();

    const request = http.expectOne(`${API_BASE_URL}/appointments/book`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ message: 'ok', appointment: { appointmentId: 1 } });
  });

  it('cancels an appointment with a reason', () => {
    const service = TestBed.inject(AppointmentService);
    const http = TestBed.inject(HttpTestingController);

    service.cancelExistingAppointment(12, 'Not available').subscribe();

    const request = http.expectOne((req) => req.url === `${API_BASE_URL}/appointments/12`);
    expect(request.request.method).toBe('DELETE');
    expect(request.request.params.get('cancellationReason')).toBe('Not available');
    request.flush({ message: 'ok' });
  });
});
