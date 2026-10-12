# DK Byggkoncept

Webbplats med Next.js App Router, Payload CMS, MongoDB och S3. Design och ursprungligt innehåll kommer från Lovable; sidor, hero, innehållsblock och SEO redigeras i Payload.

## Kom igång

1. Installera projektets dependencies med `pnpm install`.
2. Kopiera `.env.example` till `.env` och konfigurera databas, Payload och övriga integrationer.
3. Kör `pnpm seed` för att skapa saknat ursprungsinnehåll. Befintliga sidor och redigeringar bevaras.
4. Starta med `pnpm dev`. Webbplatsen finns på `http://localhost:3000` och admin på `/admin`.

Produktion byggs med `pnpm build` och startas med `pnpm start`. På Vercel konfigureras miljövariabler separat för Production och Preview. `NEXT_PUBLIC_SERVER_URL` ska vara den avsedda publika adressen; utan explicit värde använder Preview sin Vercel-adress.

## Innehåll och integrationer

Se [INTEGRATION.md](INTEGRATION.md) för block, media, S3, videohero, SEO och offertformuläret med Resend. Se [INSTAGRAM.md](INSTAGRAM.md) för Instagram-flödet och automatisk tokenförnyelse. Tidigare URL:er och permanenta redirects dokumenteras i [REDIRECTS.md](REDIRECTS.md).

Bloggfunktionen, kategorierna och sökfunktionen från grundtemat används inte och är borttagna från CMS-konfigurationen. `/posts`, `/search` och underliggande URL:er ger 404 och finns inte i sitemap. Det gamla demonstrationsseedet är borttaget; använd projektets återkörbara `pnpm seed`.

OG-bilden redigeras i varje sidas SEO-flik. Frontend använder webbplatsens egna metadata och bilder. Kvarvarande exempelbildsetiketter kan rensas med `pnpm cleanup:image-labels`; scriptet tar en säkerhetskopia och bevarar separata utkast.

## Kontrollera ändringar

- `pnpm test:int` kör integrationstester.
- `pnpm build` kontrollerar även TypeScript och produktionsbygget.
- `node scripts/smoke.mjs` kontrollerar webbplats, metadata, avstängda routes, sitemap och media mot localhost. Sätt `SMOKE_BASE_URL` för en annan testadress.
- `node scripts/check-redirects.mjs` kontrollerar gamla URL:er och deras redirects.

Lokala säkerhetskopior ligger i `.backups` och ska inte läggas i Git. API-nycklar och andra hemligheter ska hållas i miljövariabler.
