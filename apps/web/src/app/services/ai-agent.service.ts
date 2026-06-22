import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class AIAgentService {
  private readonly http = inject(HttpClient);

  analyzeAnswer(answerId: number): Promise<any> {
    return firstValueFrom(
      this.http.post(`${API_URL}/ai/analyze/${answerId}`, {})
    );
  }

  getProfile(): Promise<any> {
    return firstValueFrom(
      this.http.get(`${API_URL}/ai/profile`)
    );
  }

  suggestTopics(): Promise<any[]> {
    return firstValueFrom(
      this.http.get<any[]>(`${API_URL}/ai/suggestions`)
    );
  }
}
