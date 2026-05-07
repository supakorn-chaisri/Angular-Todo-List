import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DialogModule } from 'primeng/dialog';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TodoService } from '../../services/todo.service';
import { CategoryService } from '../../services/category.service';
import { Priority } from '../../../../core/models/todo.model';
import { MainLayoutComponent } from '../../../../shared/components/main-layout/main-layout.component';
import { TodoItemComponent } from '../todo-item/todo-item.component';
import { TodoFormComponent } from '../todo-form/todo-form.component';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule, FormsModule, ButtonModule, InputTextModule, SelectModule,
    ToggleSwitchModule, DialogModule, SkeletonModule, ToastModule,
    MainLayoutComponent, TodoItemComponent, TodoFormComponent
  ],
  template: `
    <app-main-layout>
      <p-toast />
      <div class="todo-page">
        <!-- Header -->
        <div class="page-header">
          <div>
            <h1 class="page-title">My Tasks</h1>
            <p class="page-subtitle">{{ todoService.filteredTodos().length }} of {{ todoService.todos().length }} tasks</p>
          </div>
          <p-button label="New Task" icon="pi pi-plus" severity="primary" (onClick)="openForm()" />
        </div>

        <!-- Filters -->
        <div class="filters-bar">
          <div class="search-wrap">
            <i class="pi pi-search search-icon"></i>
            <input type="text" placeholder="Search tasks..." class="search-input"
                   [ngModel]="todoService.searchQuery()"
                   (ngModelChange)="todoService.setSearch($event)" />
          </div>

          <p-select [options]="priorityOptions" [(ngModel)]="priorityFilter"
                    (onChange)="onPriorityChange($event.value)"
                    placeholder="Priority" [showClear]="true"
                    optionLabel="label" optionValue="value" styleClass="filter-select" />

          <p-select [options]="categoryOptions()" [(ngModel)]="categoryFilter"
                    (onChange)="onCategoryChange($event.value)"
                    placeholder="Category" [showClear]="true"
                    optionLabel="label" optionValue="value" styleClass="filter-select" />

          <div class="toggle-wrap">
            <p-toggleSwitch [(ngModel)]="showCompleted" (onChange)="todoService.toggleShowCompleted()" />
            <span class="toggle-label">Show completed</span>
          </div>

          <p-button icon="pi pi-filter-slash" severity="secondary" [text]="true"
                    (onClick)="resetFilters()" pTooltip="Reset filters" tooltipPosition="top" />
        </div>

        <!-- Todo List -->
        @if (todoService.loading()) {
          <div class="skeleton-list">
            @for (i of [1,2,3,4]; track i) {
              <p-skeleton height="80px" borderRadius="12px" styleClass="mb-3" />
            }
          </div>
        } @else if (todoService.filteredTodos().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">📋</div>
            <h3>No tasks found</h3>
            <p>{{ todoService.todos().length === 0 ? 'Create your first task to get started!' : 'Try adjusting your filters.' }}</p>
            @if (todoService.todos().length === 0) {
              <p-button label="Create Task" icon="pi pi-plus" (onClick)="openForm()" />
            }
          </div>
        } @else {
          <div class="todo-list">
            @for (todo of todoService.filteredTodos(); track todo.id) {
              <app-todo-item
                [todo]="todo"
                (onToggle)="toggleTodo($event)"
                (onEdit)="openForm($event)"
                (onDelete)="deleteTodo($event)" />
            }
          </div>
        }
      </div>

      <!-- Todo Form Dialog -->
      <app-todo-form
        [visible]="formVisible()"
        [editTodo]="editingTodo()"
        [categories]="categoryService.categories()"
        (onSave)="onSaved($event)"
        (onCancel)="closeForm()" />
    </app-main-layout>
  `,
  styles: [`
    .todo-page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
    .page-title { font-size: 1.875rem; font-weight: 700; color: white; margin: 0; }
    .page-subtitle { color: rgba(255,255,255,0.5); margin: 0.25rem 0 0; font-size: 0.875rem; }
    .filters-bar {
      display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 1rem; padding: 1rem;
    }
    .search-wrap { position: relative; flex: 1; min-width: 200px; }
    .search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.4); }
    .search-input {
      width: 100%; padding: 0.625rem 0.75rem 0.625rem 2.25rem;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 0.5rem; color: white; font-size: 0.875rem; outline: none;
    }
    .search-input::placeholder { color: rgba(255,255,255,0.3); }
    .search-input:focus { border-color: #6366f1; }
    .toggle-wrap { display: flex; align-items: center; gap: 0.5rem; }
    .toggle-label { color: rgba(255,255,255,0.6); font-size: 0.875rem; white-space: nowrap; }
    .todo-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .empty-state {
      text-align: center; padding: 4rem 2rem;
      background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.1);
      border-radius: 1.5rem;
    }
    .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
    .empty-state h3 { color: white; font-size: 1.25rem; margin: 0 0 0.5rem; }
    .empty-state p { color: rgba(255,255,255,0.4); font-size: 0.875rem; margin-bottom: 1.5rem; }
    .skeleton-list { display: flex; flex-direction: column; gap: 0.75rem; }
  `]
})
export class TodoListComponent implements OnInit {
  todoService = inject(TodoService);
  categoryService = inject(CategoryService);
  private messageService = inject(MessageService);

  formVisible = signal(false);
  editingTodo = signal<any>(null);
  priorityFilter: number | null = null;
  categoryFilter: string | null = null;
  showCompleted = true;

  priorityOptions = [
    { label: '🟢 Low', value: Priority.Low },
    { label: '🟡 Medium', value: Priority.Medium },
    { label: '🔴 High', value: Priority.High }
  ];

  categoryOptions = () => this.categoryService.categories().map(c => ({ label: c.name, value: c.id }));

  ngOnInit(): void {
    this.todoService.loadTodos().subscribe();
    this.categoryService.loadCategories().subscribe();
  }

  openForm(todo?: any): void {
    this.editingTodo.set(todo ?? null);
    this.formVisible.set(true);
  }

  closeForm(): void {
    this.formVisible.set(false);
    this.editingTodo.set(null);
  }

  toggleTodo(id: string): void {
    this.todoService.toggleTodo(id).subscribe({
      error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not update task.' })
    });
  }

  deleteTodo(id: string): void {
    this.todoService.deleteTodo(id).subscribe({
      next: () => this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Task removed.' }),
      error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not delete task.' })
    });
  }

  onSaved(message: string): void {
    this.closeForm();
    this.messageService.add({ severity: 'success', summary: 'Success', detail: message });
  }

  onPriorityChange(val: number | null): void { this.todoService.setPriority(val as Priority | null); }
  onCategoryChange(val: string | null): void { this.todoService.setCategory(val); }
  resetFilters(): void {
    this.priorityFilter = null;
    this.categoryFilter = null;
    this.showCompleted = true;
    this.todoService.resetFilters();
  }
}
