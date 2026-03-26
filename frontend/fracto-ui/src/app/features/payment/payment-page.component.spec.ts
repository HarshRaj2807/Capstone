import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PaymentPageComponent } from './payment-page.component';
import { AppointmentService } from '../../core/services/appointment.service';
import { AuthService } from '../../core/services/auth.service';

describe('PaymentPageComponent', () => {
  const appointmentServiceStub = {
    scheduleNewAppointment: jasmine.createSpy().and.returnValue(of({
      message: 'Booked',
      appointment: { appointmentId: 1, appointmentDate: '2099-01-01', timeSlot: '09:00' }
    }))
  };

  const authServiceStub = {
    currentUser: () => ({ fullName: 'Test User' })
  };

  function setupWithQuery(params: Record<string, string> = {}) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [PaymentPageComponent],
      providers: [
        { provide: AppointmentService, useValue: appointmentServiceStub },
        { provide: AuthService, useValue: authServiceStub },
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(params) } } }
      ]
    });

    return TestBed.createComponent(PaymentPageComponent);
  }

  it('shows an error when query params are incomplete', () => {
    const fixture = setupWithQuery();
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.paymentContext()).toBeNull();
    expect(component.errorMessage()).toBe('The selected booking details are incomplete. Please choose a slot again.');
  });

  it('validates payment form before processing', () => {
    const fixture = setupWithQuery({
      doctorId: '1',
      doctorName: 'Dr. Test',
      specializationName: 'Cardiology',
      city: 'Chennai',
      consultationFee: '500',
      appointmentDate: '2099-01-01',
      timeSlot: '09:00'
    });
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.processPayment();

    expect(component.errorMessage()).toBe('Please correct the highlighted errors in the payment form.');
  });

  it('processes payment and shows confirmation', fakeAsync(() => {
    const fixture = setupWithQuery({
      doctorId: '1',
      doctorName: 'Dr. Test',
      specializationName: 'Cardiology',
      city: 'Chennai',
      consultationFee: '500',
      appointmentDate: '2099-01-01',
      timeSlot: '09:00'
    });
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.paymentForm.setValue({
      cardholderName: 'Test User',
      cardNumber: '4242424242424242',
      expiry: '12/29',
      cvv: '123',
      reasonForVisit: 'Checkup',
      billingNote: '',
      acceptTerms: true
    });

    component.processPayment();
    tick(900);

    expect(appointmentServiceStub.scheduleNewAppointment).toHaveBeenCalled();
    expect(component.popupVisible()).toBeTrue();
  }));
});
