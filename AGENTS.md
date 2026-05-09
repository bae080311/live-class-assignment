# live-class-assignment — Project Rules & Conventions

## Tech Stack (MANDATORY to follow)

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.x |
| UI | React | 19.x |
| Language | TypeScript | 5.x (strict) |
| Form | react-hook-form | 7.x |
| Validation | Zod | 4.x |
| Data Fetching | ky + TanStack React Query | 5.x |
| Styling | Tailwind CSS | v3 |
| Testing | Vitest + Testing Library | latest |

**NO external UI libraries.** No styled-components, MUI, Radix, Shadcn, etc.

---

## File Structure Conventions

```
app/
  api/{resource}/route.ts        # API route handlers (server-only)
  page.tsx                       # Root page (renders EnrollmentForm)
  layout.tsx                     # Root layout + providers
  providers.tsx                  # React Query + global providers
  globals.css                    # @tailwind directives + global base only

components/enrollment/
  EnrollmentForm.tsx             # Root form orchestrator (state machine)
  Step{1,2,3}{Name}.tsx          # Individual step components
  StepBar.tsx                    # Step progress indicator
  TopBar.tsx                     # Back button + step counter
  Result{Success,Fail}.tsx       # Submission result screens
  SaveBanner.tsx                 # Auto-save indicator
  LeaveModal.tsx                 # Exit confirmation modal
  Icons.tsx                      # Inline SVG icon components

lib/
  schemas/enrollment.ts          # Zod schemas + validate helpers
  db.ts                          # File-based DB (reads/writes data/db.json)
  api/client.ts                  # Shared ky instance (ONLY file that imports ky directly)
  api/{courses,enrollments}.ts   # Client-side API wrappers (use apiClient)

data/
  db.json                        # Persistent mock data (courses + enrollments)

test/
  components/                    # Component tests (Testing Library)
  lib/                           # API wrapper + DB tests
  schemas/                       # Zod schema validation tests
```

---

## Coding Rules

### 1. Form State Management
- **Orchestrator pattern**: `EnrollmentForm.tsx` holds ALL state, passes down via props
- **RHF**: handles Step 2 personal fields (name, email, phone, motivation)
- **localState (useState)**: handles cross-step data (courseId, type, participants, agreed)
- **Step transitions**: validate with Zod `safeParse()` BEFORE calling `setStep(n + 1)`
- **NEVER** use Context API for form state

### 2. Zod Validation
- Schema files: `lib/schemas/enrollment.ts`
- Use `safeParse()`, NOT `parse()` — handle errors manually
- Step schemas: `Step1Schema`, `Step2PersonalSchema`, `Step2GroupSchema`, `Step3Schema`
- Server-side re-validation in API routes using the SAME schemas
- All error messages in Korean (user-facing)

### 3. API Layer
- `lib/api/client.ts` exports `apiClient = ky.create(...)` — ONLY this file imports `ky` directly
- All other wrappers import `apiClient` from `./client`
- Error response format: `{ code: string; message: string; details?: Record<string, string> }`
- Error codes: `COURSE_FULL`, `DUPLICATE_ENROLLMENT`, `INVALID_INPUT`
- Use TanStack React Query for all data fetching (`useQuery`, `useMutation`)
- HTTP status codes: 201 (created), 400 (validation), 409 (conflict), 500 (server error)

### 4. Styling (Tailwind CSS v3)
- Use Tailwind utility classes — NO inline styles
- Design tokens defined in `tailwind.config.ts` under `theme.extend`
- Key tokens: `brand`, `brand-soft`, `danger`, `danger-soft`, `success`, `ink-1`~`ink-5`
- Border radius: `rounded-sm`(10px) `rounded-md`(14px) `rounded-lg`(20px) `rounded-xl`(28px)
- Font: Pretendard via `font-sans` (configured in tailwind.config.ts)
- `globals.css` contains ONLY `@tailwind` directives + minimal `@layer base`
- New tokens → add to `tailwind.config.ts` `theme.extend`, not arbitrary values `[...]`

### 5. Testing
- Test files: `test/{components,lib,schemas}/*.test.tsx`
- Mock ALL API calls — never hit real endpoints
- Test user flows, not implementation details
- Both valid AND invalid inputs must be tested for schema tests
- Coverage target: 80%+

### 6. TypeScript
- Strict mode — NO `as any`, NO `@ts-ignore`, NO `@ts-expect-error`
- Use `z.infer<typeof Schema>` for derived types
- All form data flows through `EnrollmentFormData` type

### 7. Next.js Specific
- ALL interactive components need `'use client'` at top
- API routes import `'server-only'` at top
- `lib/db.ts` is server-only — reads/writes `data/db.json` via Node.js `fs`
- DB functions: `getAll`, `getById`, `create`, `remove` — never manipulate db.json directly

---

## Anti-Patterns (BLOCKING)

- ❌ External UI libraries (Radix, MUI, Shadcn, etc.)
- ❌ `as any` or `@ts-ignore` for type errors
- ❌ Inline styles `style={{...}}` (except truly dynamic values)
- ❌ Arbitrary Tailwind values (`text-[#333]`) when a token exists (`text-ink-1`)
- ❌ Context API for form state
- ❌ Direct DOM manipulation
- ❌ Skipping server-side validation in API routes
- ❌ English user-facing error messages
- ❌ Deleting tests to get green builds
- ❌ Importing `ky` directly outside of `lib/api/client.ts`
- ❌ `useEffect` for data fetching (use React Query)

---

## Review Checklist (before marking task complete)

1. [ ] No TypeScript errors (`npx tsc --noEmit`)
2. [ ] `npm run build` passes
3. [ ] `npm run test` passes (no new failures)
4. [ ] Error messages in Korean
5. [ ] No new inline styles — Tailwind classes only
6. [ ] No `as any` or `@ts-ignore`
7. [ ] Server-side validation present in API routes
