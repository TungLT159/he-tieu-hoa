import type { ReactNode } from 'react'

interface FieldRowProps {
  children: ReactNode
  description?: string
  htmlFor?: string
  label: string
  labelId?: string
}

export function FieldRow({ children, description, htmlFor, label, labelId }: FieldRowProps) {
  return (
    <div className="field-row">
      <div className="field-row__copy">
        <label className="field-row__label" htmlFor={htmlFor} id={labelId}>{label}</label>
        {description ? <p className="field-row__description">{description}</p> : null}
      </div>
      <div className="field-row__control">{children}</div>
    </div>
  )
}
