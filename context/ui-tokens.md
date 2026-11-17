# UI Tokens (Clean Clinical Healthcare Admin)

**Single Source of Truth** — defined in `src/app/globals.css` as CSS variables mapped into the Tailwind CSS theme.

Components may **only** use semantic tokens (e.g. `bg-background`, `bg-surface`, `text-primary`, `border-border`, `text-muted-foreground`).  
**Rule**: Never use raw hex values or raw Tailwind palette classes (e.g. `bg-blue-500`, `text-slate-800`) in component files.

---

## 1. Color Tokens ("Clean Clinical" Palette)

All text/background combinations meet or exceed **WCAG AA contrast (4.5:1 minimum)**.

| Token | CSS Variable | Hex Value | Primary Usage & Semantics |
| :--- | :--- | :--- | :--- |
| `background` | `--background` | `#F6F8FA` | Neutral soft grayish-blue page background |
| `surface` | `--surface` | `#FFFFFF` | Clean white card and modal containers |
| `surface-muted` | `--surface-muted` | `#EEF2F6` | Table headers, subtle hover rows, disabled inputs |
| `border` | `--border` | `#E2E8F0` | Subtle clean card borders, table dividers |
| `foreground` | `--foreground` | `#0F172A` | High contrast slate-black primary text |
| `muted-foreground` | `--muted-foreground` | `#475569` | Secondary text, captions, table metadata, placeholders |
| `primary` | `--primary` | `#0F766E` | Deep healthcare teal: primary buttons, active tabs/nav |
| `primary-hover` | `--primary-hover` | `#115E59` | Darker teal for button/link hover states |
| `primary-foreground` | `--primary-foreground`| `#FFFFFF` | Text on primary buttons and badges |
| `accent` | `--accent` | `#E6F6F4` | Soft teal tint: active nav pill background, highlights |
| `accent-foreground` | `--accent-foreground` | `#0F766E` | Text on accent backgrounds |
| `sidebar` | `--sidebar` | `#0F2A33` | Deep teal-navy navigation chrome |
| `sidebar-foreground`| `--sidebar-foreground`| `#F1F5F9` | Text/icons inside sidebar chrome |
| `sidebar-muted` | `--sidebar-muted` | `#94A3B8` | Inactive nav links inside sidebar |
| `sidebar-active` | `--sidebar-active` | `#134E5E` | Active nav link background inside sidebar |
| `ring` | `--ring` | `#0F766E` | Accessible focus rings for inputs and buttons |

---

## 2. Status Tokens (State Only — Never for Brand/Decorative Use)

Status colors are strictly reserved for state indicators (badges, alert banners, toast notifications).

| Token | Hex Value | Foreground Text Token | Usage |
| :--- | :--- | :--- | :--- |
| `success` | `#15803D` | `#FFFFFF` (`success-foreground`) | Completed actions, active doctor status |
| `warning` | `#B45309` | `#FFFFFF` (`warning-foreground`) | Cold-start alert, caution prompts |
| `danger` | `#B91C1C` | `#FFFFFF` (`danger-foreground`) | Destructive actions, delete confirmation, API errors |

---

## 3. Chart Palette (Independent Visualization Tokens)

Charts use an independent color strategy separate from the UI palette:

| Token | Variable | Hex Value | Role |
| :--- | :--- | :--- | :--- |
| `chart-1` | `--chart-1` | `#0F766E` | Deep Clinical Teal (Workload / Primary Series) |
| `chart-2` | `--chart-2` | `#4F46E5` | Indigo (Patient Admission Trend Line / Area) |
| `chart-3` | `--chart-3` | `#D97706` | Amber (Secondary Series / Observation) |
| `chart-4` | `--chart-4` | `#DB2777` | Rose/Pink (Diagnostic Condition Segment) |
| `chart-5` | `--chart-5` | `#64748B` | Slate Gray (Other / Unclassified Segment) |

---

## 4. Typography, Radii & Elevations

* **Font Family**: Inter (via `next/font/google`), loaded with `display: swap`.
* **Type Scale**:
  * `xs`: 0.75rem (12px) - micro labels, tags
  * `sm`: 0.875rem (14px) - table data, secondary captions
  * `base`: 1.000rem (16px) - body text, form input text (prevents iOS mobile zoom)
  * `lg`: 1.125rem (18px) - card titles, section subtitles
  * `xl`: 1.250rem (20px) - sub-headers, dialog titles
  * `2xl`: 1.500rem (24px) - page headings
  * `3xl`: 1.875rem (30px) - KPI metric numbers
* **Border Radii**:
  * `sm`: 0.25rem (4px) - badges, micro controls
  * `md`: 0.375rem (6px) - buttons, inputs
  * `lg`: 0.500rem (8px) - cards, dialogs, charts container
  * `xl`: 0.750rem (12px) - sheets, drawer panels
* **Box Shadows**:
  * `sm`: Subtle elevation for cards (`0 1px 2px 0 rgb(0 0 0 / 0.05)`)
  * `md`: Elevation for dropdowns, tooltips, dialogs (`0 4px 6px -1px rgb(0 0 0 / 0.1)`)
