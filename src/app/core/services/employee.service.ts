
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface EmployeeRequest {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
}

export interface EmployeeResponse {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeePage {
  content: EmployeeResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/employees';

  getEmployees(): Observable<ApiResponse<EmployeeResponse[]>> {
    return this.http.get<ApiResponse<EmployeeResponse[]>>(this.apiUrl);
  }

  searchEmployees(
    search = '',
    country = '',
    page = 0,
    size = 10,
    sortBy = 'id',
    direction = 'asc'
  ): Observable<ApiResponse<EmployeePage>> {

    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('direction', direction);

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    if (country.trim()) {
      params = params.set('country', country.trim());
    }

    return this.http.get<ApiResponse<EmployeePage>>(
      `${this.apiUrl}/search`,
      { params }
    );
  }

  getEmployeeById(id: number): Observable<ApiResponse<EmployeeResponse>> {
    return this.http.get<ApiResponse<EmployeeResponse>>(
      `${this.apiUrl}/${id}`
    );
  }

  createEmployee(
    request: EmployeeRequest
  ): Observable<ApiResponse<EmployeeResponse>> {
    return this.http.post<ApiResponse<EmployeeResponse>>(
      this.apiUrl,
      request
    );
  }

  updateEmployee(
    id: number,
    request: EmployeeRequest
  ): Observable<ApiResponse<EmployeeResponse>> {
    return this.http.put<ApiResponse<EmployeeResponse>>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  deleteEmployee(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${id}`
    );
  }
}
