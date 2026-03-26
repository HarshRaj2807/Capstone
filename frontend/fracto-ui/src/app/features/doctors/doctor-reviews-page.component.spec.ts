import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DoctorReviewsPageComponent } from './doctor-reviews-page.component';
import { DoctorService } from '../../core/services/doctor.service';

describe('DoctorReviewsPageComponent', () => {
  it('loads ratings and doctor name when id is valid', async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorReviewsPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
        {
          provide: DoctorService,
          useValue: {
            fetchRatingsByDoctorId: () => of({
              averageRating: 4.5,
              totalReviews: 2,
              items: [
                { ratingId: 1, userName: 'User A', ratingValue: 5, reviewComment: 'Great', createdAtUtc: '2099-01-01T00:00:00Z' }
              ]
            }),
            fetchSingleDoctorDetails: () => of({
              doctorId: 1,
              fullName: 'Dr. Tester',
              specializationId: 1,
              specializationName: 'Cardiology',
              city: 'Chennai',
              experienceYears: 8,
              consultationFee: 500,
              consultationStartTime: '09:00',
              consultationEndTime: '12:00',
              slotDurationMinutes: 30,
              averageRating: 4.5,
              totalReviews: 2,
              availableSlots: [],
              isActive: true,
              profileImagePath: null
            })
          }
        }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(DoctorReviewsPageComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.loading()).toBeFalse();
    expect(component.doctorName()).toBe('Dr. Tester');
  });

  it('shows an error when id is missing', async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorReviewsPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '0' }) } } },
        {
          provide: DoctorService,
          useValue: {
            fetchRatingsByDoctorId: () => throwError(() => new Error('fail')),
            fetchSingleDoctorDetails: () => of({} as any)
          }
        }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(DoctorReviewsPageComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.errorMessage()).toBe('Invalid doctor identifier.');
  });
});
