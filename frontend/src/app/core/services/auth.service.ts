import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ApiResponse, AuthResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _accessToken = signal<string | null>(localStorage.getItem('access_token'));
  private _userEmail = signal<string | null>(localStorage.getItem('user_email'));
  private _userId = signal<string | null>(localStorage.getItem('user_id'));

  accessToken = this._accessToken.asReadonly();
  userEmail = this._userEmail.asReadonly();
  userId = this._userId.asReadonly();
  isAuthenticated = computed(() => !!this._accessToken());

  register(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/register`, { email, password }).pipe(
      tap(res => { if (res.success) this.storeTokens(res.data); }),
      map(res => res.data)
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => { if (res.success) this.storeTokens(res.data); }),
      map(res => res.data)
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const token = localStorage.getItem('refresh_token');
    return this.http.post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/refresh-token`, { refreshToken: token }).pipe(
      tap(res => { if (res.success) this.storeTokens(res.data); }),
      map(res => res.data)
    );
  }

  logout(): void {
    this._accessToken.set(null);
    this._userEmail.set(null);
    this._userId.set(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_id');
    this.router.navigate(['/auth/login']);
  }

  private storeTokens(data: AuthResponse): void {
    this._accessToken.set(data.accessToken);
    this._userEmail.set(data.email);
    this._userId.set(data.userId);
    localStorage.setItem('access_token', data.accessToken);
    localStorage.setItem('refresh_token', data.refreshToken);
    localStorage.setItem('user_email', data.email);
    localStorage.setItem('user_id', data.userId);
  }
}
