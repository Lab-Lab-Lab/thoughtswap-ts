# ThoughtSwap

ThoughtSwap is a real-time classroom discussion tool that facilitates anonymous peer review of short answers ("thoughts") using Canvas for authentication.

- **Client**: React (Vite) + Tailwind CSS
- **Server**: Node.js (Express) + Socket.io + Prisma (PostgreSQL)

## Prerequisites

- **Node.js** (v18+ recommended)
- **npm**
- **Docker & Docker Compose** (for the database)
- A **Canvas LMS** instance (or a Free-for-Teacher account) for developer keys.

---

## 🛠️ Setup & Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/victor-hugo-dc/thoughtswap-ts.git
    cd thoughtswap-ts
    ```

2.  **Install dependencies:**
    This will install dependencies for the root, client, and server workspaces.

    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the root directory (or `packages/server/.env` depending on your preference, but the docker setup expects it at root or server level).

    ```env
    # Server Configuration
    PORT=8000
    DATABASE_URL="postgresql://user:password@localhost:5432/thoughtswap?schema=public"
    FRONTEND_URL="http://localhost:5173"

    # Canvas OAuth Configuration
    # Obtain these from Canvas Admin -> Developer Keys
    CANVAS_CLIENT_ID="your_client_id"
    CANVAS_CLIENT_SECRET="your_client_secret"
    CANVAS_BASE_URL="https://<your-canvas-instance>.instructure.com"

    # IMPORTANT: Must match exactly what is configured in Canvas
    CANVAS_REDIRECT_URI="http://localhost:8000/accounts/canvas/login/callback/"
    ```

---

## Local Development

### 1. Start the Database

Use Docker to spin up the PostgreSQL database defined in `docker-compose.yml`.

```bash
docker-compose up -d
```

### 2. Run Migrations & Seed

Apply the Prisma schema to your database and seed the initial dev user.

```bash
# Run from the root
npm run dev --workspace=packages/server
# OR specifically for migrations:
cd packages/server
npx prisma migrate dev
npx prisma db seed
```

The seed command creates a "Dev Teacher" account (teacher@dev.com) which allows you to test teacher features without a real Canvas login.

### 3. Start the Application

Run both the client and server concurrently from the root directory.

```bash
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:8000
