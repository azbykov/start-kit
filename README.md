# Youth Football Match & Player Analytics Platform (MVP)

Web platform for youth football (soccer) tournaments, based on Veo2 match recordings and manually imported statistics.

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Database**: PostgreSQL with Prisma ORM
- **Data Fetching**: TanStack Query (React Query)
- **Tables**: TanStack Table
- **HTTP Client**: Axios
- **Logging**: pino

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd start-kit
```

2. Install dependencies:

```bash
npm install
```

3. Set up PostgreSQL database:

**Local PostgreSQL Setup:**

Ensure PostgreSQL is installed and running locally:

```bash
# macOS (using Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Create database
createdb startkit_dev
# or via psql:
# psql -U postgres
# CREATE DATABASE startkit_dev;
```

4. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your PostgreSQL connection string and NextAuth configuration:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/startkit_dev"
# NEXTAUTH_URL="http://localhost:3000"
# NEXTAUTH_SECRET="your-secret-key-here" # Generate with: openssl rand -base64 32
# YANDEX_CLIENT_ID="your-yandex-client-id" # Optional: Get from https://oauth.yandex.com/client/new
# YANDEX_CLIENT_SECRET="your-yandex-client-secret" # Optional: Get from https://oauth.yandex.com/client/new
```

**Yandex OAuth Setup (Optional):**
1. Go to [Yandex OAuth](https://oauth.yandex.com/client/new) and create a new application
2. Set callback URL to: `http://localhost:3001/api/auth/callback/yandex` (use the port from your `NEXTAUTH_URL`)
3. Copy `Client ID` and `Client Secret` to `.env` file

**Note:** The callback URL must match your `NEXTAUTH_URL` environment variable. If your dev server runs on a different port, update the callback URL accordingly.

5. Initialize database schema:

```bash
# Apply schema to database
npm run db:push

# Generate Prisma Client
npm run db:generate

# Seed test admin user
npm run db:seed
```

**Test Admin Credentials:**
- Email: `admin@test.com`
- Password: `admin123`

6. Start the development server:

```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/
├── app/              # Next.js App Router (pages, API routes)
├── components/       # React components
│   └── ui/          # shadcn/ui components
├── lib/             # Utilities and shared code
│   ├── api.ts       # Axios instance
│   ├── auth/        # NextAuth configuration and utilities
│   │   ├── config.ts # NextAuth configuration
│   │   ├── index.ts  # NextAuth exports
│   │   └── roles.ts  # Role-based access control utilities
│   ├── db.ts        # Prisma Client singleton
│   ├── db-utils.ts  # Database utilities
│   ├── logger.ts    # Structured logging
│   └── utils.ts     # General utilities
├── prisma/          # Prisma schema and migrations
│   └── schema.prisma # Database schema definition
└── public/          # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting without making changes

### Database Scripts

- `npm run db:push` - Apply schema changes to database (development only, no migrations)
- `npm run db:generate` - Generate Prisma Client from schema
- `npm run db:seed` - Seed database with test admin user

## Code Quality

This project uses ESLint and Prettier to maintain code quality and consistency.

### Running Linting

```bash
# Check for linting errors
npm run lint

# Automatically fix linting errors
npm run lint:fix
```

### Running Formatting

```bash
# Format all files
npm run format

# Check formatting without making changes
npm run format:check
```

### TypeScript Strict Mode

The project uses TypeScript strict mode to catch errors early. All type errors must be resolved before committing code.

## Authentication

The application uses NextAuth.js v5 (Auth.js) for authentication with JWT sessions.

### Authentication Methods

- **Credentials**: Email/password authentication
- **Yandex OAuth**: Sign in with Yandex account (optional, requires configuration and existing user account)

### User Roles

- **PLAYER**: Default role for regular users (default for OAuth users)
- **COACH**: Role for coaches
- **AGENT**: Role for agents
- **ADMIN**: Role for administrators

### Protected Routes

- `/dashboard` - Requires authentication
- `/admin` - Requires ADMIN role

### API Routes

- `/api/auth/*` - NextAuth authentication endpoints
- `/api/protected` - Example protected API route (requires authentication)
- `/api/admin` - Example admin-only API route (requires ADMIN role)

## Development

See [quickstart guide](./specs/001-project-setup/quickstart.md) for detailed setup instructions and verification steps.

For authentication setup, see [authentication quickstart](./specs/004-auth-roles-setup/quickstart.md).

## License

[Add license information]
