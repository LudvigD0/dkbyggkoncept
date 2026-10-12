import type { InstagramFeedBlock, Page } from '../../src/payload-types'

export const instagramFeedBlock = (): InstagramFeedBlock => ({
  blockType: 'instagramFeed',
  blockName: 'Instagram – våra byggprojekt',
  anchor: 'instagram',
  heading: 'Följ arbetet bakom resultatet',
  body: 'Från första rivningen till sista detaljen. På Instagram delar vi bilder från våra byggprojekt, renoveringar och vardagen på plats.',
  accountURL: 'https://www.instagram.com/dkbyggkoncept_ab/',
  accountLabel: '@dkbyggkoncept_ab',
  linkLabel: 'Följ oss på Instagram',
  postCount: '6',
  emptyText: 'Se fler bilder från våra projekt och följ arbetet på Instagram.',
})

export function addHomeInstagram(layout: NonNullable<Page['layout']>) {
  if (layout.some((block) => block.blockType === 'instagramFeed')) return layout
  const result = [...layout]
  const cta = result.findIndex((block) => block.blockType === 'siteCTA')
  result.splice(cta < 0 ? result.length : cta, 0, instagramFeedBlock())
  return result
}
