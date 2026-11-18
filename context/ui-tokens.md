# UI Tokens (Soft Clinical Healthcare Admin)

**Single Source of Truth** — defined in `src/app/globals.css` as CSS variables mapped into the Tailwind CSS theme.

Components may **only** use semantic tokens (e.g. `bg-background`, `bg-surface`, `text-primary`, `border-border`, `text-muted-foreground`, `shadow-raised`, `shadow-inset`).  
**Rule**: Never use raw hex values or raw Tailwind palette classes (e.g. `bg-blue-500`, `text-slate-800`) in component files.

---

## 1. Color Tokens ("Soft Clinical" Neumorphic Palette)

All text/background combinations meet or exceed **WCAG AA contrast (4.5:1 minimum)**. Interactive element borders meet **3:1 contrast** minimum.

| Token | CSS Variable | Hex Value | Primary Usage & Semantics | Contrast vs Surface (`#E6EBF1`) |
| :--- | :--- | :--- | :--- | :--- |
| `background` | `--background` | `#E6EBF1` | Soft neutral clinical background | 1:1 (base surface) |
| `surface` | `--surface` | `#E6EBF1` | Soft neumorphic surface for cards, buttons, modals | 1:1 (base surface) |
| `surface-muted` | `--surface-muted` | `#D9E1EB` | Inset backgrounds, table headers, hover rows | 1.15:1 |
| `border` | `--border` | `#7A899B` | Mandatory 1px border for inputs, buttons, selects | **3.03:1** (meets >= 3:1 safeguard) |
| `border-subtle` | `--border-subtle` | `#C8D1DC` | Subtle dividers inside flat tables | 1.4:1 |
| `foreground` | `--foreground` | `#0F172A` | Slate-black primary text | **11.5:1** (exceeds 4.5:1 AA) |
| `muted-foreground` | `--muted-foreground` | `#475569` | Secondary text, captions, metadata | **5.1:1** (exceeds 4.5:1 AA) |
| `primary` | `--primary` | `#0D6E66` | Clinical teal (tuned for AA contrast) | **5.04:1** (exceeds 4.5:1 AA) |
| `primary-hover` | `--primary-hover` | `#0A5650` | Deeper teal for hover states | 6.2:1 |
| `primary-foreground` | `--primary-foreground`| `#FFFFFF` | Text on primary solid teal buttons | **6.01:1** on `#0D6E66` |
| `accent` | `--accent` | `#D6EAE7` | Soft teal tint: active nav pill background | 1.1:1 |
| `accent-foreground` | `--accent-foreground` | `#0D6E66` | Text on accent backgrounds | **4.6:1** |
| `sidebar` | `--sidebar` | `#E6EBF1` | Continuous soft clinical chrome | 1:1 |
| `sidebar-foreground`| `--sidebar-foreground`| `#0F172A` | Text/icons inside sidebar chrome | 11.5:1 |
| `sidebar-muted` | `--sidebar-muted` | `#475569` | Inactive nav links inside sidebar | 5.1:1 |
| `sidebar-active` | `--sidebar-active` | `#D6EAE7` | Active nav link background inside sidebar | 1.1:1 |
| `ring` | `--ring` | `#0D6E66` | Accessible focus ring (2px offset) | 5.04:1 |

---

## 2. Neumorphic Shadow Tokens (Dual-Layer Only)

Neumorphism in "Soft Clinical" uses at most 2 shadow layers per token, keeping performance smooth and rendering crisp:

| Token | CSS Variable / Utility | Shadow Definition | Primary Role |
| :--- | :--- | :--- | :--- |
| `shadow-raised` | `--shadow-raised` (`shadow-raised`) | `-4px -4px 10px #FFFFFF, 4px 4px 10px #C2CAD6` | Raised cards, dialogs, primary & outline buttons |
| `shadow-raised-sm` | `--shadow-raised-sm` (`shadow-raised-sm`) | `-2px -2px 5px #FFFFFF, 2px 2px 5px #C2CAD6` | Micro-controls, badges, table mobile cards, icon buttons |
| `shadow-inset` | `--shadow-inset` (`shadow-inset`) | `inset 2px 2px 5px #C2CAD6, inset -2px -2px 5px #FFFFFF` | Inset text inputs, search fields, selects, active nav items |
| `shadow-pressed` | `--shadow-pressed` (`shadow-pressed`) | `inset 3px 3px 6px #B8C2D0, inset -3px -3px 6px #FFFFFF` | Active pressed button and toggle states |

---

## 3. Status Tokens (State Only)

| Token | Hex Value | Foreground Text Token | Usage |
| :--- | :--- | :--- | :--- |
| `success` | `#15803D` | `#FFFFFF` (`success-foreground`) | Completed actions, live API online status dot |
| `warning` | `#B45309` | `#FFFFFF` (`warning-foreground`) | Cold-start alert, caution prompts |
| `danger` | `#B91C1C` | `#FFFFFF` (`danger-foreground`) | Destructive actions, delete confirmation, API errors |

---

## 4. Chart Palette (Independent Visualization Tokens)

| Token | Variable | Hex Value | Role |
| :--- | :--- | :--- | :--- |
| `chart-1` | `--chart-1` | `#0D6E66` | Deep Clinical Teal (Primary Series / Workload) |
| `chart-2` | `--chart-2` | `#4338CA` | Indigo (Patient Admission Trend Line / Area) |
| `chart-3` | `--chart-3` | `#D97706` | Amber (Secondary Series / Observation) |
| `chart-4` | `--chart-4` | `#DB2777` | Rose/Pink (Diagnostic Condition Segment) |
| `chart-5` | `--chart-5` | `#64748B` | Slate Gray (Other / Unclassified Segment) |

---

## 5. Typography, Radii & Safeguards

* **Font Family**: Inter (via `next/font/google`), loaded with `display: swap`.
* **Border Radii**:
  * `radius-sm`: `0.25rem` (4px) - micro controls
  * `radius-md`: `0.5rem` (8px) - default radius
  * `radius-lg`: `0.75rem` (12px) - buttons, inputs
  * `radius-xl`: `1rem` (16px) - cards, dialogs, drawers
* **Mandatory Safeguards**:
  * Visible 1px border (`border-border`) on every interactive control ($\ge 3:1$ contrast against surface).
  * Visible focus ring (`ring-2 ring-primary ring-offset-2`).
  * Primary buttons remain solid teal with high-contrast white text (`#FFFFFF`).
  * Tables stay FLAT inside one raised card: no per-row neumorphism.
  * `prefers-reduced-motion` media query zeroes transitions and animations for accessibility.
