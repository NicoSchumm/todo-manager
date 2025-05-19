import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

import { TodoService } from '../services/todo.service';
import { Todo, TodoFilter, TodoSortBy } from '../models/todo.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
    MatChipsModule,
    MatBadgeModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatButtonToggleModule,
    MatSelectModule,
    DragDropModule
  ],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.scss',
  animations: [
    trigger('todoAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, height: 0, transform: 'translateY(-20px)' }),
          stagger(100, [
            animate('300ms ease-out', style({ opacity: 1, height: '*', transform: 'translateY(0)' }))
          ])
        ], { optional: true }),
        query(':leave', [
          animate('200ms ease-in', style({ opacity: 0, height: 0, transform: 'translateY(-20px)' }))
        ], { optional: true })
      ])
    ]),
    trigger('filterAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class TodoListComponent implements OnInit {
  todos$: Observable<Todo[]>;
  categories$: Observable<string[]>;
  
  currentFilter: TodoFilter = 'all';
  currentSortBy: TodoSortBy = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';
  searchTerm = '';
  selectedCategory: string | null = null;

  priorityColors: Record<string, string> = {
    low: '#8bc34a',
    medium: '#ffc107',
    high: '#f44336'
  };

  constructor(private todoService: TodoService) {
    this.todos$ = this.todoService.getFilteredTodos();
    this.categories$ = this.todoService.getCategories();
  }

  ngOnInit(): void {
    this.initializeFilterSubscriptions();
  }
  
  private initializeFilterSubscriptions(): void {
    this.todoService.getCurrentFilter().subscribe(filter => {
      this.currentFilter = filter;
    });
    
    this.todoService.getCurrentSortBy().subscribe(sortBy => {
      this.currentSortBy = sortBy;
    });
    
    this.todoService.getCurrentSortDirection().subscribe(direction => {
      this.sortDirection = direction;
    });
    
    this.todoService.getCurrentSearchTerm().subscribe(term => {
      this.searchTerm = term;
    });
    
    this.todoService.getCurrentCategoryFilter().subscribe(category => {
      this.selectedCategory = category;
    });
  }

  toggleComplete(id: number): void {
    this.todoService.toggleComplete(id);
  }

  deleteTodo(id: number): void {
    this.todoService.deleteTodo(id);
  }
  
  setFilter(filter: TodoFilter): void {
    this.todoService.setFilter(filter);
  }
  
  setSortBy(sortBy: TodoSortBy): void {
    if (this.currentSortBy === sortBy) {
      const newDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      this.todoService.setSortDirection(newDirection);
    } else {
      this.todoService.setSortBy(sortBy);
      this.todoService.setSortDirection('desc');
    }
  }
  
  applySearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.todoService.setSearchTerm(input.value);
  }
  
  clearSearch(): void {
    this.searchTerm = '';
    this.todoService.setSearchTerm('');
  }
  
  selectCategory(category: string | null): void {
    this.todoService.setCategoryFilter(category);
  }
  
  drop(event: CdkDragDrop<Todo[]>, todos: Todo[]): void {
    if (event.previousIndex !== event.currentIndex) {
      const updatedTodos = [...todos];
      moveItemInArray(updatedTodos, event.previousIndex, event.currentIndex);
      this.todoService.reorderTodos(updatedTodos);
    }
  }
  
  formatDate(date: Date | undefined): string {
    if (!date) return 'No date';
    return new Date(date).toLocaleDateString();
  }
  
  isDueDateOverdue(date: Date | undefined): boolean {
    if (!date) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(date) < today;
  }
  
  isDueDateToday(date: Date | undefined): boolean {
    if (!date) return false;
    
    const today = new Date();
    const dueDate = new Date(date);
    
    return today.getDate() === dueDate.getDate() && 
           today.getMonth() === dueDate.getMonth() && 
           today.getFullYear() === dueDate.getFullYear();
  }
  
  getDueDateLabel(date: Date | undefined): string {
    if (!date) return '';
    
    if (this.isDueDateOverdue(date)) return 'Overdue';
    if (this.isDueDateToday(date)) return 'Today';
    
    return this.formatDate(date);
  }
  
  getPriorityLabel(priority: string): string {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  }
  
  getSortIcon(sortBy: TodoSortBy): string {
    if (this.currentSortBy !== sortBy) return '';
    return this.sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }
}