# Employee Salary Management System — Frontend

Angular frontend for the Employee Salary Management System built for the Incubyte engineering assessment.

The application provides an HR Manager interface for managing employees, maintaining salary history, and viewing salary-related dashboard statistics.

## Features

- Dashboard with live employee and salary statistics
- Employee management
  - View employees
  - Search employees
  - Filter by country
  - Server-side pagination
  - Sorting
  - Add employee
  - Edit employee
  - Delete employee
- Salary management
  - View salary history
  - Add salary records
  - Edit salary records
  - Delete salary records
  - Calculate total compensation as base salary + bonus
- Form validation and error handling
- Responsive layout
- Angular routing
- REST API integration with Spring Boot backend

## Technology Stack

- Angular 22
- TypeScript
- Tailwind CSS
- RxJS
- HTML/CSS
- Vitest
- REST APIs

## Application Structure

```text
src/
├── app/
│   ├── core/
│   │   └── services/
│   │       ├── dashboard.ts
│   │       ├── employee.service.ts
│   │       └── salary.service.ts
│   │
│   ├── features/
│   │   ├── dashboard/
│   │   ├── employees/
│   │   │   ├── employee-form/
│   │   │   └── employee-list/
│   │   └── salaries/
│   │       └── salary-management/
│   │
│   ├── app.config.ts
│   ├── app.routes.ts
│   ├── app.html
│   └── app.ts
│
├── index.html
├── main.ts
└── styles.css
```

## Prerequisites

- Node.js
- npm
- Angular CLI

## Installation

Clone the repository and install dependencies:

```bash
npm install
```

## Development Server

Start the Angular development server:

```bash
ng serve
```

Open:

```text
http://localhost:4200
```

The frontend expects the Spring Boot backend to be available at:

```text
http://localhost:8080
```

## Production Build

Create a production build:

```bash
ng build
```

The generated build files are placed in the `dist/` directory.

## Unit Tests

Run the frontend unit tests:

```bash
ng test
```

The project uses Vitest through the Angular testing configuration.

## Backend Dependency

The frontend communicates with the Employee Salary Management System Spring Boot backend through REST APIs.

Backend repository:

https://github.com/vj0157/employee-salary-management

Backend base URL used by the application:

```text
http://localhost:8080/api
```

## Main API Areas

The frontend consumes APIs for:

- Employee management
- Employee search and filtering
- Salary history
- Salary CRUD operations
- Dashboard summary
- Country distribution
- Salary statistics

## Performance

The employee list uses server-side pagination and filtering so that the UI remains responsive when working with approximately 10,000 employee records.

## Assessment Notes

This frontend is part of the Incubyte Employee Salary Management System take-home assessment.

The application focuses on the requested employee and salary management workflow while deliberately keeping payroll processing, tax calculation, currency conversion, authentication/authorization, and other out-of-scope HR functionality outside the implementation.