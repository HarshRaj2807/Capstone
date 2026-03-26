import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AppointmentsPageComponent } from './appointments-page.component';
import { AppointmentService } from '../../core/services/appointment.service';
import { RatingService } from '../../core/services/rating.service';

describe('AppointmentsPageComponent', () => {
  const appointmentServiceStub = {
    fetchAppointments: jasmine.createSpy().and.returnValue(of({
      items: [
        {
          appointmentId: 1,
          doctorId: 2,
          doctorName: 'Dr. Mira',
          userId: 3,
          userName: 'User A',
          appointmentDate: '2099-01-01',
          timeSlot: '09:00',
          status: 'Booked',
          reasonForVisit: 'Checkup',
          cancellationReason: null,
          canRate: true
        }
      ]
    })),
    cancelExistingAppointment: jasmine.createSpy().and.returnValue(of({ message: 'Cancelled' })),
    rescheduleAppointment: jasmine.createSpy().and.returnValue(of({})),
    updateAppointmentStatus: jasmine.createSpy().and.returnValue(of({}))
  };

  const ratingServiceStub = {
    createRating: jasmine.createSpy().and.returnValue(of({ message: 'Thanks', rating: { ratingId: 1 } }))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentsPageComponent],
      providers: [
        { provide: AppointmentService, useValue: appointmentServiceStub },
        { provide: RatingService, useValue: ratingServiceStub }
      ]
    }).compileComponents();
  });

  it('loads appointments on init', () => {
    const fixture = TestBed.createComponent(AppointmentsPageComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.listOfAppointments().length).toBe(1);
  });

  it('requires date and time before rescheduling', () => {
    const fixture = TestBed.createComponent(AppointmentsPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const appointment = component.listOfAppointments()[0];
    component.updateRescheduleDraft(appointment.appointmentId, 'appointmentDate', '');
    component.updateRescheduleDraft(appointment.appointmentId, 'timeSlot', '');

    component.rescheduleAppointment(appointment);

    expect(component.errorNotification()).toBe('Please select a new date and time slot before rescheduling.');
    expect(appointmentServiceStub.rescheduleAppointment).not.toHaveBeenCalled();
  });

  it('submits a rating and shows confirmation', () => {
    const fixture = TestBed.createComponent(AppointmentsPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const appointment = component.listOfAppointments()[0];
    component.modifyDraftRatingValue(appointment.appointmentId, '4');
    component.modifyDraftReviewComment(appointment.appointmentId, 'Great');

    component.sendRatingToApi(appointment);

    expect(ratingServiceStub.createRating).toHaveBeenCalled();
    expect(component.isConfirmationPopupVisible()).toBeTrue();
  });
});
