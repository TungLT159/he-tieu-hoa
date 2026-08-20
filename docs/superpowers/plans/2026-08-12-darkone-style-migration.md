# Darkone Style Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Áp dụng toàn bộ visual identity của Darkone React Dashboard Template vào dự án: palette màu tím chủ đạo, flat shadow, border radius nhỏ hơn, soft button/badge variants, double-border cards.

**Architecture:** Thay thế CSS custom properties trong `index.css` bằng token Darkone, cập nhật `@theme inline` block, và nâng cấp 11 shadcn/ui components. Không thêm dependency mới, không thay font, không thay layout.

**Tech Stack:** Tailwind CSS v4, React 19, TypeScript, Radix UI, shadcn/ui (New York)

---

### Task 1: Update Design Tokens in `src/index.css`

**Files:**
- Modify: `src/index.css` (toàn bộ file)

- [ ] **Step 1: Replace the entire `src/index.css` with Darkone tokens**

Thay toàn bộ nội dung file bằng:

```css
@import "tailwindcss";
@import "tw-animate-css";

/* ============================================================
   Theme Variables — Darkone-inspired light/dark contract
   ============================================================ */

:root {
  --font-sans: ui-sans-serif, "Segoe UI Variable", "Segoe UI", Helvetica, Arial, sans-serif;
  --font-mono: "Cascadia Code", "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-family: var(--font-sans);
  line-height: 1.5;
  font-weight: 400;
  font-size: 14px;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

[data-radix-popper-content-wrapper] {
  zoom: var(--starter-overlay-zoom-inverse, 1);
}

[data-radix-popper-content-wrapper] > [data-slot="dropdown-menu-content"],
[data-radix-popper-content-wrapper] > [data-slot="popover-content"],
[data-radix-popper-content-wrapper] > [data-slot="select-content"],
[data-radix-popper-content-wrapper] > [data-slot="tooltip-content"] {
  zoom: var(--starter-overlay-zoom-factor, 1);
}

:root,
[data-theme="light"] {
  color-scheme: light;

  /* --- Semantic surfaces (light mode) --- */
  --surface-app: #f8f7fa;
  --surface-sidebar: #ffffff;
  --surface-panel: #ffffff;
  --surface-card: #ffffff;
  --surface-popover: #ffffff;
  --surface-input: #ffffff;
  --surface-button: #eef2f7;
  --surface-dialog: #ffffff;
  --surface-editor: #ffffff;
  --surface-overlay: rgba(0, 0, 0, 0.3);

  /* --- Semantic text (light mode) --- */
  --text-primary: #5d7186;
  --text-secondary: #8391a2;
  --text-tertiary: #8391a2;
  --text-muted: #b0b0bb;
  --text-faint: #b0b0bb;
  --text-heading: #424e5a;
  --text-inverse: #ffffff;

  /* --- Semantic borders (light mode) --- */
  --border-default: #eaedf1;
  --border-subtle: #eaedf1;
  --border-strong: #d8dfe7;
  --border-input: #d8dfe7;
  --border-dialog: #eaedf1;
  --border-focus: #7e67fe;

  /* --- Interaction states (light mode) --- */
  --state-hover: #eef2f7;
  --state-hover-subtle: #f8f9fa;
  --state-selected: rgba(126, 103, 254, 0.1);
  --state-selected-strong: rgba(126, 103, 254, 0.18);
  --state-active: rgba(126, 103, 254, 0.1);
  --state-focus-ring: #7e67fe;
  --state-drag-target: rgba(126, 103, 254, 0.12);
  --state-disabled: #eef2f7;

  /* --- Accent roles (light mode) --- */
  --accent-blue: #1a80f8;
  --accent-blue-bg: rgba(26, 128, 248, 0.12);
  --accent-blue-hover: #1568d0;
  --accent-blue-light: rgba(26, 128, 248, 0.1);
  --accent-green: #21d760;
  --accent-green-light: rgba(33, 215, 96, 0.1);
  --accent-orange: #f0934e;
  --accent-orange-light: rgba(240, 147, 78, 0.1);
  --accent-red: #ed321f;
  --accent-red-light: rgba(237, 50, 31, 0.1);
  --accent-purple: #7e67fe;
  --accent-purple-light: rgba(126, 103, 254, 0.1);
  --accent-yellow: #fb9f68;
  --accent-yellow-light: rgba(251, 159, 104, 0.1);
  --accent-teal: #040505;
  --accent-teal-light: rgba(4, 5, 5, 0.1);
  --accent-pink: #ff86c8;
  --accent-pink-light: rgba(255, 134, 200, 0.1);
  --accent-gray: #8486a7;
  --accent-gray-light: rgba(132, 134, 167, 0.1);

  /* --- Feedback roles (light mode) --- */
  --feedback-info-text: var(--accent-blue);
  --feedback-info-bg: var(--accent-blue-light);
  --feedback-success-text: var(--accent-green);
  --feedback-success-bg: var(--accent-green-light);
  --feedback-warning-text: #f0934e;
  --feedback-warning-bg: rgba(240, 147, 78, 0.1);
  --feedback-warning-border: #f0934e;
  --feedback-error-text: var(--accent-red);
  --feedback-error-bg: var(--accent-red-light);

  /* --- Syntax and diff roles (light mode) --- */
  --syntax-heading: #0969DA;
  --syntax-link: #0969DA;
  --syntax-monospace: #C9383E;
  --syntax-monospace-bg: rgba(175, 184, 193, 0.15);
  --syntax-muted: #636C76;
  --syntax-frontmatter-key: #C9383E;
  --syntax-frontmatter-value: #2A7E4F;
  --syntax-highlight-comment: #6A737D;
  --syntax-highlight-keyword: #D73A49;
  --syntax-highlight-string: #032F62;
  --syntax-highlight-number: #005CC5;
  --syntax-highlight-title: #6F42C1;
  --syntax-highlight-type: #E36209;
  --syntax-highlight-deletion: #B31D28;
  --syntax-highlight-deletion-bg: #FFEEF0;
  --diff-added-text: #4CAF50;
  --diff-added-bg: rgba(76, 175, 80, 0.12);
  --diff-removed-text: #F44336;
  --diff-removed-bg: rgba(244, 67, 54, 0.12);
  --diff-hunk-bg: rgba(33, 150, 243, 0.08);
  --editor-code-block-background: var(--surface-sidebar);
  --editor-code-block-border: var(--border-subtle);
  --editor-code-block-text: var(--text-primary);
  --editor-code-block-language: var(--text-secondary);

  /* --- Shadows (light mode) --- */
  --shadow-panel: 0px 3px 4px 0px rgba(0, 0, 0, 0.03);
  --shadow-panel-soft: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  --shadow-overlay: var(--surface-overlay);
  --shadow-dialog: rgba(30, 32, 37, 0.12);

  /* --- shadcn theme aliases (light mode) --- */
  --radius: 0.35rem;
  --background: var(--surface-app);
  --foreground: var(--text-primary);
  --card: var(--surface-card);
  --card-foreground: var(--text-primary);
  --popover: var(--surface-popover);
  --popover-foreground: var(--text-primary);
  --primary: var(--accent-purple);
  --primary-foreground: var(--text-inverse);
  --secondary: #424e5a;
  --secondary-foreground: var(--text-inverse);
  --muted: #eef2f7;
  --muted-foreground: var(--text-secondary);
  --accent: var(--state-hover);
  --accent-foreground: var(--text-primary);
  --destructive: var(--accent-red);
  --destructive-foreground: var(--text-inverse);
  --border: var(--border-default);
  --input: var(--border-input);
  --ring: var(--state-focus-ring);
  --sidebar: var(--surface-sidebar);
  --sidebar-foreground: var(--text-primary);
  --sidebar-primary: var(--accent-purple);
  --sidebar-primary-foreground: var(--text-inverse);
  --sidebar-accent: var(--state-hover);
  --sidebar-accent-foreground: var(--text-primary);
  --sidebar-border: var(--border-default);
  --sidebar-ring: var(--state-focus-ring);

  /* --- Compatibility aliases --- */
  --bg-primary: var(--surface-app);
  --bg-sidebar: var(--surface-sidebar);
  --bg-card: var(--surface-card);
  --bg-hover: var(--state-hover);
  --bg-hover-subtle: var(--state-hover-subtle);
  --bg-selected: var(--state-selected);
  --bg-input: var(--surface-input);
  --bg-button: var(--surface-button);
  --bg-dialog: var(--surface-dialog);
  --border-primary: var(--border-default);
  --hover: var(--state-hover);
  --link-color: var(--accent-purple);
  --link-hover: #6b56e5;
}

:root.dark,
[data-theme="dark"] {
  color-scheme: dark;

  /* --- Semantic surfaces (dark mode) --- */
  --surface-app: #191e23;
  --surface-sidebar: #1d2329;
  --surface-panel: #242b33;
  --surface-card: #1d2329;
  --surface-popover: #242b33;
  --surface-input: #242b33;
  --surface-button: #36404a;
  --surface-dialog: #1d2329;
  --surface-editor: #191e23;
  --surface-overlay: rgba(0, 0, 0, 0.5);

  /* --- Semantic text (dark mode) --- */
  --text-primary: #aab8c5;
  --text-secondary: #8391a2;
  --text-tertiary: #8391a2;
  --text-muted: #687d92;
  --text-faint: #424e5a;
  --text-heading: #dee2e6;
  --text-inverse: #191e23;

  /* --- Semantic borders (dark mode) --- */
  --border-default: #272f37;
  --border-subtle: #272f37;
  --border-strong: #3a4551;
  --border-input: #3a4551;
  --border-dialog: #272f37;
  --border-focus: #9b8bfe;

  /* --- Interaction states (dark mode) --- */
  --state-hover: #2d3744;
  --state-hover-subtle: #242b33;
  --state-selected: rgba(126, 103, 254, 0.2);
  --state-selected-strong: rgba(126, 103, 254, 0.28);
  --state-active: rgba(126, 103, 254, 0.2);
  --state-focus-ring: #9b8bfe;
  --state-drag-target: rgba(126, 103, 254, 0.22);
  --state-disabled: #222930;

  /* --- Accent roles (dark mode) --- */
  --accent-blue: #4a9efa;
  --accent-blue-bg: rgba(74, 158, 250, 0.2);
  --accent-blue-hover: #6db4fb;
  --accent-blue-light: rgba(74, 158, 250, 0.16);
  --accent-green: #4ddb83;
  --accent-green-light: rgba(77, 219, 131, 0.16);
  --accent-orange: #f5a76a;
  --accent-orange-light: rgba(245, 167, 106, 0.16);
  --accent-red: #f06054;
  --accent-red-light: rgba(240, 96, 84, 0.16);
  --accent-purple: #9b8bfe;
  --accent-purple-light: rgba(155, 139, 254, 0.16);
  --accent-yellow: #fcb681;
  --accent-yellow-light: rgba(252, 182, 129, 0.16);
  --accent-teal: #263333;
  --accent-teal-light: rgba(38, 51, 51, 0.16);
  --accent-pink: #ff9fd5;
  --accent-pink-light: rgba(255, 159, 213, 0.16);
  --accent-gray: #a0a3b5;
  --accent-gray-light: rgba(160, 163, 181, 0.16);

  /* --- Feedback roles (dark mode) --- */
  --feedback-info-text: var(--accent-blue);
  --feedback-info-bg: var(--accent-blue-light);
  --feedback-success-text: var(--accent-green);
  --feedback-success-bg: var(--accent-green-light);
  --feedback-warning-text: #f5a76a;
  --feedback-warning-bg: rgba(245, 167, 106, 0.16);
  --feedback-warning-border: #f5a76a;
  --feedback-error-text: var(--accent-red);
  --feedback-error-bg: var(--accent-red-light);

  /* --- Syntax and diff roles (dark mode) --- */
  --syntax-heading: #83B2FF;
  --syntax-link: #83B2FF;
  --syntax-monospace: #FFA6A3;
  --syntax-monospace-bg: rgba(160, 163, 181, 0.16);
  --syntax-muted: #8391a2;
  --syntax-frontmatter-key: #FFA6A3;
  --syntax-frontmatter-value: #8EDFAE;
  --syntax-highlight-comment: #687d92;
  --syntax-highlight-keyword: #FF9BA0;
  --syntax-highlight-string: #A9D6FF;
  --syntax-highlight-number: #8BB7FF;
  --syntax-highlight-title: #C2AAFF;
  --syntax-highlight-type: #F3B175;
  --syntax-highlight-deletion: #FF9C9A;
  --syntax-highlight-deletion-bg: rgba(240, 96, 84, 0.16);
  --diff-added-text: #4ddb83;
  --diff-added-bg: rgba(77, 219, 131, 0.14);
  --diff-removed-text: #f06054;
  --diff-removed-bg: rgba(240, 96, 84, 0.14);
  --diff-hunk-bg: rgba(74, 158, 250, 0.13);
  --editor-code-block-background: #161616;
  --editor-code-block-border: transparent;
  --editor-code-block-text: #FFFFFF;
  --editor-code-block-language: rgba(255, 255, 255, 0.7);

  /* --- Shadows (dark mode) --- */
  --shadow-panel: 0px 3px 4px 0px rgba(0, 0, 0, 0.08);
  --shadow-panel-soft: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.2);
  --shadow-overlay: var(--surface-overlay);
  --shadow-dialog: rgba(0, 0, 0, 0.4);

  /* --- shadcn theme aliases (dark mode) --- */
  --background: var(--surface-app);
  --foreground: var(--text-primary);
  --card: var(--surface-card);
  --card-foreground: var(--text-primary);
  --popover: var(--surface-popover);
  --popover-foreground: var(--text-primary);
  --primary: var(--accent-purple);
  --primary-foreground: var(--text-inverse);
  --secondary: #424e5a;
  --secondary-foreground: var(--text-inverse);
  --muted: #242b33;
  --muted-foreground: var(--text-secondary);
  --accent: var(--state-hover);
  --accent-foreground: var(--text-primary);
  --destructive: var(--accent-red);
  --destructive-foreground: var(--text-inverse);
  --border: var(--border-default);
  --input: var(--border-input);
  --ring: var(--state-focus-ring);
  --sidebar: var(--surface-sidebar);
  --sidebar-foreground: var(--text-primary);
  --sidebar-primary: var(--accent-purple);
  --sidebar-primary-foreground: var(--text-inverse);
  --sidebar-accent: var(--state-hover);
  --sidebar-accent-foreground: var(--text-primary);
  --sidebar-border: var(--border-default);
  --sidebar-ring: var(--state-focus-ring);

  /* --- Compatibility aliases --- */
  --bg-primary: var(--surface-app);
  --bg-sidebar: var(--surface-sidebar);
  --bg-card: var(--surface-card);
  --bg-hover: var(--state-hover);
  --bg-hover-subtle: var(--state-hover-subtle);
  --bg-selected: var(--state-selected);
  --bg-input: var(--surface-input);
  --bg-button: var(--surface-button);
  --bg-dialog: var(--surface-dialog);
  --border-primary: var(--border-default);
  --hover: var(--state-hover);
  --link-color: var(--accent-purple);
  --link-hover: #b5a5ff;
}

/* --- Tailwind v4 theme inline --- */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-surface-app: var(--surface-app);
  --color-surface-sidebar: var(--surface-sidebar);
  --color-surface-panel: var(--surface-panel);
  --color-surface-card: var(--surface-card);
  --color-surface-popover: var(--surface-popover);
  --color-surface-editor: var(--surface-editor);
  --color-state-hover: var(--state-hover);
  --color-state-selected: var(--state-selected);
  --color-border-default: var(--border-default);
  --color-border-subtle: var(--border-subtle);
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-muted: var(--text-muted);
  --radius-sm: 0.25rem;
  --radius-md: 0.35rem;
  --radius-lg: 0.5rem;
  --radius-xl: 1rem;
}

/* --- Base layer --- */
@layer base {
  * {
    @apply border-border;
    box-sizing: border-box;
  }
  body {
    @apply bg-background text-foreground;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
  body.custom-window-chrome {
    padding-top: 32px;
  }
  html, body {
    height: 100%;
    width: 100%;
  }
  #root {
    width: 100%;
    height: 100%;
  }
  :where(
    button:not(:disabled):not([aria-disabled="true"]),
    [role="button"]:not([aria-disabled="true"]):not([data-disabled]),
    [role="menuitem"]:not([aria-disabled="true"]):not([data-disabled]),
    [role="menuitemcheckbox"]:not([aria-disabled="true"]):not([data-disabled]),
    [role="menuitemradio"]:not([aria-disabled="true"]):not([data-disabled]),
    [role="option"]:not([aria-disabled="true"]):not([data-disabled])
  ) {
    cursor: pointer;
  }
}

/* --- Label typography --- */
.font-mono-label {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 500;
}

.font-mono-overline {
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 0.02em;
}

.button-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.72rem;
  color: var(--muted-foreground);
}

.form-field {
  display: grid;
  gap: 6px;
}

.form-field > span {
  font-weight: 650;
}

.pattern-page-header-demo {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 20px;
  background: color-mix(in oklab, var(--primary) 10%, var(--card));
}

.pattern-page-header-demo h2 {
  margin: 0;
  font-size: clamp(1.5rem, 3vw, 2.75rem);
  line-height: 1;
  letter-spacing: -0.04em;
  text-wrap: balance;
}

.pattern-page-header-demo p {
  color: var(--muted-foreground);
  max-width: 560px;
}

.mini-stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.stat-card [data-slot='card-content'] {
  display: grid;
  gap: 10px;
  padding-top: 18px;
}

.stat-card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted-foreground);
}

.stat-card strong {
  font-size: 2rem;
  letter-spacing: -0.04em;
}

.feature-list,
.key-value-list,
.activity-timeline,
.checklist-progress ul {
  display: grid;
  gap: 10px;
}

.feature-list__item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 12px;
}

.feature-list__item p,
.empty-state p,
.preference-row p,
.inline-notice p,
.activity-timeline p {
  color: var(--muted-foreground);
  margin: 4px 0 0;
}

.empty-state {
  display: grid;
  place-items: center;
  gap: 12px;
  text-align: center;
  border: 1px dashed var(--border);
  border-radius: 18px;
  padding: 28px;
}

.empty-state h3 {
  margin: 0;
}

.filter-toolbar {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(150px, 0.5fr) auto;
  gap: 10px;
  align-items: center;
}

.filter-toolbar__search {
  position: relative;
}

.filter-toolbar__search svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted-foreground);
}

.filter-toolbar__search input {
  padding-left: 34px;
}

.key-value-list {
  margin: 0;
}

.key-value-list__row,
.preference-row,
.status-matrix__item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  border-bottom: 1px solid var(--border);
  padding: 10px 0;
}

.key-value-list__row:last-child,
.status-matrix__item:last-child {
  border-bottom: 0;
}

.key-value-list dt {
  color: var(--muted-foreground);
}

.key-value-list dd {
  margin: 0;
  font-weight: 650;
}

.activity-timeline {
  list-style: none;
  margin: 0;
  padding: 0;
}

.activity-timeline__item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
}

.activity-timeline__dot {
  margin-top: 6px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--primary);
  box-shadow: 0 0 0 4px color-mix(in oklab, var(--primary) 18%, transparent);
}

.activity-timeline__heading {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.activity-timeline__heading small {
  color: var(--muted-foreground);
}

.status-matrix {
  display: grid;
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 4px 12px;
}

.inline-notice {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 14px;
  background: color-mix(in oklab, var(--primary) 8%, var(--card));
}

.inline-notice--success {
  background: color-mix(in oklab, var(--accent-green) 10%, var(--card));
}

.inline-notice--warning {
  background: color-mix(in oklab, var(--destructive) 8%, var(--card));
}

.checklist-progress {
  display: grid;
  gap: 14px;
}

.checklist-progress ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.checklist-progress li {
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-row {
  display: grid;
  grid-template-columns: minmax(180px, 0.6fr) minmax(240px, 1fr);
  gap: 16px;
  align-items: center;
}

.field-row__label {
  font-weight: 650;
}

.field-row__description {
  color: var(--muted-foreground);
  margin: 4px 0 0;
}

@media (max-width: 780px) {
  .field-row,
  .filter-toolbar,
  .mini-stat-grid {
    grid-template-columns: 1fr;
  }

  .pattern-page-header-demo,
  .preference-row,
  .key-value-list__row,
  .status-matrix__item {
    align-items: flex-start;
    flex-direction: column;
  }

  .button-row {
    width: 100%;
  }

  .button-row [data-slot='button'] {
    min-width: 0;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/index.css
git commit -m "style: migrate design tokens to Darkone palette"
```

---

### Task 2: Update `components.json`

**Files:**
- Modify: `components.json`

- [ ] **Step 1: Update cssVariables config**

Thay `"baseColor": "neutral"` thành `"baseColor": "slate"` trong file `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "phosphor"
}
```

- [ ] **Step 2: Commit**

```bash
git add components.json
git commit -m "style: update components.json baseColor to slate"
```

---

### Task 3: Add Soft Button Variant

**Files:**
- Modify: `src/components/ui/button.tsx`

- [ ] **Step 1: Add `soft` variant to buttonVariants**

Thêm variant `soft` vào object `variants.variant` trong `buttonVariants`, sau dòng `link`:

Edit file `src/components/ui/button.tsx`, thay dòng 11-21:

```tsx
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        soft: "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground",
      },
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/button.tsx
git commit -m "feat: add soft button variant (Darkone style)"
```

---

### Task 4: Add Soft and Outline Badge Variants

**Files:**
- Modify: `src/components/ui/badge.tsx`

- [ ] **Step 1: Add `soft` and `outline-color` variants**

Thay variant object trong `badgeVariants`, dòng 11-22:

```tsx
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
        soft: "border-0 bg-primary/18 text-primary",
        "outline-primary": "border border-primary bg-transparent text-primary [a&]:hover:bg-primary [a&]:hover:text-primary-foreground",
        "outline-secondary": "border border-secondary bg-transparent text-secondary-foreground [a&]:hover:bg-secondary [a&]:hover:text-secondary-foreground",
        "outline-success": "border border-green-500 bg-transparent text-green-500 [a&]:hover:bg-green-500 [a&]:hover:text-white",
        "outline-danger": "border border-destructive bg-transparent text-destructive [a&]:hover:bg-destructive [a&]:hover:text-destructive-foreground",
        "outline-warning": "border border-orange-400 bg-transparent text-orange-400 [a&]:hover:bg-orange-400 [a&]:hover:text-white",
        "outline-info": "border border-blue-400 bg-transparent text-blue-400 [a&]:hover:bg-blue-400 [a&]:hover:text-white",
      },
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/badge.tsx
git commit -m "feat: add soft and outline badge variants (Darkone style)"
```

---

### Task 5: Double-Border Card Style

**Files:**
- Modify: `src/components/ui/card.tsx`

- [ ] **Step 1: Update Card className to use double-border**

Sửa dòng 10 trong `card.tsx`:

Từ:
```tsx
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
```
Thành:
```tsx
        "bg-card text-card-foreground flex flex-col gap-6 rounded-lg border-double border-[3px] py-6 shadow-sm",
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/card.tsx
git commit -m "style: apply Darkone double-border card style"
```

---

### Task 6: Input - Remove Focus Ring, Darkone Border

**Files:**
- Modify: `src/components/ui/input.tsx`

- [ ] **Step 1: Replace focus ring with border-only style**

Thay toàn bộ `className` trong `Input` (dòng 12-15):

```tsx
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-0",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/input.tsx
git commit -m "style: remove input focus ring, use Darkone border-only focus"
```

---

### Task 7: Select - Darkone Border

**Files:**
- Modify: `src/components/ui/select.tsx`

- [ ] **Step 1: Update SelectTrigger to remove focus ring**

Sửa dòng 44-45 trong `select.tsx`, thay `focus-visible:ring-ring/50 focus-visible:ring-[3px]` thành `focus-visible:ring-0`:

```tsx
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-0 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/select.tsx
git commit -m "style: remove select focus ring for Darkone look"
```

---

### Task 8: Dialog - Darkone Radius and Shadow

**Files:**
- Modify: `src/components/ui/dialog.tsx`

- [ ] **Step 1: Update DialogContent radius and shadow**

Sửa dòng 71 trong `dialog.tsx`, thay `rounded-lg` thành `rounded-md` và thay `shadow-lg`:

```tsx
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-md border p-6 shadow-lg duration-200 outline-none sm:max-w-lg",
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/dialog.tsx
git commit -m "style: apply Darkone dialog radius and shadow"
```

---

### Task 9: Dropdown Menu - Slide-Down Animation

**Files:**
- Modify: `src/components/ui/dropdown-menu.tsx`

- [ ] **Step 1: Add slide-down keyframes and apply to content**

Thêm keyframes và animation class vào `src/index.css` (cuối file):

```css
@keyframes dropdown-slide-down {
  from {
    opacity: 0;
    transform: scaleY(0.95) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: scaleY(1) translateY(0);
  }
}

.animate-dropdown-slide-down {
  animation: dropdown-slide-down 0.2s ease-out;
  transform-origin: top;
}
```

Sau đó sửa `dropdown-menu.tsx` dòng 10: thêm `animate-dropdown-slide-down` vào `dropdownMenuContentMotionClass`:

```tsx
const dropdownMenuContentMotionClass =
  "bg-popover text-popover-foreground animate-dropdown-slide-down data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 origin-(--radix-dropdown-menu-content-transform-origin) rounded-md border p-1"
```

Sửa `shadow-md` trong `DropdownMenuContent` (dòng 105) thành `shadow-lg`:

```tsx
          "max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] overflow-x-hidden overflow-y-auto shadow-lg",
```

- [ ] **Step 2: Commit**

```bash
git add src/index.css src/components/ui/dropdown-menu.tsx
git commit -m "style: add Darkone dropdown slide-down animation and shadow"
```

---

### Task 10: Sheet - Darkone Styling

**Files:**
- Modify: `src/components/ui/sheet.tsx`

- [ ] **Step 1: No changes needed** — Sheet đã dùng `bg-background`, `shadow-lg`, `rounded-*` từ token toàn cục. Các token đã được cập nhật trong Task 1 nên Sheet sẽ tự động nhận style mới.

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/sheet.tsx
git commit -m "style: sheet inherits Darkone tokens (no source changes needed)"
```

---

### Task 11: Progress - Add Size Variants

**Files:**
- Modify: `src/components/ui/progress.tsx`

- [ ] **Step 1: Add size variants to Progress**

Thêm variant `size` vào Progress:

```tsx
import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const progressVariants = cva(
  "bg-primary/20 relative w-full overflow-hidden rounded-full",
  {
    variants: {
      size: {
        xs: "h-[1px]",
        sm: "h-[5px]",
        md: "h-2",
        lg: "h-3",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

function Progress({
  className,
  value,
  size,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> &
  VariantProps<typeof progressVariants>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(progressVariants({ size }), className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/progress.tsx
git commit -m "feat: add size variants to Progress (xs/sm/md/lg)"
```

---

### Task 12: Avatar - Add Size Variants

**Files:**
- Modify: `src/components/ui/avatar.tsx`

- [ ] **Step 1: Add size variants to Avatar**

```tsx
import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        xs: "size-6",
        sm: "size-9",
        md: "size-12",
        lg: "size-[72px]",
        xl: "size-24",
        xxl: "size-[120px]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

function Avatar({
  className,
  size,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> &
  VariantProps<typeof avatarVariants>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(avatarVariants({ size }), className)}
      {...props}
    />
  )
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return <AvatarPrimitive.Image data-slot="avatar-image" className={cn("aspect-square size-full", className)} {...props} />
}

function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn("bg-muted flex size-full items-center justify-center rounded-full text-sm font-medium", className)}
      {...props}
    />
  )
}

export { Avatar, AvatarFallback, AvatarImage }
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/avatar.tsx
git commit -m "feat: add size variants to Avatar (xs/sm/md/lg/xl/xxl)"
```

---

### Task 13: Tabs - Active Pill Style

**Files:**
- Modify: `src/components/ui/tabs.tsx`

- [ ] **Step 1: Update TabsTrigger active state to Darkone pill style**

Sửa dòng 67 trong `tabs.tsx`:

Từ:
```tsx
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 data-[state=active]:text-foreground",
```
Thành:
```tsx
        "data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm dark:data-[state=active]:border-primary",
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/tabs.tsx
git commit -m "style: update tabs active state to Darkone pill style"
```

---

### Task 14: Verification

**Files:** (none created/modified)

- [ ] **Step 1: Run linter**

```bash
pnpm lint
```
Expected: PASS, no errors.

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```
Expected: PASS, no type errors.

- [ ] **Step 3: Run unit tests**

```bash
pnpm test
```
Expected: All tests pass.

- [ ] **Step 4: Run build**

```bash
pnpm build
```
Expected: Build succeeds.

- [ ] **Step 5: Visual smoke test**

Khởi động dev server và kiểm tra:
- Light mode: sidebar, buttons, cards, badges, inputs
- Dark mode: chuyển theme, kiểm tra tương tự
- Responsive: 780px breakpoint

- [ ] **Step 6: Commit** (nếu cần fix bất kỳ vấn đề nào phát sinh)

```bash
git add -A
git commit -m "chore: verification fixes after Darkone migration"
```
