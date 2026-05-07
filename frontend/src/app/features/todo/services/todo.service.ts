import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map, finalize } from 'rxjs/operators';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Todo, CreateTodoRequest, UpdateTodoRequest, Priority, TodoStats } from '../../../core/models/todo.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/todos`;

  // ─── State Signals ────────────────────────────────────────────────────────
  private _todos = signal<Todo[]>([]);
  private _loading = signal(false);
  private _searchQuery = signal('');
  private _selectedCategory = signal<string | null>(null);
  private _selectedPriority = signal<Priority | null>(null);
  private _showCompleted = signal(true);

  // ─── Public Read-only ─────────────────────────────────────────────────────
  todos = this._todos.asReadonly();
  loading = this._loading.asReadonly();
  searchQuery = this._searchQuery.asReadonly();
  selectedCategory = this._selectedCategory.asReadonly();
  selectedPriority = this._selectedPriority.asReadonly();
  showCompleted = this._showCompleted.asReadonly();

  // ─── Computed Signals ─────────────────────────────────────────────────────
  filteredTodos = computed(() => {
    let result = this._todos();
    const query = this._searchQuery().toLowerCase().trim();
    const cat = this._selectedCategory();
    const prio = this._selectedPriority();
    const showDone = this._showCompleted();

    if (query) result = result.filter(t =>
      t.title.toLowerCase().includes(query) ||
      (t.description?.toLowerCase().includes(query) ?? false)
    );
    if (cat) result = result.filter(t => t.categoryId === cat);
    if (prio !== null) result = result.filter(t => t.priority === prio);
    if (!showDone) result = result.filter(t => !t.isCompleted);
    return result;
  });

  stats = computed<TodoStats>(() => ({
    total: this._todos().length,
    completed: this._todos().filter(t => t.isCompleted).length,
    pending: this._todos().filter(t => !t.isCompleted).length,
    highPriority: this._todos().filter(t => t.priority === Priority.High && !t.isCompleted).length,
  }));

  completionRate = computed(() => {
    const total = this._todos().length;
    if (total === 0) return 0;
    return Math.round((this._todos().filter(t => t.isCompleted).length / total) * 100);
  });

  // ─── Filter Actions ───────────────────────────────────────────────────────
  setSearch(query: string): void { this._searchQuery.set(query); }
  setCategory(id: string | null): void { this._selectedCategory.set(id); }
  setPriority(p: Priority | null): void { this._selectedPriority.set(p); }
  toggleShowCompleted(): void { this._showCompleted.update(v => !v); }
  resetFilters(): void {
    this._searchQuery.set('');
    this._selectedCategory.set(null);
    this._selectedPriority.set(null);
    this._showCompleted.set(true);
  }

  // ─── API Actions ──────────────────────────────────────────────────────────
  loadTodos(): Observable<void> {
    this._loading.set(true);
    return this.http.get<ApiResponse<Todo[]>>(this.apiUrl).pipe(
      tap(res => { if (res.success) this._todos.set(res.data); }),
      map(() => void 0),
      finalize(() => this._loading.set(false))
    );
  }

  createTodo(dto: CreateTodoRequest): Observable<Todo> {
    return this.http.post<ApiResponse<Todo>>(this.apiUrl, dto).pipe(
      tap(res => { if (res.success) this._todos.update(list => [res.data, ...list]); }),
      map(res => res.data)
    );
  }

  updateTodo(id: string, dto: UpdateTodoRequest): Observable<Todo> {
    return this.http.put<ApiResponse<Todo>>(`${this.apiUrl}/${id}`, dto).pipe(
      tap(res => {
        if (res.success) this._todos.update(list => list.map(t => t.id === id ? res.data : t));
      }),
      map(res => res.data)
    );
  }

  toggleTodo(id: string): Observable<void> {
    return this.http.patch<ApiResponse<Todo>>(`${this.apiUrl}/${id}/toggle`, {}).pipe(
      tap(res => {
        if (res.success) this._todos.update(list => list.map(t => t.id === id ? res.data : t));
      }),
      map(() => void 0)
    );
  }

  deleteTodo(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      tap(res => { if (res.success) this._todos.update(list => list.filter(t => t.id !== id)); }),
      map(() => void 0)
    );
  }
}
