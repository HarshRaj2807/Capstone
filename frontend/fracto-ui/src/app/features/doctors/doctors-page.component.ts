import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DoctorService } from '../../core/services/doctor.service';
import { SpecializationService } from '../../core/services/specialization.service';
import { Doctor, Specialization } from '../../core/models/doctor.models';

@Component({
  selector: 'app-doctors-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CurrencyPipe, DecimalPipe],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">Doctor Discovery</p>
          <h1>Find the right doctor and secure the right slot.</h1>
          <p>
            Search by city, specialization, and rating, then continue to the payment screen to
            confirm the booking.
          </p>
        </div>

        <div class="header-actions">
          <a routerLink="/appointments" class="ghost-link">View Appointments</a>
          @if (isAdmin()) {
            <a routerLink="/admin" class="ghost-link accent">Open Admin Console</a>
          }
        </div>
      </header>

      @if (errorMessage()) {
        <div class="feedback error">{{ errorMessage() }}</div>
      }

      @if (message()) {
        <div class="feedback success">{{ message() }}</div>
      }

      <div class="content-grid">
        <aside class="filters-card">
          <form [formGroup]="searchForm" (ngSubmit)="searchDoctors()">
            <h2>Search Filters</h2>

            <label>
              City
              <input type="text" formControlName="city" placeholder="Bengaluru" />
            </label>

            <label>
              Specialization
              <select formControlName="specializationId">
                <option value="">All specializations</option>
                @for (specialization of specializations(); track specialization.specializationId) {
                  <option [value]="specialization.specializationId">
                    {{ specialization.specializationName }}
                  </option>
                }
              </select>
            </label>

            <label>
              Minimum Rating
              <select formControlName="minRating">
                <option value="">Any rating</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="4.5">4.5+</option>
              </select>
            </label>

            <label>
              Appointment Date
              <input type="date" formControlName="appointmentDate" />
            </label>

            <div class="filter-actions">
              <button type="submit" [disabled]="loading()">
                {{ loading() ? 'Searching...' : 'Search Doctors' }}
              </button>
              <button type="button" class="secondary" (click)="resetFilters()">Reset</button>
            </div>
          </form>
        </aside>

        <div class="results-grid">
          @if (!loading() && doctors().length === 0) {
            <article class="empty-state">
              <h3>No doctors matched your filters.</h3>
              <p>Try changing the city, specialization, rating, or appointment date.</p>
            </article>
          }

          @for (doctor of doctors(); track doctor.doctorId) {
            <article class="doctor-card">
              <div class="card-top">
                <div>
                  <p class="specialization">{{ doctor.specializationName }}</p>
                  <h3>{{ doctor.fullName }}</h3>
                </div>
                <span class="rating-chip">{{ doctor.averageRating | number: '1.1-1' }} / 5</span>
              </div>

              <div class="meta-grid">
                <span>{{ doctor.city }}</span>
                <span>{{ doctor.experienceYears }} years experience</span>
                <span>{{ doctor.consultationFee | currency: 'INR':'symbol':'1.0-0' }}</span>
                <span>{{ doctor.totalReviews }} reviews</span>
              </div>

              <p class="schedule">
                Consulting hours: {{ doctor.consultationStartTime }} - {{ doctor.consultationEndTime }}
              </p>

              <div class="slots-block">
                <div class="slots-heading">
                  <strong>Available slots</strong>
                  <span>{{ doctor.availableSlots.length }} open</span>
                </div>

                @if (doctor.availableSlots.length === 0) {
                  <p class="empty-slots">
                    Add a date and search again to see live slot availability for this doctor.
                  </p>
                } @else {
                  <div class="slots-grid">
                    @for (slot of doctor.availableSlots; track slot) {
                      <button
                        type="button"
                        [disabled]="bookingDoctorId() === doctor.doctorId"
                        (click)="bookSlot(doctor, slot)">
                        {{ slot }}
                      </button>
                    }
                  </div>
                }
              </div>
            </article>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }

    .page-shell {
      display: grid;
      gap: 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: end;
      padding: 1.5rem 1.75rem;
      border-radius: 1.75rem;
      background:
        radial-gradient(circle at top right, rgba(221, 110, 66, 0.18), transparent 28%),
        linear-gradient(135deg, #f8f2e8, #efe5d7);
      border: 1px solid rgba(15, 59, 53, 0.12);
    }

    .eyebrow {
      margin: 0 0 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      font-size: 0.76rem;
      color: #8b4a2d;
    }

    h1 {
      margin: 0;
      font-size: clamp(2rem, 4vw, 3.2rem);
      font-family: Georgia, 'Times New Roman', serif;
      color: #122926;
    }

    .page-header p:not(.eyebrow) {
      max-width: 44rem;
      margin: 0.8rem 0 0;
      color: #5f6058;
      line-height: 1.7;
    }

    .header-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .ghost-link {
      text-decoration: none;
      border-radius: 999px;
      padding: 0.9rem 1.2rem;
      border: 1px solid rgba(15, 59, 53, 0.16);
      color: #122926;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.45);
    }

    .ghost-link.accent {
      background: #0f3b35;
      color: #fff;
    }

    .feedback {
      border-radius: 1rem;
      padding: 0.95rem 1rem;
    }

    .feedback.error {
      background: #fde8df;
      color: #8c2f17;
    }

    .feedback.success {
      background: #e5f5ee;
      color: #0f6a4f;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 20rem 1fr;
      gap: 1.5rem;
      align-items: start;
    }

    .filters-card,
    .doctor-card,
    .empty-state {
      border-radius: 1.5rem;
      border: 1px solid rgba(15, 59, 53, 0.12);
      background: rgba(255, 255, 255, 0.88);
      box-shadow: 0 18px 40px rgba(18, 41, 38, 0.08);
    }

    .filters-card {
      position: sticky;
      top: 1.5rem;
      padding: 1.5rem;
    }

    form {
      display: grid;
      gap: 1rem;
    }

    form h2 {
      margin: 0;
      font-family: Georgia, 'Times New Roman', serif;
      color: #122926;
    }

    label {
      display: grid;
      gap: 0.4rem;
      color: #424740;
      font-weight: 600;
    }

    input,
    select {
      border-radius: 1rem;
      border: 1px solid #d9d1c3;
      padding: 0.9rem 1rem;
      background: #fff;
      font: inherit;
    }

    .filter-actions {
      display: grid;
      gap: 0.8rem;
    }

    .filter-actions button,
    .slots-grid button {
      border: none;
      border-radius: 1rem;
      padding: 0.95rem 1rem;
      cursor: pointer;
      font-weight: 700;
    }

    .filter-actions button {
      background: linear-gradient(135deg, #0f3b35, #1f6f63);
      color: #fff;
    }

    .filter-actions button.secondary {
      background: #efe5d7;
      color: #122926;
    }

    .results-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1.25rem;
    }

    .doctor-card,
    .empty-state {
      padding: 1.4rem;
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: start;
    }

    .specialization {
      margin: 0;
      color: #8b4a2d;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      font-size: 0.75rem;
    }

    .doctor-card h3,
    .empty-state h3 {
      margin: 0.35rem 0 0;
      font-size: 1.4rem;
      color: #122926;
      font-family: Georgia, 'Times New Roman', serif;
    }

    .rating-chip {
      white-space: nowrap;
      border-radius: 999px;
      padding: 0.55rem 0.8rem;
      background: #efe5d7;
      color: #122926;
      font-weight: 700;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.65rem;
      margin: 1rem 0;
      color: #5f6058;
    }

    .schedule {
      margin: 0 0 1rem;
      color: #38403a;
      font-weight: 600;
    }

    .slots-block {
      padding-top: 1rem;
      border-top: 1px solid rgba(15, 59, 53, 0.08);
    }

    .slots-heading {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 0.85rem;
      color: #122926;
    }

    .slots-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
    }

    .slots-grid button {
      background: #e5f5ee;
      color: #0f6a4f;
    }

    .slots-grid button:hover {
      background: #0f6a4f;
      color: #fff;
    }

    .empty-slots {
      margin: 0;
      color: #6a6d66;
      line-height: 1.6;
    }

    @media (max-width: 1100px) {
      .content-grid {
        grid-template-columns: 1fr;
      }

      .filters-card {
        position: static;
      }
    }

    @media (max-width: 860px) {
      .page-header,
      .card-top {
        flex-direction: column;
      }

      .results-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DoctorsPageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly doctorService = inject(DoctorService);
  private readonly specializationService = inject(SpecializationService);
  private readonly authService = inject(AuthService);

  readonly doctors = signal<Doctor[]>([]);
  readonly specializations = signal<Specialization[]>([]);
  readonly loading = signal(false);
  readonly bookingDoctorId = signal<number | null>(null);
  readonly errorMessage = signal('');
  readonly message = signal('');
  readonly isAdmin = this.authService.isAdmin;

  readonly searchForm = this.formBuilder.nonNullable.group({
    city: ['Bengaluru'],
    specializationId: [''],
    minRating: [''],
    appointmentDate: [this.getTomorrowDate()]
  });

  ngOnInit(): void {
    this.loadSpecializations();
    this.searchDoctors();
  }

  loadSpecializations(): void {
    this.specializationService.getSpecializations().subscribe({
      next: (items) => this.specializations.set(items),
      error: (error) =>
        this.errorMessage.set(error.error?.message ?? 'Unable to load specializations.')
    });
  }

  searchDoctors(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.message.set('');

    const filters = this.searchForm.getRawValue();
    this.doctorService
      .searchDoctors({
        city: filters.city || undefined,
        specializationId: filters.specializationId ? Number(filters.specializationId) : undefined,
        minRating: filters.minRating ? Number(filters.minRating) : undefined,
        appointmentDate: filters.appointmentDate || undefined,
        pageNumber: 1,
        pageSize: 12
      })
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          this.doctors.set(response.items);
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(error.error?.message ?? 'Unable to search doctors right now.');
        }
      });
  }

  resetFilters(): void {
    this.searchForm.setValue({
      city: 'Bengaluru',
      specializationId: '',
      minRating: '',
      appointmentDate: this.getTomorrowDate()
    });

    this.searchDoctors();
  }

  async bookSlot(doctor: Doctor, slot: string): Promise<void> {
    if (this.authService.isAdmin()) {
      this.errorMessage.set('Use the demo user account to book appointments from the patient journey.');
      return;
    }

    const appointmentDate = this.searchForm.getRawValue().appointmentDate;
    if (!appointmentDate) {
      this.errorMessage.set('Please select an appointment date before booking a slot.');
      return;
    }

    this.bookingDoctorId.set(doctor.doctorId);
    this.errorMessage.set('');

    await this.router.navigate(['/payment'], {
      queryParams: {
        doctorId: doctor.doctorId,
        doctorName: doctor.fullName,
        specializationName: doctor.specializationName,
        city: doctor.city,
        consultationFee: doctor.consultationFee,
        appointmentDate,
        timeSlot: slot,
        reasonForVisit: `Consultation request for ${doctor.specializationName}`
      }
    });

    this.bookingDoctorId.set(null);
  }

  private getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  }
}
