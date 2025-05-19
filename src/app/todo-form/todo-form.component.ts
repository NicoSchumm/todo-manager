import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TodoService } from '../services/todo.service';
import { Observable, map, startWith, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatChipsModule,
    MatAutocompleteModule
  ],
  templateUrl: './todo-form.component.html',
  styleUrl: './todo-form.component.scss'
})
export class TodoFormComponent {
  todoForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    priority: new FormControl('medium'),
    dueDate: new FormControl<Date | null>(null),
    category: new FormControl<string | null>(null)
  });

  categories$: Observable<string[]>;
  filteredCategories$: Observable<string[]>;

  priorityOptions = [
    { value: 'low', label: 'Low', color: '#8bc34a' },
    { value: 'medium', label: 'Medium', color: '#ffc107' },
    { value: 'high', label: 'High', color: '#f44336' }
  ];

  constructor(private todoService: TodoService) {
    this.categories$ = this.todoService.getCategories();
    
    this.filteredCategories$ = this.todoForm.controls.category.valueChanges.pipe(
      startWith(''),
      switchMap(value => this._filterCategories(value))
    );
  }
  private _filterCategories(value: string | null): Observable<string[]> {
    if (!value) return of([]); 
    
    const filterValue = value.toLowerCase();
    return this.categories$.pipe(
      map(categories => categories.filter(category => 
        category.toLowerCase().includes(filterValue)
      ))
    );
  }

  addTodo(): void {
    if (this.todoForm.valid) {
      const { title, priority, dueDate, category } = this.todoForm.value;
      
      this.todoService.addTodo(
        title as string, 
        priority as 'low' | 'medium' | 'high', 
        dueDate as Date | null,
        category as string | null
      );
      
      this.todoForm.reset({
        title: '',
        priority: 'medium',
        dueDate: null,
        category: null
      });
    }
  }
}