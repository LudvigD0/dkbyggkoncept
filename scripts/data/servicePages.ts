import type { Page, ServiceContentBlock, ProcessBlock, FAQBlock } from '../../src/payload-types'
import { action, type MediaRefs } from './buildPageBlocks'
import { heroFromBlock } from './restoreHeroStructure'

type Topics = NonNullable<ServiceContentBlock['topics']>
type ServicePage = {
  slug: string
  title: string
  description: string
  lead: string
  intro: string
  image: string
  detailImage: string
  quoteService?: string
  scope: { heading: string; body: string; topics: Topics; note: { heading: string; body: string } }
  planning: {
    heading: string
    body: string
    topics: Topics
    note: { heading: string; body: string }
  }
  steps: NonNullable<ProcessBlock['steps']>
  questions: NonNullable<FAQBlock['questions']>
}

const rotURL =
  'https://www.skatteverket.se/privat/fastigheterochbostad/rotarbeteochrutarbete/safungerarrotavdraget.4.5947400c11f47f7f9dd80004014.html'
const buildingURL =
  'https://www.boverket.se/sv/PBL-kunskapsbanken/lov--byggande/anmalningsplikt/byggnader/tillbyggnad/'
const rotQuestion = {
  question: 'Kan jag använda ROT-avdrag?',
  answer:
    'Vissa renoverings- och tillbyggnadsarbeten kan ge rätt till ROT-avdrag på arbetskostnaden. Det beror på arbetet, bostaden och dina personliga förutsättningar. Material omfattas inte. Kontrollera aktuella villkor hos Skatteverket inför ditt projekt.',
  links: [action('Skatteverkets aktuella villkor', rotURL, 'text')],
}

export const servicePages: ServicePage[] = [
  {
    slug: 'totalentreprenad-goteborg',
    title: 'Totalentreprenad Göteborg',
    description:
      'Totalentreprenad i Göteborg med en kontakt genom hela byggprojektet. DK Byggkoncept samordnar renovering, tillbyggnad och nybyggnation. Begär offert.',
    lead: 'Ett samlat ansvar. En tydlig väg framåt.',
    intro:
      'När flera yrkesgrupper ska arbeta tillsammans behöver någon hålla ihop helheten. DK Byggkoncept hjälper dig med totalentreprenad i Göteborg, Lerum, Partille, Alingsås och Sävedalen – från de första frågorna till ett färdigt projekt.',
    image: 'service-totalentreprenad',
    detailImage: 'service-samordning',
    scope: {
      heading: 'Ett byggprojekt med många delar. En kontakt för dig.',
      body: 'En större ombyggnad handlar om mer än själva hantverket. Beslut om material, installationer, leveranser och arbetsordning behöver fungera tillsammans. Vi samordnar de delar som ingår i uppdraget så att du får ett begripligt upplägg.',
      topics: [
        {
          heading: 'Renovering och ombyggnad',
          body: 'Ska ett kök och badrum byggas om samtidigt, eller behöver hela bostaden en ny lösning? Ett samlat upplägg gör det lättare att planera momenten i rätt ordning. Rivning, förberedelser, installationer och ytskikt ses som delar av samma projekt.',
        },
        {
          heading: 'Tillbyggnad och nybyggnation',
          body: 'Nya ytor ställer krav på att mark, grund, stomme och installationer passar ihop. Vi går igenom vad som behöver göras och vilka kompetenser som behövs. Även anslutningen till en befintlig byggnad får en tydlig plats i planeringen.',
        },
        {
          heading: 'Samordning av rätt yrkesgrupper',
          body: 'Vi arbetar med ett etablerat nätverk av underleverantörer. Du får en kontakt för frågor och uppföljning, medan arbetet samordnas mellan de yrkesgrupper som projektet behöver. Ansvar och omfattning tydliggörs innan arbetet startar.',
        },
      ],
      note: {
        heading: 'Helheten börjar i planeringen',
        body: 'Ju tidigare vi får förstå projektet, desto bättre kan vi reda ut beroenden och viktiga beslut.',
      },
    },
    planning: {
      heading: 'Gör projektet tydligt innan det blir en byggarbetsplats.',
      body: 'Ett bra underlag beskriver både vad du vill förändra och hur du vill använda resultatet. Det hjälper oss att föreslå en genomförbar lösning och avgränsa offerten.',
      topics: [
        {
          heading: 'Bestäm vad som ska ingå',
          body: 'Skriv gärna ned önskemål, sådant som måste lösas och delar som kan vänta. Finns ritningar eller tidigare underlag tar vi med dem i genomgången. Vi klargör vilka arbeten, material och samordningsuppgifter som ingår i förslaget.',
        },
        {
          heading: 'Planera ekonomi och beslut',
          body: 'Materialval och projektets omfattning påverkar kostnaden. Vi går igenom förutsättningarna innan offert och diskuterar vilka beslut som behöver tas i god tid. Förändringar under arbetet behöver också stämmas av så att deras påverkan blir tydlig.',
        },
        {
          heading: 'Håll kontakt genom projektet',
          body: 'Frågor ska kunna fångas upp medan arbetet pågår. En utsedd kontakt gör det enklare att följa nästa moment, prata om val och reda ut sådant som upptäcks på plats. Vid avslut går vi tillsammans igenom det utförda arbetet.',
        },
      ],
      note: {
        heading: 'Ta med till första samtalet',
        body: 'Projektets adress, några bilder, önskad omfattning och en ungefärlig tidsplan räcker som början.',
      },
    },
    steps: [
      {
        title: 'Vi lyssnar',
        description:
          'Du berättar vad du vill bygga eller förändra. Vi reder ut mål, plats och förutsättningar.',
      },
      {
        title: 'Vi planerar',
        description: 'Vi går igenom omfattning, ansvar och arbetsordning inför en tydlig offert.',
      },
      {
        title: 'Vi samordnar',
        description:
          'Arbetet hålls ihop mellan de yrkesgrupper och leveranser som ingår i uppdraget.',
      },
      {
        title: 'Vi följer upp',
        description:
          'Det färdiga arbetet gås igenom tillsammans med dig och projektets avslut stäms av.',
      },
    ],
    questions: [
      {
        question: 'Vilka projekt passar för totalentreprenad?',
        answer:
          'Det passar ofta när flera arbeten och yrkesgrupper behöver samordnas, exempelvis en större renovering, tillbyggnad eller nybyggnation. Vi går igenom ditt projekt och föreslår en omfattning som passar förutsättningarna.',
      },
      {
        question: 'Vad är skillnaden mellan totalentreprenad och totalrenovering?',
        answer:
          'Totalrenovering beskriver omfattningen av en renovering. Totalentreprenad beskriver hur ansvar och genomförande organiseras. En totalrenovering kan alltså utföras inom ett samlat entreprenaduppdrag. Exakt vad som ingår framgår av avtalet.',
      },
      {
        question: 'Behöver jag ha färdiga ritningar?',
        answer:
          'Du kan kontakta oss även om projektet fortfarande är en idé. Befintliga ritningar och bilder är bra underlag, men det första samtalet kan börja med dina behov och en beskrivning av platsen. Vi diskuterar vilket underlag som behövs därefter.',
      },
      {
        question: 'Vad avgör kostnaden?',
        answer:
          'Omfattning, byggnadens förutsättningar, material och installationer påverkar priset. Vi behöver förstå projektet innan vi lämnar en relevant offert. Skicka gärna bilder och en kort beskrivning så tar vi nästa steg därifrån.',
      },
    ],
  },
  {
    slug: 'totalrenovering-goteborg',
    title: 'Totalrenovering Göteborg',
    description:
      'Planerar du totalrenovering i Göteborg? DK Byggkoncept hjälper dig med kök, badrum, ytskikt och samordning för ett hem som fungerar bättre. Begär offert.',
    lead: 'Nytt liv i hemmet. Omtanke om hela resultatet.',
    intro:
      'En totalrenovering ger möjlighet att tänka igenom bostaden som en helhet. Vi hjälper privatpersoner, fastighetsägare och bostadsrättsföreningar i Göteborg med omnejd att förena funktion, material och ett omsorgsfullt utfört arbete.',
    image: 'service-totalrenovering',
    detailImage: 'service-renovering-detalj',
    quoteService: 'totalrenovering',
    scope: {
      heading: 'När flera rum ska bli ett sammanhängande hem.',
      body: 'Vad behöver förändras för att bostaden ska fungera bättre? Vi utgår från hur du använder hemmet och planerar arbetet så att de olika delarna hänger ihop.',
      topics: [
        {
          heading: 'Kök och badrum som fungerar i vardagen',
          body: 'Placering av förvaring, belysning och arbetsytor påverkar hur ett rum används. När kök eller badrum ingår ser vi också till att installationer och byggmoment får rätt plats i arbetsordningen. Material och detaljer väljs med hänsyn till rummets användning.',
        },
        {
          heading: 'Golv, väggar och genomtänkta detaljer',
          body: 'Ytskikten binder ihop bostaden. Ett genomgående golv, en lugn färgskala eller anpassad förvaring kan förändra känslan i flera rum samtidigt. Vi pratar igenom möten mellan material, övergångar och avslut innan arbetet genomförs.',
        },
        {
          heading: 'Planlösning och tekniska förutsättningar',
          body: 'En ny planlösning behöver fungera med byggnadens konstruktion och installationer. Befintligt skick, el, vatten och ventilation kan påverka vad som går att göra. Därför är en genomgång på plats en viktig del av underlaget för en större renovering.',
        },
      ],
      note: {
        heading: 'En lösning för ditt hem',
        body: 'En totalrenovering ska utgå från bostadens förutsättningar och dina prioriteringar.',
      },
    },
    planning: {
      heading: 'En renovering blir enklare med en tydlig plan.',
      body: 'Budget, materialval och vardagsliv behöver tänkas igenom tillsammans. Vi hjälper dig att se vilka frågor som behöver få ett svar innan arbetet startar.',
      topics: [
        {
          heading: 'Prioritera det som gör störst skillnad',
          body: 'Skilj gärna på nödvändiga åtgärder och önskemål. Vilka rum är viktigast? Ska något bevaras? Det gör det lättare att välja en rimlig omfattning och att lägga budgeten där den gör mest nytta för dig.',
        },
        {
          heading: 'Planera för tiden under arbetet',
          body: 'Tillgången till kök och badrum kan vara begränsad under delar av renoveringen. Prata tidigt om om du kan bo kvar, hur möbler behöver skyddas och hur arbetsområden ska avgränsas. Vardagens praktiska frågor hör också till projektplaneringen.',
        },
        {
          heading: 'Red ut tillstånd och gemensamma delar',
          body: 'Bor du i bostadsrätt behöver projektet stämmas av mot föreningens regler. Arbeten som påverkar konstruktion eller installationer kan också behöva prövas av kommunen. Kontrollera vad som gäller för just de åtgärder du planerar innan de påbörjas.',
        },
      ],
      note: {
        heading: 'Bilder hjälper oss förstå',
        body: 'Fotografera gärna de rum du vill förändra och skriv ned vad som fungerar sämre i dag.',
      },
    },
    steps: [
      {
        title: 'Behov och idéer',
        description: 'Vi går igenom bostaden, dina prioriteringar och vad du vill uppnå.',
      },
      {
        title: 'Omfattning och offert',
        description: 'Arbeten och materialval avgränsas så att du får ett tydligt beslutsunderlag.',
      },
      {
        title: 'Renovering',
        description: 'Momenten samordnas och vi håller kontakt om arbetet och kommande beslut.',
      },
      {
        title: 'Gemensam genomgång',
        description: 'Vi går igenom resultatet, detaljerna och det som hör till projektets avslut.',
      },
    ],
    questions: [
      {
        question: 'Vad kan ingå i en totalrenovering?',
        answer:
          'Det kan exempelvis vara kök, badrum, golv, väggar, förvaring och förändringar av planlösningen. Ingen bostad har exakt samma behov. Därför beskriver vi omfattningen i offerten utifrån vad som ska utföras i ditt hem.',
      },
      {
        question: 'Kan jag bo kvar under renoveringen?',
        answer:
          'Det beror på omfattningen och vilka rum som berörs. Om både kök och badrum renoveras kan vardagen bli svår att få ihop. Vi går igenom arbetsordning och praktiska förutsättningar med dig så att boendet kan planeras i god tid.',
      },
      {
        question: 'Hur lång tid tar en totalrenovering?',
        answer:
          'Storlek, befintligt skick, installationer och materialens leveranstider påverkar tidsplanen. Vi kan bedöma ett relevant upplägg när vi känner till projektet. Omfattande förändringar och sådant som upptäcks under rivning kan behöva hanteras separat.',
      },
      rotQuestion,
    ],
  },
  {
    slug: 'lagenhetsrenovering-goteborg',
    title: 'Lägenhetsrenovering Göteborg',
    description:
      'Lägenhetsrenovering i Göteborg med omsorg om både hemmet och huset. DK Byggkoncept hjälper dig med kök, badrum, golv och ytskikt. Få en kostnadsfri offert.',
    lead: 'Mer plats för livet, i lägenheten du redan har.',
    intro:
      'Från nya ytskikt till en större ombyggnad: vi hjälper dig att renovera lägenhet i Göteborg, Partille, Lerum, Alingsås och Sävedalen. Dina behov och byggnadens förutsättningar får styra upplägget.',
    image: 'service-lagenhetsrenovering',
    detailImage: 'service-lagenhet-detalj',
    scope: {
      heading: 'Små förändringar eller en helt ny helhet.',
      body: 'En lägenhet behöver ofta fylla flera funktioner på begränsad yta. Renoveringen kan handla om att skapa lugn, förbättra förvaringen eller få kök och badrum att fungera bättre.',
      topics: [
        {
          heading: 'Ytskikt som lyfter hela bostaden',
          body: 'Målning, golv och genomtänkta avslut gör stor skillnad för helhetsintrycket. Vi går igenom vad som ska förnyas och vad som kan bevaras. Befintliga material och rummens proportioner kan ge en bra utgångspunkt för valen.',
        },
        {
          heading: 'Kök och badrum med omsorg om detaljerna',
          body: 'Även ett mindre kök eller badrum behöver planeras noga. Förvaring, belysning och placering av inredning ska fungera med installationerna. Vid mer omfattande arbeten kan vi samordna flera yrkesgrupper inom ett gemensamt upplägg.',
        },
        {
          heading: 'Förvaring och rum som används bättre',
          body: 'Vilka ytor blir inte riktigt använda i dag? En anpassad förvaringslösning eller förändrad rumsindelning kan vara en del av projektet. Vi tittar på vad du vill uppnå och vad byggnaden tillåter innan förslaget tar form.',
        },
      ],
      note: {
        heading: 'Bostaden finns i ett större hus',
        body: 'Planeringen behöver ta hänsyn till föreningen, grannarna och de gemensamma utrymmena.',
      },
    },
    planning: {
      heading: 'Tänk igenom hemmet. Stäm av med huset.',
      body: 'En bra lägenhetsrenovering tar hänsyn till både arbetet inne i bostaden och vardagen runt omkring. Några frågor är särskilt bra att reda ut tidigt.',
      topics: [
        {
          heading: 'Kontakta föreningen eller fastighetsägaren',
          body: 'Beskriv vad du vill göra och fråga vilka underlag som behövs. Ingrepp som berör bärande delar, ledningar eller ventilation kan kräva ett särskilt godkännande. Ett skriftligt besked och rätt underlag bör finnas innan sådana arbeten startar.',
        },
        {
          heading: 'Planera leveranser och arbetsområdet',
          body: 'Trapphus, hiss och tillgänglighet påverkar hur material tas in och avfall tas ut. Vi diskuterar skydd av gemensamma ytor, praktiska transporter och hur arbetet kan organiseras. Det ger en bättre grund för både tidsplanen och genomförandet.',
        },
        {
          heading: 'Gör vardagen hanterbar',
          body: 'Berätta om boendesituationen, föreningens arbetstider och sådant som behöver fungera under renoveringen. Vi kan då prata om etapper och arbetsordning. Tydlig information till grannar och förening hjälper också till att minska onödiga missförstånd.',
        },
      ],
      note: {
        heading: 'Bra underlag till offerten',
        body: 'Planritning, bilder och föreningens eventuella renoveringsregler hjälper oss att förstå projektet.',
      },
    },
    steps: [
      {
        title: 'Dina önskemål',
        description: 'Vi pratar om hur du använder lägenheten och vad du vill förbättra.',
      },
      {
        title: 'Rätt förutsättningar',
        description: 'Omfattning, befintligt skick och föreningens förutsättningar gås igenom.',
      },
      {
        title: 'Arbetet i bostaden',
        description: 'Renoveringen planeras med hänsyn till arbetsordning och gemensamma utrymmen.',
      },
      {
        title: 'Detaljer och avslut',
        description: 'Vi går igenom det färdiga arbetet tillsammans med dig.',
      },
    ],
    questions: [
      {
        question: 'Kan ni hjälpa till med en mindre lägenhetsrenovering?',
        answer:
          'Ja, vi hjälper till med både mindre arbeten på ytskikt och större renoveringar. Beskriv vilka rum eller delar du vill förändra så kan vi diskutera ett lämpligt upplägg.',
      },
      {
        question: 'Behöver jag föreningens tillstånd?',
        answer:
          'Det beror på vad som ska göras. Åtgärder som berör bärande konstruktion, vissa installationer eller andra väsentliga förändringar kan kräva styrelsens godkännande. Stäm av det planerade arbetet med föreningen och kontrollera även eventuella kommunala krav innan start.',
      },
      {
        question: 'Kan jag renovera kök och badrum samtidigt?',
        answer:
          'Det kan vara möjligt och ge ett samlat upplägg, men det behöver planeras utifrån installationer, tillgång till rummen och din boendesituation. Vi går igenom vilka delar som kan samordnas och hur arbetsordningen bör se ut.',
      },
      rotQuestion,
    ],
  },
  {
    slug: 'tillbyggnad-goteborg',
    title: 'Tillbyggnad Göteborg',
    description:
      'Skapa mer utrymme med en tillbyggnad i Göteborg. DK Byggkoncept hjälper dig planera en utbyggnad som passar huset, tomten och vardagen. Begär offert.',
    lead: 'Låt huset växa med livet.',
    intro:
      'Ett större kök, ett extra rum eller en mer välkomnande entré. Vi hjälper dig att planera och genomföra en tillbyggnad i Göteborg med omnejd, med omsorg om hur det nya möter det befintliga huset.',
    image: 'service-tillbyggnad',
    detailImage: 'service-tillbyggnad-detalj',
    quoteService: 'tillbyggnad',
    scope: {
      heading: 'Mer utrymme som känns som en del av huset.',
      body: 'En tillbyggnad ska göra vardagen enklare och samtidigt fungera med husets uttryck. Vi börjar med behoven och går sedan igenom placering, material och byggnadens förutsättningar.',
      topics: [
        {
          heading: 'Rum för det som saknas i dag',
          body: 'Behöver familjen ett extra sovrum, större gemensamma ytor eller en bättre entré? Beskriv hur du vill använda den nya delen. Då blir det lättare att tänka igenom yta, anslutningar och hur rörelsen mellan gamla och nya rum ska fungera.',
        },
        {
          heading: 'Arkitektur, ljus och material',
          body: 'Taklinje, fasad och fönster påverkar hur tillbyggnaden möter huset. Även ljusinsläpp och insyn behöver finnas med i samtalet. Vi tittar på en utformning som passar bostaden och de funktioner du vill skapa.',
        },
        {
          heading: 'Från mark och grund till färdigt rum',
          body: 'Tomtens förutsättningar och anslutningen till det befintliga huset påverkar arbetet. Grund, stomme, isolering och installationer behöver planeras som en helhet. Vi kan samordna de delar och yrkesgrupper som ingår i uppdraget.',
        },
      ],
      note: {
        heading: 'Börja med funktionen',
        body: 'En tydlig bild av hur ytan ska användas hjälper oss att diskutera rätt storlek och placering.',
      },
    },
    planning: {
      heading: 'De viktiga besluten tas innan första spadtaget.',
      body: 'En utbyggnad berör både huset och tomten. Ju tidigare förutsättningarna reds ut, desto tydligare blir det vad projektet faktiskt behöver omfatta.',
      topics: [
        {
          heading: 'Tomt och befintlig byggnad',
          body: 'Markförhållanden, tillgänglighet och läget på tomten kan påverka utformningen. Vi behöver också förstå hur tillbyggnaden ska ansluta till huset. Bilder, befintliga ritningar och en enkel beskrivning av önskad placering är bra underlag för det första samtalet.',
        },
        {
          heading: 'Lov, anmälan och underlag',
          body: 'Bygglov och andra krav beror på åtgärden och platsens förutsättningar. Det finns undantag från lovplikten, men de betyder inte att alla krav försvinner. Stäm av projektet med kommunen och kontrollera vilket underlag och vilka besked som behövs innan byggstart.',
        },
        {
          heading: 'Värme, ventilation och vardagsliv',
          body: 'En ny del behöver fungera med bostadens tekniska lösningar och den tänkta användningen. Prata om temperatur, ventilation, belysning och övergången till befintliga rum. Vi diskuterar också hur arbetet kan påverka boendet under byggtiden.',
        },
      ],
      note: {
        heading: 'Hela vägen till en användbar yta',
        body: 'Ta med både byggnaden och de invändiga detaljerna när du planerar projektets omfattning.',
      },
    },
    steps: [
      {
        title: 'Idé och behov',
        description: 'Vi går igenom vilken yta du saknar och hur tillbyggnaden ska användas.',
      },
      {
        title: 'Förutsättningar',
        description: 'Hus, tomt, underlag och planerad omfattning ses över inför offert.',
      },
      {
        title: 'Byggnation',
        description: 'De delar som ingår i uppdraget samordnas, från grund till invändiga arbeten.',
      },
      {
        title: 'Färdig tillbyggnad',
        description: 'Vi går tillsammans igenom resultatet och hur den nya delen möter huset.',
      },
    ],
    questions: [
      {
        question: 'Behöver en tillbyggnad alltid bygglov?',
        answer:
          'Nej, det finns undantag. Bedömningen beror bland annat på byggnaden, tillbyggnadens storlek, placeringen och områdets förutsättningar. Kontrollera de aktuella reglerna och stäm av med kommunen innan du bestämmer utformning eller startar arbetet.',
        links: [action('Boverkets information om tillbyggnad', buildingURL, 'text')],
      },
      {
        question: 'Kan tillbyggnaden anpassas till ett äldre hus?',
        answer:
          'Vi utgår från det befintliga husets karaktär och dina önskemål. Material, proportioner, tak och anslutningar behöver tänkas igenom tillsammans. Befintliga ritningar och bilder hjälper oss att förstå vilken lösning som kan passa.',
      },
      {
        question: 'Vad påverkar priset på en tillbyggnad?',
        answer:
          'Yta, mark- och grundförhållanden, konstruktion, materialval och installationer påverkar kostnaden. Även anslutningen till det befintliga huset har betydelse. Vi behöver gå igenom projektets förutsättningar för att lämna en relevant offert.',
      },
      rotQuestion,
    ],
  },
]

export function buildServiceHero(page: ServicePage, media: MediaRefs): Page['hero'] {
  const quoteURL = `/offert${page.quoteService ? `?tjanst=${page.quoteService}` : ''}#formular`
  return heroFromBlock(
    {
      blockType: 'serviceHero',
      heading: `${page.title.replace(' Göteborg', '')} i Göteborg`,
      eyebrow: 'DK Byggkoncept · Göteborg med omnejd',
      lead: page.lead,
      body: page.intro,
      image: media[page.image],
      breadcrumbLabel: 'Alla tjänster',
      breadcrumbURL: '/tjanster',
      items: [
        { text: 'En tydlig kontakt' },
        { text: 'Omsorg om detaljerna' },
        { text: 'Kostnadsfri offert' },
      ],
      links: [
        action('Få en kostnadsfri offert', quoteURL, 'accent'),
        action('Så arbetar vi', '#arbetsgang', 'text'),
      ],
    },
    page.slug,
  )
}

export function buildServicePage(
  page: ServicePage,
  media: MediaRefs,
  company: { phone: string; phoneHref: string },
): NonNullable<Page['layout']> {
  const quoteURL = `/offert${page.quoteService ? `?tjanst=${page.quoteService}` : ''}#formular`
  const content = (
    section: ServicePage['scope'],
    key: string,
    imageSide: 'left' | 'right',
  ): ServiceContentBlock => ({
    blockType: 'serviceContent',
    blockName: section.heading,
    anchor: key,
    eyebrow: key === 'om-tjansten' ? 'Med omsorg om helheten' : 'Inför ditt projekt',
    ...section,
    image: media[imageSide === 'left' ? page.detailImage : page.image],
    imageSide,
    links: key === 'planering' ? [action('Berätta om ditt projekt', quoteURL, 'text')] : [],
  })
  return [
    content(page.scope, 'om-tjansten', 'left'),
    {
      blockType: 'process',
      blockName: 'Arbetsgång',
      anchor: 'arbetsgang',
      eyebrow: 'Från första samtal till färdigt',
      heading: 'Tydliga steg genom projektet.',
      steps: page.steps,
      layout: 'cards',
    },
    content(page.planning, 'planering', 'right'),
    {
      blockType: 'faq',
      blockName: 'Vanliga frågor',
      anchor: 'fragor',
      eyebrow: 'Bra att veta',
      heading: `Frågor om ${page.title.replace(' Göteborg', '').toLowerCase()}.`,
      body: 'Har du en annan fråga? Hör av dig så pratar vi om förutsättningarna för just ditt projekt.',
      links: [action('Kontakta oss', '/kontakt', 'text')],
      questions: page.questions,
    },
    {
      blockType: 'intro',
      blockName: 'Lokalt arbetsområde',
      eyebrow: 'Nära dig',
      heading: `${page.title.replace(' Göteborg', '')} i Göteborg och närområdet.`,
      body: 'Vi arbetar i Göteborg, Lerum, Partille, Alingsås och Sävedalen. Berätta var ditt projekt finns och vad du vill förändra, så tar vi nästa steg tillsammans.',
      layout: 'split',
    },
    serviceLinks(page.slug),
    {
      blockType: 'siteCTA',
      blockName: 'Kostnadsfri offert',
      appearance: 'dark',
      heading: 'Vad vill du förändra?',
      body: 'Skicka en kort beskrivning och gärna några bilder. Vi återkommer med nästa steg mot en kostnadsfri offert.',
      links: [
        action('Berätta om ditt projekt', quoteURL, 'accent'),
        action(`Ring ${company.phone}`, company.phoneHref, 'text'),
      ],
    },
  ]
}

export function serviceLinks(exclude?: string): NonNullable<Page['layout']>[number] {
  return {
    blockType: 'cardGrid',
    blockName: 'Fördjupade tjänster',
    eyebrow: 'Våra tjänster',
    heading: exclude ? 'Mer hjälp för ditt hem.' : 'Från en ny idé till en färdig helhet.',
    columns: exclude ? '3' : '4',
    showNumbers: true,
    cards: servicePages
      .filter((page) => page.slug !== exclude)
      .map((page) => ({
        title: page.title.replace(' Göteborg', ''),
        description: page.lead,
        enableLink: true,
        link: action(`Läs om ${page.title.toLowerCase()}`, `/${page.slug}`).link,
      })),
  }
}
