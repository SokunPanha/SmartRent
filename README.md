<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ed94c270-16ee-460f-a88b-a163686d4dba

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Project Structure

The app uses the Next.js App Router with a modular, feature-based layout. UI
primitives come from [shadcn/ui](https://ui.shadcn.com).

```
app/                      # Routes (one folder per page)
  layout.tsx              # Root layout → RentProvider + AppShell + Toaster
  page.tsx                # Redirects to /dashboard
  dashboard/page.tsx      # Each page consumes the shared store via useRent()
  properties/page.tsx
  tenants/page.tsx
  utilities/page.tsx      # Meter readings
  invoices/page.tsx
  reports/page.tsx
  api/telegram/send/      # API route
components/
  ui/                     # shadcn/ui primitives (button, card, sidebar, ...)
  layout/                 # AppShell, AppSidebar, AppHeader, nav-config
features/                 # Self-contained feature modules, each:
  <feature>/
    index.tsx             #   entry point (data wiring + composition)
    components/*.tsx       #   presentational sub-components
    <feature>.helpers.ts   #   pure helpers / derived-data builders
    use-*.ts               #   feature hooks (forms / controllers)
    *.api.ts, *.queries.ts #   data layer (fetch + TanStack Query)
  auth/                   # login: useLogin() hook + LoginForm component
components/shared/        # cross-feature reusables (Modal, EmptyState, PermissionBanner)
lib/format.ts             # shared currency/number formatters
store/
  rent-store.tsx          # Central state (Context) + useRent() hook, localStorage-backed
lib/                      # types, seed data, utils
hooks/                    # shared hooks
```

State for every page lives in `store/rent-store.tsx` and is shared across routes
through the `useRent()` hook, so navigation between pages preserves data.

## Theming (light / dark)

Theme is handled by **next-themes** (`attribute="class"`, default **dark**). A
sun/moon toggle in the header switches modes; the choice persists in
`localStorage`. The shell and all six feature pages use shadcn semantic tokens
(`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`,
`border-border`, …) defined in `app/globals.css`, so both themes stay
consistent. A `@media print` block forces the light palette so invoices/receipts
always print on white.

```
components/theme-provider.tsx        # next-themes provider
components/layout/ThemeToggle.tsx     # header sun/moon switch
app/globals.css                       # :root (light) + .dark token values + print override
```

## Authentication

Auth is handled by **Auth.js (NextAuth v5)** with a credentials (email/password)
provider and JWT sessions. Users live in the `users` table (bcrypt-hashed
passwords); each user is assigned a dynamic role whose permissions drive access
(see Dynamic roles & permissions below).

```
auth.config.ts        # edge-safe config (used by middleware) — route protection + JWT/session callbacks
auth.ts               # Node config — Credentials provider (bcrypt + DB lookup)
middleware.ts         # protects every route except /login and /api/auth/*
app/login/page.tsx    # sign-in form
app/api/auth/[...nextauth]/route.ts
app/api/users/route.ts   # owner-only: list / create users
lib/api/guard.ts      # requireUser() / requireRole() helpers for route handlers
```

Requires `AUTH_SECRET` in `.env.local` (see `.env.example`;
`openssl rand -base64 32`). The signed-in user + role appear in the sidebar
(replacing the old persona toggle), with a sign-out button.

### Dynamic roles & permissions (RBAC)

Roles are **not hard-coded** — a super admin creates them at runtime and chooses
each role's permissions. Permissions are a fixed capability catalog
(`lib/permissions.ts`): `properties.manage`, `tenants.manage`, `readings.manage`,
`invoices.generate`, `invoices.pay`, `admin.access`.

- **Roles & Permissions** (`/admin/roles`): create/rename/delete roles and toggle
  each role's capabilities. The built-in **Super Admin** role is a protected
  `isSystem` role (all access, can't be edited/deleted).
- **Users** (`/admin/users`): create users and assign them to any role.
- Anyone with the `admin.access` permission (e.g. Super Admin) sees the
  Administration section. The admin pages are server-guarded via
  `userCan('admin.access')`; the API is the authoritative gate.

Data model: `roles`, `role_permissions(role_id, permission)`, `users.role_id`.
Enforcement:
- Server — `requirePermission(key)` / `requireAdmin()` (`lib/api/guard.ts`) read
  the matrix **per request**, so permission changes take effect immediately
  (no re-login). Applied to every mutating route.
- Client — `useCan()` (from `/api/permissions/me`) hides actions the role lacks.

Safeguards: the system role can't be modified/deleted, a role in use can't be
deleted, you can't delete your own account, and the last Super Admin can't be
removed.

### Seeded login

`npm run db:seed` creates **only** the protected Super Admin role and one
account (everything else is created from the admin UI):

| Email               | Role        | Password      |
| ------------------- | ----------- | ------------- |
| `admin@khrent.local`| Super Admin | `password123` |

Sign in as the Super Admin, then create roles under **Roles & Permissions** and
add users under **Users**.

## API & Database

A REST API is implemented with Next.js **route handlers** under `app/api`,
backed by **Postgres** via **Drizzle ORM** (`lib/db`).

### Database setup (local)

```bash
# 1. Point DATABASE_URL at a Postgres instance (see .env.example)
echo 'DATABASE_URL="postgresql://USER@127.0.0.1:5432/rental_db"' >> .env.local

# 2. Apply the schema and seed baseline data
npm run db:migrate    # create tables from lib/db/migrations
npm run db:seed       # load the defaults from lib/data.ts
```

Helper scripts: `db:generate` (create a migration from schema changes),
`db:push` (push schema without a migration file), `db:studio` (Drizzle Studio).

### Endpoints

| Method(s)              | Path                              | Description                              |
| ---------------------- | --------------------------------- | ---------------------------------------- |
| `GET` `POST`           | `/api/properties`                 | List / create properties                 |
| `GET` `PATCH` `DELETE` | `/api/properties/:id`             | Read / update / delete (cascades rooms)  |
| `GET` `POST`           | `/api/rooms`                      | List (`?propertyId`) / create            |
| `GET` `PATCH` `DELETE` | `/api/rooms/:id`                  | Read / update / delete (keeps room count)|
| `GET` `POST`           | `/api/tenants`                    | List / create                            |
| `GET` `PATCH` `DELETE` | `/api/tenants/:id`                | Read / update / delete                   |
| `GET` `POST`           | `/api/contracts`                  | List (`?status`) / create (occupies room)|
| `GET` `PATCH` `DELETE` | `/api/contracts/:id`              | Read / update / delete (frees room)      |
| `GET` `POST`           | `/api/readings`                   | List (`?roomId&year&month`) / create     |
| `GET` `DELETE`         | `/api/readings/:id`               | Read / delete                            |
| `GET` `POST`           | `/api/invoices`                   | List (`?status&month&year`) / create     |
| `GET` `PATCH` `DELETE` | `/api/invoices/:id`               | Read / update / delete                   |
| `POST`                 | `/api/invoices/:id/payment`       | Record a payment (`{amount, method}`)    |
| `POST`                 | `/api/invoices/generate`          | Bulk-generate invoices (`{year, month}`) |
| `GET` `POST`           | `/api/logs`                       | Activity log list / append               |

Responses are `{ "data": ... }` on success and `{ "error": ... }` on failure.
Domain side-effects live in the handlers (e.g. creating a contract marks its
room `occupied`; deleting a room decrements the property's `totalRooms`).

### Frontend data layer

The UI is wired to the API with **TanStack Query**, organized per feature so no
single file owns all the data:

```
lib/api/client.ts                     # typed fetch wrapper (unwraps {data}/{error})
lib/query/provider.tsx                # QueryClientProvider
features/<feature>/<entity>.api.ts    # HTTP calls for that entity
features/<feature>/<entity>.queries.ts# useX() query + mutation hooks
features/activity/                    # logs + the shared logAction() hook
store/rent-store.tsx                  # UI-only prefs (language, persona, toast)
```

Each `app/<route>/page.tsx` pulls data from the relevant feature hooks and
passes it to its (prop-driven) feature component. Mutations invalidate the
affected query keys so related views stay consistent — e.g. creating a contract
invalidates both `contracts` and `rooms`. `store/rent-store.tsx` holds only
client UI state; all domain data flows through the query hooks.

