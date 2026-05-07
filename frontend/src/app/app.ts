import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: [`
    :host { display: block; min-height: 100vh; }
  `]
})
export class App implements OnInit {
  private auth = inject(AuthService);

  ngOnInit(): void {
    // Apply saved theme
    const savedTheme = localStorage.getItem('theme') ?? 'dark';
    if (savedTheme === 'dark') document.documentElement.classList.add('dark-mode');
  }
}
