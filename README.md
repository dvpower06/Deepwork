# Deepwork

Deepwork helps you plan tasks and stay focused during deep work sessions. It includes a Pomodoro timer and a personal space with simple charts for completed tasks and focus time.

> **Status: In development.** Features and design may change as the app is built.

## Features

- 25-minute Pomodoro focus timer
- Add, complete, and remove tasks
- Weekly, monthly, and yearly charts for completed tasks and focus time
- Saves statistics in your browser (for now)


## Tech stack

- Frontend: React and Vite
- Backend: Java, Spring Boot, and Maven

## Getting started

### Frontend

Requirements: Node.js and npm.

```sh
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite in your browser.

To create a production build or run the linter:

```sh
npm run build
npm run lint
```

### Backend

Requirements: Java 25.

From the repository root, run:

```sh
cd backend
./mvnw spring-boot:run
```

On Windows, use `mvnw.cmd spring-boot:run` instead.

## Project structure

```text
frontend/   React application
backend/    Spring Boot application
```

## Development

This project is under active development. Contributions and suggestions are welcome; please open an issue or pull request.
