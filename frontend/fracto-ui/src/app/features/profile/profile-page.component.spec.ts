import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProfilePageComponent } from './profile-page.component';
import { AuthService } from '../../core/services/auth.service';

describe('ProfilePageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilePageComponent],
      providers: [
        {
          provide: AuthService,
          useValue: {
            currentUser: () => ({
              userId: 1,
              fullName: 'Jane Doe',
              email: 'jane@example.com',
              role: 'User',
              city: 'Chennai',
              profileImagePath: null
            }),
            updateProfile: () => of({
              userId: 1,
              fullName: 'Jane Doe',
              email: 'jane@example.com',
              role: 'User',
              city: 'Chennai',
              profileImagePath: null
            }),
            changePassword: () => of({ message: 'Password updated successfully.' }),
            uploadProfileImage: () => of({ message: 'ok', path: '/uploads/test.png' }),
            refreshCurrentUser: () => of({
              userId: 1,
              fullName: 'Jane Doe',
              email: 'jane@example.com',
              role: 'User',
              city: 'Chennai',
              profileImagePath: null
            })
          }
        }
      ]
    }).compileComponents();
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(ProfilePageComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('initializes profile form with current user data', () => {
    const fixture = TestBed.createComponent(ProfilePageComponent);
    const component = fixture.componentInstance;
    component.ngOnInit();
    expect(component.profileForm.value.firstName).toBe('Jane');
    expect(component.profileForm.value.lastName).toBe('Doe');
  });
});
