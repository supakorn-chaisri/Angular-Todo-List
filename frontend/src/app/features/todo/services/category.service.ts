import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Category } from '../../../core/models/todo.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/categories`;

  private _categories = signal<Category[]>([]);
  categories = this._categories.asReadonly();

  loadCategories(): Observable<void> {
    return this.http.get<ApiResponse<Category[]>>(this.apiUrl).pipe(
      tap(res => { if (res.success) this._categories.set(res.data); }),
      map(() => void 0)
    );
  }

  createCategory(name: string, colorHex: string): Observable<Category> {
    return this.http.post<ApiResponse<Category>>(this.apiUrl, { name, colorHex }).pipe(
      tap(res => { if (res.success) this._categories.update(list => [...list, res.data]); }),
      map(res => res.data)
    );
  }

  updateCategory(id: string, name: string, colorHex: string): Observable<Category> {
    return this.http.put<ApiResponse<Category>>(`${this.apiUrl}/${id}`, { name, colorHex }).pipe(
      tap(res => {
        if (res.success) this._categories.update(list => list.map(c => c.id === id ? res.data : c));
      }),
      map(res => res.data)
    );
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      tap(res => { if (res.success) this._categories.update(list => list.filter(c => c.id !== id)); }),
      map(() => void 0)
    );
  }
}
