import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { PagedResponse } from '../models/shared.models';
import { UserListItem } from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  getUsers(): Observable<PagedResponse<UserListItem>> {
    const params = new HttpParams().set('pageNumber', 1).set('pageSize', 50);
    return this.http.get<PagedResponse<UserListItem>>(`${API_BASE_URL}/users`, { params });
  }

  toggleUserStatus(userId: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${API_BASE_URL}/users/${userId}/toggle-status`, {});
  }
}
