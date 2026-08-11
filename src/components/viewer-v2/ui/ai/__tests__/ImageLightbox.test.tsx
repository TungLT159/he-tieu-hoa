import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ImageLightbox } from '../ImageLightbox'
import type { ImageLightboxProps } from '../ImageLightbox'

function setup(props: Partial<ImageLightboxProps> = {}) {
  const onClose = vi.fn()
  const onDownload = vi.fn()

  render(
    <ImageLightbox
      open={props.open ?? true}
      imageUrl={props.imageUrl ?? 'https://example.com/image.png'}
      prompt={props.prompt ?? 'A test prompt'}
      downloadLabel={props.downloadLabel ?? 'Localized download'}
      onClose={props.onClose ?? onClose}
      onDownload={props.onDownload ?? onDownload}
    />,
  )

  return {
    onClose: props.onClose ?? onClose,
    onDownload: props.onDownload ?? onDownload,
  }
}

describe('ImageLightbox', () => {
  it('renders a constrained image dialog with prompt caption when open', () => {
    setup()

    const dialog = screen.getByRole('dialog')
    const image = screen.getByRole('img', { name: 'A test prompt' })

    expect(dialog).toHaveClass('max-w-[90vw]', 'sm:max-w-[90vw]', 'max-h-[90vh]', 'flex', 'flex-col')
    expect(image).toHaveAttribute('src', 'https://example.com/image.png')
    expect(image).toHaveAttribute('alt', 'A test prompt')
    expect(image).toHaveClass('object-contain')
    expect(screen.getByRole('heading', { name: 'A test prompt' })).toBeInTheDocument()
  })

  it('calls onDownload when the localized download button is clicked', async () => {
    const { onDownload } = setup()

    fireEvent.click(screen.getByRole('button', { name: 'Localized download' }))

    expect(onDownload).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when the dialog closes', async () => {
    const { onClose } = setup()

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not render the image when closed', () => {
    setup({ open: false })

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
