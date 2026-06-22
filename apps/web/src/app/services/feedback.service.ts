import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private readonly http = inject(HttpClient);

  getByAnswer(answerId: number): Promise<any> {
    return firstValueFrom(
      this.http.get(`${API_URL}/feedback/answer/${answerId}`)
    );
  }

  regenerate(answerId: number): Promise<any> {
    return firstValueFrom(
      this.http.post(`${API_URL}/feedback/regenerate/${answerId}`, {})
    );
  }
}
