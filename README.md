# Angular Todo List — Full Stack (Signals + .NET 10)

A production-ready, modular Todo List application built with **Angular 18+** (utilizing Signals for state management) and **.NET Core 10** (Clean Architecture). The system is fully containerized and features a modern, premium design.

## 🚀 Features

-   **Signals-Based State**: Modern Angular reactivity with high performance.
-   **Clean Architecture**: Backend organized into Domain, Application, Infrastructure, and WebAPI layers.
-   **JWT Authentication**: Secure login/registration with automatic Access and Refresh token lifecycle.
-   **CQRS Pattern**: Decoupled command and query logic using MediatR.
-   **Responsive Design**: Premium dark mode UI with PrimeNG Aura and Tailwind CSS.
-   **Global Exception Handling**: Standardized API responses and error management.
-   **Database Migrations**: Automatic PostgreSQL schema updates on application startup.
-   **Docker Orchestration**: Single-command deployment for DB, API, and UI.

## 🛠️ Tech Stack

### Frontend
-   **Framework**: Angular 18+ (Standalone Components)
-   **State Management**: Angular Signals
-   **Styling**: Tailwind CSS & Vanilla CSS
-   **UI Components**: PrimeNG 21 (Aura Theme)
-   **Icons**: PrimeIcons
-   **Form Handling**: Reactive Forms

### Backend
-   **Runtime**: .NET Core 10
-   **Architecture**: Clean Architecture + CQRS
-   **Database**: PostgreSQL 16
-   **ORM**: Entity Framework Core
-   **Validation**: FluentValidation
-   **Mapping**: AutoMapper
-   **Messaging**: MediatR
-   **Security**: JWT (Bearer Tokens) & BCrypt hashing

## 📦 Project Structure

```text
Angular-Todo-List/
├── backend/                # .NET Core 10 Solution
│   ├── src/
│   │   ├── Domain/         # Entities, Enums, Interfaces
│   │   ├── Application/    # CQRS, DTOs, Business Logic
│   │   ├── Infrastructure/ # DB Context, Repositories, JWT, Hashers
│   │   └── WebAPI/         # Controllers, Middleware, Configuration
│   └── Dockerfile
├── frontend/               # Angular 18 SPA
│   ├── src/app/
│   │   ├── core/           # Guards, Interceptors, Services, Models
│   │   ├── features/       # Feature-based modules (Auth, Todo, Dashboard)
│   │   └── shared/         # Common Layouts & Components
│   └── Dockerfile
└── docker-compose.yml      # Orchestration for local development
```

## ⚙️ Prerequisites

-   [Docker Desktop](https://www.docker.com/products/docker-desktop/)
-   Node.js 22+ (for local frontend development)
-   .NET 10 SDK (for local backend development)

## 🚀 Quick Start (Docker)

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/Angular-Todo-List.git
    cd Angular-Todo-List
    ```

2.  **Configure Environment**:
    Copy `.env.example` to `.env` and update the `JWT_SECRET`.
    ```bash
    cp .env.example .env
    ```

3.  **Run the application**:
    ```bash
    docker-compose up -d --build
    ```

4.  **Access the application**:
    -   Frontend: [http://localhost:4200](http://localhost:4200)
    -   Backend API: [http://localhost:5000](http://localhost:5000)
    -   OpenAPI JSON: [http://localhost:5000/openapi/v1.json](http://localhost:5000/openapi/v1.json)

## 🔧 Environment Variables

The application uses the following variables (managed via `.env`):

| Variable | Description | Default |
| :--- | :--- | :--- |
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `postgres` |
| `JWT_SECRET` | Secret key for JWT signing | *(Required)* |

## 🧪 Development

### Backend Local Run
```bash
cd backend/src/TodoList.WebAPI
dotnet run
```

### Frontend Local Run
```bash
cd frontend
npm install
npm run start
```

## 📄 License
MIT License. See [LICENSE](LICENSE) for details.

---
*Built with 🌌 [Antigravity](https://github.com/google-deepmind/antigravity)*