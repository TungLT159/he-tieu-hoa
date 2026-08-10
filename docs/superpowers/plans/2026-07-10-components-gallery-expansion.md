# Components Gallery Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the Components page into a larger generic starter UI kit with reusable pattern components, practical primitives, new gallery tabs, and localized demos.

**Architecture:** Add low-level primitives under `src/components/ui/` and reusable app patterns under `src/components/patterns/`. Keep `ComponentsPage.tsx` responsible for localization, demo data, and composition, while imported components own reusable rendering boundaries.

**Tech Stack:** Tauri starter, React 19, TypeScript, Vite, Tailwind CSS utility classes, shadcn-style components, Radix primitives from the existing `radix-ui` dependency, Vitest, Testing Library, Playwright smoke tests.

## Global Constraints

- Keep the app generic: shell, routing, settings, theme, localization, and reusable UI patterns only.
- Do not add product-specific workflows, analytics, storage systems, external task systems, or brand/domain references.
- Use existing shadcn/ui components from `src/components/ui/` for user-facing interactive elements.
- User-facing copy lives in `src/lib/locales/en.json` and `src/lib/locales/vi.json`.
- Run `pnpm l10n:validate` after editing locale files.
- Do not introduce heavyweight dependencies; target table, pagination, slider, and toggle group only when compatible with the existing dependency stack.
- Preserve the starter visual system: theme tokens, responsive layout, accessible contrast, and keyboard-friendly interactions.
- Use TDD for behavior changes and add focused tests near the changed code.

---

## File Structure

- Create `src/components/ui/table.tsx`: semantic table wrapper components: `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`.
- Create `src/components/ui/pagination.tsx`: semantic pagination nav wrappers: `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`.
- Create `src/components/ui/slider.tsx`: Radix slider wrapper using `Slider` from `radix-ui` if the installed package exports it.
- Create `src/components/ui/toggle-group.tsx`: Radix toggle group wrapper using `ToggleGroup` from `radix-ui` if the installed package exports it.
- Create `src/components/ui/table-pagination.test.tsx`: focused accessibility/render tests for table and pagination primitives.
- Create `src/components/patterns/EmptyState.tsx`: no-content state with optional icon/action slots.
- Create `src/components/patterns/StatCard.tsx`: metric card with optional icon and status/trend text.
- Create `src/components/patterns/FilterToolbar.tsx`: search/filter/action toolbar pattern.
- Create `src/components/patterns/KeyValueList.tsx`: compact key-value metadata rows.
- Create `src/components/patterns/ActivityTimeline.tsx`: ordered timeline events.
- Create `src/components/patterns/StatusMatrix.tsx`: grouped status indicators.
- Create `src/components/patterns/PreferenceRow.tsx`: label/description/control row for advanced settings.
- Create `src/components/patterns/InlineNotice.tsx`: lightweight contextual notice.
- Create `src/components/patterns/ChecklistProgress.tsx`: progress plus checklist items.
- Create `src/components/patterns/FeatureList.tsx`: reusable capability list.
- Create `src/components/patterns/patterns.test.tsx`: focused render/accessibility tests for reusable patterns.
- Modify `src/components/gallery/ComponentsPage.tsx`: import new primitives/patterns, add new tabs, provide demo state/data, and render 10-14 new demos.
- Modify `src/components/gallery/ComponentsPage.test.tsx`: assert new tabs and representative demos render and basic interactions work.
- Modify `src/lib/locales/en.json`: add English copy for tabs, demos, labels, aria labels, and pattern text.
- Modify `src/lib/locales/vi.json`: add Vietnamese copy matching English keys.
- Modify `src/index.css`: add small reusable layout classes for gallery tables, pattern cards, toolbars, timelines, matrices, and responsive demos.

---

### Task 1: Add Table And Pagination Primitives

**Files:**
- Create: `src/components/ui/table.tsx`
- Create: `src/components/ui/pagination.tsx`
- Create: `src/components/ui/table-pagination.test.tsx`

**Interfaces:**
- Consumes: `cn(...inputs: ClassValue[])` from `src/lib/utils.ts`; `Button` and `buttonVariants` from `src/components/ui/button.tsx`.
- Produces: named exports `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`, `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`.

- [ ] **Step 1: Write failing primitive tests**

Create `src/components/ui/table-pagination.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './table'

describe('table primitive', () => {
  it('renders semantic table structure with caption and cells', () => {
    render(
      <Table>
        <TableCaption>Starter records</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Shell</TableCell>
            <TableCell>Ready</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )

    expect(screen.getByRole('table', { name: 'Starter records' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Ready' })).toBeInTheDocument()
  })
})

describe('pagination primitive', () => {
  it('renders a labelled navigation region with page links', () => {
    render(
      <Pagination aria-label="Starter pages">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#previous" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#page-1" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#next" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    )

    expect(screen.getByRole('navigation', { name: 'Starter pages' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go to previous page' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '1' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByText('More pages')).toHaveClass('sr-only')
    expect(screen.getByRole('link', { name: 'Go to next page' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test src/components/ui/table-pagination.test.tsx`

Expected: FAIL because `./table` and `./pagination` modules do not exist.

- [ ] **Step 3: Implement `table.tsx`**

Create `src/components/ui/table.tsx`:

```tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table data-slot="table" className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return <thead data-slot="table-header" className={cn('[&_tr]:border-b', className)} {...props} />
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody data-slot="table-body" className={cn('[&_tr:last-child]:border-0', className)} {...props} />
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('bg-muted/50 border-t font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn('hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors', className)}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn('text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap', className)}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return <td data-slot="table-cell" className={cn('p-2 align-middle whitespace-nowrap', className)} {...props} />
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return <caption data-slot="table-caption" className={cn('text-muted-foreground mt-4 text-sm', className)} {...props} />
}

export { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption }
```

- [ ] **Step 4: Implement `pagination.tsx`**

Create `src/components/ui/pagination.tsx`:

```tsx
import * as React from 'react'
import { CaretLeft, CaretRight, DotsThree } from '@phosphor-icons/react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return <nav data-slot="pagination" className={cn('mx-auto flex w-full justify-center', className)} {...props} />
}

function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul data-slot="pagination-content" className={cn('flex flex-row items-center gap-1', className)} {...props} />
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = React.ComponentProps<'a'> & {
  isActive?: boolean
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs' | 'icon-xs' | 'icon-sm' | 'icon-lg'
}

function PaginationLink({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      data-active={isActive}
      data-slot="pagination-link"
      className={cn(buttonVariants({ variant: isActive ? 'outline' : 'ghost', size }), className)}
      {...props}
    />
  )
}

function PaginationPrevious({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="Go to previous page" className={cn('gap-1 px-2.5 sm:pl-2.5', className)} size="default" {...props}>
      <CaretLeft className="size-4" />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  )
}

function PaginationNext({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="Go to next page" className={cn('gap-1 px-2.5 sm:pr-2.5', className)} size="default" {...props}>
      <span className="hidden sm:block">Next</span>
      <CaretRight className="size-4" />
    </PaginationLink>
  )
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn('flex size-9 items-center justify-center', className)}
      {...props}
    >
      <DotsThree className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
```

- [ ] **Step 5: Run primitive tests**

Run: `pnpm test src/components/ui/table-pagination.test.tsx`

Expected: PASS for table and pagination primitive tests.

---

### Task 2: Add Slider And Toggle Group Primitives

**Files:**
- Create: `src/components/ui/slider.tsx`
- Create: `src/components/ui/toggle-group.tsx`
- Modify: `src/components/ui/table-pagination.test.tsx`

**Interfaces:**
- Consumes: `Slider` and `ToggleGroup` namespaces from `radix-ui`, if exported by the installed package.
- Produces: named exports `Slider`, `ToggleGroup`, `ToggleGroupItem`.

- [ ] **Step 1: Probe Radix exports**

Run: `node -e "import('radix-ui').then((m)=>console.log(Boolean(m.Slider), Boolean(m.ToggleGroup)))"`

Expected: output `true true`. If either value is false, skip creation of that primitive and do not import it in later tasks.

- [ ] **Step 2: Add failing tests when exports are available**

Append to `src/components/ui/table-pagination.test.tsx`:

```tsx
import { Slider } from './slider'
import { ToggleGroup, ToggleGroupItem } from './toggle-group'

describe('slider primitive', () => {
  it('renders a labelled slider control', () => {
    render(<Slider aria-label="Interface scale" defaultValue={[64]} max={100} step={1} />)

    expect(screen.getByRole('slider', { name: 'Interface scale' })).toBeInTheDocument()
  })
})

describe('toggle group primitive', () => {
  it('renders toggle group items as buttons', () => {
    render(
      <ToggleGroup type="single" aria-label="Preview density" defaultValue="compact">
        <ToggleGroupItem value="compact" aria-label="Compact density">
          Compact
        </ToggleGroupItem>
        <ToggleGroupItem value="comfortable" aria-label="Comfortable density">
          Comfortable
        </ToggleGroupItem>
      </ToggleGroup>,
    )

    expect(screen.getByRole('button', { name: 'Compact density' })).toHaveAttribute('data-state', 'on')
    expect(screen.getByRole('button', { name: 'Comfortable density' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm test src/components/ui/table-pagination.test.tsx`

Expected: FAIL because `./slider` and `./toggle-group` modules do not exist.

- [ ] **Step 4: Implement `slider.tsx`**

Create `src/components/ui/slider.tsx`:

```tsx
import * as React from 'react'
import { Slider as SliderPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

function Slider({ className, defaultValue, value, min = 0, max = 100, ...props }: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const values = React.useMemo(() => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min]), [defaultValue, min, value])

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn('relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50', className)}
      {...props}
    >
      <SliderPrimitive.Track data-slot="slider-track" className="bg-muted relative h-2 w-full grow overflow-hidden rounded-full">
        <SliderPrimitive.Range data-slot="slider-range" className="bg-primary absolute h-full" />
      </SliderPrimitive.Track>
      {values.map((_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="border-primary bg-background ring-ring/50 block size-5 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
```

- [ ] **Step 5: Implement `toggle-group.tsx`**

Create `src/components/ui/toggle-group.tsx`:

```tsx
import * as React from 'react'
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

function ToggleGroup({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={cn('bg-muted inline-flex h-9 items-center justify-center rounded-lg p-[3px]', className)}
      {...props}
    />
  )
}

function ToggleGroupItem({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(
        'text-foreground/60 hover:text-foreground data-[state=on]:bg-background data-[state=on]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-[calc(100%-1px)] min-w-9 items-center justify-center rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem }
```

- [ ] **Step 6: Run primitive tests**

Run: `pnpm test src/components/ui/table-pagination.test.tsx`

Expected: PASS for table, pagination, slider, and toggle group primitive tests.

---

### Task 3: Add Reusable Pattern Components

**Files:**
- Create: `src/components/patterns/EmptyState.tsx`
- Create: `src/components/patterns/StatCard.tsx`
- Create: `src/components/patterns/FilterToolbar.tsx`
- Create: `src/components/patterns/KeyValueList.tsx`
- Create: `src/components/patterns/ActivityTimeline.tsx`
- Create: `src/components/patterns/StatusMatrix.tsx`
- Create: `src/components/patterns/PreferenceRow.tsx`
- Create: `src/components/patterns/InlineNotice.tsx`
- Create: `src/components/patterns/ChecklistProgress.tsx`
- Create: `src/components/patterns/FeatureList.tsx`
- Create: `src/components/patterns/patterns.test.tsx`

**Interfaces:**
- Consumes: `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription`, `Badge`, `Button`, `Progress`, `Input`, `Select`, and `cn`.
- Produces: reusable typed React components listed in the created files. Later tasks import these by named export from each file.

- [ ] **Step 1: Write failing pattern tests**

Create `src/components/patterns/patterns.test.tsx`:

```tsx
import { CheckCircle, MagnifyingGlass, Tray } from '@phosphor-icons/react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ActivityTimeline } from './ActivityTimeline'
import { ChecklistProgress } from './ChecklistProgress'
import { EmptyState } from './EmptyState'
import { FeatureList } from './FeatureList'
import { FilterToolbar } from './FilterToolbar'
import { InlineNotice } from './InlineNotice'
import { KeyValueList } from './KeyValueList'
import { PreferenceRow } from './PreferenceRow'
import { StatCard } from './StatCard'
import { StatusMatrix } from './StatusMatrix'

describe('starter patterns', () => {
  it('renders reusable empty, stats, and feature patterns', () => {
    render(
      <>
        <EmptyState icon={Tray} title="No starter records" description="Create a starter record to continue." action={<Button>Add record</Button>} />
        <StatCard icon={CheckCircle} label="Ready modules" value="8" trend="2 added" />
        <FeatureList
          items={[
            { title: 'Routing', description: 'Route definitions power navigation.' },
            { title: 'Localization', description: 'Copy stays in locale catalogs.' },
          ]}
        />
      </>,
    )

    expect(screen.getByRole('heading', { name: 'No starter records' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add record' })).toBeInTheDocument()
    expect(screen.getByText('Ready modules')).toBeInTheDocument()
    expect(screen.getByText('Routing')).toBeInTheDocument()
  })

  it('renders reusable data and state patterns', () => {
    render(
      <>
        <KeyValueList items={[{ label: 'Theme', value: 'System' }]} />
        <ActivityTimeline items={[{ title: 'Shell prepared', meta: 'Now', description: 'Navigation is available.' }]} />
        <StatusMatrix items={[{ label: 'Theme', status: 'Ready' }]} />
        <InlineNotice title="Saved locally" description="Demo changes stay in memory." />
        <ChecklistProgress
          label="Starter checklist"
          value={50}
          items={[
            { label: 'Routes', complete: true },
            { label: 'Patterns', complete: false },
          ]}
        />
      </>,
    )

    expect(screen.getByText('Theme')).toBeInTheDocument()
    expect(screen.getByText('Shell prepared')).toBeInTheDocument()
    expect(screen.getByText('Ready')).toBeInTheDocument()
    expect(screen.getByText('Saved locally')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Starter checklist' })).toBeInTheDocument()
  })

  it('renders reusable form patterns', () => {
    render(
      <>
        <FilterToolbar
          searchLabel="Search starter records"
          searchPlaceholder="Search records"
          filter={
            <Select defaultValue="all">
              <SelectTrigger aria-label="Status filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          }
          action={<Button>New item</Button>}
        />
        <PreferenceRow label="Interface scale" description="Adjust the preview density." control={<Button variant="outline">Compact</Button>} />
      </>,
    )

    expect(screen.getByRole('textbox', { name: 'Search starter records' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New item' })).toBeInTheDocument()
    expect(screen.getByText('Interface scale')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test src/components/patterns/patterns.test.tsx`

Expected: FAIL because pattern modules do not exist.

- [ ] **Step 3: Implement `EmptyState.tsx`**

Create `src/components/patterns/EmptyState.tsx`:

```tsx
import type { Icon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: Icon
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('empty-state', className)}>
      {Icon ? <Icon className="size-8" aria-hidden /> : null}
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {action ? <div className="button-row">{action}</div> : null}
    </div>
  )
}
```

- [ ] **Step 4: Implement metric, list, timeline, and status components**

Create `src/components/patterns/StatCard.tsx`:

```tsx
import type { Icon } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
  icon?: Icon
  label: string
  value: string
  trend?: string
}

export function StatCard({ icon: Icon, label, value, trend }: StatCardProps) {
  return (
    <Card className="stat-card">
      <CardContent>
        <div className="stat-card__meta">
          {Icon ? <Icon className="size-5" aria-hidden /> : null}
          <span>{label}</span>
        </div>
        <strong>{value}</strong>
        {trend ? <Badge variant="secondary">{trend}</Badge> : null}
      </CardContent>
    </Card>
  )
}
```

Create `src/components/patterns/FeatureList.tsx`:

```tsx
import type { Icon } from '@phosphor-icons/react'

export interface FeatureListItem {
  icon?: Icon
  title: string
  description: string
}

interface FeatureListProps {
  items: FeatureListItem[]
}

export function FeatureList({ items }: FeatureListProps) {
  return (
    <div className="feature-list">
      {items.map(({ icon: Icon, title, description }) => (
        <article className="feature-list__item" key={title}>
          {Icon ? <Icon className="size-5" aria-hidden /> : null}
          <div>
            <strong>{title}</strong>
            <p>{description}</p>
          </div>
        </article>
      ))}
    </div>
  )
}
```

Create `src/components/patterns/KeyValueList.tsx`:

```tsx
export interface KeyValueItem {
  label: string
  value: string
}

interface KeyValueListProps {
  items: KeyValueItem[]
}

export function KeyValueList({ items }: KeyValueListProps) {
  return (
    <dl className="key-value-list">
      {items.map((item) => (
        <div className="key-value-list__row" key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
```

Create `src/components/patterns/ActivityTimeline.tsx`:

```tsx
export interface ActivityTimelineItem {
  title: string
  meta: string
  description: string
}

interface ActivityTimelineProps {
  items: ActivityTimelineItem[]
}

export function ActivityTimeline({ items }: ActivityTimelineProps) {
  return (
    <ol className="activity-timeline">
      {items.map((item) => (
        <li className="activity-timeline__item" key={`${item.title}-${item.meta}`}>
          <span className="activity-timeline__dot" aria-hidden />
          <div>
            <div className="activity-timeline__heading">
              <strong>{item.title}</strong>
              <small>{item.meta}</small>
            </div>
            <p>{item.description}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
```

Create `src/components/patterns/StatusMatrix.tsx`:

```tsx
import { Badge } from '@/components/ui/badge'

export interface StatusMatrixItem {
  label: string
  status: string
}

interface StatusMatrixProps {
  items: StatusMatrixItem[]
}

export function StatusMatrix({ items }: StatusMatrixProps) {
  return (
    <div className="status-matrix">
      {items.map((item) => (
        <div className="status-matrix__item" key={item.label}>
          <span>{item.label}</span>
          <Badge variant="outline">{item.status}</Badge>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Implement form and feedback pattern components**

Create `src/components/patterns/FilterToolbar.tsx`:

```tsx
import type { ReactNode } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { Input } from '@/components/ui/input'

interface FilterToolbarProps {
  searchLabel: string
  searchPlaceholder: string
  filter?: ReactNode
  action?: ReactNode
}

export function FilterToolbar({ searchLabel, searchPlaceholder, filter, action }: FilterToolbarProps) {
  return (
    <div className="filter-toolbar">
      <div className="filter-toolbar__search">
        <MagnifyingGlass className="size-4" aria-hidden />
        <Input aria-label={searchLabel} placeholder={searchPlaceholder} />
      </div>
      {filter ? <div className="filter-toolbar__filter">{filter}</div> : null}
      {action ? <div className="filter-toolbar__action">{action}</div> : null}
    </div>
  )
}
```

Create `src/components/patterns/PreferenceRow.tsx`:

```tsx
import type { ReactNode } from 'react'

interface PreferenceRowProps {
  label: string
  description: string
  control: ReactNode
}

export function PreferenceRow({ label, description, control }: PreferenceRowProps) {
  return (
    <div className="preference-row">
      <div>
        <strong>{label}</strong>
        <p>{description}</p>
      </div>
      <div>{control}</div>
    </div>
  )
}
```

Create `src/components/patterns/InlineNotice.tsx`:

```tsx
import type { Icon } from '@phosphor-icons/react'
import { Info } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface InlineNoticeProps {
  icon?: Icon
  title: string
  description: string
  tone?: 'info' | 'success' | 'warning'
}

export function InlineNotice({ icon: Icon = Info, title, description, tone = 'info' }: InlineNoticeProps) {
  return (
    <div className={cn('inline-notice', `inline-notice--${tone}`)}>
      <Icon className="size-5" aria-hidden />
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </div>
  )
}
```

Create `src/components/patterns/ChecklistProgress.tsx`:

```tsx
import { CheckCircle, Circle } from '@phosphor-icons/react'
import { Progress } from '@/components/ui/progress'

export interface ChecklistProgressItem {
  label: string
  complete: boolean
}

interface ChecklistProgressProps {
  label: string
  value: number
  items: ChecklistProgressItem[]
}

export function ChecklistProgress({ label, value, items }: ChecklistProgressProps) {
  return (
    <div className="checklist-progress">
      <Progress value={value} aria-label={label} />
      <ul>
        {items.map((item) => {
          const Icon = item.complete ? CheckCircle : Circle
          return (
            <li key={item.label}>
              <Icon className="size-4" aria-hidden />
              <span>{item.label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
```

- [ ] **Step 6: Run pattern tests**

Run: `pnpm test src/components/patterns/patterns.test.tsx`

Expected: PASS for all pattern component tests.

---

### Task 4: Add Localized Gallery Copy

**Files:**
- Modify: `src/lib/locales/en.json`
- Modify: `src/lib/locales/vi.json`

**Interfaces:**
- Consumes: `createTranslator(locale)` and `TranslationKey` generated from locale keys.
- Produces: stable `components.*` keys for the new tabs and demos.

- [ ] **Step 1: Add English locale keys**

Modify `src/lib/locales/en.json` by adding these entries before the final `common.current` group or in the existing `components.*` block:

```json
  "components.patterns": "Patterns",
  "components.data": "Data",
  "components.states": "States",
  "components.advancedControls": "Advanced controls",
  "components.slider.description": "A range control for tuning starter preferences.",
  "components.slider.label": "Interface scale",
  "components.slider.caption": "64% preview scale",
  "components.toggle.description": "A grouped control for mutually exclusive display modes.",
  "components.toggle.compact": "Compact",
  "components.toggle.comfortable": "Comfortable",
  "components.toggle.spacious": "Spacious",
  "components.patterns.pageHeader.title": "Page header pattern",
  "components.patterns.pageHeader.description": "A reusable heading area with metadata and actions.",
  "components.patterns.pageHeader.eyebrow": "Starter pattern",
  "components.patterns.pageHeader.heading": "Reusable workspace",
  "components.patterns.pageHeader.body": "Use this pattern to introduce a route without adding product-specific assumptions.",
  "components.patterns.pageHeader.action": "Create starter item",
  "components.patterns.stats.title": "Stats and feature list",
  "components.patterns.stats.description": "Compact cards and lists for starter dashboard sections.",
  "components.patterns.stats.routes": "Routes",
  "components.patterns.stats.routesValue": "3",
  "components.patterns.stats.routesTrend": "Ready",
  "components.patterns.stats.locales": "Locales",
  "components.patterns.stats.localesValue": "2",
  "components.patterns.stats.localesTrend": "Synced",
  "components.patterns.feature.routing": "Shared routing",
  "components.patterns.feature.routingBody": "Route definitions power sidebar and command navigation.",
  "components.patterns.feature.theme": "Theme ready",
  "components.patterns.feature.themeBody": "Theme mode stays reusable across starter pages.",
  "components.patterns.empty.title": "Empty state pattern",
  "components.patterns.empty.description": "A generic no-content state with optional actions.",
  "components.patterns.empty.heading": "No starter records yet",
  "components.patterns.empty.body": "Create a reusable starter item or adjust filters to see content here.",
  "components.patterns.empty.action": "Add starter item",
  "components.patterns.toolbar.title": "Filter toolbar pattern",
  "components.patterns.toolbar.description": "Search, filter, and action slots for list pages.",
  "components.patterns.toolbar.search": "Search starter records",
  "components.patterns.toolbar.placeholder": "Search records...",
  "components.patterns.toolbar.filter": "Record status",
  "components.patterns.toolbar.all": "All records",
  "components.patterns.toolbar.ready": "Ready only",
  "components.patterns.toolbar.action": "New record",
  "components.data.table.title": "Table and pagination",
  "components.data.table.description": "Semantic data table paired with accessible pagination.",
  "components.data.table.caption": "Starter module status",
  "components.data.table.module": "Module",
  "components.data.table.owner": "Owner",
  "components.data.table.status": "Status",
  "components.data.table.shell": "Shell",
  "components.data.table.settings": "Settings",
  "components.data.table.gallery": "Gallery",
  "components.data.table.foundation": "Foundation",
  "components.data.table.preferences": "Preferences",
  "components.data.table.uiKit": "UI kit",
  "components.data.table.ready": "Ready",
  "components.data.table.inProgress": "In progress",
  "components.data.pagination.label": "Starter records pages",
  "components.data.keyValue.title": "Key-value list",
  "components.data.keyValue.description": "Metadata rows for settings, about panels, and summaries.",
  "components.data.keyValue.theme": "Theme mode",
  "components.data.keyValue.language": "Language",
  "components.data.keyValue.version": "Version",
  "components.data.timeline.title": "Activity timeline",
  "components.data.timeline.description": "Ordered starter events without persistent storage.",
  "components.data.timeline.shell": "Shell prepared",
  "components.data.timeline.shellMeta": "Now",
  "components.data.timeline.shellBody": "Navigation and layout are available for new routes.",
  "components.data.timeline.locale": "Locales checked",
  "components.data.timeline.localeMeta": "Earlier",
  "components.data.timeline.localeBody": "English and Vietnamese catalogs stay aligned.",
  "components.data.matrix.title": "Status matrix",
  "components.data.matrix.description": "Grouped readiness labels that do not rely on color alone.",
  "components.data.matrix.routing": "Routing",
  "components.data.matrix.theme": "Theme",
  "components.data.matrix.localization": "Localization",
  "components.states.notice.title": "Inline notice",
  "components.states.notice.description": "A lightweight notice for local page feedback.",
  "components.states.notice.heading": "Changes stay local",
  "components.states.notice.body": "This demo shows feedback without adding global notification infrastructure.",
  "components.states.checklist.title": "Checklist progress",
  "components.states.checklist.description": "Progress plus explicit setup steps for starter flows.",
  "components.states.checklist.label": "Starter setup progress",
  "components.states.checklist.routes": "Routes connected",
  "components.states.checklist.theme": "Theme configured",
  "components.states.checklist.patterns": "Patterns reviewed",
  "components.states.preference.title": "Preference row",
  "components.states.preference.description": "A reusable settings row with a control slot.",
  "components.states.preference.scale": "Interface scale",
  "components.states.preference.scaleBody": "Adjust a local preview value without persisting settings."
```

- [ ] **Step 2: Add Vietnamese locale keys**

Modify `src/lib/locales/vi.json` with matching keys:

```json
  "components.patterns": "Pattern",
  "components.data": "Dữ liệu",
  "components.states": "Trạng thái",
  "components.advancedControls": "Control nâng cao",
  "components.slider.description": "Control dạng khoảng để tinh chỉnh tuỳ chọn starter.",
  "components.slider.label": "Tỷ lệ giao diện",
  "components.slider.caption": "Tỷ lệ xem trước 64%",
  "components.toggle.description": "Control nhóm cho các chế độ hiển thị loại trừ nhau.",
  "components.toggle.compact": "Gọn",
  "components.toggle.comfortable": "Thoáng",
  "components.toggle.spacious": "Rộng",
  "components.patterns.pageHeader.title": "Pattern tiêu đề trang",
  "components.patterns.pageHeader.description": "Vùng tiêu đề tái sử dụng với metadata và hành động.",
  "components.patterns.pageHeader.eyebrow": "Pattern starter",
  "components.patterns.pageHeader.heading": "Không gian làm việc tái sử dụng",
  "components.patterns.pageHeader.body": "Dùng pattern này để giới thiệu route mà không thêm giả định theo sản phẩm.",
  "components.patterns.pageHeader.action": "Tạo mục starter",
  "components.patterns.stats.title": "Stats và danh sách tính năng",
  "components.patterns.stats.description": "Card và danh sách gọn cho các phần dashboard starter.",
  "components.patterns.stats.routes": "Route",
  "components.patterns.stats.routesValue": "3",
  "components.patterns.stats.routesTrend": "Sẵn sàng",
  "components.patterns.stats.locales": "Ngôn ngữ",
  "components.patterns.stats.localesValue": "2",
  "components.patterns.stats.localesTrend": "Đồng bộ",
  "components.patterns.feature.routing": "Routing dùng chung",
  "components.patterns.feature.routingBody": "Định nghĩa route điều khiển sidebar và command navigation.",
  "components.patterns.feature.theme": "Theme sẵn sàng",
  "components.patterns.feature.themeBody": "Theme mode có thể tái sử dụng trên các trang starter.",
  "components.patterns.empty.title": "Pattern trạng thái rỗng",
  "components.patterns.empty.description": "Trạng thái không có nội dung, có thể kèm hành động.",
  "components.patterns.empty.heading": "Chưa có bản ghi starter",
  "components.patterns.empty.body": "Tạo một mục starter tái sử dụng hoặc chỉnh bộ lọc để xem nội dung tại đây.",
  "components.patterns.empty.action": "Thêm mục starter",
  "components.patterns.toolbar.title": "Pattern thanh lọc",
  "components.patterns.toolbar.description": "Slot tìm kiếm, bộ lọc và hành động cho trang danh sách.",
  "components.patterns.toolbar.search": "Tìm bản ghi starter",
  "components.patterns.toolbar.placeholder": "Tìm bản ghi...",
  "components.patterns.toolbar.filter": "Trạng thái bản ghi",
  "components.patterns.toolbar.all": "Tất cả bản ghi",
  "components.patterns.toolbar.ready": "Chỉ mục sẵn sàng",
  "components.patterns.toolbar.action": "Bản ghi mới",
  "components.data.table.title": "Bảng và phân trang",
  "components.data.table.description": "Bảng dữ liệu semantic đi cùng phân trang truy cập được.",
  "components.data.table.caption": "Trạng thái module starter",
  "components.data.table.module": "Module",
  "components.data.table.owner": "Phụ trách",
  "components.data.table.status": "Trạng thái",
  "components.data.table.shell": "Shell",
  "components.data.table.settings": "Cài đặt",
  "components.data.table.gallery": "Gallery",
  "components.data.table.foundation": "Nền tảng",
  "components.data.table.preferences": "Tuỳ chọn",
  "components.data.table.uiKit": "Bộ UI",
  "components.data.table.ready": "Sẵn sàng",
  "components.data.table.inProgress": "Đang làm",
  "components.data.pagination.label": "Trang bản ghi starter",
  "components.data.keyValue.title": "Danh sách key-value",
  "components.data.keyValue.description": "Dòng metadata cho cài đặt, giới thiệu và tóm tắt.",
  "components.data.keyValue.theme": "Theme mode",
  "components.data.keyValue.language": "Ngôn ngữ",
  "components.data.keyValue.version": "Phiên bản",
  "components.data.timeline.title": "Dòng hoạt động",
  "components.data.timeline.description": "Sự kiện starter có thứ tự mà không cần lưu trữ bền vững.",
  "components.data.timeline.shell": "Shell đã chuẩn bị",
  "components.data.timeline.shellMeta": "Hiện tại",
  "components.data.timeline.shellBody": "Navigation và layout đã sẵn sàng cho route mới.",
  "components.data.timeline.locale": "Đã kiểm tra ngôn ngữ",
  "components.data.timeline.localeMeta": "Trước đó",
  "components.data.timeline.localeBody": "Catalog tiếng Anh và tiếng Việt luôn khớp nhau.",
  "components.data.matrix.title": "Ma trận trạng thái",
  "components.data.matrix.description": "Nhãn sẵn sàng theo nhóm, không chỉ dựa vào màu sắc.",
  "components.data.matrix.routing": "Routing",
  "components.data.matrix.theme": "Theme",
  "components.data.matrix.localization": "Đa ngôn ngữ",
  "components.states.notice.title": "Thông báo inline",
  "components.states.notice.description": "Thông báo nhẹ cho phản hồi cục bộ trên trang.",
  "components.states.notice.heading": "Thay đổi chỉ ở local",
  "components.states.notice.body": "Demo này hiển thị phản hồi mà không thêm hạ tầng notification toàn cục.",
  "components.states.checklist.title": "Tiến trình checklist",
  "components.states.checklist.description": "Tiến trình kèm các bước thiết lập rõ ràng cho flow starter.",
  "components.states.checklist.label": "Tiến trình thiết lập starter",
  "components.states.checklist.routes": "Route đã kết nối",
  "components.states.checklist.theme": "Theme đã cấu hình",
  "components.states.checklist.patterns": "Pattern đã review",
  "components.states.preference.title": "Dòng tuỳ chọn",
  "components.states.preference.description": "Dòng cài đặt tái sử dụng với slot control.",
  "components.states.preference.scale": "Tỷ lệ giao diện",
  "components.states.preference.scaleBody": "Điều chỉnh giá trị xem trước cục bộ mà không lưu cài đặt."
```

- [ ] **Step 3: Validate locale catalogs**

Run: `pnpm l10n:validate`

Expected: PASS with no missing or extra locale keys.

---

### Task 5: Expand Components Page Demos

**Files:**
- Modify: `src/components/gallery/ComponentsPage.tsx`
- Modify: `src/components/gallery/ComponentsPage.test.tsx`

**Interfaces:**
- Consumes: primitives from Tasks 1-2, patterns from Task 3, locale keys from Task 4.
- Produces: new gallery tabs `patterns`, `data`, and `states`; demos for roughly 10-14 new primitives/patterns.

- [ ] **Step 1: Add failing gallery tests**

Modify `src/components/gallery/ComponentsPage.test.tsx` by appending checks inside the existing `showcases every shared ui primitive in the starter gallery` test after the Surfaces checks:

```tsx
    selectTab('Patterns')
    expect(await screen.findByText('Page header pattern')).toBeInTheDocument()
    expect(screen.getByText('Stats and feature list')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Search starter records' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add starter item' })).toBeInTheDocument()

    selectTab('Data')
    expect(await screen.findByRole('table', { name: 'Starter module status' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Starter records pages' })).toBeInTheDocument()
    expect(screen.getByText('Activity timeline')).toBeInTheDocument()
    expect(screen.getByText('Status matrix')).toBeInTheDocument()

    selectTab('States')
    expect(await screen.findByText('Inline notice')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Starter setup progress' })).toBeInTheDocument()
    expect(screen.getByText('Preference row')).toBeInTheDocument()
```

If Task 2 added slider and toggle group, also append after the Forms tab assertions:

```tsx
    expect(screen.getByRole('slider', { name: 'Interface scale' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Compact' })).toBeInTheDocument()
```

- [ ] **Step 2: Run gallery test to verify it fails**

Run: `pnpm test src/components/gallery/ComponentsPage.test.tsx`

Expected: FAIL because new tabs and demos do not exist.

- [ ] **Step 3: Import new components and add state/data**

Modify `src/components/gallery/ComponentsPage.tsx` imports:

```tsx
import { CheckCircle, CirclesFour, Funnel, Info, Sparkle, SquaresFour, Tray } from '@phosphor-icons/react'
import { ActivityTimeline } from '@/components/patterns/ActivityTimeline'
import { ChecklistProgress } from '@/components/patterns/ChecklistProgress'
import { EmptyState } from '@/components/patterns/EmptyState'
import { FeatureList } from '@/components/patterns/FeatureList'
import { FilterToolbar } from '@/components/patterns/FilterToolbar'
import { InlineNotice } from '@/components/patterns/InlineNotice'
import { KeyValueList } from '@/components/patterns/KeyValueList'
import { PreferenceRow } from '@/components/patterns/PreferenceRow'
import { StatCard } from '@/components/patterns/StatCard'
import { StatusMatrix } from '@/components/patterns/StatusMatrix'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Slider } from '@/components/ui/slider'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
```

Inside `ComponentsPage`, add state:

```tsx
  const [scale, setScale] = useState([64])
  const [displayMode, setDisplayMode] = useState('compact')
```

Add local arrays after the state declarations:

```tsx
  const featureItems = [
    { icon: SquaresFour, title: t('components.patterns.feature.routing'), description: t('components.patterns.feature.routingBody') },
    { icon: Sparkle, title: t('components.patterns.feature.theme'), description: t('components.patterns.feature.themeBody') },
  ]

  const tableRows = [
    { module: t('components.data.table.shell'), owner: t('components.data.table.foundation'), status: t('components.data.table.ready') },
    { module: t('components.data.table.settings'), owner: t('components.data.table.preferences'), status: t('components.data.table.ready') },
    { module: t('components.data.table.gallery'), owner: t('components.data.table.uiKit'), status: t('components.data.table.inProgress') },
  ]

  const keyValueItems = [
    { label: t('components.data.keyValue.theme'), value: t('settings.theme.system') },
    { label: t('components.data.keyValue.language'), value: t('settings.language.system') },
    { label: t('components.data.keyValue.version'), value: '0.1.0' },
  ]

  const timelineItems = [
    { title: t('components.data.timeline.shell'), meta: t('components.data.timeline.shellMeta'), description: t('components.data.timeline.shellBody') },
    { title: t('components.data.timeline.locale'), meta: t('components.data.timeline.localeMeta'), description: t('components.data.timeline.localeBody') },
  ]

  const statusItems = [
    { label: t('components.data.matrix.routing'), status: t('components.data.table.ready') },
    { label: t('components.data.matrix.theme'), status: t('components.data.table.ready') },
    { label: t('components.data.matrix.localization'), status: t('components.data.table.ready') },
  ]
```

- [ ] **Step 4: Add new tab triggers**

Modify the `TabsList` in `ComponentsPage.tsx` to include:

```tsx
          <TabsTrigger value="patterns">{t('components.patterns')}</TabsTrigger>
          <TabsTrigger value="data">{t('components.data')}</TabsTrigger>
          <TabsTrigger value="states">{t('components.states')}</TabsTrigger>
```

- [ ] **Step 5: Add advanced form controls card**

Inside the existing `forms` tab grid, after the Calendar card, add:

```tsx
            <Card>
              <CardHeader>
                <CardTitle>{t('components.advancedControls')}</CardTitle>
                <CardDescription>{t('components.slider.description')}</CardDescription>
              </CardHeader>
              <CardContent className="settings-stack">
                <PreferenceRow
                  label={t('components.slider.label')}
                  description={t('components.slider.caption')}
                  control={<Slider aria-label={t('components.slider.label')} value={scale} onValueChange={setScale} max={100} step={1} />}
                />
                <div className="form-field">
                  <Label>{t('components.toggle.description')}</Label>
                  <ToggleGroup type="single" value={displayMode} onValueChange={(value) => value && setDisplayMode(value)} aria-label={t('components.toggle.description')}>
                    <ToggleGroupItem value="compact" aria-label={t('components.toggle.compact')}>{t('components.toggle.compact')}</ToggleGroupItem>
                    <ToggleGroupItem value="comfortable" aria-label={t('components.toggle.comfortable')}>{t('components.toggle.comfortable')}</ToggleGroupItem>
                    <ToggleGroupItem value="spacious" aria-label={t('components.toggle.spacious')}>{t('components.toggle.spacious')}</ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </CardContent>
            </Card>
```

If Task 2 skipped slider/toggle group, omit this card and do not add the Task 2-related tests.

- [ ] **Step 6: Add `patterns` tab content**

Add after the `surfaces` tab content:

```tsx
        <TabsContent value="patterns">
          <div className="component-grid">
            <Card className="pattern-card-wide">
              <CardHeader>
                <CardTitle>{t('components.patterns.pageHeader.title')}</CardTitle>
                <CardDescription>{t('components.patterns.pageHeader.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="pattern-page-header-demo">
                  <div>
                    <p className="eyebrow">{t('components.patterns.pageHeader.eyebrow')}</p>
                    <h2>{t('components.patterns.pageHeader.heading')}</h2>
                    <p>{t('components.patterns.pageHeader.body')}</p>
                  </div>
                  <Button><Sparkle className="size-4" />{t('components.patterns.pageHeader.action')}</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('components.patterns.stats.title')}</CardTitle>
                <CardDescription>{t('components.patterns.stats.description')}</CardDescription>
              </CardHeader>
              <CardContent className="settings-stack">
                <div className="mini-stat-grid">
                  <StatCard icon={CirclesFour} label={t('components.patterns.stats.routes')} value={t('components.patterns.stats.routesValue')} trend={t('components.patterns.stats.routesTrend')} />
                  <StatCard icon={Sparkle} label={t('components.patterns.stats.locales')} value={t('components.patterns.stats.localesValue')} trend={t('components.patterns.stats.localesTrend')} />
                </div>
                <FeatureList items={featureItems} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('components.patterns.empty.title')}</CardTitle>
                <CardDescription>{t('components.patterns.empty.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={Tray}
                  title={t('components.patterns.empty.heading')}
                  description={t('components.patterns.empty.body')}
                  action={<Button variant="outline">{t('components.patterns.empty.action')}</Button>}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('components.patterns.toolbar.title')}</CardTitle>
                <CardDescription>{t('components.patterns.toolbar.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <FilterToolbar
                  searchLabel={t('components.patterns.toolbar.search')}
                  searchPlaceholder={t('components.patterns.toolbar.placeholder')}
                  filter={
                    <Select defaultValue="all">
                      <SelectTrigger aria-label={t('components.patterns.toolbar.filter')}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('components.patterns.toolbar.all')}</SelectItem>
                        <SelectItem value="ready">{t('components.patterns.toolbar.ready')}</SelectItem>
                      </SelectContent>
                    </Select>
                  }
                  action={<Button><Funnel className="size-4" />{t('components.patterns.toolbar.action')}</Button>}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
```

- [ ] **Step 7: Add `data` tab content**

Add after the `patterns` tab content:

```tsx
        <TabsContent value="data">
          <div className="component-grid">
            <Card className="pattern-card-wide">
              <CardHeader>
                <CardTitle>{t('components.data.table.title')}</CardTitle>
                <CardDescription>{t('components.data.table.description')}</CardDescription>
              </CardHeader>
              <CardContent className="settings-stack">
                <Table>
                  <TableCaption>{t('components.data.table.caption')}</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('components.data.table.module')}</TableHead>
                      <TableHead>{t('components.data.table.owner')}</TableHead>
                      <TableHead>{t('components.data.table.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableRows.map((row) => (
                      <TableRow key={row.module}>
                        <TableCell>{row.module}</TableCell>
                        <TableCell>{row.owner}</TableCell>
                        <TableCell><Badge variant="secondary">{row.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Pagination aria-label={t('components.data.pagination.label')}>
                  <PaginationContent>
                    <PaginationItem><PaginationPrevious href="#previous" /></PaginationItem>
                    <PaginationItem><PaginationLink href="#page-1" isActive>1</PaginationLink></PaginationItem>
                    <PaginationItem><PaginationLink href="#page-2">2</PaginationLink></PaginationItem>
                    <PaginationItem><PaginationEllipsis /></PaginationItem>
                    <PaginationItem><PaginationNext href="#next" /></PaginationItem>
                  </PaginationContent>
                </Pagination>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('components.data.keyValue.title')}</CardTitle>
                <CardDescription>{t('components.data.keyValue.description')}</CardDescription>
              </CardHeader>
              <CardContent><KeyValueList items={keyValueItems} /></CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('components.data.timeline.title')}</CardTitle>
                <CardDescription>{t('components.data.timeline.description')}</CardDescription>
              </CardHeader>
              <CardContent><ActivityTimeline items={timelineItems} /></CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('components.data.matrix.title')}</CardTitle>
                <CardDescription>{t('components.data.matrix.description')}</CardDescription>
              </CardHeader>
              <CardContent><StatusMatrix items={statusItems} /></CardContent>
            </Card>
          </div>
        </TabsContent>
```

- [ ] **Step 8: Add `states` tab content**

Add after the `data` tab content:

```tsx
        <TabsContent value="states">
          <div className="component-grid">
            <Card>
              <CardHeader>
                <CardTitle>{t('components.states.notice.title')}</CardTitle>
                <CardDescription>{t('components.states.notice.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <InlineNotice icon={Info} title={t('components.states.notice.heading')} description={t('components.states.notice.body')} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('components.states.checklist.title')}</CardTitle>
                <CardDescription>{t('components.states.checklist.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ChecklistProgress
                  label={t('components.states.checklist.label')}
                  value={72}
                  items={[
                    { label: t('components.states.checklist.routes'), complete: true },
                    { label: t('components.states.checklist.theme'), complete: true },
                    { label: t('components.states.checklist.patterns'), complete: false },
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('components.states.preference.title')}</CardTitle>
                <CardDescription>{t('components.states.preference.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <PreferenceRow
                  label={t('components.states.preference.scale')}
                  description={t('components.states.preference.scaleBody')}
                  control={<Button variant="outline">{displayMode}</Button>}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
```

- [ ] **Step 9: Run gallery tests**

Run: `pnpm test src/components/gallery/ComponentsPage.test.tsx`

Expected: PASS for existing and new gallery demos.

---

### Task 6: Add Pattern Styling

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Consumes: class names emitted by Tasks 3 and 5.
- Produces: responsive, theme-token-based styles for new pattern demos.

- [ ] **Step 1: Add responsive pattern styles**

Append these classes near the existing gallery styles in `src/index.css` after `.gallery-scroll-area`:

```css
.pattern-card-wide { grid-column: 1 / -1; }
.pattern-page-header-demo { display: flex; justify-content: space-between; gap: 18px; align-items: flex-start; border: 1px solid var(--border); border-radius: 20px; padding: 20px; background: color-mix(in oklab, var(--accent) 24%, transparent); }
.pattern-page-header-demo h2 { margin: 0; font-size: clamp(1.5rem, 3vw, 2.75rem); line-height: 1; letter-spacing: -0.04em; }
.pattern-page-header-demo p { color: var(--muted-foreground); max-width: 560px; }
.mini-stat-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.stat-card [data-slot='card-content'] { display: grid; gap: 10px; padding-top: 18px; }
.stat-card__meta { display: flex; align-items: center; gap: 8px; color: var(--muted-foreground); }
.stat-card strong { font-size: 2rem; letter-spacing: -0.04em; }
.feature-list, .key-value-list, .activity-timeline, .checklist-progress ul { display: grid; gap: 10px; }
.feature-list__item { display: flex; gap: 10px; align-items: flex-start; border: 1px solid var(--border); border-radius: 14px; padding: 12px; }
.feature-list__item p, .empty-state p, .preference-row p, .inline-notice p, .activity-timeline p { color: var(--muted-foreground); margin: 4px 0 0; }
.empty-state { display: grid; place-items: center; gap: 12px; text-align: center; border: 1px dashed var(--border); border-radius: 18px; padding: 28px; }
.empty-state h3 { margin: 0; }
.filter-toolbar { display: grid; grid-template-columns: minmax(180px, 1fr) minmax(150px, 0.5fr) auto; gap: 10px; align-items: center; }
.filter-toolbar__search { position: relative; }
.filter-toolbar__search svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--muted-foreground); }
.filter-toolbar__search input { padding-left: 34px; }
.key-value-list { margin: 0; }
.key-value-list__row, .preference-row, .status-matrix__item { display: flex; justify-content: space-between; gap: 16px; align-items: center; border-bottom: 1px solid var(--border); padding: 10px 0; }
.key-value-list__row:last-child, .status-matrix__item:last-child { border-bottom: 0; }
.key-value-list dt { color: var(--muted-foreground); }
.key-value-list dd { margin: 0; font-weight: 650; }
.activity-timeline { list-style: none; margin: 0; padding: 0; }
.activity-timeline__item { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 10px; }
.activity-timeline__dot { margin-top: 6px; size: 8px; width: 8px; height: 8px; border-radius: 999px; background: var(--primary); box-shadow: 0 0 0 4px color-mix(in oklab, var(--primary) 18%, transparent); }
.activity-timeline__heading { display: flex; justify-content: space-between; gap: 12px; }
.activity-timeline__heading small { color: var(--muted-foreground); }
.status-matrix { display: grid; border: 1px solid var(--border); border-radius: 14px; padding: 4px 12px; }
.inline-notice { display: flex; gap: 12px; align-items: flex-start; border: 1px solid var(--border); border-radius: 16px; padding: 14px; background: color-mix(in oklab, var(--accent) 18%, transparent); }
.inline-notice--success { background: color-mix(in oklab, var(--primary) 10%, transparent); }
.inline-notice--warning { background: color-mix(in oklab, var(--destructive) 8%, transparent); }
.checklist-progress { display: grid; gap: 14px; }
.checklist-progress ul { list-style: none; margin: 0; padding: 0; }
.checklist-progress li { display: flex; align-items: center; gap: 8px; }
```

Add inside the existing `@media (max-width: 780px)` block:

```css
  .pattern-page-header-demo, .preference-row, .key-value-list__row, .status-matrix__item { align-items: flex-start; flex-direction: column; }
  .filter-toolbar, .mini-stat-grid { grid-template-columns: 1fr; }
```

- [ ] **Step 2: Run typecheck to catch invalid CSS-adjacent class assumptions**

Run: `npx tsc --noEmit`

Expected: PASS. If TypeScript fails, fix import/type issues before continuing.

---

### Task 7: Full Verification And Graph Refresh

**Files:**
- Modify only if verification reveals issues in files changed by Tasks 1-6.

**Interfaces:**
- Consumes: completed primitives, patterns, gallery demos, localization, and styles.
- Produces: verified implementation ready for final summary.

- [ ] **Step 1: Run localization validation**

Run: `pnpm l10n:validate`

Expected: PASS with matching English and Vietnamese locale keys.

- [ ] **Step 2: Run lint**

Run: `pnpm lint`

Expected: PASS with zero warnings.

- [ ] **Step 3: Run typecheck**

Run: `npx tsc --noEmit`

Expected: PASS with no TypeScript errors.

- [ ] **Step 4: Run unit tests**

Run: `pnpm test`

Expected: PASS for all Vitest suites.

- [ ] **Step 5: Run production build**

Run: `pnpm build`

Expected: PASS with Vite build output.

- [ ] **Step 6: Run Playwright smoke test**

Run: `pnpm playwright:smoke`

Expected: PASS because the Components route gallery behavior changed.

- [ ] **Step 7: Refresh graphify code graph**

Run: `python3 -c "from graphify.watch import _rebuild_code; from pathlib import Path; _rebuild_code(Path('.'))"`

Expected: PASS or document the exact environment error if `python3` or `graphify` is unavailable.

---

## Self-Review

- Spec coverage: Tasks cover practical primitives, reusable pattern files, new `Patterns`/`Data`/`States` tabs, localization, accessibility semantics, responsive styling, full verification, and graph refresh.
- Placeholder scan: No TBD/TODO/fill-in placeholders remain; fallback behavior for missing Radix slider/toggle exports is explicit.
- Type consistency: Component names and exports match the imports used by the gallery and tests.
