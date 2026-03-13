import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="auth-shell">
      <div class="hero-panel">
        <p class="eyebrow">Quick Access</p>
        <h1>Book trusted care without the phone calls.</h1>
        <p class="hero-copy">
          Fracto helps patients discover doctors by city, specialization, and ratings, then book
          the right slot in a clean digital workflow.
        </p>

        <div class="demo-grid">
          <article class="demo-card">
            <span class="demo-role">Demo Admin</span>
            <strong>admin@fracto.com</strong>
            <span>Admin@123</span>
            <button type="button" (click)="useDemo('admin')">Use Admin Login</button>
          </article>

          <article class="demo-card">
            <span class="demo-role">Demo User</span>
            <strong>user@fracto.com</strong>
            <span>User@123</span>
            <button type="button" (click)="useDemo('user')">Use User Login</button>
          </article>
        </div>
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
            <h2>Welcome back</h2>
            <label>
              Email
              <input type="email" formControlName="email" placeholder="name@example.com" />
            </label>

            <label>
              Password
              <input type="password" formControlName="password" placeholder="Enter your password" />
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
            </label>

            <div class="split-fields">
              <label>
                Password
                <input type="password" formControlName="password" placeholder="Create a password" />
              </label>

              <label>
                Phone Number
                <input type="text" formControlName="phoneNumber" placeholder="Enter phone number" />
              </label>
            </div>

            <label>
              City
              <input type="text" formControlName="city" placeholder="Enter city" />
            </label>

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
      align-items: stretch;
    }

    .hero-panel,
    .form-panel {
      border-radius: 2rem;
      padding: 2.5rem;
      border: 1px solid rgba(15, 59, 53, 0.12);
      box-shadow: 0 24px 60px rgba(18, 41, 38, 0.12);
    }

    .hero-panel {
      background:
        radial-gradient(circle at top right, rgba(221, 110, 66, 0.22), transparent 35%),
        linear-gradient(145deg, #0f3b35, #1a5a52);
      color: #f8f2e8;
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
      color: #f0c4ab;
    }

    h1 {
      margin: 0;
      font-size: clamp(2.4rem, 5vw, 4.4rem);
      line-height: 0.98;
      font-family: Georgia, 'Times New Roman', serif;
    }

    .hero-copy {
      max-width: 34rem;
      margin: 1.5rem 0 2rem;
      color: rgba(248, 242, 232, 0.86);
      font-size: 1.05rem;
      line-height: 1.75;
    }

    .demo-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }

    .demo-card {
      display: grid;
      gap: 0.45rem;
      padding: 1.1rem;
      border-radius: 1.25rem;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(12px);
    }

    .demo-role {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: #f0c4ab;
    }

    .demo-card button {
      width: fit-content;
      margin-top: 0.4rem;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 999px;
      background: #f8f2e8;
      color: #0f3b35;
      font-weight: 700;
      cursor: pointer;
    }

    .form-panel {
      background: rgba(255, 252, 248, 0.94);
      backdrop-filter: blur(14px);
    }

    .panel-switcher {
      display: inline-flex;
      padding: 0.35rem;
      border-radius: 999px;
      background: #efe5d7;
      margin-bottom: 1.5rem;
    }

    .panel-switcher button {
      border: none;
      background: transparent;
      color: #6b6357;
      border-radius: 999px;
      padding: 0.7rem 1.3rem;
      font-weight: 700;
      cursor: pointer;
    }

    .panel-switcher button.active {
      background: #0f3b35;
      color: #fff;
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

    .auth-form {
      display: grid;
      gap: 1rem;
    }

    .auth-form h2 {
      margin: 0 0 0.25rem;
      font-size: 1.7rem;
      color: #122926;
      font-family: Georgia, 'Times New Roman', serif;
    }

    label {
      display: grid;
      gap: 0.45rem;
      color: #3f433e;
      font-weight: 600;
    }

    input {
      border: 1px solid #d9d1c3;
      border-radius: 1rem;
      padding: 0.95rem 1rem;
      font-size: 1rem;
      background: #fff;
    }

    .split-fields {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }

    .auth-form button[type='submit'] {
      margin-top: 0.5rem;
      border: none;
      border-radius: 1rem;
      padding: 1rem 1.2rem;
      background: linear-gradient(135deg, #0f3b35, #1f6f63);
      color: white;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 18px 30px rgba(15, 59, 53, 0.18);
    }

    .auth-form button[disabled] {
      opacity: 0.7;
      cursor: wait;
    }

    @media (max-width: 980px) {
      .auth-shell {
        grid-template-columns: 1fr;
      }

      .split-fields,
      .demo-grid {
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

  readonly registerForm = this.formBuilder.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    phoneNumber: [''],
    city: ['']
  });

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

  useDemo(role: 'admin' | 'user'): void {
    this.setMode('login');
    this.loginForm.patchValue(
      role === 'admin'
        ? { email: 'admin@fracto.com', password: 'Admin@123' }
        : { email: 'user@fracto.com', password: 'User@123' }
    );
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

    this.authService.register(this.registerForm.getRawValue()).subscribe({
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
}
