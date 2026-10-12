import type { GroupField } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'
import { anchor, image, items } from '@/blocks/siteFields'
import { HOME_HERO_VIDEO_PATH, isLocalHeroVideoPath } from './localVideo'

export const hero: GroupField = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'none',
      label: 'Hero-typ',
      options: [
        {
          label: 'Ingen hero',
          value: 'none',
        },
        {
          label: 'High Impact – bakgrundsbild / startsidesvideo',
          value: 'highImpact',
        },
        {
          label: 'Medium Impact – text och bild',
          value: 'mediumImpact',
        },
        {
          label: 'Low Impact – text',
          value: 'lowImpact',
        },
      ],
      required: true,
    },
    anchor,
    { name: 'eyebrow', label: 'Överrubrik', type: 'text' },
    {
      name: 'richText',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: 'Rubrik och introduktion',
      admin: { description: 'Använd en H1-rubrik följd av ingress och eventuell brödtext.' },
    },
    linkGroup({
      overrides: {
        label: 'Knappar och länkar',
      },
    }),
    {
      name: 'media',
      type: 'upload',
      label: 'Hero-bild (även fallback för startsidesvideo)',
      admin: {
        condition: (_, { type } = {}) => ['highImpact', 'mediumImpact'].includes(type),
      },
      relationTo: 'media',
      filterOptions: { mimeType: { contains: 'image/' } },
      validate: (value: unknown, { siblingData }: { siblingData: { type?: string } }) =>
        !['highImpact', 'mediumImpact'].includes(siblingData.type || '') ||
        Boolean(value) ||
        'Välj en hero-bild.',
    },
    { name: 'mediaAlt', label: 'Bildbeskrivning (lämna tom för medias alt-text)', type: 'text' },
    { name: 'mediaLabel', label: 'Bildetikett', type: 'text' },
    { name: 'breadcrumbLabel', label: 'Länk ovanför rubriken', type: 'text' },
    { name: 'breadcrumbURL', label: 'Länkens adress', type: 'text' },
    items,
    { name: 'footerText', label: 'Text längst ned i High Impact', type: 'text' },
    {
      name: 'height',
      label: 'High Impact – höjd',
      type: 'select',
      defaultValue: 'large',
      options: [
        { label: 'Stor', value: 'large' },
        { label: 'Fyll skärmen', value: 'viewport' },
        { label: 'Kompakt', value: 'compact' },
      ],
      admin: { condition: (_, data) => data.type === 'highImpact' },
    },
    {
      name: 'overlay',
      label: 'Mörkläggning av bakgrunden',
      type: 'select',
      defaultValue: 'strong',
      options: [
        { label: 'Stark', value: 'strong' },
        { label: 'Mellan', value: 'medium' },
      ],
      admin: { condition: (_, data) => data.type === 'highImpact' },
    },
    {
      name: 'enableBackgroundVideo',
      label: 'Använd bakgrundsvideo på startsidan',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        condition: (data, sibling) => data.slug === 'home' && sibling.type === 'highImpact',
      },
      validate: (
        value: unknown,
        { data, siblingData }: { data: { slug?: string }; siblingData: { type?: string } },
      ) =>
        !value ||
        (data.slug === 'home' && siblingData.type === 'highImpact') ||
        'Bakgrundsvideo används endast på startsidan med High Impact.',
    },
    {
      name: 'backgroundVideoPath',
      label: 'Bakgrundsvideo från public',
      type: 'text',
      defaultValue: HOME_HERO_VIDEO_PATH,
      admin: {
        condition: (data, sibling) =>
          data.slug === 'home' && sibling.type === 'highImpact' && sibling.enableBackgroundVideo,
        description:
          'Ange en MP4-sökväg, till exempel /design/hero-background.mp4. Filen ska finnas i public och följer med nästa deploy. Lämna tomt för att välja en video från mediabiblioteket.',
      },
      validate: (value: unknown) =>
        !value || isLocalHeroVideoPath(value) || 'Ange en lokal MP4-sökväg som börjar med /.',
    },
    {
      ...image('backgroundVideo', 'Bakgrundsvideo'),
      filterOptions: { mimeType: { contains: 'video/' } },
      admin: {
        condition: (data, sibling) =>
          data.slug === 'home' &&
          sibling.type === 'highImpact' &&
          sibling.enableBackgroundVideo &&
          !sibling.backgroundVideoPath,
      },
      validate: (
        value: unknown,
        {
          siblingData,
        }: { siblingData: { enableBackgroundVideo?: boolean; backgroundVideoPath?: string } },
      ) =>
        !siblingData.enableBackgroundVideo ||
        Boolean(siblingData.backgroundVideoPath) ||
        Boolean(value) ||
        'Ange en lokal videofil eller välj en bakgrundsvideo.',
    },
    {
      name: 'pauseLabel',
      label: 'Pausknappens text',
      type: 'text',
      defaultValue: 'Pausa bakgrundsvideo',
      admin: {
        condition: (data, sibling) => data.slug === 'home' && sibling.enableBackgroundVideo,
      },
    },
    {
      name: 'playLabel',
      label: 'Uppspelningsknappens text',
      type: 'text',
      defaultValue: 'Spela bakgrundsvideo',
      admin: {
        condition: (data, sibling) => data.slug === 'home' && sibling.enableBackgroundVideo,
      },
    },
  ],
  label: false,
}
