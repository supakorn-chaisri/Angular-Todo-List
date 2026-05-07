import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService } from 'primeng/api';
import { Todo, Priority } from '../../../../core/models/todo.model';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  providers: [ConfirmationService],
  imports: [CommonModule, ButtonModule, CheckboxModule, TooltipModule, ConfirmPopupModule],
  template: `
    <p-confirmpopup />
    <div class="todo-item" [class.completed]="todo.isCompleted" [class.overdue]="isOverdue()">
      <button class="check-btn" (click)="onToggle.emit(todo.id)"
              [class.checked]="todo.isCompleted"
              [attr.aria-label]="todo.isCompleted ? 'Mark incomplete' : 'Mark complete'">
        @if (todo.isCompleted) { <i class="pi pi-check"></i> }
      </button>

      <div class="todo-content">
        <div class="todo-top">
          <span class="todo-title" [class.strikethrough]="todo.isCompleted">{{ todo.title }}</span>
          <span class="priority-badge" [class]="'prio-' + priorityKey()">
            {{ priorityLabel() }}
          </span>
        </div>

        @if (todo.description) {
          <p class="todo-desc">{{ todo.description }}</p>
        }

        <div class="todo-meta">
          @if (todo.categoryName) {
            <span class="cat-tag" [style.background]="todo.categoryColorHex + '33'" [style.color]="todo.categoryColorHex">
              {{ todo.categoryName }}
            </span>
          }
          @if (todo.dueDate) {
            <span class="due-date" [class.overdue-text]="isOverdue() && !todo.isCompleted">
              <i class="pi pi-calendar"></i>
              {{ formatDate(todo.dueDate) }}
            </span>
          }
          <span class="created-date">
            <i class="pi pi-clock"></i>
            {{ formatDate(todo.createdAt) }}
          </span>
        </div>
      </div>

      <div class="todo-actions">
        <p-button icon="pi pi-pencil" [text]="true" severity="secondary" size="small"
                  (onClick)="onEdit.emit(todo)" pTooltip="Edit" tooltipPosition="top" />
        <p-button icon="pi pi-trash" [text]="true" severity="danger" size="small"
                  (onClick)="confirmDelete($event)" pTooltip="Delete" tooltipPosition="top" />
      </div>
    </div>
  `,
  styles: [`
    .todo-item {
      display: flex; align-items: flex-start; gap: 1rem;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 1rem; padding: 1rem 1.25rem;
      transition: all 0.2s; animation: slideIn 0.3s ease;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .todo-item:hover { border-color: rgba(99,102,241,0.3); background: rgba(255,255,255,0.07); }
    .todo-item.completed { opacity: 0.6; }
    .todo-item.overdue { border-color: rgba(239,68,68,0.3); }
    .check-btn {
      width: 24px; height: 24px; min-width: 24px; border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.3); background: transparent;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      color: white; transition: all 0.2s; margin-top: 2px;
    }
    .check-btn:hover { border-color: #6366f1; background: rgba(99,102,241,0.1); }
    .check-btn.checked { background: #6366f1; border-color: #6366f1; }
    .todo-content { flex: 1; min-width: 0; }
    .todo-top { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0.35rem; }
    .todo-title { color: white; font-weight: 500; font-size: 0.9375rem; }
    .todo-title.strikethrough { text-decoration: line-through; color: rgba(255,255,255,0.4); }
    .priority-badge { font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 9999px; letter-spacing: 0.05em; text-transform: uppercase; }
    .prio-high { background: rgba(239,68,68,0.2); color: #f87171; }
    .prio-medium { background: rgba(251,191,36,0.2); color: #fbbf24; }
    .prio-low { background: rgba(34,197,94,0.2); color: #4ade80; }
    .todo-desc { color: rgba(255,255,255,0.5); font-size: 0.8125rem; margin: 0 0 0.5rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .todo-meta { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .cat-tag { font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px; }
    .due-date, .created-date { font-size: 0.75rem; color: rgba(255,255,255,0.4); display: flex; align-items: center; gap: 0.25rem; }
    .overdue-text { color: #f87171 !important; }
    .todo-actions { display: flex; gap: 0.25rem; opacity: 0; transition: opacity 0.2s; }
    .todo-item:hover .todo-actions { opacity: 1; }
  `]
})
export class TodoItemComponent {
  @Input({ required: true }) todo!: Todo;
  @Output() onToggle = new EventEmitter<string>();
  @Output() onEdit = new EventEmitter<Todo>();
  @Output() onDelete = new EventEmitter<string>();

  private confirmService = inject(ConfirmationService);

  priorityKey(): string {
    return Priority[this.todo.priority].toLowerCase();
  }

  priorityLabel(): string {
    return Priority[this.todo.priority];
  }

  isOverdue(): boolean {
    if (!this.todo.dueDate || this.todo.isCompleted) return false;
    return new Date(this.todo.dueDate) < new Date();
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  confirmDelete(event: Event): void {
    this.confirmService.confirm({
      target: event.target as EventTarget,
      message: 'Delete this task?',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { severity: 'danger', label: 'Delete' },
      rejectButtonProps: { severity: 'secondary', label: 'Cancel', text: true },
      accept: () => this.onDelete.emit(this.todo.id)
    });
  }
}
