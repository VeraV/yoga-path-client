# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server**: `npm run dev` (Vite, localhost:5173)
- **Build**: `npm run build` (runs `tsc -b && vite build`)
- **Lint**: `npm run lint`
- **Run all tests**: `npm test`
- **Run a single test**: `npx jest path/to/file.spec.ts`

## Architecture

React 19 + TypeScript SPA for yoga practice management. Connects to a Spring Boot backend API (default `http://localhost:8080/api`, configurable via `VITE_API_URL` env var).

### Key layers

- **`src/api/`** — Axios-based API layer. `axios.ts` configures the shared instance with JWT auth interceptor (token from localStorage) and 401 redirect. Domain-specific files (`authApi`, `profileApi`, `recommendationApi`, `practiceLogApi`, `referenceApi`) each export typed request functions.
- **`src/context/AuthContext.tsx`** — Single React context providing auth state (`user`, `isAuthenticated`, `isLoading`) and methods (`login`, `register`, `logout`). Verifies stored token on app load.
- **`src/pages/`** — Route-level page components: Home, Login, Register, Dashboard, Profile, Recommendations, PracticeLog.
- **`src/components/`** — `layout/` (Layout, Header), `guards/PrivateRoute` (auth-protected route wrapper), `common/` (ErrorMessage, Loading, LimitationsModal).
- **`src/types/`** — TypeScript interfaces organized by domain (auth, profile, recommendation, practiceLog, reference). Barrel-exported from `index.ts`.
- **`src/features/`**, **`src/hooks/`**, **`src/utils/`** — Exist but currently empty; intended for future feature-based organization.

### Routing

Defined in `App.tsx` using react-router-dom v7. Public routes (`/`, `/login`, `/register`) and authenticated routes (`/dashboard`, `/profile`, `/recommendations`, `/practice-log`) wrapped in `PrivateRoute`. Layout component wraps all routes with Header + Outlet.

### Styling

SCSS files in `src/styles/` and co-located with components. Uses Sass (`sass` package).

### Forms

`react-hook-form` is used for form handling (login, register, profile, practice log).

### Testing

Jest + ts-jest + React Testing Library with jsdom environment. Config in `jest.config.cjs`, separate `tsconfig.jest.json` for test compilation.

### Deployment

Deployed to Vercel. `vercel.json` rewrites all routes to `index.html` for SPA support.
