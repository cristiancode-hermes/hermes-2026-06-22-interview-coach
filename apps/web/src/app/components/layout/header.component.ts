import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <a routerLink="/dashboard" class="flex items-center gap-2 font-bold text-lg text-primary-600 dark:text-primary-400">
            <svg class="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            Interview Coach
          </a>

          <!-- Desktop Nav -->
          @if (auth.isAuthenticated()) {
            <nav class="hidden md:flex items-center gap-6">
              <a routerLink="/dashboard" routerLinkActive="text-primary-600 dark:text-primary-400 font-semibold" class="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors">
                Dashboard
              </a>
              <a routerLink="/interview/new" routerLinkActive="text-primary-600 dark:text-primary-400 font-semibold" class="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors">
                New Interview
              </a>
              <a routerLink="/history" routerLinkActive="text-primary-600 dark:text-primary-400 font-semibold" class="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors">
                History
              </a>
            </nav>
          }

          <!-- Right side -->
          <div class="flex items-center gap-3">
            <!-- Dark mode toggle -->
            <button (click)="theme.toggle()" class="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" title="Toggle dark mode">
              @if (theme.isDark()) {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              } @else {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                </svg>
              }
            </button>

            <!-- User menu (desktop) -->
            @if (auth.isAuthenticated()) {
              <div class="relative hidden md:block">
                <button (click)="menuOpen.set(!menuOpen())" class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                  <div class="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
                    {{ initials() }}
                  </div>
                  <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                @if (menuOpen()) {
                  <div class="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 animate-fade-in" (click)="menuOpen.set(false)">
                    <div class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                      <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ auth.currentUser()?.name }}</p>
                      <p class="text-xs text-neutral-500">{{ auth.currentUser()?.email }}</p>
                    </div>
                    <a routerLink="/profile" class="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">Profile</a>
                    <button (click)="auth.logout()" class="block w-full text-left px-4 py-2 text-sm text-danger-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">Logout</button>
                  </div>
                }
              </div>
            }

            <!-- Mobile hamburger -->
            <button (click)="mobileOpen.set(!mobileOpen())" class="md:hidden p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                @if (mobileOpen()) {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                } @else {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                }
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile nav -->
        @if (mobileOpen() && auth.isAuthenticated()) {
          <div class="md:hidden border-t border-neutral-200 dark:border-neutral-800 py-3 space-y-1 animate-fade-in">
            <a routerLink="/dashboard" (click)="mobileOpen.set(false)" class="block px-3 py-2 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">Dashboard</a>
            <a routerLink="/interview/new" (click)="mobileOpen.set(false)" class="block px-3 py-2 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">New Interview</a>
            <a routerLink="/history" (click)="mobileOpen.set(false)" class="block px-3 py-2 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">History</a>
            <a routerLink="/profile" (click)="mobileOpen.set(false)" class="block px-3 py-2 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">Profile</a>
            <button (click)="auth.logout(); mobileOpen.set(false)" class="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-danger-600 hover:bg-neutral-100 dark:hover:bg-neutral-800">Logout</button>
          </div>
        }
      </div>
    </header>
  `
})
export class HeaderComponent {
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  protected readonly menuOpen = signal(false);
  protected readonly mobileOpen = signal(false);

  protected readonly initials = computed(() => {
    const name = this.auth.currentUser()?.name || '';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
  });
}
