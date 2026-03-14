# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project overview
- Frontend app built with Vite + React + TypeScript.
- Styling uses Tailwind CSS v4 (via `@tailwindcss/vite`) plus global CSS in `src/index.css`.
- Data/auth backend is Supabase (`@supabase/supabase-js`), with credentials from Vite env vars.

## Common commands
- Install dependencies:
  - `npm install`
- Start local dev server:
  - `npm run dev`
- Build production bundle (includes TypeScript project build):
  - `npm run build`
- Lint:
  - `npm run lint`
- Preview production build locally:
  - `npm run preview`

## Tests
- There is currently no test runner configured in `package.json` and no test files in the repository.
- There is no existing command to run all tests or a single test.

## Environment and configuration
- Supabase client is created in `src/lib/supabaseClient.ts` from:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Vite plugins are configured in `vite.config.ts`:
  - React SWC plugin
  - Tailwind Vite plugin
- TypeScript uses project references (`tsconfig.json` -> `tsconfig.app.json` and `tsconfig.node.json`) with strict checks enabled in the app config.

## High-level architecture
- Entry point:
  - `src/main.tsx` renders `App` under `React.StrictMode` and imports global styles.
- App shell and auth gate:
  - `src/App.tsx` is the top-level orchestrator.
  - It listens to Supabase auth session state (`supabase.auth.getSession` + `onAuthStateChange`).
  - If unauthenticated, it renders `Auth`; if authenticated, it renders the routed app.
- Routing and navigation:
  - Routes are defined inside `App.tsx` using `react-router-dom`.
  - Shared header/footer navigation is implemented by `src/components/Digits.tsx`.
  - Main pages: `HomePage`, `Codes`, `Calculate`, `Vendors`, `Clients`, `Logout`.
- Data access pattern:
  - Supabase access is centralized in `src/services/addressService.tsx`.
  - Service functions read/write the `address` table, map DB snake_case fields to app camelCase `Address` type (`src/types/address.ts`), and expose filtered selectors (`getVendors`, `getClients`, `getAddressesByMonth`).
- UI data flow for address features:
  - Page components compose feature components:
    - `Vendors`/`Clients`: `AddressInput` + `AddressTable`
    - `Codes`: vendor/client `AddressTable` views
    - `Calculate`: date picker + `AddressTableFull` (monthly filter)
  - `AddressTable` and `AddressTableFull` fetch data via service functions and render with the reusable generic `src/components/Table.tsx` built on TanStack Table.
  - Row deletion is triggered from a custom right-click context menu in table wrapper components and calls `deleteAddress`.

## Notable current-state details
- Several scaffolding files currently exist but are empty (`src/router.tsx`, `src/lib/sessionManager.ts`, `src/contexts/SessionContext.ts`, `src/config/auth.ts`, `src/components/Layout.tsx`, `src/components/ProtectedRoute.tsx`, `src/utils/validation.ts`).
- `AddressInput` writes directly to Supabase instead of using `addressService`; when changing data logic, keep this split in mind.
