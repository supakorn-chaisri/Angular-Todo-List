export enum Priority {
  Low = 1,
  Medium = 2,
  High = 3
}

export interface Category {
  id: string;
  name: string;
  colorHex: string;
  createdAt: string;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: Priority;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  categoryId?: string;
  categoryName?: string;
  categoryColorHex?: string;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
  categoryId?: string;
}

export interface UpdateTodoRequest {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
  categoryId?: string;
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  highPriority: number;
}
