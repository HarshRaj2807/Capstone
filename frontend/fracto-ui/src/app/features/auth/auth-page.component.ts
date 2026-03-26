import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, ReactiveFormsModule, Validators, FormBuilder, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  host: {
    '[class.register-active]': "mode() === 'register'"
  },
  template: `
    <section class="auth-shell">
      <div class="hero-panel">
        <p class="eyebrow">Quick Access</p>
        <h1>Book trusted care without the phone calls.</h1>
        <p class="hero-copy">
          Fracto helps patients discover doctors by city, specialization, and ratings, then book
          the right slot in a clean digital workflow.
        </p>

      </div>

      <div class="form-panel">
        <div class="panel-switcher">
          <button
            type="button"
            [class.active]="mode() === 'login'"
            (click)="setMode('login')">
            Login
          </button>
          <button
            type="button"
            [class.active]="mode() === 'register'"
            (click)="setMode('register')">
            Register
          </button>
        </div>

        @if (errorMessage()) {
          <div class="feedback error">{{ errorMessage() }}</div>
        }

        @if (infoMessage()) {
          <div class="feedback success">{{ infoMessage() }}</div>
        }

        @if (mode() === 'login') {
          <form class="auth-form" [formGroup]="loginForm" (ngSubmit)="submitLogin()">
            <h2>Welcome</h2>
            <label>
              Email
              <input type="email" formControlName="email" placeholder="name@example.com" />
              @if (loginForm.controls.email.touched && loginForm.controls.email.invalid) {
                <span class="field-error">Enter a valid email address.</span>
              }
            </label>

            <label>
              Password
              <input type="password" formControlName="password" placeholder="Enter your password" />
              @if (loginForm.controls.password.touched && loginForm.controls.password.invalid) {
                <span class="field-error">Password is required.</span>
              }
            </label>

            <button type="submit" [disabled]="isSubmitting()">
              {{ isSubmitting() ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>
        } @else {
          <form class="auth-form" [formGroup]="registerForm" (ngSubmit)="submitRegister()">
            <h2>Create your account</h2>
            <div class="split-fields">
              <label>
                First Name
                <input type="text" formControlName="firstName" placeholder="Enter first name" />
              </label>

              <label>
                Last Name
                <input type="text" formControlName="lastName" placeholder="Enter last name" />
              </label>
            </div>

            <label>
              Email
              <input type="email" formControlName="email" placeholder="name@example.com" />
              @if (registerForm.controls.email.touched && registerForm.controls.email.invalid) {
                <span class="field-error">Enter a valid email address.</span>
              }
            </label>

            <div class="split-fields">
              <label>
                Password
                <input type="password" formControlName="password" placeholder="Create a password" />
                @if (registerForm.controls.password.touched && registerForm.controls.password.invalid) {
                  <span class="field-error">Use 8+ chars with uppercase, number, and symbol.</span>
                }
              </label>

              <label>
                Confirm Password
                <input type="password" formControlName="confirmPassword" placeholder="Re-enter password" />
                @if (registerForm.errors?.passwordMismatch && registerForm.controls.confirmPassword.touched) {
                  <span class="field-error">Passwords do not match.</span>
                }
              </label>
            </div>

            <div class="split-fields">
              <label>
                Phone Number
                <input type="text" formControlName="phoneNumber" placeholder="Enter phone number" />
                @if (registerForm.controls.phoneNumber.touched && registerForm.controls.phoneNumber.invalid) {
                  <span class="field-error">Use 7-15 digits, optional + prefix.</span>
                }
              </label>

              <label>
                City
                <input type="text" formControlName="city" placeholder="Enter city" />
              </label>
            </div>

            <button type="submit" [disabled]="isSubmitting()">
              {{ isSubmitting() ? 'Creating account...' : 'Create Account' }}
            </button>
          </form>
        }
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }

    .auth-shell {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 2rem;
      min-height: calc(100vh - 9rem);
      max-width: 1200px;
      margin: 0 auto;
      align-items: stretch;
      align-content: center;
    }

    .hero-panel,
    .form-panel {
      border-radius: 2rem;
      padding: 3.5rem;
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .hero-panel {
      background: rgba(255, 255, 255, 0.45);
      backdrop-filter: blur(30px) saturate(180%);
      -webkit-backdrop-filter: blur(30px) saturate(180%);
      color: #1d1d1f;
      position: relative;
      overflow: hidden;
    }

    .hero-panel::after {
      content: '';
      position: absolute;
      inset: auto -8rem -8rem auto;
      width: 18rem;
      height: 18rem;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      filter: blur(10px);
    }

    .eyebrow {
      margin: 0 0 1rem;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      font-size: 0.76rem;
      color: #0066cc;
    }

    h1 {
      margin: 0;
      font-size: clamp(2.4rem, 5vw, 4.4rem);
      line-height: 0.98;
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, sans-serif;
      font-weight: 700;
      letter-spacing: -0.03em;
    }

    .hero-copy {
      max-width: 34rem;
      margin: 1.5rem 0 2rem;
      color: #424245;
      font-size: 1.05rem;
      line-height: 1.75;
    }

    .form-panel {
      background: rgba(255, 255, 255, 0.45);
      backdrop-filter: blur(30px) saturate(180%);
      -webkit-backdrop-filter: blur(30px) saturate(180%);
      border-left: 1px solid rgba(0, 0, 0, 0.08);
    }

    .panel-switcher {
      display: flex;
      width: 100%;
      padding: 0.35rem;
      border-radius: 999px;
      background: rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(0, 0, 0, 0.05);
      margin-bottom: 2rem;
      position: relative;
    }

    /* Create a sliding background pill for the active state */
    .panel-switcher::before {
      content: '';
      position: absolute;
      top: 0.35rem;
      bottom: 0.35rem;
      width: calc(50% - 0.35rem);
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid rgba(0, 0, 0, 0.05);
      border-radius: 999px;
      transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
      z-index: 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .panel-switcher button {
      flex: 1;
      border: none;
      background: transparent;
      color: #86868b;
      border-radius: 999px;
      padding: 0.75rem 1.3rem;
      font-weight: 700;
      cursor: pointer;
      position: relative;
      z-index: 1;
      transition: color 0.3s ease;
    }

    .panel-switcher button.active {
      color: #1d1d1f;
    }

    .feedback {
      border-radius: 1rem;
      padding: 0.9rem 1rem;
      margin-bottom: 1rem;
      font-size: 0.95rem;
    }

    .feedback.error {
      background: #fde8df;
      color: #8c2f17;
    }

    .feedback.success {
      background: #e5f5ee;
      color: #0f6a4f;
    }

    @keyframes slideFadeUp {
      0% {
        opacity: 0;
        transform: translateY(12px) scale(0.98);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .auth-form {
      display: grid;
      gap: 1.5rem;
      animation: slideFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      transform-origin: top center;
    }

    /* Stagger the inner inputs to create a cascading effect */
    .auth-form > * {
      opacity: 0;
      animation: slideFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .auth-form > *:nth-child(1) { animation-delay: 0.05s; }
    .auth-form > *:nth-child(2) { animation-delay: 0.1s; }
    .auth-form > *:nth-child(3) { animation-delay: 0.15s; }
    .auth-form > *:nth-child(4) { animation-delay: 0.2s; }
    .auth-form > *:nth-child(5) { animation-delay: 0.25s; }
    .auth-form > *:nth-child(6) { animation-delay: 0.3s; }

    .auth-form h2 {
      margin: 0 0 0.25rem;
      font-size: 1.7rem;
      color: #1d1d1f;
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;
      font-weight: 600;
      letter-spacing: -0.02em;
    }

    .field-error {
      color: #8c2f17;
      font-size: 0.8rem;
      font-weight: 500;
    }

    label {
      display: grid;
      gap: 0.5rem;
      color: #424245;
      font-weight: 500;
      font-size: 0.95rem;
    }

    input {
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 1rem;
      padding: 1.15rem 1rem;
      font-size: 1rem;
      background: rgba(255, 255, 255, 0.6);
      color: #1d1d1f;
      width: 100%;
      box-sizing: border-box;
      transition: border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
    }
    
    input:focus {
      outline: none;
      border-color: rgba(0, 102, 204, 0.5);
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
    }

    input::placeholder {
      color: #8e8e93;
    }

    .split-fields {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      width: 100%;
    }

    .auth-form button[type='submit'] {
      margin-top: 0.5rem;
      border: none;
      border-radius: 1rem;
      padding: 1rem 1.2rem;
      background: #1d1d1f;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      transition: transform 0.2s ease, background 0.2s ease;
    }
    
    .auth-form button[type='submit']:hover:not([disabled]) {
      transform: scale(1.02);
      background: #000000;
    }

    .auth-form button[disabled] {
      opacity: 0.7;
      cursor: wait;
    }

    @media (max-width: 980px) {
      .auth-shell {
        grid-template-columns: 1fr;
      }

      .split-fields {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AuthPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly mode = signal<'login' | 'register'>(
    this.route.snapshot.data['mode'] === 'register' ? 'register' : 'login'
  );
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  readonly infoMessage = signal('');

  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  readonly registerForm = this.formBuilder.nonNullable.group(
    {
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)
        ]
      ],
      confirmPassword: ['', [Validators.required]],
      phoneNumber: ['', [Validators.pattern(/^\+?[0-9]{7,15}$/)]],
      city: ['']
    },
    { validators: [this.passwordMatchValidator] }
  );

  constructor() {
    if (this.authService.isAuthenticated()) {
      void this.navigateByRole(this.authService.currentUser()?.role);
    }
  }

  setMode(mode: 'login' | 'register'): void {
    this.mode.set(mode);
    this.errorMessage.set('');
    this.infoMessage.set('');
  }

  submitLogin(): void {
    if (this.loginForm.invalid) {
      this.errorMessage.set('Please enter a valid email and password.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.infoMessage.set(response.message);
        void this.navigateByRole(response.user.role);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(error.error?.message ?? 'Unable to sign in right now.');
      }
    });
  }

  submitRegister(): void {
    if (this.registerForm.invalid) {
      this.errorMessage.set('Please complete the registration form correctly.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const { confirmPassword, ...payload } = this.registerForm.getRawValue();

    this.authService.register(payload).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.infoMessage.set(response.message);
        void this.navigateByRole(response.user.role);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(error.error?.message ?? 'Unable to create the account right now.');
      }
    });
  }

  private async navigateByRole(role?: string): Promise<void> {
    await this.router.navigate([role === 'Admin' ? '/admin' : '/doctors']);
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  }
}
