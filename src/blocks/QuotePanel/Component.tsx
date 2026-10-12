import type { QuotePanelBlock } from '@/payload-types'
import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'
import { FormBlock } from '@/blocks/Form/Component'
import { Icon } from '../siteComponents'
import Link from 'next/link'
import { QuoteForm } from '@/forms/quote/QuoteForm'
import { resendConfigured } from '@/forms/quote/emailConfig'
export function QuotePanelComponent(block: QuotePanelBlock & { selectedService?: string }) {
  const selected = block.services?.find((service) => service.slug === block.selectedService)
  const form = block.form && typeof block.form === 'object' ? block.form : null
  return (
    <section
      id={block.anchor || undefined}
      className="container-site grid gap-6 lg:grid-cols-[1.5fr_1fr]"
    >
      <div className="rounded-4xl bg-card p-8 shadow-card sm:p-10">
        {selected && (
          <p className="mb-6 inline-flex rounded-full bg-accent/15 px-4 py-2 text-sm font-semibold text-accent">
            {block.selectedLabel} {selected.title}
          </p>
        )}
        {form ? (
          form.formKind === 'quote' ? (
            <QuoteForm
              form={{
                id: form.id,
                fields: form.fields,
                quoteSettings: form.quoteSettings,
                title: form.title,
                submitButtonLabel: form.submitButtonLabel,
              }}
              selectedService={block.selectedService}
              canSend={resendConfigured()}
            />
          ) : (
            <FormBlock form={form as FormType} enableIntro={false} />
          )
        ) : (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border p-8 text-center">
            {block.placeholderTitle && (
              <h2 className="font-display text-2xl font-semibold">{block.placeholderTitle}</h2>
            )}
            {block.placeholderText && (
              <p className="mt-2 max-w-sm whitespace-pre-line text-muted-foreground">
                {block.placeholderText}
              </p>
            )}
          </div>
        )}
      </div>
      <aside className="space-y-4">
        {block.contacts?.map((contact, i) => {
          const url =
            selected && contact.url.startsWith('mailto:')
              ? `${contact.url}${contact.url.includes('?') ? '&' : '?'}subject=${encodeURIComponent(selected.title)}`
              : contact.url
          return (
            <Link
              href={url}
              key={contact.id || i}
              className={`flex items-center gap-4 rounded-3xl p-6 ${contact.dark ? 'bg-ink text-ink-foreground' : 'border border-border'}`}
            >
              <Icon name={contact.icon} className="h-6 w-6 shrink-0 text-accent" />
              <span className="min-w-0">
                <span className="block text-sm opacity-70">{contact.label}</span>
                <span className="block break-all font-semibold">{contact.value}</span>
              </span>
            </Link>
          )
        })}
        {(block.checklistTitle || (block.items?.length ?? 0) > 0) && (
          <div className="rounded-3xl bg-secondary p-6">
            {block.checklistTitle && (
              <h2 className="text-lg font-semibold">{block.checklistTitle}</h2>
            )}
            <ul className="mt-3 space-y-1 text-muted-foreground">
              {block.items?.map((item, i) => (
                <li key={item.id || i}>{item.text}</li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </section>
  )
}
