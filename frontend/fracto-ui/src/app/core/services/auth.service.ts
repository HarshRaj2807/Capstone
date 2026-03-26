import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, finalize, map, of, shareReplay, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest
} from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storageKey = 'fracto.auth.session';
  private readonly sessionState = signal<AuthResponse | null>(this.getStoredSession());
  private readonly refreshHeaders = new HttpHeaders({ 'x-refresh-call': 'true' });
  private refreshInFlight?: Observable<AuthResponse>;
  private refreshTimeoutId?: number;

  readonly session = this.sessionState.asReadonly();
  readonly currentUser = computed(() => this.sessionState()?.user ?? null);
  readonly token = computed(() => this.sessionState()?.token ?? null);
  readonly isAuthenticated = computed(() => {
    const session = this.sessionState();
    return !!session?.token && !this.isSessionExpired(session);
  });
  readonly isAdmin = computed(() => this.currentUser()?.role === 'Admin');

  constructor() {
    const existing = this.sessionState();
    if (existing && this.isSessionExpired(existing)) {
      this.clearSession();
    } else if (existing) {
      this.scheduleRefresh(existing.expiresAtUtc);
    }
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/login`, payload, { withCredentials: true }).pipe(
      tap((response) => this.setSession(response))
    );
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/register`, payload, { withCredentials: true }).pipe(
      tap((response) => this.setSession(response))
    );
  }

  refreshSession(): Observable<AuthResponse> {
    if (this.refreshInFlight) {
      return this.refreshInFlight;
    }

    this.refreshInFlight = this.http
      .post<AuthResponse>(`${API_BASE_URL}/auth/refresh`, {}, {
        withCredentials: true,
        headers: this.refreshHeaders
      })
      .pipe(
        tap((response) => this.setSession(response)),
        finalize(() => {
          this.refreshInFlight = undefined;
        }),
        shareReplay(1)
      );

    return this.refreshInFlight;
  }

  ensureSession(): Observable<boolean> {
    if (this.isAuthenticated()) {
      return of(true);
    }

    return this.refreshSession().pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  getCurrentUser(): Observable<AuthResponse['user']> {
    return this.http.get<AuthResponse['user']>(`${API_BASE_URL}/auth/me`);
  }

  refreshCurrentUser(): Observable<AuthResponse['user']> {
    return this.getCurrentUser().pipe(
      tap((user) => this.updateStoredUser(user))
    );
  }

  updateProfile(payload: UpdateProfileRequest): Observable<AuthResponse['user']> {
    return this.http.put<AuthResponse['user']>(`${API_BASE_URL}/auth/me`, payload).pipe(
      tap((user) => this.updateStoredUser(user))
    );
  }

  changePassword(payload: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${API_BASE_URL}/auth/change-password`, payload);
  }

  uploadProfileImage(file: File): Observable<{ message: string; path: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ message: string; path: string }>(`${API_BASE_URL}/auth/profile-image`, formData);
  }

  logout(): void {
    this.http.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true }).subscribe({
      error: () => {}
    });

    this.clearSession();
  }

  clearSession(): void {
    this.sessionState.set(null);
    localStorage.removeItem(this.storageKey);
    if (this.refreshTimeoutId) {
      window.clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = undefined;
    }
  }

  private setSession(response: AuthResponse): void {
    this.sessionState.set(response);
    localStorage.setItem(this.storageKey, JSON.stringify(response));
    this.scheduleRefresh(response.expiresAtUtc);
  }

  private getStoredSession(): AuthResponse | null {
    const rawValue = localStorage.getItem(this.storageKey);
    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as AuthResponse;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }

  private updateStoredUser(user: AuthResponse['user']): void {
    const session = this.sessionState();
    if (!session) {
      return;
    }

    const nextSession = { ...session, user };
    this.sessionState.set(nextSession);
    localStorage.setItem(this.storageKey, JSON.stringify(nextSession));
  }

  private scheduleRefresh(expiresAtUtc: string): void {
    if (!expiresAtUtc) {
      return;
    }

    const expiresAt = new Date(expiresAtUtc).getTime();
    if (Number.isNaN(expiresAt)) {
      return;
    }

    const refreshAt = expiresAt - 60_000;
    const delay = Math.max(refreshAt - Date.now(), 0);

    if (this.refreshTimeoutId) {
      window.clearTimeout(this.refreshTimeoutId);
    }

    this.refreshTimeoutId = window.setTimeout(() => {
      this.refreshSession().subscribe({
        error: () => this.clearSession()
      });
    }, delay);
  }

  private isSessionExpired(session: AuthResponse): boolean {
    const expiresAt = new Date(session.expiresAtUtc).getTime();
    if (Number.isNaN(expiresAt)) {
      return true;
    }

    return Date.now() >= expiresAt;
  }
}
