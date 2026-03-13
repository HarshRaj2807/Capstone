import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Appointment } from '../../core/models/appointment.models';
import { AuthService } from '../../core/services/auth.service';
import { AppointmentService } from '../../core/services/appointment.service';
import {
  ConfirmationDetail,
  ConfirmationPopupComponent
} from '../../shared/components/confirmation-popup.component';

interface PaymentContext {
  doctorId: number;
  doctorName: string;
  specializationName: string;
  city: string;
  consultationFee: number;
  appointmentDate: string;
  timeSlot: string;
  reasonForVisit: string;
}

@Component({
  selector: 'app-payment-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CurrencyPipe, ConfirmationPopupComponent],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">Payment</p>
          <h1>Complete the consultation fee to confirm your booking.</h1>
          <p>
            This step uses a simple checkout flow and completes the appointment only after the
            payment form is submitted.
          </p>
        </div>

        <a routerLink="/doctors" class="ghost-link">Back to Doctors</a>
      </header>

      @if (errorMessage()) {
        <div class="feedback error">{{ errorMessage() }}</div>
      }

      @if (!paymentContext()) {
        <article class="empty-state">
          <h2>No payment details were found.</h2>
          <p>Please return to the doctor search page and pick a slot again.</p>
          <a routerLink="/doctors" class="primary-link">Return to Search</a>
        </article>
      } @else {
        <div class="content-grid">
          <article class="summary-card">
            <p class="section-label">Booking Summary</p>
            <h2>{{ paymentContext()!.doctorName }}</h2>
            <p class="specialization">{{ paymentContext()!.specializationName }} - {{ paymentContext()!.city }}</p>

            <div class="summary-list">
              <div>
                <span>Appointment Date</span>
                <strong>{{ paymentContext()!.appointmentDate }}</strong>
              </div>
              <div>
                <span>Time Slot</span>
                <strong>{{ paymentContext()!.timeSlot }}</strong>
              </div>
              <div>
                <span>Booked For</span>
                <strong>{{ currentUserName() }}</strong>
              </div>
              <div>
                <span>Reason</span>
                <strong>{{ paymentForm.controls.reasonForVisit.value || 'Add a short note below' }}</strong>
              </div>
            </div>

            <div class="fee-panel">
              <span>Total Consultation Fee</span>
              <strong>{{ paymentContext()!.consultationFee | currency: 'INR':'symbol':'1.0-0' }}</strong>
            </div>
          </article>

          <article class="payment-card">
            <p class="section-label">Secure Checkout</p>
            <h2>Enter payment details</h2>

            <form [formGroup]="paymentForm" (ngSubmit)="processPayment()">
              <label>
                Cardholder Name
                <input type="text" formControlName="cardholderName" placeholder="Name as shown on card" />
              </label>

              <label>
                Card Number
                <input type="text" formControlName="cardNumber" maxlength="16" placeholder="Enter 16-digit card number" />
              </label>

              <div class="split-fields">
                <label>
                  Expiry
                  <input type="text" formControlName="expiry" maxlength="5" placeholder="MM/YY" />
                </label>

                <label>
                  CVV
                  <input type="password" formControlName="cvv" maxlength="3" placeholder="CVV" />
                </label>
              </div>

              <label>
                Reason for Visit
                <textarea
                  rows="3"
                  formControlName="reasonForVisit"
                  maxlength="500"
                  placeholder="Tell the doctor briefly what you need help with"></textarea>
              </label>

              <label>
                UPI / Billing Note
                <input type="text" formControlName="billingNote" placeholder="Optional payment reference note" />
              </label>

              <label class="checkbox">
                <input type="checkbox" formControlName="acceptTerms" />
                I confirm the consultation fee and booking details shown above.
              </label>

              <button type="submit" [disabled]="isProcessing()">
                {{ isProcessing() ? 'Processing Payment...' : 'Pay & Confirm Appointment' }}
              </button>
            </form>
          </article>
        </div>
      }

      <app-confirmation-popup
        [visible]="popupVisible()"
        [title]="'Appointment Confirmed'"
        [message]="'Your payment has been completed and the appointment has been booked successfully.'"
        [details]="popupDetails()"
        [primaryLabel]="'View Appointments'"
        [secondaryLabel]="'Book Another'"
        (primary)="goToAppointments()"
        (secondary)="goToDoctors()"
        (close)="closePopup()">
      </app-confirmation-popup>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .page-shell { display: grid; gap: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; gap: 1rem; align-items: end; padding: 1.5rem 1.75rem; border-radius: 1.75rem; background: radial-gradient(circle at top right, rgba(221, 110, 66, 0.18), transparent 28%), linear-gradient(135deg, #f8f2e8, #efe5d7); border: 1px solid rgba(15, 59, 53, 0.12); }
    .eyebrow { margin: 0 0 0.65rem; text-transform: uppercase; letter-spacing: 0.18em; font-size: 0.76rem; color: #8b4a2d; }
    h1, h2 { margin: 0; color: #122926; font-family: Georgia, 'Times New Roman', serif; }
    .page-header p:not(.eyebrow) { max-width: 46rem; margin: 0.8rem 0 0; color: #5f6058; line-height: 1.7; }
    .ghost-link, .primary-link { text-decoration: none; border-radius: 999px; padding: 0.9rem 1.2rem; font-weight: 700; }
    .ghost-link { border: 1px solid rgba(15, 59, 53, 0.16); color: #122926; background: rgba(255,255,255,0.45); }
    .primary-link { display: inline-block; background: linear-gradient(135deg, #0f3b35, #1f6f63); color: #fff; }
    .feedback { border-radius: 1rem; padding: 0.95rem 1rem; }
    .feedback.error { background: #fde8df; color: #8c2f17; }
    .empty-state, .summary-card, .payment-card { border-radius: 1.5rem; border: 1px solid rgba(15, 59, 53, 0.12); background: rgba(255,255,255,0.9); box-shadow: 0 18px 40px rgba(18,41,38,0.08); }
    .empty-state { padding: 1.6rem; }
    .empty-state p { color: #5f6058; }
    .content-grid { display: grid; grid-template-columns: 0.95fr 1.05fr; gap: 1.5rem; align-items: start; }
    .summary-card, .payment-card { padding: 1.6rem; }
    .section-label { margin: 0 0 0.65rem; text-transform: uppercase; letter-spacing: 0.16em; font-size: 0.75rem; color: #8b4a2d; }
    .specialization { margin: 0.5rem 0 1.2rem; color: #5f6058; }
    .summary-list { display: grid; gap: 0.85rem; }
    .summary-list div { display: flex; justify-content: space-between; gap: 1rem; padding: 0.9rem 1rem; border-radius: 1rem; background: #faf6ef; border: 1px solid rgba(15,59,53,0.08); }
    .summary-list span { color: #6a6d66; }
    .summary-list strong { color: #122926; text-align: right; }
    .fee-panel { margin-top: 1.2rem; display: flex; justify-content: space-between; gap: 1rem; align-items: center; border-radius: 1.2rem; padding: 1rem 1.1rem; background: linear-gradient(135deg, #0f3b35, #1f6f63); color: #fff; }
    .fee-panel strong { font-size: 1.55rem; }
    form { display: grid; gap: 1rem; }
    label { display: grid; gap: 0.4rem; color: #424740; font-weight: 600; }
    input, textarea { border-radius: 1rem; border: 1px solid #d9d1c3; padding: 0.95rem 1rem; background: #fff; font: inherit; }
    textarea { resize: vertical; min-height: 7rem; }
    .split-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
    .checkbox { display: flex; gap: 0.75rem; align-items: start; }
    .checkbox input { width: auto; margin-top: 0.2rem; }
    form button { border: none; border-radius: 1rem; padding: 1rem 1.2rem; background: linear-gradient(135deg, #0f3b35, #1f6f63); color: #fff; font-weight: 700; cursor: pointer; box-shadow: 0 18px 30px rgba(15, 59, 53, 0.18); }
    form button[disabled] { opacity: 0.75; cursor: wait; }
    @media (max-width: 980px) { .content-grid { grid-template-columns: 1fr; } .page-header { flex-direction: column; align-items: start; } .split-fields { grid-template-columns: 1fr; } }
  `]
})
export class PaymentPageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly appointmentService = inject(AppointmentService);

  readonly paymentContext = signal<PaymentContext | null>(null);
  readonly isProcessing = signal(false);
  readonly errorMessage = signal('');
  readonly popupVisible = signal(false);
  readonly bookedAppointment = signal<Appointment | null>(null);
  readonly currentUserName = computed(() => this.authService.currentUser()?.fullName ?? 'Patient');
  readonly popupDetails = computed<ConfirmationDetail[]>(() => {
    const context = this.paymentContext();
    const appointment = this.bookedAppointment();

    if (!context || !appointment) {
      return [];
    }

    return [
      { label: 'Doctor', value: context.doctorName },
      { label: 'Appointment Date', value: appointment.appointmentDate },
      { label: 'Time Slot', value: appointment.timeSlot },
      { label: 'Fee Paid', value: `INR ${context.consultationFee}` },
      { label: 'Appointment ID', value: String(appointment.appointmentId) }
    ];
  });

  readonly paymentForm = this.formBuilder.nonNullable.group({
    cardholderName: ['', [Validators.required]],
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
    reasonForVisit: ['', [Validators.required, Validators.maxLength(500)]],
    billingNote: [''],
    acceptTerms: [false, [Validators.requiredTrue]]
  });

  ngOnInit(): void {
    const queryMap = this.route.snapshot.queryParamMap;
    const doctorId = Number(queryMap.get('doctorId'));
    const consultationFee = Number(queryMap.get('consultationFee'));
    const appointmentDate = queryMap.get('appointmentDate');
    const timeSlot = queryMap.get('timeSlot');

    if (!doctorId || !consultationFee || !appointmentDate || !timeSlot) {
      this.paymentContext.set(null);
      this.errorMessage.set('The selected booking details are incomplete. Please choose a slot again.');
      return;
    }

    this.paymentContext.set({
      doctorId,
      doctorName: queryMap.get('doctorName') ?? 'Doctor',
      specializationName: queryMap.get('specializationName') ?? 'Specialist',
      city: queryMap.get('city') ?? 'City unavailable',
      consultationFee,
      appointmentDate,
      timeSlot,
      reasonForVisit: queryMap.get('reasonForVisit') ?? ''
    });

    this.paymentForm.patchValue({
      reasonForVisit: this.paymentContext()!.reasonForVisit
    });
  }

  processPayment(): void {
    if (!this.paymentContext()) {
      this.errorMessage.set('Please select a doctor and slot again before making a payment.');
      return;
    }

    if (this.paymentForm.invalid) {
      this.errorMessage.set('Please complete the payment form and add a short reason for the visit.');
      return;
    }

    const context = this.paymentContext()!;
    const formValue = this.paymentForm.getRawValue();
    this.isProcessing.set(true);
    this.errorMessage.set('');

    // A short delay makes the mocked payment step feel intentional before the booking API call.
    timer(900)
      .pipe(
        switchMap(() =>
          this.appointmentService.bookAppointment({
            doctorId: context.doctorId,
            appointmentDate: context.appointmentDate,
            timeSlot: context.timeSlot,
            reasonForVisit: formValue.reasonForVisit.trim()
          })
        )
      )
      .subscribe({
        next: (response) => {
          this.isProcessing.set(false);
          this.bookedAppointment.set(response.appointment);
          this.popupVisible.set(true);
        },
        error: (error) => {
          this.isProcessing.set(false);
          this.errorMessage.set(error.error?.message ?? 'Unable to complete the payment and booking right now.');
        }
      });
  }

  goToAppointments(): void {
    this.popupVisible.set(false);
    void this.router.navigate(['/appointments']);
  }

  goToDoctors(): void {
    this.popupVisible.set(false);
    void this.router.navigate(['/doctors']);
  }

  closePopup(): void {
    this.popupVisible.set(false);
  }
}
