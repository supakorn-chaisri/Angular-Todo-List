import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule, PasswordModule, MessageModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">✓</div>
          <h1>Welcome back</h1>
          <p>Sign in to your TodoList account</p>
        </div>

        @if (error()) {
          <p-message severity="error" [text]="error()!" styleClass="w-full mb-4" />
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="field">
            <label for="email">Email address</label>
            <input pInputText id="email" type="email" formControlName="email"
                   placeholder="you@example.com" class="w-full" />
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <small class="field-error">Valid email is required</small>
            }
          </div>

          <div class="field">
            <label for="password">Password</label>
            <p-password id="password" formControlName="password"
                        placeholder="Your password" [feedback]="false"
                        [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full" />
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <small class="field-error">Password is required</small>
            }
          </div>

          <p-button type="submit" label="Sign In" icon="pi pi-sign-in"
                    [loading]="loading()" [disabled]="form.invalid"
                    styleClass="w-full" severity="primary" />
        </form>

        <p class="auth-footer">
          Don't have an account? <a routerLink="/auth/register">Create one</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
      padding: 2rem;
    }
    .auth-card {
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 1.5rem;
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.5);
    }
    .auth-header { text-align: center; margin-bottom: 2rem; }
    .auth-logo {
      width: 64px; height: 64px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 1rem;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 2rem; color: white; margin-bottom: 1rem;
      box-shadow: 0 8px 32px rgba(99,102,241,0.4);
    }
    .auth-header h1 { font-size: 1.75rem; font-weight: 700; color: white; margin: 0; }
    .auth-header p { color: rgba(255,255,255,0.6); margin-top: 0.5rem; }
    .auth-form { display: flex; flex-direction: column; gap: 1.25rem; }
    .field { display: flex; flex-direction: column; gap: 0.5rem; }
    .field label { font-weight: 500; color: rgba(255,255,255,0.8); font-size: 0.875rem; }
    .field-error { color: #f87171; font-size: 0.75rem; }
    .auth-footer { text-align: center; margin-top: 1.5rem; color: rgba(255,255,255,0.6); font-size: 0.875rem; }
    .auth-footer a { color: #818cf8; font-weight: 600; text-decoration: none; }
    .auth-footer a:hover { color: #a5b4fc; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: any) => {
        this.error.set(err?.error?.message ?? 'Invalid credentials. Please try again.');
        this.loading.set(false);
      }
    });
  }
}
