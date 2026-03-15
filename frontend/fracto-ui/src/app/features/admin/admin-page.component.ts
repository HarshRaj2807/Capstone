import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AppointmentService } from '../../core/services/appointment.service';
import { DoctorService } from '../../core/services/doctor.service';
import { SpecializationService } from '../../core/services/specialization.service';
import { UserService } from '../../core/services/user.service';
import { Appointment } from '../../core/models/appointment.models';
import { Doctor, DoctorFormValue, Specialization } from '../../core/models/doctor.models';
import { UserListItem } from '../../core/models/user.models';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">Admin Console</p>
          <h1>Manage doctors, users, and appointment operations.</h1>
        </div>

        <div class="tab-switcher">
          <button [class.active]="activeTab() === 'doctors'" (click)="setTab('doctors')">Doctors</button>
          <button [class.active]="activeTab() === 'appointments'" (click)="setTab('appointments')">
            Appointments
          </button>
          <button [class.active]="activeTab() === 'users'" (click)="setTab('users')">Users</button>
        </div>
      </header>

      @if (errorMessage()) {
        <div class="feedback error">{{ errorMessage() }}</div>
      }

      @if (message()) {
        <div class="feedback success">{{ message() }}</div>
      }

      @if (activeTab() === 'doctors') {
        <div class="admin-grid">
          <article class="form-card">
            <div class="section-heading">
              <h2>{{ editingDoctorId() ? 'Edit Doctor' : 'Create Doctor' }}</h2>
              <button type="button" class="secondary" (click)="resetDoctorForm()">Clear Form</button>
            </div>

            <form [formGroup]="doctorForm" (ngSubmit)="saveDoctor()">
              <label>
                Full Name
                <input type="text" formControlName="fullName" placeholder="Enter doctor's full name" />
              </label>

              <div class="split-fields">
                <label>
                  Specialization
                  <select formControlName="specializationId">
                    <option value="">Select specialization</option>
                    @for (specialization of specializations(); track specialization.specializationId) {
                      <option [value]="specialization.specializationId">
                        {{ specialization.specializationName }}
                      </option>
                    }
                  </select>
                </label>

                <label>
                  City
                  <input type="text" formControlName="city" placeholder="Enter city" />
                </label>
              </div>

              <div class="split-fields">
                <label>
                  Experience Years
                  <input type="number" formControlName="experienceYears" />
                </label>

                <label>
                  Consultation Fee
                  <input type="number" formControlName="consultationFee" />
                </label>
              </div>

              <div class="split-fields">
                <label>
                  Start Time
                  <input type="time" formControlName="consultationStartTime" />
                </label>

                <label>
                  End Time
                  <input type="time" formControlName="consultationEndTime" />
                </label>
              </div>

              <div class="split-fields">
                <label>
                  Slot Duration (minutes)
                  <input type="number" formControlName="slotDurationMinutes" />
                </label>
              </div>

              <label class="checkbox">
                <input type="checkbox" formControlName="isActive" />
                Keep this doctor profile active
              </label>

              <button type="submit">{{ editingDoctorId() ? 'Update Doctor' : 'Create Doctor' }}</button>
            </form>
          </article>

          <article class="list-card">
            <div class="section-heading">
              <h2>Doctor Directory</h2>
              <span>{{ doctors().length }} records</span>
            </div>

            <div class="list-stack">
              @for (doctor of doctors(); track doctor.doctorId) {
                <div class="list-item">
                  <div>
                    <h3>{{ doctor.fullName }}</h3>
                    <p>{{ doctor.specializationName }} · {{ doctor.city }}</p>
                  </div>

                  <div class="item-actions">
                    <button type="button" class="secondary" (click)="editDoctor(doctor)">Edit</button>
                    <button type="button" class="danger" (click)="deleteDoctor(doctor.doctorId)">Delete</button>
                  </div>
                </div>
              }
            </div>
          </article>
        </div>
      }

      @if (activeTab() === 'appointments') {
        <article class="list-card">
          <div class="section-heading">
            <h2>Appointment Operations</h2>
            <span>{{ appointments().length }} records</span>
          </div>

          <div class="list-stack">
            @for (appointment of appointments(); track appointment.appointmentId) {
              <div class="list-item wide">
                <div>
                  <h3>{{ appointment.doctorName }} · {{ appointment.userName }}</h3>
                  <p>{{ appointment.appointmentDate }} at {{ appointment.timeSlot }}</p>
                </div>

                <div class="status-editor">
                  <select
                    [value]="getAppointmentDraft(appointment.appointmentId).status"
                    (change)="updateAppointmentDraft(appointment.appointmentId, 'status', $any($event.target).value)">
                    <option value="Booked">Booked</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  <input
                    type="text"
                    [value]="getAppointmentDraft(appointment.appointmentId).cancellationReason"
                    (input)="updateAppointmentDraft(appointment.appointmentId, 'cancellationReason', $any($event.target).value)"
                    placeholder="Cancellation reason (optional)" />

                  <div class="item-actions">
                    @if (appointment.status === 'Booked') {
                      <button type="button" class="confirm-btn" (click)="quickConfirm(appointment.appointmentId)">Confirm</button>
                    }
                    <button type="button" (click)="saveAppointmentStatus(appointment.appointmentId)">Update</button>
                  </div>
                </div>
              </div>
            }
          </div>
        </article>
      }

      @if (activeTab() === 'users') {
        <article class="list-card">
          <div class="section-heading">
            <h2>User Directory</h2>
            <span>{{ users().length }} records</span>
          </div>

          <div class="list-stack">
            @for (user of users(); track user.userId) {
              <div class="list-item">
                <div>
                  <h3>{{ user.fullName }}</h3>
                  <p>{{ user.email }} · {{ user.role }} · {{ user.city || 'No city' }}</p>
                </div>

                <button type="button" class="secondary" (click)="toggleUserStatus(user.userId)">
                  {{ user.isActive ? 'Deactivate' : 'Activate' }}
                </button>
              </div>
            }
          </div>
        </article>
      }
    </section>
  `,
  styles: [`
    :host { display: block; }
    .page-shell { display: grid; gap: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; gap: 1rem; align-items: end; padding: 1.5rem 1.75rem; border-radius: 1.75rem; background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(0, 0, 0, 0.08); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05); }
    .eyebrow { margin: 0 0 0.65rem; text-transform: uppercase; letter-spacing: 0.18em; font-size: 0.76rem; color: #86868b; }
    h1, h2, h3 { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif; font-weight: 600; color: #1d1d1f; letter-spacing: -0.01em; }
    .tab-switcher { display: flex; flex-wrap: wrap; gap: 0.6rem; }
    .tab-switcher button, .list-item button, form button, .secondary, .danger { border: none; border-radius: 1rem; padding: 0.9rem 1rem; font-weight: 600; cursor: pointer; transition: transform 0.2s ease, background 0.2s ease; }
    .tab-switcher button { background: rgba(0, 0, 0, 0.04); border: 1px solid rgba(0, 0, 0, 0.1); color: #86868b; }
    .tab-switcher button.active { background: rgba(0, 0, 0, 0.08); color: #1d1d1f; border-color: rgba(0, 0, 0, 0.2); }
    .tab-switcher button:hover:not(.active) { background: rgba(0, 0, 0, 0.06); color: #1d1d1f; }
    .feedback { border-radius: 1rem; padding: 0.95rem 1rem; }
    .feedback.error { background: #fde8df; color: #8c2f17; }
    .feedback.success { background: #e5f5ee; color: #0f6a4f; }
    .admin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; align-items: start; }
    .form-card, .list-card { border-radius: 1.5rem; border: 1px solid rgba(0, 0, 0, 0.08); background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%); box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05); padding: 1.5rem; }
    .section-heading span { color: #86868b; font-size: 0.95rem; }
    form, .list-stack { display: grid; gap: 1rem; }
    label { display: grid; gap: 0.4rem; color: #424245; font-weight: 500; font-size: 0.95rem; }
    input, select { border-radius: 1rem; border: 1px solid rgba(0, 0, 0, 0.1); padding: 0.9rem 1rem; font: inherit; background: rgba(255, 255, 255, 0.6); color: #1d1d1f; transition: border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease; }
    input:focus, select:focus { outline: none; border-color: rgba(0, 102, 204, 0.5); background: rgba(255, 255, 255, 0.9); box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1); }
    .split-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
    .checkbox { display: flex; align-items: center; gap: 0.6rem; }
    .checkbox input { width: auto; margin: 0; }
    form button { background: #1d1d1f; color: #fff; }
    form button:hover:not([disabled]) { background: #000; transform: scale(1.02); }
    .secondary { background: rgba(0, 0, 0, 0.04); color: #1d1d1f; border: 1px solid rgba(0, 0, 0, 0.1); }
    .secondary:hover { background: rgba(0, 0, 0, 0.08); }
    .danger { background: rgba(255, 69, 58, 0.1); color: #d70015; border: 1px solid rgba(255, 69, 58, 0.2); }
    .danger:hover { background: rgba(255, 69, 58, 0.15); }
    .list-item { display: flex; justify-content: space-between; gap: 1rem; align-items: center; padding: 1rem 1.1rem; border-radius: 1.1rem; background: rgba(0, 0, 0, 0.03); border: 1px solid rgba(0, 0, 0, 0.06); }
    .list-item p { margin: 0.35rem 0 0; color: #86868b; font-size: 0.9rem; }
    .item-actions, .status-editor { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; }
    .status-editor { width: min(100%, 32rem); justify-content: end; }
    .status-editor input, .status-editor select { min-width: 11rem; }
    .status-editor button { background: rgba(0, 0, 0, 0.04); color: #1d1d1f; border: 1px solid rgba(0, 0, 0, 0.1); }
    .status-editor button:hover { background: rgba(0, 0, 0, 0.08); transform: scale(1.02); }
    .status-editor .confirm-btn { background: #1d1d1f; color: #fff; border: none; }
    .status-editor .confirm-btn:hover { background: #000; }
    .wide { align-items: start; }
    @media (max-width: 1080px) { .admin-grid { grid-template-columns: 1fr; } }
    @media (max-width: 860px) { .page-header, .list-item, .split-fields { grid-template-columns: 1fr; display: grid; } .status-editor { justify-content: stretch; width: 100%; } }
  `]
})
export class AdminPageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly doctorService = inject(DoctorService);
  private readonly userService = inject(UserService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly specializationService = inject(SpecializationService);

  readonly activeTab = signal<'doctors' | 'appointments' | 'users'>('doctors');
  readonly doctors = signal<Doctor[]>([]);
  readonly users = signal<UserListItem[]>([]);
  readonly appointments = signal<Appointment[]>([]);
  readonly specializations = signal<Specialization[]>([]);
  readonly editingDoctorId = signal<number | null>(null);
  readonly errorMessage = signal('');
  readonly message = signal('');
  readonly appointmentDrafts = signal<Record<number, { status: string; cancellationReason: string }>>({});

  readonly doctorForm = this.formBuilder.nonNullable.group({
    fullName: ['', Validators.required],
    specializationId: ['', Validators.required],
    city: ['', Validators.required],
    experienceYears: ['', Validators.required],
    consultationFee: ['', Validators.required],
    consultationStartTime: ['', Validators.required],
    consultationEndTime: ['', Validators.required],
    slotDurationMinutes: ['', Validators.required],
    isActive: [true]
  });

  ngOnInit(): void {
    this.loadDashboard();
  }

  setTab(tab: 'doctors' | 'appointments' | 'users'): void {
    this.activeTab.set(tab);
  }

  loadDashboard(): void {
    this.errorMessage.set('');

    forkJoin({
      doctors: this.doctorService.retrieveAllDoctors(1, 50),
      users: this.userService.retrieveRegisteredUsers(),
      appointments: this.appointmentService.fetchAppointments(),
      specializations: this.specializationService.retrieveMedicalSpecialties()
    }).subscribe({
      next: ({ doctors, users, appointments, specializations }: any) => {
        this.doctors.set(doctors.items);
        this.users.set(users.items);
        this.appointments.set(appointments.items);
        this.specializations.set(specializations);
        this.initializeAppointmentDrafts(appointments.items);
      },
      error: (error: any) =>
        this.errorMessage.set(error.error?.message ?? 'Unable to load the admin dashboard right now.')
    });
  }

  editDoctor(doctor: Doctor): void {
    this.editingDoctorId.set(doctor.doctorId);
    this.doctorForm.setValue({
      fullName: doctor.fullName,
      specializationId: String(doctor.specializationId),
      city: doctor.city,
      experienceYears: String(doctor.experienceYears),
      consultationFee: String(doctor.consultationFee),
      consultationStartTime: doctor.consultationStartTime,
      consultationEndTime: doctor.consultationEndTime,
      slotDurationMinutes: String(doctor.slotDurationMinutes),
      isActive: true
    });
  }

  resetDoctorForm(): void {
    this.editingDoctorId.set(null);
    this.doctorForm.setValue({
      fullName: '',
      specializationId: '',
      city: '',
      experienceYears: '',
      consultationFee: '',
      consultationStartTime: '',
      consultationEndTime: '',
      slotDurationMinutes: '',
      isActive: true
    });
  }

  saveDoctor(): void {
    if (this.doctorForm.invalid) {
      this.errorMessage.set('Please complete the doctor form before saving.');
      return;
    }

    const rawValue = this.doctorForm.getRawValue();
    const payload: DoctorFormValue = {
      fullName: rawValue.fullName,
      specializationId: Number(rawValue.specializationId),
      city: rawValue.city,
      experienceYears: Number(rawValue.experienceYears),
      consultationFee: Number(rawValue.consultationFee),
      consultationStartTime: rawValue.consultationStartTime,
      consultationEndTime: rawValue.consultationEndTime,
      slotDurationMinutes: Number(rawValue.slotDurationMinutes),
      isActive: rawValue.isActive
    };

    const request$ = this.editingDoctorId()
      ? this.doctorService.modifyDoctorDetails(this.editingDoctorId()!, payload)
      : this.doctorService.addNewDoctorRecord(payload);

    request$.subscribe({
      next: () => {
        this.message.set(this.editingDoctorId() ? 'Doctor updated successfully.' : 'Doctor created successfully.');
        this.resetDoctorForm();
        this.loadDashboard();
      },
      error: (error: any) =>
        this.errorMessage.set(error.error?.message ?? 'Unable to save the doctor profile right now.')
    });
  }

  deleteDoctor(doctorId: number): void {
    if (!window.confirm('Delete this doctor profile from the active directory?')) {
      return;
    }

    this.doctorService.removeDoctorProfile(doctorId).subscribe({
      next: (response: { message: string }) => {
        this.message.set(response.message);
        this.loadDashboard();
      },
      error: (error: any) =>
        this.errorMessage.set(error.error?.message ?? 'Unable to delete the doctor right now.')
    });
  }

  getAppointmentDraft(appointmentId: number): { status: string; cancellationReason: string } {
    return this.appointmentDrafts()[appointmentId] ?? { status: 'Booked', cancellationReason: '' };
  }

  updateAppointmentDraft(
    appointmentId: number,
    field: 'status' | 'cancellationReason',
    value: string
  ): void {
    const current = this.getAppointmentDraft(appointmentId);
    this.appointmentDrafts.set({
      ...this.appointmentDrafts(),
      [appointmentId]: {
        ...current,
        [field]: value
      }
    });
  }

  saveAppointmentStatus(appointmentId: number): void {
    const draft = this.getAppointmentDraft(appointmentId);

    this.appointmentService
      .updateAppointmentStatus(appointmentId, {
        status: draft.status,
        cancellationReason: draft.cancellationReason || null
      })
      .subscribe({
        next: () => {
          this.message.set('Appointment status updated successfully.');
          this.loadDashboard();
        },
        error: (error) =>
          this.errorMessage.set(error.error?.message ?? 'Unable to update the appointment status.')
      });
  }

  quickConfirm(appointmentId: number): void {
    this.appointmentService
      .updateAppointmentStatus(appointmentId, {
        status: 'Confirmed'
      })
      .subscribe({
        next: () => {
          this.message.set('Appointment confirmed successfully.');
          this.loadDashboard();
        },
        error: (error) =>
          this.errorMessage.set(error.error?.message ?? 'Unable to confirm the appointment.')
      });
  }

  toggleUserStatus(userId: number): void {
    this.userService.updateUserAccountStatus(userId).subscribe({
      next: (response) => {
        this.message.set(response.message);
        this.loadDashboard();
      },
      error: (error) =>
        this.errorMessage.set(error.error?.message ?? 'Unable to update the user status.')
    });
  }

  private initializeAppointmentDrafts(appointments: Appointment[]): void {
    this.appointmentDrafts.set(
      appointments.reduce<Record<number, { status: string; cancellationReason: string }>>(
        (drafts, appointment) => {
          drafts[appointment.appointmentId] = {
            status: appointment.status,
            cancellationReason: appointment.cancellationReason ?? ''
          };
          return drafts;
        },
        {}
      )
    );
  }
}
