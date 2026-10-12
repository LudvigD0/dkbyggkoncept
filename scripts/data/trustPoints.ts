import type { Page, TrustPointsBlock } from '../../src/payload-types'

export function trustPointsBlock(): TrustPointsBlock {
  return {
    blockType: 'trustPoints',
    blockName: 'Bra att veta – pris, erfarenhet och garanti',
    anchor: 'bra-att-veta',
    heading: 'Bra att veta',
    items: [
      { title: 'Fast pris', description: 'För det arbete vi kommer överens om.', icon: 'price' },
      {
        title: '15+ års erfarenhet',
        description: 'I teamet som utför arbetet.',
        icon: 'experience',
      },
      { title: 'Garanti', description: 'På utfört arbete.', icon: 'guarantee' },
      {
        title: 'ROT-avdrag',
        description: 'På arbetskostnaden när villkoren är uppfyllda.',
        icon: 'rot',
        enableLink: true,
        link: {
          type: 'custom',
          label: 'ROT-avdrag – läs villkoren hos Skatteverket',
          url: 'https://www.skatteverket.se/privat/fastigheterochbostad/rotarbeteochrutarbete/safungerarrotavdraget',
          newTab: true,
        },
      },
    ],
    areasLabel: 'Vi arbetar i',
    areas: ['Göteborg', 'Lerum', 'Partille', 'Sävedalen', 'Alingsås'].map((name) => ({ name })),
  }
}

export function addHomeTrustPoints(layout: NonNullable<Page['layout']>) {
  if (layout.some((block) => block.blockType === 'trustPoints')) return layout
  return [trustPointsBlock(), ...layout]
}
