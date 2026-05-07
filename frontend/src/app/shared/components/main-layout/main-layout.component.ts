import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, TooltipModule],
  template: `
    <div class="layout" [class.dark-mode]="isDark()">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed()">
        <div class="sidebar-header">
          <div class="brand">
            <div class="brand-icon">✓</div>
            @if (!sidebarCollapsed()) { <span class="brand-name">TodoList</span> }
          </div>
          <button class="collapse-btn" (click)="sidebarCollapsed.update(v => !v)">
            <i class="pi" [class.pi-chevron-left]="!sidebarCollapsed()" [class.pi-chevron-right]="sidebarCollapsed()"></i>
          </button>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item"
             [pTooltip]="sidebarCollapsed() ? 'Dashboard' : ''" tooltipPosition="right">
            <i class="pi pi-chart-bar"></i>
            @if (!sidebarCollapsed()) { <span>Dashboard</span> }
          </a>
          <a routerLink="/todos" routerLinkActive="active" class="nav-item"
             [pTooltip]="sidebarCollapsed() ? 'My Tasks' : ''" tooltipPosition="right">
            <i class="pi pi-check-square"></i>
            @if (!sidebarCollapsed()) { <span>My Tasks</span> }
          </a>
        </nav>

        <div class="sidebar-footer">
          <button class="theme-btn" (click)="toggleTheme()"
                  [pTooltip]="sidebarCollapsed() ? (isDark() ? 'Light Mode' : 'Dark Mode') : ''" tooltipPosition="right">
            <i class="pi" [class.pi-sun]="isDark()" [class.pi-moon]="!isDark()"></i>
            @if (!sidebarCollapsed()) { <span>{{ isDark() ? 'Light Mode' : 'Dark Mode' }}</span> }
          </button>
          <button class="logout-btn" (click)="logout()"
                  [pTooltip]="sidebarCollapsed() ? 'Logout' : ''" tooltipPosition="right">
            <i class="pi pi-sign-out"></i>
            @if (!sidebarCollapsed()) { <span>Logout</span> }
          </button>
          @if (!sidebarCollapsed()) {
            <div class="user-info">
              <div class="user-avatar">{{ userInitial() }}</div>
              <span class="user-email">{{ auth.userEmail() }}</span>
            </div>
          }
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <ng-content />
      </main>
    </div>
  `,
  styles: [`
    .layout { display: flex; min-height: 100vh; background: #0f0c29; }
    .sidebar {
      width: 240px; min-width: 240px;
      background: rgba(255,255,255,0.04);
      border-right: 1px solid rgba(255,255,255,0.08);
      display: flex; flex-direction: column;
      transition: width 0.3s, min-width 0.3s;
      position: sticky; top: 0; height: 100vh;
    }
    .sidebar.collapsed { width: 64px; min-width: 64px; }
    .sidebar-header {
      padding: 1.25rem; display: flex; align-items: center;
      justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .brand { display: flex; align-items: center; gap: 0.75rem; overflow: hidden; }
    .brand-icon {
      width: 36px; height: 36px; min-width: 36px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 0.5rem; display: flex; align-items: center;
      justify-content: center; color: white; font-weight: 700; font-size: 1.1rem;
    }
    .brand-name { font-size: 1.1rem; font-weight: 700; color: white; white-space: nowrap; }
    .collapse-btn {
      background: transparent; border: none; color: rgba(255,255,255,0.4);
      cursor: pointer; padding: 0.25rem; border-radius: 0.25rem;
      transition: color 0.2s;
    }
    .collapse-btn:hover { color: white; }
    .sidebar-nav { flex: 1; padding: 1rem 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; }
    .nav-item {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.75rem; border-radius: 0.75rem; text-decoration: none;
      color: rgba(255,255,255,0.6); font-size: 0.875rem; font-weight: 500;
      transition: all 0.2s; white-space: nowrap; overflow: hidden;
    }
    .nav-item:hover { background: rgba(255,255,255,0.08); color: white; }
    .nav-item.active { background: rgba(99,102,241,0.2); color: #a5b4fc; }
    .nav-item i { font-size: 1rem; min-width: 1rem; }
    .sidebar-footer { padding: 1rem 0.75rem; border-top: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; gap: 0.5rem; }
    .theme-btn, .logout-btn {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.75rem; border-radius: 0.75rem; border: none;
      background: transparent; color: rgba(255,255,255,0.6);
      cursor: pointer; font-size: 0.875rem; font-weight: 500;
      transition: all 0.2s; width: 100%; white-space: nowrap; overflow: hidden;
      text-align: left;
    }
    .theme-btn:hover { background: rgba(255,255,255,0.08); color: white; }
    .logout-btn:hover { background: rgba(239,68,68,0.1); color: #f87171; }
    .user-info { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.25rem; }
    .user-avatar {
      width: 32px; height: 32px; min-width: 32px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 50%; display: flex; align-items: center;
      justify-content: center; color: white; font-weight: 700; font-size: 0.875rem;
    }
    .user-email { font-size: 0.75rem; color: rgba(255,255,255,0.4); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .main-content { flex: 1; padding: 2rem; overflow-y: auto; }
  `]
})
export class MainLayoutComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  isDark = signal(localStorage.getItem('theme') !== 'light');
  sidebarCollapsed = signal(false);

  userInitial(): string {
    return (this.auth.userEmail() ?? 'U')[0].toUpperCase();
  }

  toggleTheme(): void {
    this.isDark.update(v => !v);
    const theme = this.isDark() ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    if (this.isDark()) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }

  logout(): void {
    this.auth.logout();
  }
}
