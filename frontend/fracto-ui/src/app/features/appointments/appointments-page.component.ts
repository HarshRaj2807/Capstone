import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AppointmentService } from '../../core/services/appointment.service';
import { RatingService } from '../../core/services/rating.service';
import { Appointment } from '../../core/models/appointment.models';
import {
  ConfirmationDetail,
  ConfirmationPopupComponent
} from '../../shared/components/confirmation-popup.component';

@Component({
  selector: 'app-appointments-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmationPopupComponent],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">Appointments</p>
          <h1>Track bookings, cancellations, and completed visits.</h1>
        </div>

        <form class="status-filter" [formGroup]="filterForm">
          <select formControlName="status" (change)="loadAppointments()">
            <option value="">All statuses</option>
            <option value="Booked">Booked</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </form>
      </header>

      @if (errorMessage()) {
        <div class="feedback error">{{ errorMessage() }}</div>
      }

      @if (message()) {
        <div class="feedback success">{{ message() }}</div>
      }

      <div class="appointments-grid">
        @if (appointments().length === 0) {
          <article class="empty-state">
            <h3>No appointments found.</h3>
            <p>Book a consultation first or adjust the selected status filter.</p>
          </article>
        }

        @for (appointment of appointments(); track appointment.appointmentId) {
          <article class="appointment-card">
            <div class="card-header">
              <div>
                <p class="meta-label">Doctor</p>
                <h3>{{ appointment.doctorName }}</h3>
              </div>
              <span class="status-chip" [attr.data-status]="appointment.status.toLowerCase()">
                {{ appointment.status }}
              </span>
            </div>

            <div class="details-grid">
              <span><strong>Date:</strong> {{ appointment.appointmentDate }}</span>
              <span><strong>Time:</strong> {{ appointment.timeSlot }}</span>
              <span><strong>Booked For:</strong> {{ appointment.userName }}</span>
              <span><strong>Reason:</strong> {{ appointment.reasonForVisit || 'No reason added' }}</span>
            </div>

            @if (appointment.cancellationReason) {
              <p class="note">
                <strong>Cancellation reason:</strong> {{ appointment.cancellationReason }}
              </p>
            }

            <div class="card-actions">
              @if (appointment.status !== 'Cancelled') {
                <button type="button" class="secondary" (click)="cancelAppointment(appointment)">
                  Cancel Appointment
                </button>
              }
            </div>

            @if (appointment.canRate) {
              <div class="rating-panel">
                <h4>Rate this consultation</h4>
                <div class="rating-fields">
                  <label>
                    Rating
                    <select
                      [value]="getDraft(appointment.appointmentId).ratingValue"
                      (change)="updateRatingValue(appointment.appointmentId, $any($event.target).value)">
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Good</option>
                      <option value="3">3 - Average</option>
                      <option value="2">2 - Poor</option>
                      <option value="1">1 - Very Poor</option>
                    </select>
                  </label>

                  <label class="full-width">
                    Review
                    <textarea
                      rows="3"
                      [value]="getDraft(appointment.appointmentId).reviewComment"
                      (input)="updateReviewComment(appointment.appointmentId, $any($event.target).value)"
                      placeholder="Share how the consultation went"></textarea>
                  </label>
                </div>

                <button type="button" (click)="submitRating(appointment)">Submit Rating</button>
              </div>
            }
          </article>
        }
      </div>

      <app-confirmation-popup
        [visible]="popupVisible()"
        [title]="popupTitle()"
        [message]="popupMessage()"
        [details]="popupDetails()"
        [primaryLabel]="'Close'"
        (primary)="closePopup()"
        (close)="closePopup()">
      </app-confirmation-popup>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .page-shell { display: grid; gap: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; gap: 1rem; align-items: end; padding: 1.5rem 1.75rem; border-radius: 1.75rem; background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(0, 0, 0, 0.08); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05); }
    .eyebrow { margin: 0 0 0.65rem; text-transform: uppercase; letter-spacing: 0.18em; font-size: 0.76rem; color: #86868b; }
    h1, h3, h4 { margin: 0; color: #1d1d1f; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif; font-weight: 600; letter-spacing: -0.01em; }
    .status-filter { display: flex; gap: 0.75rem; align-items: center; }
    .status-filter select, .rating-panel select, .rating-panel button, textarea { font: inherit; }
    .status-filter select, .rating-panel select, textarea { border-radius: 1rem; border: 1px solid rgba(0, 0, 0, 0.1); padding: 0.9rem 1rem; background: rgba(255, 255, 255, 0.6); color: #1d1d1f; transition: border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease; }
    textarea { box-sizing: border-box; width: 100%; }
    .status-filter select:focus, .rating-panel select:focus, textarea:focus { outline: none; border-color: rgba(0, 102, 204, 0.5); background: rgba(255, 255, 255, 0.9); box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1); }
    .card-actions button, .rating-panel button { border: none; border-radius: 1rem; padding: 0.95rem 1rem; background: #1d1d1f; color: #fff; font-weight: 600; cursor: pointer; transition: transform 0.2s ease, background 0.2s ease; }
    .card-actions button:hover:not([disabled]), .rating-panel button:hover:not([disabled]) { transform: scale(1.02); background: #000; }
    .card-actions button.secondary { background: rgba(0, 0, 0, 0.04); color: #1d1d1f; border: 1px solid rgba(0, 0, 0, 0.1); }
    .feedback { border-radius: 1rem; padding: 0.95rem 1rem; }
    .feedback.error { background: #fde8df; color: #8c2f17; }
    .feedback.success { background: #e5f5ee; color: #0f6a4f; }
    .appointments-grid { display: grid; gap: 1rem; }
    .appointment-card, .empty-state { border-radius: 1.5rem; border: 1px solid rgba(0, 0, 0, 0.08); background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%); box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05); padding: 1.5rem; }
    .card-header { display: flex; justify-content: space-between; gap: 1rem; align-items: start; }
    .meta-label { margin: 0 0 0.35rem; text-transform: uppercase; letter-spacing: 0.12em; color: #86868b; font-size: 0.76rem; font-weight: 600; }
    .status-chip { border-radius: 999px; padding: 0.55rem 0.8rem; font-weight: 600; background: rgba(0, 0, 0, 0.04); border: 1px solid rgba(0, 0, 0, 0.08); color: #1d1d1f; font-size: 0.85rem; }
    .status-chip[data-status='completed'] { background: rgba(15, 106, 79, 0.3); color: #e5f5ee; border-color: rgba(15, 106, 79, 0.5); }
    .status-chip[data-status='cancelled'] { background: rgba(140, 47, 23, 0.3); color: #fde8df; border-color: rgba(140, 47, 23, 0.5); }
    .details-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.7rem 1rem; margin: 1rem 0; color: #424245; font-size: 0.95rem; }
    .details-grid strong { color: #1d1d1f; font-weight: 500; }
    .note { margin: 0 0 1rem; color: #424245; font-size: 0.95rem; }
    .note strong { color: #1d1d1f; font-weight: 500; }
    .card-actions { display: flex; justify-content: flex-end; }
    .rating-panel { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(0, 0, 0, 0.08); display: grid; gap: 1rem; }
    .rating-fields { display: grid; grid-template-columns: 14rem 1fr; gap: 1rem; }
    label { display: grid; gap: 0.4rem; color: #424245; font-weight: 500; font-size: 0.95rem; }
    .full-width { grid-column: 1 / -1; }
    @media (max-width: 860px) { .page-header, .card-header, .status-filter, .details-grid, .rating-fields { grid-template-columns: 1fr; display: grid; } .card-actions { justify-content: stretch; } }
  `]
})
export class AppointmentsPageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly appointmentService = inject(AppointmentService);
  private readonly ratingService = inject(RatingService);

  readonly appointments = signal<Appointment[]>([]);
  readonly errorMessage = signal('');
  readonly message = signal('');
  readonly ratingDrafts = signal<Record<number, { ratingValue: number; reviewComment: string }>>({});
  readonly popupVisible = signal(false);
  readonly popupTitle = signal('');
  readonly popupMessage = signal('');
  readonly popupDetails = signal<ConfirmationDetail[]>([]);

  readonly filterForm = this.formBuilder.nonNullable.group({
    status: ['']
  });

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.errorMessage.set('');
    this.message.set('');

    this.appointmentService.getAppointments(this.filterForm.getRawValue().status || undefined).subscribe({
      next: (response) => this.appointments.set(response.items),
      error: (error) =>
        this.errorMessage.set(error.error?.message ?? 'Unable to load appointments right now.')
    });
  }

  cancelAppointment(appointment: Appointment): void {
    const reason = window.prompt('Optional cancellation reason', '') ?? '';

    this.appointmentService.cancelAppointment(appointment.appointmentId, reason || undefined).subscribe({
      next: (response) => {
        this.message.set(response.message);
        this.openPopup('Appointment Cancelled', response.message, [
          { label: 'Doctor', value: appointment.doctorName },
          { label: 'Date', value: appointment.appointmentDate },
          { label: 'Time', value: appointment.timeSlot }
        ]);
        this.loadAppointments();
      },
      error: (error) =>
        this.errorMessage.set(error.error?.message ?? 'Unable to cancel the appointment right now.')
    });
  }

  getDraft(appointmentId: number): { ratingValue: number; reviewComment: string } {
    return this.ratingDrafts()[appointmentId] ?? { ratingValue: 5, reviewComment: '' };
  }

  updateRatingValue(appointmentId: number, value: string): void {
    const current = this.getDraft(appointmentId);
    this.ratingDrafts.set({
      ...this.ratingDrafts(),
      [appointmentId]: {
        ...current,
        ratingValue: Number(value)
      }
    });
  }

  updateReviewComment(appointmentId: number, value: string): void {
    const current = this.getDraft(appointmentId);
    this.ratingDrafts.set({
      ...this.ratingDrafts(),
      [appointmentId]: {
        ...current,
        reviewComment: value
      }
    });
  }

  submitRating(appointment: Appointment): void {
    const draft = this.getDraft(appointment.appointmentId);

    this.ratingService
      .createRating({
        appointmentId: appointment.appointmentId,
        doctorId: appointment.doctorId,
        ratingValue: draft.ratingValue,
        reviewComment: draft.reviewComment
      })
      .subscribe({
        next: (response) => {
          this.message.set(response.message);
          this.openPopup('Rating Submitted', response.message, [
            { label: 'Doctor', value: appointment.doctorName },
            { label: 'Rating', value: `${draft.ratingValue} / 5` }
          ]);
          this.loadAppointments();
        },
        error: (error) =>
          this.errorMessage.set(error.error?.message ?? 'Unable to submit the rating right now.')
      });
  }

  closePopup(): void {
    this.popupVisible.set(false);
  }

  private openPopup(title: string, message: string, details: ConfirmationDetail[] = []): void {
    this.popupTitle.set(title);
    this.popupMessage.set(message);
    this.popupDetails.set(details);
    this.popupVisible.set(true);
  }
}
