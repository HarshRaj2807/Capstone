import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { PagedResponse } from '../models/shared.models';
import { UserDetail, UserFormValue, UserListItem } from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  /**
   * Fetches a paginated list of all registered users.
   * @returns An observable of PagedResponse containing UserListItem.
   */
  retrieveRegisteredUsers(): Observable<PagedResponse<UserListItem>> {
    const params = new HttpParams().set('pNum', 1).set('pSize', 50);
    return this.http.get<PagedResponse<UserListItem>>(`${API_BASE_URL}/users`, { params });
  }

  getUserById(userId: number): Observable<UserDetail> {
    return this.http.get<UserDetail>(`${API_BASE_URL}/users/${userId}`);
  }

  createUser(payload: UserFormValue): Observable<UserDetail> {
    return this.http.post<UserDetail>(`${API_BASE_URL}/users`, payload);
  }

  updateUser(userId: number, payload: UserFormValue): Observable<UserDetail> {
    return this.http.put<UserDetail>(`${API_BASE_URL}/users/${userId}`, payload);
  }

  deleteUser(userId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_BASE_URL}/users/${userId}`);
  }

  /**
   * Updates the active status of a user account.
   * @param userId The ID of the user to update.
   * @returns An observable with a success message.
   */
  updateUserAccountStatus(userId: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${API_BASE_URL}/users/${userId}/toggle-status`, {});
  }
}
