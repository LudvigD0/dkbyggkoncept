import type { ImageKey } from './images'

export const company = {
  name: 'DK Byggkoncept',
  organizationNumber: '559463-0682',
  email: 'info@dkbyggkoncept.se',
  phone: '072-076 27 81',
  phoneHref: 'tel:+46720762781',
  areas: ['Göteborg', 'Alingsås', 'Lerum', 'Partille', 'Sävedalen'],
}

export const nav = [
  { to: '/tjanster', label: 'Tjänster' },
  { to: '/fonsterbyte', label: 'Fönsterbyte' },
  { to: '/projekt', label: 'Projekt' },
  { to: '/om-oss', label: 'Om oss' },
  { to: '/kontakt', label: 'Kontakt' },
] as const

export type Service = {
  slug: string
  title: string
  short: string
  body: string
  includes: string[]
  image: ImageKey
}

export const services: Service[] = [
  {
    slug: 'fonsterbyte',
    title: 'Fönsterbyte',
    short: 'Nya fönster som sänker energikostnaden och lyfter hela huset.',
    body: 'Vi mäter, beställer och monterar nya fönster – och tar hand om smygar, foder och bleck så att resultatet blir tätt och snyggt, både ute och inne.',
    includes: [
      'Inmätning på plats',
      'Demontering och bortforsling',
      'Montering och drevning',
      'Smygar, foder och fönsterbleck',
    ],
    image: 'fonster',
  },
  {
    slug: 'badrum',
    title: 'Badrumsrenovering',
    short: 'Från rivning till sista fog – ett badrum byggt för att hålla.',
    body: 'Vi planerar och genomför hela renoveringen: rivning, tätskikt, el och VVS i samarbete, kakel och montering. Du får en kontaktperson genom hela projektet.',
    includes: [
      'Rivning och underarbete',
      'Tätskikt',
      'Kakel och klinker',
      'Inredning och montering',
    ],
    image: 'badrum',
  },
  {
    slug: 'kok',
    title: 'Köksrenovering',
    short: 'Ett kök anpassat efter hur ni faktiskt lever och lagar mat.',
    body: 'Vi river ut det gamla, förbereder ytor och monterar nytt kök – med samordning av el och VVS så att allt blir klart i rätt ordning.',
    includes: [
      'Rivning och ytor',
      'Köksmontering',
      'Samordning el och VVS',
      'Golv, väggar och detaljer',
    ],
    image: 'kok',
  },
  {
    slug: 'totalrenovering',
    title: 'Totalrenovering',
    short: 'Hela hemmet, ett samlat ansvar.',
    body: 'När flera rum eller hela bostaden ska göras om håller vi ihop projektet – från planering till slutstädning.',
    includes: [
      'Planering och tidplan',
      'Samordning av yrkesgrupper',
      'Löpande avstämningar',
      'Slutbesiktning',
    ],
    image: 'kok',
  },
  {
    slug: 'tillbyggnad',
    title: 'Tillbyggnad',
    short: 'Mer plats utan att flytta.',
    body: 'Ett extra rum, ett större kök eller ett uterum. Vi bygger till så att det nya smälter ihop med det befintliga huset.',
    includes: ['Grund och stomme', 'Tak och fasad', 'Invändigt färdigställande'],
    image: 'hantverk',
  },
  {
    slug: 'tak',
    title: 'Tak',
    short: 'Takbyte och takarbeten som skyddar huset i många år.',
    body: 'Vi byter takbeläggning, läkt och underlagspapp och ser över plåtdetaljer och avvattning.',
    includes: ['Takbyte', 'Läkt och underlag', 'Plåtarbeten'],
    image: 'hantverk',
  },
  {
    slug: 'dranering',
    title: 'Dränering',
    short: 'Torr grund och ett friskare hus.',
    body: 'Vi gräver fram, fuktskyddar och lägger ny dränering runt huset så att vattnet leds bort från grunden.',
    includes: ['Schaktning', 'Fuktskydd av grund', 'Ny dränering och återfyllnad'],
    image: 'hantverk',
  },
  {
    slug: 'tillaggsisolering',
    title: 'Tilläggsisolering',
    short: 'Varmare inne, lägre uppvärmningskostnad.',
    body: 'Vi tilläggsisolerar vind, väggar eller bjälklag – ofta en av de mest lönsamma åtgärderna i ett äldre hus.',
    includes: ['Vindsbjälklag', 'Fasadisolering', 'Lufttätning'],
    image: 'hantverk',
  },
  {
    slug: 'nybyggnation',
    title: 'Nybyggnation',
    short: 'Från ritning till nyckelfärdigt.',
    body: 'Vi bygger nytt för privatpersoner och företag, med tydlig planering och ett samlat ansvar.',
    includes: ['Grund och stomme', 'Klimatskal', 'Invändigt färdigställande'],
    image: 'hantverk',
  },
]
