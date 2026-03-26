import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DoctorsPageComponent } from './doctors-page.component';
import { DoctorService } from '../../core/services/doctor.service';
import { SpecializationService } from '../../core/services/specialization.service';
import { AuthService } from '../../core/services/auth.service';

describe('DoctorsPageComponent', () => {
  const doctorServiceStub = {
    findDoctorsWithFilters: jasmine.createSpy().and.returnValue(of({ items: [] }))
  };

  const specializationServiceStub = {
    retrieveMedicalSpecialties: jasmine.createSpy().and.returnValue(of([]))
  };

  const authServiceStub = {
    isAdmin: () => false
  };

  beforeEach(async () => {
    authServiceStub.isAdmin = () => false;
    await TestBed.configureTestingModule({
      imports: [DoctorsPageComponent],
      providers: [
        { provide: DoctorService, useValue: doctorServiceStub },
        { provide: SpecializationService, useValue: specializationServiceStub },
        { provide: AuthService, useValue: authServiceStub },
        provideRouter([])
      ]
    }).compileComponents();
  });

  it('trims filters before searching', () => {
    const fixture = TestBed.createComponent(DoctorsPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.searchForm.setValue({
      city: '  Chennai ',
      specializationId: '',
      minRating: '',
      appointmentDate: ''
    });

    component.executeDoctorSearch();

    expect(doctorServiceStub.findDoctorsWithFilters).toHaveBeenCalledWith(jasmine.objectContaining({
      location: 'Chennai'
    }));
  });

  it('blocks booking for admins', async () => {
    const fixture = TestBed.createComponent(DoctorsPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const adminComponent = component as any;
    adminComponent.authService.isAdmin = () => true;

    await component.bookSlot({
      doctorId: 1,
      fullName: 'Dr. Admin',
      specializationId: 1,
      specializationName: 'Cardiology',
      city: 'Chennai',
      experienceYears: 5,
      consultationFee: 400,
      consultationStartTime: '09:00',
      consultationEndTime: '12:00',
      slotDurationMinutes: 30,
      availableSlots: [],
      averageRating: 4.5,
      totalReviews: 10,
      isActive: true,
      profileImagePath: null
    }, '09:00');

    expect(component.errorMessage()).toBe('Use the demo user account to book appointments from the patient journey.');
  });

  it('requires an appointment date before booking', async () => {
    const fixture = TestBed.createComponent(DoctorsPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.searchForm.patchValue({ appointmentDate: '' });

    await component.bookSlot({
      doctorId: 2,
      fullName: 'Dr. User',
      specializationId: 1,
      specializationName: 'Cardiology',
      city: 'Chennai',
      experienceYears: 5,
      consultationFee: 400,
      consultationStartTime: '09:00',
      consultationEndTime: '12:00',
      slotDurationMinutes: 30,
      availableSlots: [],
      averageRating: 4.5,
      totalReviews: 10,
      isActive: true,
      profileImagePath: null
    }, '09:00');

    expect(component.errorMessage()).toBe('Please select an appointment date before booking a slot.');
  });
});
