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

type PaginationDirectionLinkProps = React.ComponentProps<typeof PaginationLink> & {
  label: string
}

function PaginationPrevious({ children, className, label, ...props }: PaginationDirectionLinkProps) {
  return (
    <PaginationLink aria-label={label} className={cn('gap-1 px-2.5 sm:pl-2.5', className)} size="default" {...props}>
      <CaretLeft className="size-4" />
      <span className="hidden sm:block">{children}</span>
    </PaginationLink>
  )
}

function PaginationNext({ children, className, label, ...props }: PaginationDirectionLinkProps) {
  return (
    <PaginationLink aria-label={label} className={cn('gap-1 px-2.5 sm:pr-2.5', className)} size="default" {...props}>
      <span className="hidden sm:block">{children}</span>
      <CaretRight className="size-4" />
    </PaginationLink>
  )
}

function PaginationEllipsis({ className, label, ...props }: React.ComponentProps<'span'> & { label: string }) {
  return (
    <span
      data-slot="pagination-ellipsis"
      className={cn('flex size-9 items-center justify-center', className)}
      {...props}
    >
      <DotsThree className="size-4" aria-hidden />
      <span className="sr-only">{label}</span>
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
