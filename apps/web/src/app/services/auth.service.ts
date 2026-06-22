import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../config/api.config';
import type { User } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly token = signal<string | null>(this.loadToken());
  readonly currentUser = signal<User | null>(null);

  isAuthenticated(): boolean {
    return !!this.token();
  }

  async login(email: string, password: string): Promise<void> {
    const res: any = await firstValueFrom(
      this.http.post(`${API_URL}/auth/login`, { email, password })
    );
    this.token.set(res.token);
    localStorage.setItem('interview_coach_token', res.token);
    this.currentUser.set(res.user);
  }

  async register(email: string, password: string, name: string): Promise<void> {
    const res: any = await firstValueFrom(
      this.http.post(`${API_URL}/auth/register`, { email, password, name })
    );
    this.token.set(res.token);
    localStorage.setItem('interview_coach_token', res.token);
    this.currentUser.set(res.user);
  }

  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('interview_coach_token');
    this.router.navigate(['/login']);
  }

  async getProfile(): Promise<User> {
    const res: any = await firstValueFrom(
      this.http.get(`${API_URL}/auth/profile`)
    );
    this.currentUser.set(res);
    return res;
  }

  async updateProfile(name: string): Promise<void> {
    await firstValueFrom(
      this.http.patch(`${API_URL}/auth/profile`, { name })
    );
    this.currentUser.update(u => u ? { ...u, name } : null);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${API_URL}/auth/change-password`, { currentPassword, newPassword })
    );
  }

  private loadToken(): string | null {
    return localStorage.getItem('interview_coach_token');
  }
}
