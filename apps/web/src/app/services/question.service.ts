import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private readonly http = inject(HttpClient);

  getByInterview(interviewId: number): Promise<any[]> {
    return firstValueFrom(
      this.http.get<any[]>(`${API_URL}/questions/interview/${interviewId}`)
    );
  }

  generate(interviewId: number): Promise<any[]> {
    return firstValueFrom(
      this.http.post<any[]>(`${API_URL}/questions/generate/${interviewId}`, {})
    );
  }
}
