import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class InterviewService {
  private readonly http = inject(HttpClient);

  getAll(page = 1, filters?: Record<string, any>): Promise<any> {
    const params = new URLSearchParams({ page: String(page) });
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
      });
    }
    return firstValueFrom(
      this.http.get(`${API_URL}/interviews?${params}`)
    );
  }

  getRecent(): Promise<any[]> {
    return firstValueFrom(
      this.http.get<any[]>(`${API_URL}/interviews/recent`)
    );
  }

  getById(id: number): Promise<any> {
    return firstValueFrom(
      this.http.get(`${API_URL}/interviews/${id}`)
    );
  }

  create(dto: any): Promise<any> {
    return firstValueFrom(
      this.http.post(`${API_URL}/interviews`, dto)
    );
  }

  update(id: number, dto: any): Promise<any> {
    return firstValueFrom(
      this.http.patch(`${API_URL}/interviews/${id}`, dto)
    );
  }

  remove(id: number): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${API_URL}/interviews/${id}`)
    );
  }
}
