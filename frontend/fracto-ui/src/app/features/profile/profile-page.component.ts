import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">Profile</p>
          <h1>Manage your account details and security.</h1>
        </div>
      </header>

      @if (errorMessage()) {
        <div class="feedback error">{{ errorMessage() }}</div>
      }

      @if (successMessage()) {
        <div class="feedback success">{{ successMessage() }}</div>
      }

      <div class="profile-grid">
        <article class="profile-card">
          <div class="avatar-block">
            <div class="avatar">
              @if (authService.currentUser()?.profileImagePath) {
                <img [src]="authService.currentUser()?.profileImagePath" alt="Profile photo" />
              } @else {
                <span>{{ initials() }}</span>
              }
            </div>
            <div>
              <h2>{{ authService.currentUser()?.fullName }}</h2>
              <p>{{ authService.currentUser()?.email }}</p>
            </div>
          </div>

          <label class="upload">
            Update profile photo
            <input type="file" accept="image/*" (change)="uploadPhoto($event)" />
          </label>
        </article>

        <article class="form-card">
          <h2>Update profile</h2>
          <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
            <div class="split-fields">
              <label>
                First Name
                <input type="text" formControlName="firstName" />
              </label>
              <label>
                Last Name
                <input type="text" formControlName="lastName" />
              </label>
            </div>

            <div class="split-fields">
              <label>
                Phone Number
                <input type="text" formControlName="phoneNumber" placeholder="e.g. +919876543210" />
              </label>
              <label>
                City
                <input type="text" formControlName="city" />
              </label>
            </div>

            <button type="submit" [disabled]="profileSubmitting()">
              {{ profileSubmitting() ? 'Saving...' : 'Save Profile' }}
            </button>
          </form>
        </article>

        <article class="form-card">
          <h2>Change password</h2>
          <form [formGroup]="passwordForm" (ngSubmit)="updatePassword()">
            <label>
              Current Password
              <input type="password" formControlName="currentPassword" />
            </label>

            <label>
              New Password
              <input type="password" formControlName="newPassword" />
              @if (passwordForm.controls.newPassword.touched && passwordForm.controls.newPassword.invalid) {
                <span class="field-error">Use 8+ chars with uppercase, number, and symbol.</span>
              }
            </label>

            <label>
              Confirm Password
              <input type="password" formControlName="confirmPassword" />
              @if (passwordForm.errors?.passwordMismatch && passwordForm.controls.confirmPassword.touched) {
                <span class="field-error">Passwords do not match.</span>
              }
            </label>

            <button type="submit" [disabled]="passwordSubmitting()">
              {{ passwordSubmitting() ? 'Updating...' : 'Update Password' }}
            </button>
          </form>
        </article>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .page-shell { display: grid; gap: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; gap: 1rem; align-items: end; padding: 1.5rem 1.75rem; border-radius: 1.75rem; background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(0, 0, 0, 0.08); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05); }
    .eyebrow { margin: 0 0 0.65rem; text-transform: uppercase; letter-spacing: 0.18em; font-size: 0.76rem; color: #86868b; }
    h1, h2 { margin: 0; color: #1d1d1f; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif; font-weight: 600; letter-spacing: -0.01em; }
    .feedback { border-radius: 1rem; padding: 0.95rem 1rem; }
    .feedback.error { background: #fde8df; color: #8c2f17; }
    .feedback.success { background: #e5f5ee; color: #0f6a4f; }
    .profile-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
    .profile-card, .form-card { border-radius: 1.5rem; border: 1px solid rgba(0, 0, 0, 0.08); background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(24px) saturate(180%); box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05); padding: 1.5rem; display: grid; gap: 1rem; }
    .avatar-block { display: flex; gap: 1rem; align-items: center; }
    .avatar { width: 4rem; height: 4rem; border-radius: 50%; background: #1d1d1f; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 1.1rem; overflow: hidden; }
    .avatar img { width: 100%; height: 100%; object-fit: cover; }
    .upload { display: grid; gap: 0.4rem; color: #424245; font-weight: 500; }
    .upload input { margin-top: 0.5rem; }
    form { display: grid; gap: 1rem; }
    label { display: grid; gap: 0.4rem; color: #424245; font-weight: 500; font-size: 0.95rem; }
    input { border-radius: 1rem; border: 1px solid rgba(0, 0, 0, 0.1); padding: 0.95rem 1rem; background: rgba(255, 255, 255, 0.6); color: #1d1d1f; font: inherit; transition: border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease; }
    input:focus { outline: none; border-color: rgba(0, 102, 204, 0.5); background: rgba(255, 255, 255, 0.9); box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1); }
    .split-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
    .field-error { color: #8c2f17; font-size: 0.8rem; font-weight: 500; }
    button { border: none; border-radius: 1rem; padding: 0.95rem 1rem; background: #1d1d1f; color: #fff; font-weight: 600; cursor: pointer; transition: transform 0.2s ease, background 0.2s ease; }
    button:hover:not([disabled]) { transform: scale(1.02); background: #000; }
    button[disabled] { opacity: 0.7; cursor: wait; }
    @media (max-width: 720px) { .split-fields { grid-template-columns: 1fr; } }
  `]
})
export class ProfilePageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  protected readonly authService = inject(AuthService);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly profileSubmitting = signal(false);
  readonly passwordSubmitting = signal(false);

  readonly profileForm = this.formBuilder.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    phoneNumber: [''],
    city: ['']
  });

  readonly passwordForm = this.formBuilder.nonNullable.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)
        ]
      ],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: [this.passwordsMatchValidator] }
  );

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.profileForm.patchValue({
        firstName: user.fullName.split(' ')[0] ?? '',
        lastName: user.fullName.split(' ').slice(1).join(' ') ?? '',
        city: user.city ?? ''
      });
    }
  }

  initials(): string {
    const user = this.authService.currentUser();
    if (!user) {
      return 'U';
    }

    return user.fullName
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.errorMessage.set('Please complete the profile form correctly.');
      return;
    }

    this.profileSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const rawValue = this.profileForm.getRawValue();
    const payload = {
      firstName: rawValue.firstName,
      lastName: rawValue.lastName,
      phoneNumber: rawValue.phoneNumber?.trim() || null,
      city: rawValue.city?.trim() || null
    };

    this.authService.updateProfile(payload).subscribe({
      next: () => {
        this.profileSubmitting.set(false);
        this.successMessage.set('Profile updated successfully.');
      },
      error: (error) => {
        this.profileSubmitting.set(false);
        this.errorMessage.set(error.error?.message ?? 'Unable to update the profile right now.');
      }
    });
  }

  updatePassword(): void {
    if (this.passwordForm.invalid) {
      this.errorMessage.set('Please fix the password form errors.');
      return;
    }

    this.passwordSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const payload = this.passwordForm.getRawValue();
    this.authService.changePassword({
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword
    }).subscribe({
      next: (response) => {
        this.passwordSubmitting.set(false);
        this.successMessage.set(response.message);
        this.passwordForm.reset();
      },
      error: (error) => {
        this.passwordSubmitting.set(false);
        this.errorMessage.set(error.error?.message ?? 'Unable to update the password right now.');
      }
    });
  }

  uploadPhoto(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    this.authService.uploadProfileImage(file).subscribe({
      next: () => {
        this.authService.refreshCurrentUser().subscribe();
        this.successMessage.set('Profile photo updated successfully.');
      },
      error: (error) =>
        this.errorMessage.set(error.error?.message ?? 'Unable to upload the profile photo.')
    });
  }

  private passwordsMatchValidator(formGroup: any): null | { passwordMismatch: boolean } {
    const newPassword = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    if (!newPassword || !confirmPassword) {
      return null;
    }

    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }
}
