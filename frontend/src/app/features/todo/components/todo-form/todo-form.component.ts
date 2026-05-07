import { Component, inject, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { Todo, Category, Priority, CreateTodoRequest, UpdateTodoRequest } from '../../../../core/models/todo.model';
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, TextareaModule, SelectModule, DatePickerModule, DialogModule],
  template: `
    <p-dialog
      [visible]="visible" (visibleChange)="onCancel.emit()"
      [modal]="true" [closable]="true" [draggable]="false"
      [style]="{ width: '520px' }"
      [header]="editTodo ? 'Edit Task' : 'New Task'"
      styleClass="todo-dialog">

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="todo-form">
        <div class="field">
          <label>Title *</label>
          <input pInputText formControlName="title" placeholder="What needs to be done?" class="w-full" />
        </div>

        <div class="field">
          <label>Description</label>
          <textarea pTextarea formControlName="description" rows="3"
                    placeholder="Add details (optional)" class="w-full" autoResize></textarea>
        </div>

        <div class="form-row">
          <div class="field">
            <label>Priority</label>
            <p-select formControlName="priority" [options]="priorityOptions"
                      optionLabel="label" optionValue="value" styleClass="w-full" />
          </div>
          <div class="field">
            <label>Category</label>
            <p-select formControlName="categoryId" [options]="categoryOptions()"
                      optionLabel="label" optionValue="value"
                      placeholder="None" [showClear]="true" styleClass="w-full" />
          </div>
        </div>

        <div class="field">
          <label>Due Date</label>
          <p-datepicker formControlName="dueDate" [showTime]="false"
                        dateFormat="dd/mm/yy" placeholder="Select date (optional)"
                        styleClass="w-full" [showIcon]="true" />
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="onCancel.emit()" />
        <p-button [label]="editTodo ? 'Save Changes' : 'Create Task'"
                  [icon]="editTodo ? 'pi pi-check' : 'pi pi-plus'"
                  [loading]="loading" [disabled]="form.invalid"
                  (onClick)="onSubmit()" />
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .todo-form { display: flex; flex-direction: column; gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: 0.4rem; }
    .field label { font-size: 0.8125rem; font-weight: 500; color: rgba(255,255,255,0.7); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  `]
})
export class TodoFormComponent implements OnChanges {
  @Input() visible = false;
  @Input() editTodo: Todo | null = null;
  @Input() categories: Category[] = [];
  @Output() onSave = new EventEmitter<string>();
  @Output() onCancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private todoService = inject(TodoService);
  loading = false;

  priorityOptions = [
    { label: '🟢 Low', value: Priority.Low },
    { label: '🟡 Medium', value: Priority.Medium },
    { label: '🔴 High', value: Priority.High }
  ];

  categoryOptions = () => this.categories.map(c => ({ label: c.name, value: c.id }));

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: [''],
    priority: [Priority.Medium, Validators.required],
    categoryId: [null as string | null],
    dueDate: [null as Date | null]
  });

  ngOnChanges(): void {
    if (this.editTodo) {
      this.form.patchValue({
        title: this.editTodo.title,
        description: this.editTodo.description ?? '',
        priority: this.editTodo.priority,
        categoryId: this.editTodo.categoryId ?? null,
        dueDate: this.editTodo.dueDate ? new Date(this.editTodo.dueDate) : null
      });
    } else {
      this.form.reset({ priority: Priority.Medium });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const val = this.form.value;
    const dto: CreateTodoRequest | UpdateTodoRequest = {
      title: val.title!,
      description: val.description || undefined,
      priority: val.priority!,
      categoryId: val.categoryId || undefined,
      dueDate: val.dueDate ? val.dueDate.toISOString() : undefined
    };

    const obs = this.editTodo
      ? this.todoService.updateTodo(this.editTodo.id, dto as UpdateTodoRequest)
      : this.todoService.createTodo(dto as CreateTodoRequest);

    obs.subscribe({
      next: () => {
        this.loading = false;
        this.onSave.emit(this.editTodo ? 'Task updated!' : 'Task created!');
      },
      error: (err: any) => { this.loading = false; }
    });
  }
}
