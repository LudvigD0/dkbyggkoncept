'use client'

import { FieldDescription, FieldError, FieldLabel, useField } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

export const TokenField: TextFieldClientComponent = ({ field, path }) => {
  const { value, setValue, showError } = useField<string>({ path })
  return (
    <div className={`field-type text${showError ? ' error' : ''}`}>
      <FieldLabel htmlFor={`field-${path}`} label={field.label} path={path} />
      <FieldError path={path} />
      <input
        id={`field-${path}`}
        type="password"
        autoComplete="new-password"
        spellCheck={false}
        aria-describedby={`${path}-description`}
        aria-invalid={showError || undefined}
        value={value || ''}
        onChange={(event) => setValue(event.target.value)}
      />
      <FieldDescription description={field.admin?.description} path={path} />
    </div>
  )
}
