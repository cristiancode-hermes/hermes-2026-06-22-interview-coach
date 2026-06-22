import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <div class="text-center">
        <h1 class="text-6xl font-bold text-primary-500 mb-4">404</h1>
        <h2 class="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Page not found</h2>
        <p class="text-neutral-500 dark:text-neutral-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <a routerLink="/" class="inline-flex items-center px-6 py-3 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors">
          Go Home
        </a>
      </div>
    </div>
  `
})
export default class NotFoundPage {}
