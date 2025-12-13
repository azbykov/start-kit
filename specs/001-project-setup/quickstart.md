# Quickstart Guide: Project Setup

**Feature**: Project Setup and Foundation  
**Date**: 2025-11-29

This guide helps developers set up the project locally and verify all components are working correctly.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git installed
- Code editor (VS Code recommended)

## Setup Steps

### 1. Clone Repository

```bash
git clone <repository-url>
cd start-kit
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

**Expected Outcome**: All dependencies install without errors.

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` file and set required variables (if any are needed for initial setup).

**Note**: `.env` file is excluded from version control. Never commit secrets.

### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
```

**Expected Outcome**:

- Server starts on `http://localhost:3000` (or next available port)
- No errors in terminal
- Browser can access the application

### 5. Verify Setup

#### 5.1 Home Page Loads

1. Open `http://localhost:3000` in browser
2. Verify page loads without console errors
3. Check browser console (F12) - no errors should appear

**Success Criteria**: Page displays content, no console errors

#### 5.2 UI Components Work

1. Navigate to a page that uses shadcn/ui components (if example page exists)
2. Verify components render correctly
3. Check that TailwindCSS styles are applied

**Success Criteria**: Components display with proper styling

#### 5.3 Data Fetching Works

1. If example API endpoint exists, verify data fetching:
   - Check network tab in browser DevTools
   - Verify API requests succeed
   - Check that TanStack Query shows loading/error states correctly

**Success Criteria**: Data fetching works, loading states display correctly

#### 5.4 Code Quality Tools

```bash
# Run linter
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check
```

**Success Criteria**:

- Linter runs without errors (warnings acceptable)
- Formatter works correctly
- TypeScript compiles without errors

#### 5.5 Build Production

```bash
npm run build
```

**Success Criteria**:

- Build completes without errors
- No TypeScript errors
- Production build is created in `.next` directory

## Verification Checklist

- [ ] Dependencies install successfully
- [ ] Development server starts without errors
- [ ] Home page loads in browser
- [ ] No console errors in browser
- [ ] UI components render correctly (if example exists)
- [ ] TailwindCSS styles apply correctly
- [ ] Data fetching works (if example endpoint exists)
- [ ] Linter runs successfully
- [ ] Code formatter works
- [ ] TypeScript compiles without errors
- [ ] Production build succeeds

## Troubleshooting

### Dependencies Fail to Install

- Check Node.js version: `node --version` (should be 18+)
- Clear cache: `npm cache clean --force` or `yarn cache clean`
- Delete `node_modules` and `package-lock.json`, then reinstall

### Development Server Won't Start

- Check if port 3000 is already in use
- Verify `.env` file exists (copy from `.env.example` if missing)
- Check terminal for specific error messages

### TypeScript Errors

- Verify `tsconfig.json` exists and is properly configured
- Run `npm run type-check` (if script exists) to see all errors
- Ensure all dependencies are installed

### Styling Not Working

- Verify TailwindCSS is configured in `tailwind.config.ts`
- Check that `globals.css` imports Tailwind directives
- Restart development server after config changes

### Data Fetching Errors

- Check browser network tab for failed requests
- Verify API endpoint is accessible
- Check that TanStack Query provider is set up in root layout
- Verify Axios instance is configured correctly

## Next Steps

After successful setup:

1. Review project structure in `README.md`
2. Explore example components in `components/ui/`
3. Check API client configuration in `lib/api.ts`
4. Review logging setup in `lib/logger.ts`

## Getting Help

- Check project README for additional documentation
- Review constitution at `.specify/memory/constitution.md` for project principles
- Check feature specification at `specs/001-project-setup/spec.md` for requirements
