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
