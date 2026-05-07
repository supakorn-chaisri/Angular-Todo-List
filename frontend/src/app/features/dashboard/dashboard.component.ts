import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { TodoService } from '../todo/services/todo.service';
import { CategoryService } from '../todo/services/category.service';
import { AuthService } from '../../core/services/auth.service';
import { MainLayoutComponent } from '../../shared/components/main-layout/main-layout.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, CardModule, ProgressBarModule, MainLayoutComponent],
  template: `
    <app-main-layout>
      <div class="dashboard">
        <div class="dashboard-header">
          <div>
            <h1 class="dashboard-title">Good {{ greeting() }}, {{ firstName() }} 👋</h1>
            <p class="dashboard-subtitle">Here's your productivity overview</p>
          </div>
          <p-button label="Add Task" icon="pi pi-plus" routerLink="/todos" severity="primary" />
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card stat-total">
            <div class="stat-icon"><i class="pi pi-list"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ stats().total }}</span>
              <span class="stat-label">Total Tasks</span>
            </div>
          </div>
          <div class="stat-card stat-completed">
            <div class="stat-icon"><i class="pi pi-check-circle"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ stats().completed }}</span>
              <span class="stat-label">Completed</span>
            </div>
          </div>
          <div class="stat-card stat-pending">
            <div class="stat-icon"><i class="pi pi-clock"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ stats().pending }}</span>
              <span class="stat-label">Pending</span>
            </div>
          </div>
          <div class="stat-card stat-high">
            <div class="stat-icon"><i class="pi pi-exclamation-triangle"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ stats().highPriority }}</span>
              <span class="stat-label">High Priority</span>
            </div>
          </div>
        </div>

        <!-- Completion Rate -->
        <div class="completion-card">
          <div class="completion-header">
            <span class="completion-title">Overall Completion</span>
            <span class="completion-pct">{{ completionRate() }}%</span>
          </div>
          <p-progressBar [value]="completionRate()" [showValue]="false" styleClass="completion-bar" />
          <p class="completion-hint">{{ stats().completed }} of {{ stats().total }} tasks completed</p>
        </div>

        <!-- Categories Summary -->
        <div class="categories-section">
          <h2 class="section-title">Categories <span class="badge">{{ categories().length }}</span></h2>
          <div class="categories-grid">
            @for (cat of categories(); track cat.id) {
              <div class="category-pill" [style.border-color]="cat.colorHex" [style.background]="cat.colorHex + '22'">
                <span class="cat-dot" [style.background]="cat.colorHex"></span>
                <span class="cat-name">{{ cat.name }}</span>
              </div>
            }
            @if (categories().length === 0) {
              <p class="empty-hint">No categories yet. <a routerLink="/todos">Create one →</a></p>
            }
          </div>
        </div>
      </div>
    </app-main-layout>
  `,
  styles: [`
    .dashboard { padding: 0; }
    .dashboard-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 2rem; gap: 1rem; flex-wrap: wrap;
    }
    .dashboard-title { font-size: 1.875rem; font-weight: 700; color: white; margin: 0; }
    .dashboard-subtitle { color: rgba(255,255,255,0.5); margin: 0.25rem 0 0; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 1rem; padding: 1.25rem;
      display: flex; align-items: center; gap: 1rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
    .stat-icon { font-size: 1.5rem; width: 48px; height: 48px; border-radius: 0.75rem;
      display: flex; align-items: center; justify-content: center; }
    .stat-total .stat-icon { background: rgba(99,102,241,0.2); color: #818cf8; }
    .stat-completed .stat-icon { background: rgba(34,197,94,0.2); color: #4ade80; }
    .stat-pending .stat-icon { background: rgba(251,191,36,0.2); color: #fbbf24; }
    .stat-high .stat-icon { background: rgba(239,68,68,0.2); color: #f87171; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 1.75rem; font-weight: 700; color: white; line-height: 1; }
    .stat-label { font-size: 0.8rem; color: rgba(255,255,255,0.5); margin-top: 0.25rem; }
    .completion-card {
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 1rem; padding: 1.5rem; margin-bottom: 1.5rem;
    }
    .completion-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .completion-title { color: white; font-weight: 600; }
    .completion-pct { font-size: 1.5rem; font-weight: 700; color: #818cf8; }
    .completion-hint { color: rgba(255,255,255,0.4); font-size: 0.8rem; margin-top: 0.5rem; }
    .section-title { font-size: 1.1rem; font-weight: 600; color: white; margin-bottom: 1rem; }
    .badge { background: rgba(99,102,241,0.3); color: #a5b4fc; padding: 0.15rem 0.5rem;
      border-radius: 9999px; font-size: 0.75rem; font-weight: 600; margin-left: 0.5rem; }
    .categories-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; }
    .category-pill {
      display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem;
      border-radius: 9999px; border: 1px solid; font-size: 0.875rem;
    }
    .cat-dot { width: 8px; height: 8px; border-radius: 50%; }
    .cat-name { color: white; font-weight: 500; }
    .empty-hint { color: rgba(255,255,255,0.4); font-size: 0.875rem; }
    .empty-hint a { color: #818cf8; text-decoration: none; }
  `]
})
export class DashboardComponent implements OnInit {
  private todoService = inject(TodoService);
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);

  stats = this.todoService.stats;
  completionRate = this.todoService.completionRate;
  categories = this.categoryService.categories;

  greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }

  firstName(): string {
    return this.authService.userEmail()?.split('@')[0] ?? 'there';
  }

  ngOnInit(): void {
    this.todoService.loadTodos().subscribe();
    this.categoryService.loadCategories().subscribe();
  }
}
