import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';
import { EmployeeForm } from './features/employees/employee-form/employee-form';
import { EmployeeList } from './features/employees/employee-list/employee-list';
import { SalaryManagement } from './features/salaries/salary-management/salary-management';

export const routes: Routes = [
     {
    path: '',
    component: Dashboard
  },
  {
    path: 'dashboard',
    component: Dashboard
  },
    {
    path: 'employees',
    component: EmployeeList
  },
  {
    path: 'employees/new',
    component: EmployeeForm
  },
  {
    path: 'employees/edit/:id',
    component: EmployeeForm
  },
  { path: 'salary-management', component: SalaryManagement },
  {
    path: '**',
    redirectTo: ''
  }
];
