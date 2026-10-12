import type { Block } from 'payload'
import { sectionFields } from '../siteFields'

export const CompanyDetails: Block = {
  slug: 'companyDetails',
  interfaceName: 'CompanyDetailsBlock',
  labels: { singular: 'Företagsuppgifter', plural: 'Företagsuppgifter' },
  fields: [
    ...sectionFields,
    {
      name: 'labels',
      label: 'Etiketter',
      type: 'group',
      admin: {
        description:
          'Namn, organisationsnummer, telefon och e-post hämtas från Webbplats → Företag. Ändra uppgifterna där så uppdateras de på alla sidor som använder detta block.',
      },
      fields: [
        { name: 'name', label: 'Företagsnamn', type: 'text', defaultValue: 'Företag' },
        {
          name: 'organizationNumber',
          label: 'Organisationsnummer',
          type: 'text',
          defaultValue: 'Organisationsnummer',
        },
        { name: 'phone', label: 'Telefon', type: 'text', defaultValue: 'Telefon' },
        { name: 'email', label: 'E-post', type: 'text', defaultValue: 'E-post' },
      ],
    },
  ],
}
