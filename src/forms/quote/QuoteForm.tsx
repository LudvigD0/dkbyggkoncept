'use client'

import { useId, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Paperclip, X } from 'lucide-react'
import { prepareBrowserImages } from './prepareImages.client'
import {
  MAX_IMAGES,
  validateQuoteValues,
  type QuoteErrors,
  type QuoteFormData,
  type QuoteValues,
} from './shared'

const serviceAliases: Record<string, string> = {
  fonsterbyte: 'fonster-isolering',
  tillaggsisolering: 'fonster-isolering',
}
const controlClass =
  'mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25 aria-invalid:border-red-600'
const buttonClass =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60'

export function QuoteForm({
  form,
  selectedService,
  canSend,
}: {
  form: QuoteFormData
  selectedService?: string
  canSend: boolean
}) {
  const id = useId()
  const element = useRef<HTMLFormElement>(null)
  const requestID = useRef<string | undefined>(undefined)
  const fields = form.fields || []
  const ui = form.quoteSettings
  const steps = ui?.steps || []
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<QuoteValues>(() =>
    Object.fromEntries(
      fields.flatMap((field) => {
        if (!('name' in field) || field.blockType === 'quoteImages') return []
        let value =
          'defaultValue' in field && typeof field.defaultValue === 'string'
            ? field.defaultValue
            : ''
        if (field.name === 'service' && field.blockType === 'select' && selectedService) {
          const selected = serviceAliases[selectedService] || selectedService
          if ((field.options || []).some((option) => option.value === selected)) value = selected
        }
        return [[field.name, value]]
      }),
    ),
  )
  const [images, setImages] = useState<Record<string, File[]>>({})
  const [errors, setErrors] = useState<QuoteErrors>({})
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)

  const focusStep = (next: number, invalid?: string) => {
    setStep(next)
    requestAnimationFrame(() => {
      const target = invalid
        ? element.current?.querySelector<HTMLElement>(`[name="${invalid}"]`)
        : element.current?.querySelector<HTMLElement>(
            `fieldset[data-step="${next}"] input, fieldset[data-step="${next}"] select, fieldset[data-step="${next}"] textarea`,
          )
      target?.focus()
    })
  }
  const advance = () => {
    const invalid = validateQuoteValues(
      fields.filter((field) => Number(field.step) === step + 1),
      values,
    )
    setErrors(invalid)
    if (Object.keys(invalid).length) focusStep(step, Object.keys(invalid)[0])
    else focusStep(step + 1)
  }
  const showErrors = (invalid: QuoteErrors) => {
    setErrors(invalid)
    const first = fields.find((field) => 'name' in field && invalid[field.name])
    if (first && 'name' in first) focusStep(Number(first.step) - 1, first.name)
  }
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (sending || processing) return
    if (step < 2) {
      advance()
      return
    }
    if (!canSend) return
    const invalid = validateQuoteValues(fields, values)
    if (Object.keys(invalid).length) {
      showErrors(invalid)
      return
    }
    setError('')
    setSending(true)
    try {
      requestID.current ||= crypto.randomUUID()
      const data = new FormData()
      data.set('formID', form.id)
      data.set('requestID', requestID.current)
      data.set('website', String(new FormData(event.currentTarget).get('website') || ''))
      Object.entries(values).forEach(([name, value]) => data.set(name, value))
      Object.entries(images).forEach(([name, files]) =>
        files.forEach((file) => data.append(name, file)),
      )
      const response = await fetch('/api/quote', {
        method: 'POST',
        body: data,
        signal: AbortSignal.timeout(60000),
      })
      const result = (await response.json().catch(() => null)) as {
        success?: boolean
        error?: string
        errors?: QuoteErrors
      } | null
      if (!response.ok || !result?.success) {
        if (result?.errors) showErrors(result.errors)
        setError(
          result?.error || 'Förfrågan kunde inte skickas. Dina uppgifter finns kvar; försök igen.',
        )
        return
      }
      setSuccess(true)
    } catch {
      setError(
        'Förfrågan kunde inte skickas. Kontrollera anslutningen och försök igen. Dina uppgifter finns kvar.',
      )
    } finally {
      setSending(false)
    }
  }

  if (success)
    return (
      <div className="py-16 text-center" role="status" aria-live="polite">
        <CheckCircle2 className="mx-auto mb-6 h-12 w-12 text-accent" aria-hidden="true" />
        <h2 className="text-3xl font-semibold">{ui?.successTitle}</h2>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">{ui?.successText}</p>
      </div>
    )

  return (
    <form ref={element} onSubmit={submit} noValidate aria-label={form.title} aria-busy={sending}>
      {!canSend && (
        <p className="mb-6 rounded-2xl border border-border bg-secondary p-4 text-sm" role="status">
          Formuläret kan inte skicka just nu. Kontakta oss gärna via mejl eller telefon.
        </p>
      )}
      <ol className="mb-8 grid grid-cols-3 gap-2" aria-label="Formulärets steg">
        {steps.map((item, index) => (
          <li
            key={item.id || index}
            aria-current={step === index ? 'step' : undefined}
            className={`border-t-4 pt-3 ${index <= step ? 'border-accent' : 'border-border'}`}
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${index <= step ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'}`}
            >
              {index + 1}
            </span>
            <span
              className={`mt-2 block break-words text-xs font-semibold sm:text-sm ${index === step ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              {item.title}
            </span>
          </li>
        ))}
      </ol>
      {steps.map((item, index) => (
        <fieldset
          key={item.id || index}
          data-step={index}
          hidden={step !== index}
          disabled={sending}
        >
          <legend className="text-2xl font-semibold sm:text-3xl">{item.title}</legend>
          {item.description && <p className="mt-3 text-muted-foreground">{item.description}</p>}
          {ui?.requiredText && (
            <p className="mt-3 text-xs text-muted-foreground">{ui.requiredText}</p>
          )}
          <div className="mt-7 space-y-6">
            {fields
              .filter((field) => Number(field.step) === index + 1)
              .map((field) => {
                if (!('name' in field)) return null
                const controlID = `${id}-${field.name}`
                const fieldError = errors[field.name]
                const required = 'required' in field && Boolean(field.required)
                const label = (
                  <label htmlFor={controlID} className="block text-sm font-semibold">
                    {field.label}
                    {required ? (
                      <span className="ml-1 text-accent" aria-hidden="true">
                        *
                      </span>
                    ) : (
                      <span className="ml-1 font-normal text-muted-foreground">
                        ({ui?.optionalLabel})
                      </span>
                    )}
                  </label>
                )
                const common = {
                  id: controlID,
                  name: field.name,
                  required,
                  'aria-invalid': Boolean(fieldError),
                  'aria-describedby': fieldError ? `${controlID}-error` : undefined,
                }
                const change = (value: string) => {
                  setValues((current) => ({ ...current, [field.name]: value }))
                  setErrors((current) => ({ ...current, [field.name]: '' }))
                }
                return (
                  <div key={field.id || field.name}>
                    {label}
                    {field.blockType === 'select' ? (
                      <select
                        {...common}
                        value={values[field.name] || ''}
                        onChange={(event) => change(event.target.value)}
                        className={controlClass}
                      >
                        <option value="">{field.placeholder || ui?.selectPlaceholder}</option>
                        {(field.options || []).map((option) => (
                          <option key={option.id || option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : field.blockType === 'textarea' ? (
                      <textarea
                        {...common}
                        rows={5}
                        maxLength={5000}
                        value={values[field.name] || ''}
                        placeholder={field.placeholder || undefined}
                        onChange={(event) => change(event.target.value)}
                        className={`${controlClass} resize-y`}
                      />
                    ) : field.blockType === 'text' || field.blockType === 'email' ? (
                      <input
                        {...common}
                        type={field.blockType === 'email' ? 'email' : field.inputType || 'text'}
                        autoComplete={field.autoComplete || undefined}
                        inputMode={field.inputType === 'tel' ? 'tel' : undefined}
                        maxLength={250}
                        value={values[field.name] || ''}
                        placeholder={field.placeholder || undefined}
                        onChange={(event) => change(event.target.value)}
                        className={controlClass}
                      />
                    ) : field.blockType === 'quoteImages' ? (
                      <>
                        <input
                          id={controlID}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          disabled={processing}
                          aria-describedby={`${controlID}-help`}
                          className={`${controlClass} text-sm file:mr-3 file:rounded-full file:border-0 file:bg-secondary file:px-4 file:py-2 file:font-semibold`}
                          onChange={async (event) => {
                            const input = event.currentTarget
                            const files = Array.from(input.files || [])
                            input.value = ''
                            if (!files.length) return
                            setProcessing(true)
                            setErrors((current) => ({ ...current, [field.name]: '' }))
                            try {
                              if ((images[field.name]?.length || 0) + files.length > MAX_IMAGES)
                                throw new Error(`Bifoga högst ${MAX_IMAGES} bilder.`)
                              const prepared = await prepareBrowserImages(files)
                              setImages((current) => ({
                                ...current,
                                [field.name]: [...(current[field.name] || []), ...prepared],
                              }))
                            } catch (error) {
                              setErrors((current) => ({
                                ...current,
                                [field.name]:
                                  error instanceof Error
                                    ? error.message
                                    : 'Bilderna kunde inte läsas.',
                              }))
                            } finally {
                              setProcessing(false)
                            }
                          }}
                        />
                        <p
                          id={`${controlID}-help`}
                          className="mt-2 text-xs leading-relaxed text-muted-foreground"
                        >
                          {field.helpText}
                        </p>
                        {processing && (
                          <p className="mt-2 flex items-center gap-2 text-sm" role="status">
                            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                            Förbereder bilder…
                          </p>
                        )}
                        <ul className="mt-3 space-y-2">
                          {images[field.name]?.map((file, fileIndex) => (
                            <li
                              key={`${file.name}-${fileIndex}`}
                              className="flex min-w-0 items-center gap-2 rounded-xl bg-secondary p-3 text-sm"
                            >
                              <Paperclip size={16} className="shrink-0" aria-hidden="true" />
                              <span className="min-w-0 flex-1 truncate">{file.name}</span>
                              <button
                                type="button"
                                aria-label={`Ta bort ${file.name}`}
                                onClick={() =>
                                  setImages((current) => ({
                                    ...current,
                                    [field.name]: current[field.name].filter(
                                      (_, i) => i !== fileIndex,
                                    ),
                                  }))
                                }
                                className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-background"
                              >
                                <X size={16} aria-hidden="true" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : null}
                    {fieldError && (
                      <p
                        id={`${controlID}-error`}
                        className="mt-2 text-sm text-red-700"
                        role="alert"
                      >
                        {fieldError}
                      </p>
                    )}
                  </div>
                )
              })}
          </div>
        </fieldset>
      ))}
      <div aria-hidden="true" className="hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {step === 2 && (
        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">{ui?.privacyText}</p>
      )}
      {error && (
        <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
        {step > 0 ? (
          <button
            type="button"
            disabled={sending || processing}
            onClick={() => focusStep(step - 1)}
            className={`${buttonClass} border border-border hover:bg-secondary`}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {ui?.backLabel}
          </button>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={sending || processing || (step === 2 && !canSend)}
          className={`${buttonClass} bg-accent text-accent-foreground hover:bg-accent/90`}
        >
          {sending ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              {ui?.sendingLabel}
            </>
          ) : step < 2 ? (
            <>
              {ui?.nextLabel}
              <ArrowRight size={16} aria-hidden="true" />
            </>
          ) : (
            form.submitButtonLabel
          )}
        </button>
      </div>
    </form>
  )
}
