import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900">
      <!-- Header -->
      <header class="border-b border-neutral-200/50 dark:border-neutral-800/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div class="flex items-center gap-2 font-bold text-xl text-primary-600 dark:text-primary-400">
            <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            Interview Coach
          </div>
          <div class="flex items-center gap-4">
            <a routerLink="/login" class="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200">Sign In</a>
            <a routerLink="/register" class="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">Get Started</a>
          </div>
        </div>
      </header>

      <!-- Hero -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div class="text-center max-w-3xl mx-auto">
          <h1 class="text-4xl md:text-6xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight mb-6">
            Ace Your Next Interview
          </h1>
          <p class="text-lg md:text-xl text-neutral-500 dark:text-neutral-400 mb-10 leading-relaxed">
            Practice with AI-powered mock interviews tailored to your role, get instant feedback, and track your progress. Land your dream job with confidence.
          </p>
          <div class="flex items-center justify-center gap-4">
            <a routerLink="/register" class="px-8 py-3 bg-primary-500 text-white rounded-xl text-base font-semibold hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/25">
              Get Started Free
            </a>
            <a routerLink="/login" class="px-8 py-3 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-xl text-base font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              Sign In
            </a>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-sm border border-neutral-200 dark:border-neutral-700">
            <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-4 text-primary-600 dark:text-primary-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Personalized Practice</h3>
            <p class="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
              Custom interviews for Frontend, Backend, Fullstack, Data, DevOps roles with adaptive difficulty.
            </p>
          </div>

          <div class="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-sm border border-neutral-200 dark:border-neutral-700">
            <div class="w-12 h-12 bg-accent-100 dark:bg-accent-900/30 rounded-xl flex items-center justify-center mb-4 text-accent-600 dark:text-accent-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">AI-Powered Feedback</h3>
            <p class="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
              Get detailed analysis on structure, clarity, depth, examples, and keywords with sample answers.
            </p>
          </div>

          <div class="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-sm border border-neutral-200 dark:border-neutral-700">
            <div class="w-12 h-12 bg-secondary-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4 text-secondary-500">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Track Progress</h3>
            <p class="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
              Monitor your improvement over time with detailed scores, weakness profiles, and performance charts.
            </p>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="border-t border-neutral-200 dark:border-neutral-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-neutral-400">
          &copy; {{ year }} Interview Coach. All rights reserved.
        </div>
      </footer>
    </div>
  `
})
export default class LandingPage {
  protected readonly year = new Date().getFullYear();
}
