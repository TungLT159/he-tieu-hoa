import { CheckCircle, Tray } from '@phosphor-icons/react'
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
import { PageHeaderPattern } from './PageHeaderPattern'
import { PreferenceRow } from './PreferenceRow'
import { StatCard } from './StatCard'
import { StatusMatrix } from './StatusMatrix'

describe('starter patterns', () => {
  it('renders reusable empty, stats, and feature patterns', () => {
    render(
      <>
        <PageHeaderPattern eyebrow="Starter pattern" title="Reusable workspace" description="Introduce a route." action={<Button>Create item</Button>} />
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

    expect(screen.getByRole('heading', { name: 'Reusable workspace' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create item' })).toBeInTheDocument()
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

    expect(screen.getAllByText('Theme').length).toBeGreaterThan(0)
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
