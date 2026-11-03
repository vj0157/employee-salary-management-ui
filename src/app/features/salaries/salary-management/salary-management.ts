
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject ,ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmployeeService, EmployeeResponse } from '../../../core/services/employee.service';
import {
  SalaryService,
  SalaryRequest,
  SalaryResponse
} from '../../../core/services/salary.service';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
@Component({
  selector: 'app-salary-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './salary-management.html',
  styleUrl: './salary-management.css'
})
export class SalaryManagement implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly salaryService = inject(SalaryService);
  private readonly cdr = inject(ChangeDetectorRef);
  employees: EmployeeResponse[] = [];
  selectedEmployeeId: number | null = null;
  salaries: SalaryResponse[] = [];

  loadingEmployees = false;
  loadingSalaries = false;
  saving = false;

  showModal = false;
  editingSalaryId: number | null = null;
  errorMessage = '';
  successMessage = '';

  form: SalaryRequest = this.emptyForm();

  ngOnInit(): void {
    console.log('Salary Management component initialized');
    this.loadEmployees();
  }

  private emptyForm(): SalaryRequest {
    return {
      baseSalary: 0,
      bonus: 0,
      currency: '',
      effectiveDate: new Date().toISOString().slice(0, 10)
    };
  }

  onEmployeeChange(event: Event): void {
  const value = (event.target as HTMLSelectElement).value;

  this.selectEmployee(value ? Number(value) : null);
}

loadEmployees(): void {
  this.loadingEmployees = true;
  this.errorMessage = '';

  this.employeeService.getEmployees().subscribe({
    next: response => {
      this.employees = Array.isArray(response?.data)
        ? response.data
        : [];

      if (this.employees.length > 0) {
        this.selectedEmployeeId = this.employees[0].id;
        this.selectEmployee(this.employees[0].id);
      }

      this.loadingEmployees = false;
      this.cdr.detectChanges();

      console.log('Employees loaded:', this.employees.length);
      console.log('Selected employee:', this.selectedEmployeeId);
    },
    error: error => {
      console.error('Employee API error:', error);
      this.loadingEmployees = false;
      this.errorMessage = 'Unable to load employees.';
      this.cdr.detectChanges();
    }
  });
}


selectEmployee(employeeId: number | null): void {
  this.selectedEmployeeId = employeeId;
  this.salaries = [];
  this.errorMessage = '';

  if (employeeId === null) {
    this.loadingSalaries = false;
     this.cdr.detectChanges();
    return;
  }

  this.loadingSalaries = true;

  this.salaryService.getSalaryHistory(employeeId)
    .pipe(
      finalize(() => this.loadingSalaries = false)
    )
    .subscribe({
      next: response => {
        this.salaries = [...(response.data ?? [])].sort(
          (a, b) => b.effectiveDate.localeCompare(a.effectiveDate)
        );
         this.cdr.detectChanges(); 
        console.log('Salary history for employee:', employeeId, this.salaries);
      },
      error: error => {
        console.error('Salary history error:', error);
        this.errorMessage = 'Unable to load salary history.';
         this.cdr.detectChanges(); 
      }
    });
}

  openAddModal(): void {
    if (this.selectedEmployeeId === null) {
      this.errorMessage = 'Please select an employee first.';
      return;
    }

    this.editingSalaryId = null;
    this.form = this.emptyForm();
    this.errorMessage = '';
    this.showModal = true;
  }

  openEditModal(salary: SalaryResponse): void {
    this.editingSalaryId = salary.id;
    this.form = {
      baseSalary: salary.baseSalary,
      bonus: salary.bonus,
      currency: salary.currency,
      effectiveDate: salary.effectiveDate
    };
    this.errorMessage = '';
    this.showModal = true;
  }

  closeModal(): void {
    if (this.saving) return;
    this.showModal = false;
  }

 
saveSalary(): void {
  if (this.selectedEmployeeId === null) {
    this.errorMessage = 'Please select an employee first.';
    return;
  }

  const currency = this.form.currency.trim().toUpperCase();

  // Validate form data
  if (
    this.form.baseSalary < 0 ||
    this.form.bonus < 0 ||
    !Number.isFinite(this.form.baseSalary) ||
    !Number.isFinite(this.form.bonus) ||
    !/^[A-Z]{3}$/.test(currency) ||
    !this.form.effectiveDate
  ) {
    this.errorMessage =
      'Enter valid salary amounts, a three-letter currency code, and an effective date.';
    return;
  }

  const request: SalaryRequest = {
    baseSalary: Number(this.form.baseSalary),
    bonus: Number(this.form.bonus),
    currency: currency,
    effectiveDate: this.form.effectiveDate
  };

  this.saving = true;
  this.errorMessage = '';

  const employeeId = this.selectedEmployeeId;

  // Create or update salary
  const operation = this.editingSalaryId === null
    ? this.salaryService.createSalary(employeeId, request)
    : this.salaryService.updateSalary(this.editingSalaryId, request);

  operation
    .pipe(
      finalize(() => {
        this.saving = false;
      })
    )
    .subscribe({
      next: response => {
        console.log('Salary saved successfully:', response);

        this.showModal = false;
        this.editingSalaryId = null;

        this.successMessage =
          response.message || 'Salary saved successfully.';

        // Reload salary history for the same employee
        this.selectEmployee(employeeId);
      },

      error: error => {
        console.error('Salary save error:', error);

        this.errorMessage =
          error?.error?.message ||
          'Unable to save salary. Please try again.';
      }
    });
}


  deleteSalary(salary: SalaryResponse): void {
    const confirmed = window.confirm(
      `Delete this salary record effective ${salary.effectiveDate}?`
    );

    if (!confirmed) return;

    this.salaryService.deleteSalary(salary.id).subscribe({
      next: response => {
        this.successMessage = response.message || 'Salary record deleted.';
        if (this.selectedEmployeeId !== null) {
          this.selectEmployee(this.selectedEmployeeId);
        }
      },
      error: error => {
        this.errorMessage =
          error?.error?.message || 'Unable to delete salary record.';
      }
    });
  }

  get selectedEmployee(): EmployeeResponse | undefined {
    return this.employees.find(
      employee => employee.id === this.selectedEmployeeId
    );
  }
}
