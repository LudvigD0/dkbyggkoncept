import type { CompanyDetailsBlock } from '@/payload-types'
import { getSiteData } from '@/site/data'

export async function CompanyDetailsComponent(block: CompanyDetailsBlock) {
  const { company } = await getSiteData()
  const organizationNumber = company.organizationNumber?.replace(/^(\d{6})(\d{4})$/, '$1-$2')
  const details = [
    { label: block.labels?.name ?? 'Företag', value: company.name },
    { label: block.labels?.organizationNumber ?? 'Organisationsnummer', value: organizationNumber },
    { label: block.labels?.phone ?? 'Telefon', value: company.phone, href: company.phoneHref },
    {
      label: block.labels?.email ?? 'E-post',
      value: company.email,
      href: `mailto:${company.email}`,
    },
  ].filter((detail) => detail.value)

  return (
    <section id={block.anchor || undefined} className="container-site scroll-mt-28">
      <div className="rounded-md border border-border bg-card px-6 py-8 sm:p-10">
        {(block.eyebrow || block.heading || block.body) && (
          <div className="max-w-2xl">
            {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
            {block.heading && (
              <h2 className="text-2xl font-semibold sm:text-3xl">{block.heading}</h2>
            )}
            {block.body && (
              <p className="mt-3 whitespace-pre-line text-muted-foreground">{block.body}</p>
            )}
          </div>
        )}
        <dl className="mt-7 grid gap-x-8 gap-y-6 border-t border-border pt-7 sm:grid-cols-2 lg:grid-cols-4">
          {details.map((detail, index) => (
            <div key={index} className="min-w-0">
              <dt className="text-sm text-muted-foreground">{detail.label}</dt>
              <dd className="mt-2 break-words text-lg font-semibold">
                {detail.href ? (
                  <a href={detail.href} className="underline-offset-4 hover:underline">
                    {detail.value}
                  </a>
                ) : (
                  detail.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
