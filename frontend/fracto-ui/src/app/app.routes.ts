import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { AdminPageComponent } from './features/admin/admin-page.component';
import { AppointmentsPageComponent } from './features/appointments/appointments-page.component';
import { AuthPageComponent } from './features/auth/auth-page.component';
import { DoctorsPageComponent } from './features/doctors/doctors-page.component';
import { PaymentPageComponent } from './features/payment/payment-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: AuthPageComponent },
  { path: 'register', component: AuthPageComponent, data: { mode: 'register' } },
  { path: 'doctors', component: DoctorsPageComponent, canActivate: [authGuard] },
  {
    path: 'doctors/:id/reviews',
    loadComponent: () =>
      import('./features/doctors/doctor-reviews-page.component').then((m) => m.DoctorReviewsPageComponent),
    canActivate: [authGuard]
  },
  { path: 'payment', component: PaymentPageComponent, canActivate: [authGuard] },
  { path: 'appointments', component: AppointmentsPageComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminPageComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: 'login' }
];
