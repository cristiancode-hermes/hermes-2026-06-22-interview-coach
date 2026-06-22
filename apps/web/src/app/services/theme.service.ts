import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal<boolean>(this.loadTheme());

  constructor() {
    this.applyTheme();
  }

  toggle(): void {
    this.isDark.update(v => !v);
    localStorage.setItem('interview_coach_dark', String(this.isDark()));
    this.applyTheme();
  }

  private applyTheme(): void {
    if (this.isDark()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  private loadTheme(): boolean {
    const stored = localStorage.getItem('interview_coach_dark');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
