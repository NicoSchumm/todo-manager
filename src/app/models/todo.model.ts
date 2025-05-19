export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  category?: string;
  order?: number;
}

export type TodoFilter = 'all' | 'active' | 'completed';
export type TodoSortBy = 'createdAt' | 'title' | 'dueDate' | 'priority';
export type SortDirection = 'asc' | 'desc';