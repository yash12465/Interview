# DESIGN.md: interview-planner-ui

Instructions for AI coding assistants (Claude, Copilot, Cursor and others) working in this repo. Follow them when reading, writing or committing code.

## Project

Frontend for InterviewSetu, an interview-preparation platform with three roles: candidate, interviewer (mentor) and admin.
Stack: Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4.
All data comes from [Interview-planner-backend](https://github.com/Interview-planner/Interview-planner-backend) over REST.

> **This Next.js version has breaking changes.** Before using a Next.js API, read the matching guide in `node_modules/next/dist/docs/`. Don't rely on memory of older versions. See `AGENTS.md`.

## Commands

```bash
pnpm install
pnpm run dev          # http://localhost:40050 (start the backend first)
pnpm run typecheck    # run after every change
pnpm run lint         # Biome + Tailwind class check, as CI runs it
pnpm run lint:fix     # apply safe fixes and formatting
pnpm run build
pnpm test             # Playwright, against the mock API

scripts/start_frontend.sh [port] [-b] [--with-backend]   # checks, start, wait (Git Bash on Windows)
scripts/stop_frontend.sh [port] [--all] [--with-backend]
scripts/status_frontend.sh [--with-backend]
```

Copy `.env.example` to `.env.local` before the first run.
`next dev` reads the port from `PORT` (default 40050), so `PORT=8081 pnpm run dev` works on every OS.
`scripts/start_frontend.sh` / `scripts/stop_frontend.sh` wrap this with pre-flight checks, background mode and a clean stop (see README).

## Structure

```
src/
  app/(frontend)/          every page; shares layout.tsx and styles.css
    app/candidate|interviewer|admin/   role portals
    staff/                 admin portal
  components/
    CandidateApp.tsx, InterviewerApp.tsx, AdminApp.tsx   portal UIs
    PrototypeState.tsx     portal state (React context + localStorage)
    public/                PublicNav, PublicFooter
    ui/                    RippleButton, RoleSwitcher, LoadState, AppearanceSettings, SettingsLink
  lib/
    api.ts                 backend client
    use-api.ts             client-side fetch hook
  types/index.ts           domain types (copy of the backend's types)
```

## Fetching data

- Always use `src/lib/api.ts`. Never call `fetch` on the backend directly, and never hardcode the API URL.
- **Server components:** `await api<T>('/path')`, or `apiOrNull<T>()` when a 404 should show the not-found state. Add `export const dynamic = 'force-dynamic'`.
- **Client components:** `const { data, error, loading } = useApi<T>('/path')`, and render `LoadState` while loading or on error.
- Paths are relative to `/api/v1`, e.g. `api('/tracks')`.
- Never import seed data or copy backend data into the UI. If a page needs data that doesn't exist, the endpoint belongs in the backend repo.
- The portals (`/app/*`, `/staff`) read and write through `usePrototypeState()`. Keep that pattern in portal code unless the user asks to connect a feature to the API.

## Types

`src/types/index.ts` mirrors the backend's `src/data/mock-db.ts`. When you change a type here, say in your summary that the backend needs the same change.

## Pages and routing

- Pages live in `src/app/(frontend)/<route>/page.tsx`. Directory names are `kebab-case`.
- Route params are a Promise: `{ params }: { params: Promise<{ slug: string }> }`, then `const { slug } = await params`.
- Add `'use client'` only when the component needs state, effects or browser APIs.
- Public pages use `PublicNav` and `PublicFooter`.

## Styling

### CSS files

| File | Holds | Raw values (hex, px font sizes, font names) allowed? |
| --- | --- | --- |
| `src/app/(frontend)/global.css` | Design tokens: palette, semantic colours, type scale, fonts, Tailwind `@theme` | Yes, only here |
| `src/app/(frontend)/styles.css` | Element defaults (in `@layer base`) and component/page rules | No, only `var(--token)` |

`styles.css` imports `global.css`. Every colour, font size and font family in the app comes from `global.css`.

### No hardcoded values

Use a token or a Tailwind scale class, never a literal, unless nothing fits and it is genuinely needed:

- Colours → semantic colour tokens (below). Font sizes → the type scale. Fonts → `font-sans` / `font-display`.
- Spacing, radius, shadow → Tailwind's scale (`p-4`, `gap-3`, `rounded-lg`, `shadow-md`) in JSX, or `var(--spacing)` multiples / `var(--radius-lg)` / `var(--shadow-md)` in CSS.
- Not allowed: arbitrary values like `text-[11px]`, `p-[13px]`, `bg-[#fff]`, `w-[347px]`, and inline `style={{ fontSize: 11 }}` or `style={{ color: '#333' }}`.
- If a literal really is needed (a one-off layout measurement such as a sidebar width), add a short comment saying why. If you need the same value twice, make it a token in `global.css`.
- Older parts of `styles.css` still hardcode spacing and radii in px. Don't copy that; move a rule to tokens when you edit it.

### Colour rules (follow these exactly)

1. **Never write a colour value** (hex, `rgb()`, `hsl()`, named colours like `white`) in `styles.css`, in JSX `className` (`bg-[#fff]`), or in `style={{}}`. The only exceptions are `transparent`, `currentColor` and `inherit`.
2. **Use semantic tokens, not palette tokens.** In CSS write `var(--surface)`, `var(--text-muted)`, `var(--border)`, `var(--brand)`. Palette tokens (`--blue-700`, `--slate-200`, ...) exist only so semantic tokens can point at them, and they don't change with the theme.
3. **In JSX, use the token utilities** from `@theme`:

   | Role | Utilities |
   | --- | --- |
   | Backgrounds | `bg-surface`, `bg-surface-soft`, `bg-surface-sunken`, `bg-surface-raised`, `bg-surface-inverse` (always-dark panels), `bg-overlay` |
   | Text | `text-ink` (headings), `text-body`, `text-muted`, `text-subtle` (placeholders only), `text-inverse` (on dark/brand) |
   | Lines | `border-border`, `border-border-soft`, `border-border-strong`, `border-border-inverse` |
   | Brand | `bg-brand hover:bg-brand-hover text-inverse` (primary action), `text-brand-strong` (links, highlights), `bg-brand-soft` (selected), `border-brand-tint` |
   | Status | `text-success bg-success-soft border-success-border`, `bg-success-solid text-inverse`; same for `warning`, `danger`, `info` |
   | Focus | `outline-focus` / `ring-focus` |
   | Elevation | `shadow-sm`, `shadow-md`, `shadow-lg` (in CSS: `var(--shadow-md)`) |
4. **Don't use Tailwind's built-in palette** (`zinc-*`, `slate-*`, `indigo-*`, `rose-*`, `emerald-*`, `amber-*`, `white`, `black`, ...). They don't follow the theme, so they break dark mode.
5. **Pick the token by role, not by looks.** Background → `surface*`; text → `ink`/`body`/`muted`/`subtle`/`inverse`; lines → `border*`; status → `success`/`warning`/`danger`/`info` with a `-soft` background.
6. **Need a new colour?** Add it to the palette in `global.css`, map it to a semantic token with `light-dark(light, dark)` (and in the warm accent block if it is a brand or neutral colour), expose it in `@theme`, then use the semantic name. Mention the new token in your summary.
7. **Deprecated token names** (`--ink`, `--navy`, `--indigo`, `--violet`, `--cyan`, `--mint`, `--muted`, `--soft`, `--line`) still work but must not be used in new code.

### Typography (follow these exactly)

One type scale, defined in `global.css`. Use the Tailwind class in JSX or the variable in CSS:

| Token / class | Size | Use for |
| --- | --- | --- |
| `text-xs` / `var(--text-xs)` | 12px | **Minimum size.** Captions, badges, table meta, timestamps, helper text, bottom-nav labels |
| `text-sm` / `var(--text-sm)` | 14px | **Default UI text:** buttons, inputs, selects, tabs, table cells, sidebar nav, cards' body text |
| `text-base` / `var(--text-base)` | 16px | Body copy and paragraphs, large buttons, form text on mobile |
| `text-lg` / `var(--text-lg)` | 18px | Lead paragraphs, card titles |
| `text-xl` / `var(--text-xl)` | 20px | Section sub-headings (h3) |
| `text-2xl` / `var(--text-2xl)` | 24px | Portal page sections (h2), KPI figures |
| `text-3xl` / `var(--text-3xl)` | 30px | Page titles (h1) in portals and forms |
| `text-4xl`–`text-6xl` | 36–60px | Marketing headlines only (public pages) |

Rules:

1. **Nothing below 12px.** No `text-[10px]`, `font-size: 9px`, or `<small>` inside small text (`small` is fixed to `text-xs`).
2. **No px font sizes and no arbitrary sizes** (`text-[13px]`). Pick the nearest step. Responsive headlines use `clamp()` with tokens: `clamp(var(--text-4xl), 6vw, var(--text-6xl))`.
3. **Buttons:** `text-sm` (14px) by default (`RippleButton size="md"`), `text-xs` only for compact `size="sm"` buttons, `text-base` (16px) for `size="lg"`. All buttons in one row use the same size. Button labels don't wrap (`whitespace-nowrap`).
4. **One level of hierarchy per step.** Within a card: title `text-lg`/`text-base` semibold, body `text-sm`, meta `text-xs` muted. Don't skip from `text-xs` to `text-3xl` in the same component.
5. **Weights:** 400 body, 500–600 UI labels, 700 headings and buttons, 800 only for page and marketing headlines.
6. **Headings** use `font-display` (Manrope); everything else uses `font-sans` (DM Sans), which is the default.
7. **Uppercase eyebrow labels:** `text-xs`, weight 700, `tracking-wider`, at most one per section.
8. **Long labels on small screens:** give a shorter label instead of shrinking the text (see the `nav-short` labels in the portal bottom bars).

Element defaults (`body`, `button`, `input`, `small` ...) are in `@layer base` in `styles.css`, so Tailwind classes always override them. Don't add unlayered element rules; they would beat every utility.

### Minimum sizes and accessibility (Apple HIG target, WCAG 2.2 AA floor)

Aim for Apple's [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/accessibility). Never go below [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/). When the two differ, follow the stricter one.

| What | Target (Apple HIG) | Never below (WCAG 2.2 AA) | How |
| --- | --- | --- | --- |
| Touch/click target | **44×44px** | 24×24px (SC 2.5.8), or 24px of spacing around a smaller target | `min-h-11 min-w-11` (44px) on icon buttons, links in lists and nav items. In CSS: `min-height: calc(var(--spacing) * 11)` |
| Text size | 12px minimum (`text-xs`), 16px body copy | Text resizable to 200% without loss (SC 1.4.4) | Type scale above, in `rem`; never fix heights that clip text |
| Form fields on phones | **16px** (`text-base`) | – | Base layer sets inputs to `text-base` under 640px; below 16px iOS Safari zooms the page on focus. Don't override it with `text-sm` on mobile |
| Text contrast | 4.5:1 body, 3:1 large (≥24px, or ≥19px bold) | Same (SC 1.4.3) | Semantic tokens pass in all themes. `text-subtle` is for placeholders and decoration only |
| Non-text contrast | 3:1 for icons, input borders, focus rings | Same (SC 1.4.11) | `border-border-strong` on inputs, `outline-focus` for focus |
| Focus | Visible on every interactive element | SC 2.4.7, and not hidden behind sticky bars (SC 2.4.11) | `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus`. Never `outline: none` without a replacement |
| Motion | Respect reduced motion | SC 2.3.3 (AAA, but follow it) | `motion-safe:` utilities; respect `data-reduced-motion="true"` on `<html>` |

Also:

- A target smaller than 44px is acceptable only inside dense desktop tables and toolbars, and then it must still be at least 24×24px.
- Inline text links inside a sentence are exempt from target size, but links in lists, cards and nav are not.
- Icon-only buttons need an `aria-label`; inputs need a visible `<label>`; images need `alt`.
- Don't convey state with colour alone: pair status colours with text or an icon.
- Check new UI at 320px wide and with the browser zoomed to 200%.

### Themes and appearance

- Users choose **Theme** (System, the default; Light; Dark) and **Accent** (Blue, the default; Warm) at `/settings` and in each portal's Settings > Appearance tab. The choice is saved in `localStorage` (`interviewsetu-appearance`) and applied to `<html data-theme data-accent>` before first paint by the script in `layout.tsx`.
- Code for this lives in `src/lib/appearance-config.ts` (server-safe constants), `src/lib/appearance.ts` (`useAppearance()` hook, client only) and `src/components/ui/AppearanceSettings.tsx`. Reuse `AppearanceSettings` rather than building another switcher.
- Every screen must work in all four combinations (light/dark × blue/warm). If you only use semantic tokens, it does automatically. Check new UI in dark mode before finishing.
- Don't use Tailwind's `dark:` variant or `prefers-color-scheme` media queries for colours. The tokens already switch.

### Visual style (professional, not "AI-generated")

- No gradients: no gradient backgrounds, gradient text or gradient buttons. Use flat token colours.
- No glows or decorative blur: no coloured shadows, glowing blobs, `filter: blur()` decoration, aurora or orb effects. Elevation comes only from `shadow-sm/md/lg`.
- No floating or drifting decorative elements, and no hover "lift" (`translateY` on hover). Show hover with a border or background colour change.
- No emoji in the UI, including headings, buttons, badges, toasts and empty states. Use icons (below).
- One brand colour per screen. Status colours only for status. No extra decorative hues (violet, cyan, mint).
- Restrained radii: 8–10px for controls, 12–16px for cards, pills only for tags and chips.
- Uppercase letter-spaced "eyebrow" labels sparingly: at most one per section.

### Icons

- Use **[lucide-react](https://lucide.dev/icons/)** for every icon: `import { Calendar, TriangleAlert } from 'lucide-react'`, then `<Calendar size={16} />`. Browse names at lucide.dev.
- Don't draw inline `<svg>` icons, use icon fonts, or add another icon library. Older portal code still has hand-drawn SVG icon sets (`Icon`/`AIcon` helpers); replace them with lucide icons when you edit those components.
- Sizes: 16 inline with text, 20 in buttons and navigation, 24 in feature tiles. Colour comes from `currentColor`, so set it with a text utility (`text-muted`, `text-brand-strong`).
- Decorative icons are hidden from screen readers by default. Icon-only buttons need an `aria-label`.
- To store an icon in data, type it as `LucideIcon` and render it as `<item.icon size={20} />`.

### Other styling rules

- Use Tailwind utility classes in JSX first. Add a rule to `styles.css` only when a utility can't do it, and use a class selector, not a bare element selector.
- Use `RippleButton` for buttons (`primary`, `secondary`, `quiet`, `danger`, `ghost`).
- Layouts must work from 320px to 1440px wide with no horizontal scroll.
- Accessibility: see "Minimum sizes and accessibility" above.

## Code style

- TypeScript strict mode. Type props and function parameters. No `any` (Biome fails on it): type the value, use `unknown` and narrow, or use `getErrorMessage(err, fallback)` from `src/lib/error-message.ts` in `catch`.
- Components are `PascalCase.tsx`. Utilities are `kebab-case.ts`. Biome enforces both.
- Keep comments short and only where the code isn't obvious.

## Linting and formatting (Biome)

[Biome](https://biomejs.dev) formats, lints and sorts imports for JS/TS/JSON/CSS. Config: `biome.jsonc`. CI runs `pnpm run lint` and fails on any error or warning.

- **Style**: single quotes, no semicolons, trailing commas, 2-space indent, 100-char lines, LF line endings (`.gitattributes` enforces LF on Windows too). Run `pnpm run lint:fix` or format on save (VS Code settings are in `.vscode/`).
- **Rules**: Biome's `recommended` set plus the React and Next.js domains, with stricter rules on top (no unused imports/variables, `import type`, no non-null `!`, exhaustive hook deps, kebab/Pascal file names).
- **Never switch a rule off to make code pass.** Fix the code. If a rule is genuinely wrong for one line, suppress only that line with the reason:
  `// biome-ignore lint/<group>/<rule>: <why this case is safe>`. A suppression without a real reason is a review blocker.
- Accessibility rules stay on. Clickable things are `<button type="button">` (or links), never `<div onClick>`. Every form field has a `<label htmlFor>`, and a group of chips uses `<fieldset>` with a `<legend>`. Dialogs close on Escape (`useEscapeKey` in `src/lib/use-escape-key.ts`).
- Data-fetching functions called from an effect are wrapped in `useCallback` with their real dependencies, and the effect depends on the callback. Create Supabase clients once per component: `const [supabase] = useState(createClient)`.
- **Tailwind classes must be canonical** (`shrink-0`, not `flex-shrink-0`; scale values, not `min-w-[240px]`). `pnpm run lint:classes` checks this with Tailwind's own design system, and `pnpm run lint:fix` rewrites them.
- Markdown and YAML aren't formatted by Biome (its support is new and it re-nested a Playwright ARIA snapshot). Keep them hand-formatted.
- If a file has a syntax error, fix it before running any `--write`: Biome can misparse the file and its fixes then delete code.

## Configuration and security

- Env vars: `NEXT_PUBLIC_API_URL` (backend URL, no `/api/v1`) and `NEXT_PUBLIC_SITE_URL`.
- `NEXT_PUBLIC_*` values are bundled into the browser. Never put secrets in them or in `next.config.ts` `env`.
- Never commit `.env` or `.env.local`. Add new variables to `.env.example` with a safe default.
- Don't edit `AGENTS.md`. `next dev` regenerates it.

## Git and commits

- **No direct pushes or merges to `main`.** Every change, from every developer, goes through a pull request from a branch (`feat/...`, `fix/...`, `chore/...`, `docs/...`), and is merged only when CI is green. Our GitHub plan can't enforce branch protection on private repos, so this is a team rule: keep to it.
- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.
- **Never add attribution to a commit or pull request.** No `Co-Authored-By:` lines, no "Generated with ..." lines, and no mention of Claude, any AI assistant or any tool. The commit message is only the summary and an optional body.
- Don't commit or push unless the user asks.
- Never force-push or rewrite history without the user's explicit approval.
