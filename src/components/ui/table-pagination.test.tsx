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
import { Slider } from './slider'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './table'
import { ToggleGroup, ToggleGroupItem } from './toggle-group'

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
            <PaginationPrevious href="#previous" label="Go to previous page">
              Previous
            </PaginationPrevious>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#page-1" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis label="More pages" />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#next" label="Go to next page">
              Next
            </PaginationNext>
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

    expect(screen.getByRole('radio', { name: 'Compact density' })).toHaveAttribute('data-state', 'on')
    expect(screen.getByRole('radio', { name: 'Comfortable density' })).toBeInTheDocument()
  })
})
