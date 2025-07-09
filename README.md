# Fastify Microservices Project

This repository contains a collection of microservices built with Fastify and TypeScript, demonstrating a microservices architecture. Each service is designed to be independently deployable and scalable.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Database Setup](#database-setup)
- [Service Setup](#service-setup)
  - [Catalog Service](#catalog-service)
  - [Message Service](#message-service)
  - [Order Service](#order-service)
  - [Outbox Service](#outbox-service)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: LTS version (e.g., 18.x or 20.x). You can download it from [nodejs.org](https://nodejs.org/).
- **Docker & Docker Compose**: Used for setting up the database and other infrastructure. Install Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/).
- **npm** (Node Package Manager) or **yarn**: Comes with Node.js installation.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/fastify-micro-2.git
    cd fastify-micro-2
    ```

## Database Setup

The project uses Docker Compose to manage its database and other infrastructure services (e.g., Redis, Grafana, Tempo).

1.  **Navigate to the `db` directory:**
    ```bash
    cd db
    ```
2.  **Start the Docker services:**
    ```bash
    docker-compose up -d
    ```
    This command will build and start all services defined in `docker-compose.yml` in detached mode. Wait for all services to be healthy before proceeding. You can check their status with `docker-compose ps`.

## Service Setup

Each microservice needs its dependencies installed and database migrations applied (if applicable).

### Catalog Service

The `catalog-service` manages product information.

1.  **Navigate to the `catalog-service` directory:**
    ```bash
    cd ../catalog-service
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run Prisma migrations:**
    ```bash
    npx prisma migrate dev --name init
    ```
    This will apply any pending database migrations and generate the Prisma client.
4.  **Start the service:**
    ```bash
    npm run dev
    ```

### Message Service

The `message-service` handles inter-service communication and messaging.

1.  **Navigate to the `message-service` directory:**
    ```bash
    cd ../message-service
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the service:**
    ```bash
    npm run dev
    ```

### Order Service

The `order-service` manages customer orders and shopping carts.

1.  **Navigate to the `order-service` directory:**
    ```bash
    cd ../order-service
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run Prisma migrations:**
    ```bash
    npx prisma migrate dev --name init
    ```
    This will apply any pending database migrations and generate the Prisma client.
4.  **Start the service:**
    ```bash
    npm run dev
    ```

### Outbox Service

The `outbox-service` implements the Outbox Pattern for reliable event publishing.

1.  **Navigate to the `outbox-service` directory:**
    ```bash
    cd ../outbox-service
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run Prisma migrations:**
    ```bash
    npm run prisma:generate
    npx prisma db push
    ```
4.  **Start the service:**
    ```bash
    npm run dev
    ```

## Running Tests

Each service typically has its own set of tests.

1.  **Navigate to the desired service directory** (e.g., `catalog-service`):
    ```bash
    cd catalog-service
    ```
2.  **Run tests:**
    ```bash
    npm test
    ```

## Project Structure

- `catalog-service/`: Manages product data.
- `message-service/`: Handles inter-service messaging.
- `order-service/`: Manages order creation and shopping cart functionality.
- `outbox-service/`: Implements the Outbox Pattern for reliable event delivery.
- `db/`: Contains Docker Compose configurations for databases and monitoring tools.
