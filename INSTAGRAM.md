# Instagram

Startsidan har ett redigerbart **Instagram-inlägg**-block före sista offertsektionen. Det visar 3 eller 6 inlägg, Instagram-symbol, datum, bildtext och länkar till respektive inlägg samt `https://www.instagram.com/dkbyggkoncept_ab/`. Rubrik, text, kontolänk, knapptext och antal ändras under **Sidor → Startsida → Sidans block**. Bilder optimeras med Next Image och laddas först när de behövs. Videoinlägg visas med stillbild och öppnas på Instagram. Inga externa Instagram-embeds eller klientskript används.

## Konfiguration

- `INSTAGRAM_TOKEN_ENCRYPTION_KEY`: exakt 32 slumpmässiga bytes kodade som base64. Skapa med `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"`. Spara säkert och använd **samma nyckel på alla instanser som använder samma databas**. Ändra inte nyckeln utan att först migrera sparade tokens.
- `CRON_SECRET`: en stark slumpmässig hemlighet för cron-endpointen. Ingen `NEXT_PUBLIC_`-variabel får innehålla dessa värden.
- Befintliga `DATABASE_URL` och `PAYLOAD_SECRET` används som tidigare. App-ID/app-secret behövs inte för förnyelse av en redan långlivad Instagram Login-token.

Lägg nycklarna i `.env` lokalt och i Vercels **Project Settings → Environment Variables → Production**, och deploya ändringen. Starta om lokal utvecklingsserver efter ändring av `.env`.

## Lägg in token

Öppna **Inställningar → Instagram-inställningar** i Payload Admin. Klistra in token i lösenordsfältet och spara. Fältet blir tomt igen; **Token finns sparad** bekräftar lagringen. Tomt fält vid nästa sparning behåller token. Token lagras krypterad med AES-256-GCM; även autentiserade API-svar döljer den.

Använd en **långlivad Instagram User-token från Instagram Login**, med `instagram_business_basic`, för företagets konto. Facebook Page-tokens använder ett annat flöde och fungerar inte med denna förnyelse-endpoint. [Metas förnyelsereferens](https://developers.facebook.com/docs/instagram-platform/reference/refresh_access_token/).

Ange verkligt **Token skapad** och **Token löper ut** om du känner till datumen. Lämna okända datum tomma. Importen antar inte att en gammal token är ny: efter minst 24 timmar från registreringen görs första tillåtna förnyelseförsöket, som ger ett bekräftat utgångsdatum från Meta. Om ett äldre skapandedatum är känt kan det anges för tidigare förnyelse. En redan ogiltig/utgången token behöver ersättas manuellt.

`pnpm setup:instagram` lägger till blocket utan att skriva över ändrade sidor eller separat utkast; en sidbackup sparas i `.backups/`. Om CMS ännu saknar token importerar scriptet `INSTAGRAM_ACCESS_TOKEN` från `.env` krypterat. Befintlig CMS-token skrivs aldrig över. Scriptet är återkörbart och gör **inga Meta-anrop**. Efter import används endast CMS-token vid hämtning/förnyelse; miljövariabeln kan tas bort efter kontroll.

## Cron och felsökning

Om admin visar ett krypteringsfel: **saknas i serverns miljö** betyder att den körande servern inte har läst in nyckeln. Kontrollera `.env` lokalt och starta om servern. På Vercel lägger du in **samma befintliga nyckel** i rätt miljö och deployar på nytt. **Fel format** betyder att värdet inte är 32 bytes kodade som base64. **Kunde inte läsas med serverns krypteringsnyckel** betyder att den sparade token inte kan dekrypteras med den aktuella nyckeln. Återställ nyckeln som användes när token sparades; generera inte en ersättningsnyckel för att lösa felet.

`vercel.json` schemalägger `GET /api/cron/refresh-instagram` dagligen kl. **06:00 UTC**. Vercel skickar automatiskt `Authorization: Bearer <CRON_SECRET>`. Saknad/felaktig hemlighet ger 401 innan databasanslutning. Cron körs i produktion, inte automatiskt med `next dev`. [Vercels cron-dokumentation](https://vercel.com/docs/cron-jobs/manage-cron-jobs).

Jobbet förnyar efter cirka 45 dagar eller senast när 7 dagar återstår. Okänt utgångsdatum ger ett första försök när 24-timmarskravet är uppfyllt. Giltig token förnyas inte vid varje körning. MongoDB-lås hindrar samtidiga jobb; ett kraschat jobs lås löper ut efter två minuter. Atomisk jämförelse vid skrivning skyddar en token som bytts i admin under förnyelsen. Fel behåller tidigare token och datum, skriver endast ett säkert felmeddelande och ger HTTP 503. Vercel gör inga automatiska återförsök; nästa dags körning försöker igen när token fortfarande är giltig.

Kontrollera körningar i Vercel under **Settings → Cron Jobs → View Logs**. Svaret visar `refreshed`, `skipped` med orsak, eller `failed`. Payload visar **Senast förnyad**, **Token löper ut** och **Senaste förnyelsefel**. Ett manuellt **Run** kan göra en riktig förnyelse när token är redo; testerna anropar aldrig detta live.

Publika inlägg hämtas på servern och cachelagras en timme. Token ingår aldrig i cache-resultat/nycklar. Adminändringar och lyckad cron-förnyelse ogiltigförklarar inläggscachen. Ett API-fel visar kontolänken i stället för att krascha sidan. Varken token, Meta-feltext eller API-paginering skickas till besökaren.

## Filer och tester

- `src/instagram/`: privat global, lösenordsfält, kryptering, serverhämtning, cache, databaslås och förnyelse.
- `src/blocks/InstagramFeed/`, `siteBlocks.ts`, `RenderBlocks.tsx`: blockets schema och design.
- `src/payload.config.ts`, genererade Payload-typer/importmap: registrering.
- `src/app/(frontend)/api/cron/refresh-instagram/route.ts`, `vercel.json`: skyddat dagligt jobb.
- `next.config.ts`: tillåtna Instagram/Facebook-bilddomäner.
- `scripts/setup-instagram.ts`, `scripts/data/instagram.ts`, `buildPageBlocks.ts`: återkörbar installation/seed.
- `.env.example`, `package.json`: konfiguration och installationskommando.
- `tests/int/instagram.int.spec.ts`: mockade API-svar för kryptering, åtkomst, datumregler, lyckad/misslyckad förnyelse, samtidighet, adminbyte och inläggshämtning efter förnyelse.

Kör `pnpm exec tsc --noEmit` och `pnpm exec vitest run tests/int/instagram.int.spec.ts`. Ingen riktig tokenförnyelse sker i testerna.
