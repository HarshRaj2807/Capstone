import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdminPageComponent } from './admin-page.component';
import { AppointmentService } from '../../core/services/appointment.service';
import { DoctorService } from '../../core/services/doctor.service';
import { SpecializationService } from '../../core/services/specialization.service';
import { UserService } from '../../core/services/user.service';

describe('AdminPageComponent', () => {
  const doctorServiceStub = {
    retrieveAllDoctors: jasmine.createSpy().and.returnValue(of({ items: [
      {
        doctorId: 1,
        fullName: 'Dr. Dev',
        specializationId: 1,
        specializationName: 'Cardiology',
        city: 'Chennai',
        experienceYears: 10,
        consultationFee: 500,
        consultationStartTime: '09:00',
        consultationEndTime: '12:00',
        slotDurationMinutes: 30,
        isActive: true,
        availableSlots: [],
        averageRating: 4.5,
        totalReviews: 10,
        profileImagePath: null
      }
    ] })),
    addNewDoctorRecord: jasmine.createSpy().and.returnValue(of({})),
    modifyDoctorDetails: jasmine.createSpy().and.returnValue(of({})),
    removeDoctorProfile: jasmine.createSpy().and.returnValue(of({ message: 'deleted' }))
  };

  const userServiceStub = {
    retrieveRegisteredUsers: jasmine.createSpy().and.returnValue(of({ items: [
      { userId: 1, fullName: 'User One', email: 'user@fracto.com', role: 'User', city: 'Pune', isActive: true }
    ] })),
    getUserById: jasmine.createSpy().and.returnValue(of({
      userId: 1,
      firstName: 'User',
      lastName: 'One',
      email: 'user@fracto.com',
      role: 'User',
      phoneNumber: null,
      city: 'Pune',
      isActive: true
    })),
    createUser: jasmine.createSpy().and.returnValue(of({})),
    updateUser: jasmine.createSpy().and.returnValue(of({})),
    updateUserAccountStatus: jasmine.createSpy().and.returnValue(of({ message: 'ok' }))
  };

  const appointmentServiceStub = {
    fetchAppointments: jasmine.createSpy().and.returnValue(of({ items: [
      {
        appointmentId: 1,
        doctorId: 1,
        doctorName: 'Dr. Dev',
        userId: 1,
        userName: 'User One',
        appointmentDate: '2099-01-01',
        timeSlot: '09:00',
        status: 'Booked',
        reasonForVisit: null,
        cancellationReason: null,
        canRate: false
      }
    ] })),
    updateAppointmentStatus: jasmine.createSpy().and.returnValue(of({}))
  };

  const specializationServiceStub = {
    retrieveMedicalSpecialties: jasmine.createSpy().and.returnValue(of([
      { specializationId: 1, specializationName: 'Cardiology', description: null }
    ])),
    createSpecialization: jasmine.createSpy().and.returnValue(of({})),
    updateSpecialization: jasmine.createSpy().and.returnValue(of({})),
    deleteSpecialization: jasmine.createSpy().and.returnValue(of({ message: 'ok' }))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPageComponent],
      providers: [
        { provide: DoctorService, useValue: doctorServiceStub },
        { provide: UserService, useValue: userServiceStub },
        { provide: AppointmentService, useValue: appointmentServiceStub },
        { provide: SpecializationService, useValue: specializationServiceStub }
      ]
    }).compileComponents();
  });

  it('loads dashboard data on init', () => {
    const fixture = TestBed.createComponent(AdminPageComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.doctors().length).toBe(1);
    expect(component.users().length).toBe(1);
    expect(component.appointments().length).toBe(1);
    expect(component.specializations().length).toBe(1);
  });

  it('creates a new doctor when form is valid and not editing', () => {
    const fixture = TestBed.createComponent(AdminPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.doctorForm.setValue({
      fullName: 'Dr. Test',
      specializationId: '1',
      city: 'Chennai',
      experienceYears: '5',
      consultationFee: '500',
      consultationStartTime: '09:00',
      consultationEndTime: '12:00',
      slotDurationMinutes: '30',
      isActive: true
    });

    component.saveDoctor();

    expect(doctorServiceStub.addNewDoctorRecord).toHaveBeenCalled();
  });

  it('requires a password when creating a new user', () => {
    const fixture = TestBed.createComponent(AdminPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.userForm.setValue({
      firstName: 'New',
      lastName: 'User',
      email: 'new@example.com',
      role: 'User',
      phoneNumber: '',
      city: '',
      password: '',
      isActive: true
    });

    component.saveUser();

    expect(component.errorMessage()).toBe('Password is required when creating a new user.');
    expect(userServiceStub.createUser).not.toHaveBeenCalled();
  });
});
