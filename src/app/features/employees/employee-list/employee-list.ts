
import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';

import {
  EmployeeService,
  EmployeeResponse
} from '../../../core/services/employee.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css'
})
export class EmployeeList implements OnInit, OnDestroy {

  private readonly employeeService = inject(EmployeeService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly subscriptions = new Subscription();

  employees: EmployeeResponse[] = [];

  searchControl = new FormControl('', { nonNullable: true });
  countryControl = new FormControl('', { nonNullable: true });

  loading = false;
  errorMessage = '';
  successMessage = '';

  page = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  sortBy = 'id';
  direction: 'asc' | 'desc' = 'asc';

  deletingEmployeeId: number | null = null;

  ngOnInit(): void {
    this.loadEmployees();

    this.subscriptions.add(
      this.searchControl.valueChanges
        .pipe(debounceTime(350), distinctUntilChanged())
        .subscribe(() => {
          this.page = 0;
          this.loadEmployees();
        })
    );

    this.subscriptions.add(
      this.countryControl.valueChanges
        .pipe(debounceTime(250), distinctUntilChanged())
        .subscribe(() => {
          this.page = 0;
          this.loadEmployees();
        })
    );
  }

  loadEmployees(): void {
    this.loading = true;
    this.errorMessage = '';

    this.subscriptions.add(
      this.employeeService.searchEmployees(
        this.searchControl.value,
        this.countryControl.value,
        this.page,
        this.pageSize,
        this.sortBy,
        this.direction
      ).subscribe({
        next: (response) => {
          this.employees = response.data.content;
          this.totalElements = response.data.totalElements;
          this.totalPages = response.data.totalPages;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Employee list error:', error);
          this.errorMessage =
            error.error?.message || 'Unable to load employees.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      })
    );
  }

  changePage(newPage: number): void {
    if (newPage < 0 || newPage >= this.totalPages) {
      return;
    }

    this.page = newPage;
    this.loadEmployees();
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.page = 0;
    this.loadEmployees();
  }

  sort(field: string): void {
    if (this.sortBy === field) {
      this.direction = this.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.direction = 'asc';
    }

    this.page = 0;
    this.loadEmployees();
  }

  deleteEmployee(employee: EmployeeResponse): void {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`
    );

    if (!confirmed) {
      return;
    }

    this.deletingEmployeeId = employee.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.employeeService.deleteEmployee(employee.id).subscribe({
      next: (response) => {
        this.successMessage =
          response.message || 'Employee deleted successfully.';

        this.deletingEmployeeId = null;

        if (this.employees.length === 1 && this.page > 0) {
          this.page--;
        }

        this.loadEmployees();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Employee deletion error:', error);
        this.errorMessage =
          error.error?.message || 'Unable to delete employee.';
        this.deletingEmployeeId = null;
        this.cdr.detectChanges();
      }
    });
  }

  get firstRecord(): number {
    return this.totalElements === 0
      ? 0
      : this.page * this.pageSize + 1;
  }

  get lastRecord(): number {
    return Math.min(
      (this.page + 1) * this.pageSize,
      this.totalElements
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
