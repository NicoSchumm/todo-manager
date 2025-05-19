import { TestBed } from '@angular/core/testing';
import { TodoService } from './todo.service';
import { Todo } from '../models/todo.model';

describe('TodoService', () => {
  let service: TodoService;
  let localStorageGetItemSpy: jasmine.Spy;
  let localStorageSetItemSpy: jasmine.Spy;

  beforeEach(() => {
    // Mock localStorage
    localStorageGetItemSpy = spyOn(localStorage, 'getItem').and.returnValue(null);
    localStorageSetItemSpy = spyOn(localStorage, 'setItem');

    TestBed.configureTestingModule({});
    service = TestBed.inject(TodoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty todos if localStorage is empty', () => {
    service.getTodos().subscribe(todos => {
      expect(todos.length).toBe(0);
    });
  });

  it('should load todos from localStorage on init', () => {
    const mockTodos: Todo[] = [
      { id: 1, title: 'Test Todo', completed: false, createdAt: new Date(), priority: 'medium' }
    ];
    
    localStorageGetItemSpy.and.returnValue(JSON.stringify(mockTodos));
    
    // Re-create service to trigger constructor
    service = TestBed.inject(TodoService);
    
    service.getTodos().subscribe(todos => {
      expect(todos.length).toBe(1);
      expect(todos[0].title).toBe('Test Todo');
    });
  });

  it('should add a todo', () => {
    service.addTodo('New Todo', 'high');
    
    service.getTodos().subscribe(todos => {
      expect(todos.length).toBe(1);
      expect(todos[0].title).toBe('New Todo');
      expect(todos[0].priority).toBe('high');
      expect(todos[0].completed).toBe(false);
    });

    expect(localStorageSetItemSpy).toHaveBeenCalled();
  });

  it('should not add empty todos', () => {
    service.addTodo('');
    
    service.getTodos().subscribe(todos => {
      expect(todos.length).toBe(0);
    });
    
    expect(localStorageSetItemSpy).not.toHaveBeenCalled();
  });

  it('should toggle todo completion status', () => {
    service.addTodo('Test Todo');
    
    let todoId: number;
    service.getTodos().subscribe(todos => {
      todoId = todos[0].id;
    });

    service.toggleComplete(todoId!);
    
    service.getTodos().subscribe(todos => {
      expect(todos[0].completed).toBe(true);
    });

    service.toggleComplete(todoId!);
    
    service.getTodos().subscribe(todos => {
      expect(todos[0].completed).toBe(false);
    });
  });

  it('should delete a todo', () => {
    service.addTodo('Test Todo');
    
    let todoId: number;
    service.getTodos().subscribe(todos => {
      todoId = todos[0].id;
    });

    service.deleteTodo(todoId!);
    
    service.getTodos().subscribe(todos => {
      expect(todos.length).toBe(0);
    });
  });

  it('should filter todos correctly', (done) => {
    service.addTodo('Todo 1');
    service.addTodo('Todo 2');
    
    let todoId: number;
    service.getTodos().subscribe(todos => {
      todoId = todos[0].id;
    });

    service.toggleComplete(todoId!);
    
    // Test 'all' filter
    service.setFilter('all');
    service.getFilteredTodos().subscribe(todos => {
      expect(todos.length).toBe(2);
      done();
    });
    
    // Test 'active' filter
    service.setFilter('active');
    service.getFilteredTodos().subscribe(todos => {
      expect(todos.length).toBe(1);
      expect(todos[0].title).toBe('Todo 2');
      done();
    });
    
    // Test 'completed' filter
    service.setFilter('completed');
    service.getFilteredTodos().subscribe(todos => {
      expect(todos.length).toBe(1);
      expect(todos[0].title).toBe('Todo 1');
      done();
    });
  });

  it('should sort todos correctly', (done) => {
    service.addTodo('B Todo', 'low');
    service.addTodo('A Todo', 'high');
    
    // Test sort by title, ascending
    service.setSortBy('title');
    service.setSortDirection('asc');
    
    service.getFilteredTodos().subscribe(todos => {
      expect(todos[0].title).toBe('A Todo');
      expect(todos[1].title).toBe('B Todo');
      done();
    });
    
    // Test sort by priority, descending
    service.setSortBy('priority');
    service.setSortDirection('desc');
    
    service.getFilteredTodos().subscribe(todos => {
      expect(todos[0].priority).toBe('high');
      expect(todos[1].priority).toBe('low');
      done();
    });
  });

  it('should search todos correctly', (done) => {
    service.addTodo('Meeting with client');
    service.addTodo('Buy groceries');
    
    service.setSearchTerm('meeting');
    
    service.getFilteredTodos().subscribe(todos => {
      expect(todos.length).toBe(1);
      expect(todos[0].title).toBe('Meeting with client');
      done();
    });
    
    service.setSearchTerm('');
    
    service.getFilteredTodos().subscribe(todos => {
      expect(todos.length).toBe(2);
      done();
    });
  });
});