import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Todo, TodoFilter, TodoSortBy, SortDirection } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private todos: Todo[] = [];
  private todosSubject = new BehaviorSubject<Todo[]>([]);
  
  private filterSubject = new BehaviorSubject<TodoFilter>('all');
  private sortBySubject = new BehaviorSubject<TodoSortBy>('createdAt');
  private sortDirectionSubject = new BehaviorSubject<SortDirection>('desc');
  private searchSubject = new BehaviorSubject<string>('');
  private categoryFilterSubject = new BehaviorSubject<string | null>(null);

  constructor() {
    this.loadTodosFromStorage();
  }

  private loadTodosFromStorage(): void {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      this.todos = JSON.parse(storedTodos, this.dateReviver);
      this.todosSubject.next([...this.todos]);
    }
  }

  private dateReviver(key: string, value: any): any {
    if (key === 'createdAt' || key === 'dueDate') {
      return value ? new Date(value) : null;
    }
    return value;
  }

  // Get filtered, sorted todos
  getFilteredTodos(): Observable<Todo[]> {
    return combineLatest([
      this.todosSubject,
      this.filterSubject,
      this.sortBySubject,
      this.sortDirectionSubject,
      this.searchSubject,
      this.categoryFilterSubject
    ]).pipe(
      map(([todos, filter, sortBy, direction, search, category]) => {
        // First filter by status
        let filteredTodos = todos.filter(todo => {
          if (filter === 'all') return true;
          if (filter === 'active') return !todo.completed;
          if (filter === 'completed') return todo.completed;
          return true;
        });

        // Then filter by search text
        if (search && search.trim() !== '') {
          const searchLower = search.toLowerCase();
          filteredTodos = filteredTodos.filter(todo => 
            todo.title.toLowerCase().includes(searchLower)
          );
        }

        // Then filter by category
        if (category) {
          filteredTodos = filteredTodos.filter(todo => 
            todo.category === category
          );
        }

        // Then sort
        return this.sortTodos(filteredTodos, sortBy, direction);
      })
    );
  }

  // Get raw todos (unfiltered)
  getTodos(): Observable<Todo[]> {
    return this.todosSubject.asObservable();
  }

  // Get available categories
  getCategories(): Observable<string[]> {
    return this.todosSubject.pipe(
      map(todos => {
        const categories = todos
          .map(todo => todo.category)
          .filter(Boolean) as string[];
        return [...new Set(categories)].sort();
      })
    );
  }

  // Sorting function
  private sortTodos(todos: Todo[], sortBy: TodoSortBy, direction: SortDirection): Todo[] {
    return [...todos].sort((a, b) => {
      let comparison = this.compareByProperty(a, b, sortBy);
      return direction === 'asc' ? comparison : -comparison;
    });
  }

  private compareByProperty(a: Todo, b: Todo, sortBy: TodoSortBy): number {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'createdAt':
        return (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0);
      case 'dueDate':
        if (!a.dueDate && b.dueDate) return 1;
        if (a.dueDate && !b.dueDate) return -1;
        return (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0);
      case 'priority':
        const priorityValues = { high: 3, medium: 2, low: 1 };
        return (priorityValues[a.priority] || 0) - (priorityValues[b.priority] || 0);
      default:
        return 0;
    }
  }

  // Filter setters
  setFilter(filter: TodoFilter): void {
    this.filterSubject.next(filter);
  }

  setSortBy(sortBy: TodoSortBy): void {
    this.sortBySubject.next(sortBy);
  }

  setSortDirection(direction: SortDirection): void {
    this.sortDirectionSubject.next(direction);
  }

  setSearchTerm(term: string): void {
    this.searchSubject.next(term);
  }

  setCategoryFilter(category: string | null): void {
    this.categoryFilterSubject.next(category);
  }

  // Current filter getters
  getCurrentFilter(): Observable<TodoFilter> {
    return this.filterSubject.asObservable();
  }

  getCurrentSortBy(): Observable<TodoSortBy> {
    return this.sortBySubject.asObservable();
  }

  getCurrentSortDirection(): Observable<SortDirection> {
    return this.sortDirectionSubject.asObservable();
  }

  getCurrentSearchTerm(): Observable<string> {
    return this.searchSubject.asObservable();
  }

  getCurrentCategoryFilter(): Observable<string | null> {
    return this.categoryFilterSubject.asObservable();
  }

  // Todo operations
  addTodo(title: string, priority: 'low' | 'medium' | 'high' = 'medium', dueDate: Date | null = null, category: string | null = null): void {
    if (!title.trim()) return;
    
    const newTodo: Todo = {
      id: Date.now(),
      title: title.trim(),
      completed: false,
      createdAt: new Date(),
      priority,
      dueDate: dueDate || undefined,
      category: category || undefined,
      order: this.todos.length
    };
    
    this.todos = [...this.todos, newTodo];
    this.todosSubject.next(this.todos);
    this.saveTodos();
  }

  toggleComplete(id: number): void {
    this.updateTodoProperty(id, todo => ({
      ...todo,
      completed: !todo.completed
    }));
  }

  updateTodo(updatedTodo: Todo): void {
    this.updateTodoProperty(updatedTodo.id, () => ({
      ...updatedTodo
    }));
  }

  deleteTodo(id: number): void {
    this.todos = this.todos.filter(todo => todo.id !== id);
    this.todosSubject.next([...this.todos]);
    this.saveTodos();
  }

  reorderTodos(reorderedTodos: Todo[]): void {
    this.todos = reorderedTodos.map((todo, index) => ({ 
      ...todo, 
      order: index 
    }));
    this.todosSubject.next([...this.todos]);
    this.saveTodos();
  }

  private updateTodoProperty(id: number, updateFn: (todo: Todo) => Todo): void {
    this.todos = this.todos.map(todo => 
      todo.id === id ? updateFn(todo) : todo
    );
    
    this.todosSubject.next([...this.todos]);
    this.saveTodos();
  }

  private saveTodos(): void {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }
}