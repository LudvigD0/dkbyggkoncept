# DK Byggkoncept

Lovables design och innehåll är anpassade till projektets Next.js App Router och Payload CMS. `lovable/` används som referens.

## Start

1. Konfigurera `.env` enligt `.env.example`.
2. Kör `pnpm seed` för originalinnehåll och media.
3. Kör `pnpm dev`. Webbplatsen finns på http://localhost:3000 och CMS på http://localhost:3000/admin.
4. Produktion: `pnpm build` och `pnpm start`. Sätt `NEXT_PUBLIC_SERVER_URL` till den publika HTTPS-adressen före bygget.

Seed-scriptet skapar saknade sidor, media och globala inställningar. Befintliga sidor, utkast och inställningar bevaras. Media identifieras med unika `seedKey`. Administratörer skapas via Payloads ordinarie flöde.

## Redigera sidor med block

Öppna en sida i **Pages**. Fliken **Hero** använder temats ordinarie `hero`-fält med **High Impact**, **Medium Impact** och **Low Impact**. Rubrik och introduktion redigeras i rich text, följt av temats länkar och media. Använd en H1-rubrik. Fliken **Sidans block** innehåller sidans övriga innehåll; block kan läggas till, flyttas, dupliceras och tas bort. Slug och innehåll är oberoende av varandra.

Innehållsblocken omfattar introduktion, bild med text, fördjupad tjänstetext, kort, galleri, arbetsgång, frågor, checklista, CTA, kontaktkort, offertpanel och de två projektblocken nedan. Varje block har egna rubriker, texter, länkar, bilder och relevanta layoutval. Hero är separat från blocken och renderas genom de befintliga komponenterna i `src/heros`.

**Header** och **Footer** har redigerbara logotyper, navigering, knappar och texter. **Webbplats** innehåller företagets kontaktuppgifter och verksamhetsområden. **Media** innehåller bilder, logotyper och videor. Välj media direkt i respektive block.

**SEO** innehåller sidans title, description och Open Graph-bild. Publicera ändringar för att visa dem publikt. Utkast och förhandsvisning använder Payloads versionsflöde. Sid-, global- och mediahooks invaliderar Next.js-cache. Slugbyte och avpublicering invaliderar även tidigare URL. Canonical, sitemap och robots använder webbplatsens konfigurerade adress.

OG-bilden hämtas från sidans SEO-bild och använder mediets `og`-variant när den finns. Om ingen bild är vald används DK Byggkoncepts videostillbild från `public/bakgrundsvideo-frame-1.jpg`. Inga bilder eller metadatastandarder från Payloads grundtema används. Favicon använder `public/logo-dk.png`.

Blogg- och sökfunktionerna är tagna ur bruk: Posts, Categories och Search är borttagna från CMS-konfigurationen, och `/posts`, `/search` och deras undersidor ger 404. Sitemap innehåller endast publicerade sidor. `pnpm cleanup:image-labels` tar bort kvarvarande exempelbildsetiketter i aktuellt publicerat innehåll och utkast, med säkerhetskopia och kontroll av samtidiga redigeringar.

## S3 och media

Alla fem variabler används: `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`. Utan S3-inställningar används lokal lagring i `public/media`. Delvis konfiguration ger ett startfel.

Payloads S3-adapter levererar filer genom `/api/media/file/...` och bucketen kan hållas privat. Nycklarna behöver rättigheter att läsa, skriva och ta bort objekt i den valda bucketen. Konfigurationen använder path-style för S3-kompatibla leverantörer.

Bilder använder WebP med kvalitet 80, begränsad originalstorlek och thumbnail/square/small/medium/large/xlarge/og-varianter. Frontend använder Next.js Image, korrekta bildstorlekar och focal point från media. Seedningen laddar upp referensbilder, båda logotyperna och fallback-bilden. Hero-videon levereras från `public`.

## Videohero

Originalfilerna finns i `public/dkbyggkoncept-vasastan-inflyg.mp4` och `public/bakgrundsvideo-frame-1.jpg`. `python3 scripts/prepare-hero-video.py` skapar `public/design/hero-background.mp4` med MP4-metadata först i filen, utan omkodning. Videon är 1280 × 720 och cirka 5,2 MiB. Startsidan använder `/design/hero-background.mp4` under **Hero → High Impact → Bakgrundsvideo från public**. Seedningen laddar upp fallback-bilden till Media; videon laddas inte upp till S3. Vid byte av den lokala videofilen behövs en ny deployment. `pnpm setup:hero-video` ställer in den lokala sökvägen på en befintlig startsida utan att skriva över övrigt innehåll. Bakgrundsvideo kan bara aktiveras på sidan med slug `home`; serverrenderingen begränsar också video till startsidan. Medium Impact visar text och stillbild, Low Impact text.

Fallback-bilden serverrenderas och prioriteras för LCP när heron ligger först. Videon hämtas efter att bilden laddats och webbläsaren har ledig tid. Uppspelning sker ljudlöst och inline när heron och fliken syns. Minskad rörelse, datasparläge och långsam anslutning använder stillbilden där webbläsaren stöder dessa signaler. En pausknapp styr uppspelningen. Vid blockerad autoplay eller fel behålls fallback-bilden.

## Offertformulär och Resend

Offertpanelen använder ett redigerbart formulär i **Forms → Offertförfrågan**. Fält, val, stegtexter, integritetstext och bekräftelse redigeras där. Formuläret har tre steg: Ditt projekt, Omfattning och Kontaktuppgifter. Arbete, fastighet, ort, namn, e-post och telefon är obligatoriska. Budget, tidsplan, beskrivning och bilder är frivilliga. Förvald tjänst stöds med `?tjanst=`.

Mottagaren ändras under **Webbplats → Inställningar → Mottagare av offertförfrågningar**. Första mottagaren är `info@dkbyggkoncept.se`. Endpointen läser adressen direkt från Payload för varje inskick. Adressen kan inte ändras via besökarens formulär och exponeras inte via den publika inställnings-API:n.

Lägg in `RESEND_API_KEY`, `RESEND_FROM_EMAIL` och vid behov `RESEND_FROM_NAME` i miljön och starta om appen. Avsändaren är förberedd som `info@dkbyggkoncept.se`; dess domän behöver vara verifierad i Resend. Utan API-nyckel visas information om att formuläret inte kan skicka och den sista skicka-knappen är avstängd. Servern stoppar också inskick utan komplett konfiguration. Ingen riktig mejlleverans har testats, enligt beställarens önskemål. Payloads officiella Resend-adapter används också för CMS-mejl när konfigurationen är komplett.

Offertformuläret skickar till `/api/quote`. Servern kontrollerar obligatoriska fält, val, e-post, telefon, bildinnehåll och storleksgränser. Origin-kontroll, honeypot och databasbaserad frekvensbegränsning begränsar missbruk. Förfrågningar kan inte skapa offertinskick direkt via `/api/form-submissions`.

Upp till fem JPG-, PNG- eller WebP-bilder kan bifogas. Webbläsaren anpassar dem till högst 1600 px och 700 KiB per bild; hela inskicket begränsas till 4 MiB. Servern kontrollerar och kodar om bilderna samt tar bort EXIF/GPS. Bilderna skickas som mejlbilagor och sparas inte i det publika mediabiblioteket. Förfrågningens text, antal bilder och e-poststatus sparas privat under **Form Submissions**. Bilagorna finns i mejlet, inte som filer i CMS.

Resend får en idempotensnyckel för varje förfrågan. Bekräftelsen visas först när leverantören accepterat mejlet. Vid fel behålls fälten och bilderna för ett nytt försök. Accepterat mejl är inte samma sak som verifierad inkorgsleverans; Resends meddelande-ID sparas i CMS.

`pnpm seed` skapar saknat offertformulär och mottagarinställning utan att skriva över redigeringar. För en befintlig sida används `pnpm exec tsx scripts/setup-quote-form.ts`: scriptet tar en lokal säkerhetskopia, kopplar formuläret, lägger vid behov till en offertpanel under heron och bevarar övriga sidblock och separata utkast.

Referenser: [Payloads e-postadapter](https://payloadcms.com/docs/email/overview), [Resend API och bilagor](https://resend.com/docs/api-reference/emails/send-email), [Resend idempotens](https://resend.com/docs/dashboard/emails/idempotency-keys).

## Migrering från tidigare sidmallar

Migreringen har genomförts på samtliga sju befintliga sidor. Publicerat innehåll, separat utkast och tidigare sidversioner har konverterats till block. Den ursprungliga säkerhetskopian finns i `.backups/before-page-block-migration.json`. Mappen är lokal, åtkomstskyddad och undantagen från Git.

För en annan databas med den äldre modellen: ta först en backup med `pnpm exec tsx scripts/backup-block-migration.ts`, använd det äldre schema som fortfarande innehåller `siteTemplate` och `siteContent`, och kör `pnpm exec tsx scripts/migrate-page-blocks.ts /sökväg/till/backup.json`. Byt därefter till det nuvarande schemat. Gamla textnycklar finns enbart i seed- och migreringsunderlaget i `scripts/data`.

## Nya tjänstesidor och projektblock

De tidigare sluggarna `totalentreprenad-goteborg`, `totalrenovering-goteborg`, `lagenhetsrenovering-goteborg` och `tillbyggnad-goteborg` används som vanliga Payload-sidor med **Medium Impact** i Hero-fliken. Innehållet består av flyttbara block: **Tjänsteinnehåll – bild och fördjupning**, **Arbetsgång**, **Vanliga frågor**, lokalt arbetsområde, relaterade tjänster och kontakt. Rubriker, texter, bilder, bildplacering och länkar redigeras på respektive sida. Ingen särskild frontendmall styr texterna.

Varje sida har en egen SEO-titel, beskrivning och Open Graph-bild under SEO-fliken. Canonical och sitemap använder det befintliga systemet. Länkar finns från tjänsteöversikten, relevanta startsideskort, sidfoten och de andra tjänstesidorna. Det ursprungliga innehållet har omarbetats utifrån respektive tjänst; mallpersoner, exempelomdömen, schablonpriser och gamla detaljregler om bygglov har inte importerats.

Två projektblock finns i blockväljaren. **Före och efter – två bilder** har två fasta bildfält med varsin etikett, alt-text och bildtext. Bilderna visas bredvid varandra på dator och under varandra på mobil. **Projekt – bildslider med före och efter** används redan på startsidan. Lägg till projekt och ordna bilderna fritt i varje projekts bildlista; varje bild märks **Före** eller **Efter**. Besökaren kan scrolla i sidled, svepa, använda pilknappar eller fokus på bildlistan med piltangenter, Home och End. Tomma bildfält visar platshållare. Det befintliga projektets före-bild och tre efterbilder har flyttats över till fyra slides med samma bildreferenser och bildtexter. Inga exempelbilder påstås vara ett riktigt före-/efterprojekt. Rubriker, beskrivningar, etiketter, hjälptext och knapptexter är redigerbara.

Hero och bildinnehåll är serverkomponenter. Enbart bakgrundsvideons uppspelning och sliderns knappar använder klientkod. Alla slides serverrenderas och kan scrollas även utan JavaScript; bilder hämtas med lazy loading. Bilder använder befintliga Next.js Image- och Payload/S3-komponenter med fasta bildytor och responsiva storlekar. Hero-bilden prioriteras, liksom första innehållsbilden efter en texthero. Vanliga frågor använder HTML `details` och fungerar utan JavaScript.

De elva sidornas hero-innehåll, utkast och tidigare versioner har flyttats tillbaka till temats hero-struktur. Säkerhetskopian finns i `.backups/before-hero-structure-1791638958604.json`. `scripts/backup-hero-structure.ts` tar en ny privat backup; `scripts/restore-page-heroes.ts` genomför konverteringen och vägrar skriva över nya redigeringar. För import från den tidigare blockmodellen ska `siteHero` och `serviceHero` fortfarande vara registrerade under konverteringen; ta bort dessa äldre block först när data är migrerade. I det nuvarande schemat är de borttagna. Seedningen skapar direkt ett separat `hero`-fält och innehållsblock.

`pnpm setup:services` tar först en privat säkerhetskopia i `.backups`, importerar sex unika originalbilder från `public/design/services`, skapar saknade tjänstesidor och lägger till startsidesblocket och interna länkar. Ett oförändrat, tidigare exempelgalleri på startsidan ersätts; egna gallerier bevaras. Publicerat innehåll och separata utkast hanteras var för sig. Scriptet kan köras igen och skriver inte över tjänstesidor, projektblock eller bilder som redan finns. `pnpm seed` använder samma underlag för en ny installation. Kör CLI-import med produktionsservern stoppad och bygg sedan webbplatsen på nytt. Importen använder `disableRevalidate` utanför Next.js och rensar dess lokala genererade datacache, så nästa bygge hämtar aktuellt innehåll till bland annat sitemap. Senare CMS-publicering använder de befintliga revalideringshookarna utan nytt bygge.

Innehållsunderlag: [totalentreprenad](https://www.dkbyggkoncept.se/totalentreprenad-goteborg/), [totalrenovering](https://www.dkbyggkoncept.se/totalrenovering-goteborg/), [lägenhetsrenovering](https://www.dkbyggkoncept.se/lagenhetsrenovering-goteborg/), [tillbyggnad](https://www.dkbyggkoncept.se/tillbyggnad-goteborg/). Aktuella regelkällor finns även som redigerbara länkar i berörda frågor: [Boverket](https://www.boverket.se/sv/PBL-kunskapsbanken/lov--byggande/anmalningsplikt/byggnader/tillbyggnad/) och [Skatteverket](https://www.skatteverket.se/privat/fastigheterochbostad/rotarbeteochrutarbete/safungerarrotavdraget.4.5947400c11f47f7f9dd80004014.html).

## Google-recensioner

**Google-recensioner** finns som ett eget block på startsidan under **Sidans block**. Lägg in upp till tre recensioner med namn, text och stjärnbetyg. Datum, länk till den enskilda recensionen och länk till företagets Google-recensioner är valfria. Källtexten är förvald till **Skrivet på Google**. Korten visas tre på rad på dator och i en kolumn på mobil, utan bilder. Tomma eller ofullständiga recensioner visas inte; hela blocket döljs om recensioner saknas. Publicera sidan för att visa ändringarna. Blocket kan även läggas till på andra sidor.

För en befintlig startsida lägger `node --import tsx scripts/setup-google-reviews.ts` till det tomma blocket före kontaktsektionen och sparar först en privat backup. Körningen bevarar befintliga block, utkast och redan ifyllda recensioner. En ny installation får blocket genom `pnpm seed`.

## Kontroll

Kör `pnpm generate:types`, `pnpm generate:importmap`, `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm exec vitest run tests/int/blocks.int.spec.ts tests/int/hero-video.int.spec.ts tests/int/service-content.int.spec.ts` och `pnpm build`. Med webbplatsen igång kontrollerar `node scripts/smoke.mjs` sidor, SEO, sitemap och media. Ange `SMOKE_BASE_URL` för annan port/adress.

Om den lokala DNS-resolvern blockerar MongoDBs SRV-frågor kan CLI-kontroller använda en uttryckligen vald resolver: `MIGRATION_DNS_SERVERS=1.1.1.1 NODE_OPTIONS='--import=./scripts/dns-preload.mjs' pnpm exec next build`. Seed- och migreringsscript stöder samma resolvervariabel. Produktionskonfigurationen använder systemets normala DNS.
