import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AuthPageComponent } from './auth-page.component';
import { AuthService } from '../../core/services/auth.service';

describe('AuthPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthPageComponent],
      providers: [
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: () => false,
            currentUser: () => null,
            login: () => of({ message: 'ok', token: 't', expiresAtUtc: '2099-01-01T00:00:00Z', user: { userId: 1, fullName: 'Test User', email: 'test@example.com', role: 'User' } }),
            register: () => of({ message: 'ok', token: 't', expiresAtUtc: '2099-01-01T00:00:00Z', user: { userId: 1, fullName: 'Test User', email: 'test@example.com', role: 'User' } })
          }
        },
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
        { provide: ActivatedRoute, useValue: { snapshot: { data: {} } } }
      ]
    }).compileComponents();
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(AuthPageComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('switches to register mode', () => {
    const fixture = TestBed.createComponent(AuthPageComponent);
    const component = fixture.componentInstance;
    component.setMode('register');
    expect(component.mode()).toBe('register');
  });
});
