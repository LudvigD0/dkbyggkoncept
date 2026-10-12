# URL-flytt från den tidigare webbplatsen

Granskad 12 oktober 2026. Alla nio sidor i den tidigare webbplatsens
[sitemap](https://www.dkbyggkoncept.se/page-sitemap.xml), dess interna länkar och
WordPress offentliga sidlista har jämförts med de publicerade sidorna i Payload.

| Tidigare adress                  | Ny adress                       | Hantering                                      |
| -------------------------------- | ------------------------------- | ---------------------------------------------- |
| `/`                              | `/`                             | Oförändrad                                     |
| `/intresseanmalan/`              | `/offert`                       | 301, permanent omdirigering                    |
| `/tjanster/`                     | `/tjanster`                     | Samma slug; 308 tar bort avslutande snedstreck |
| `/kontakt/`                      | `/kontakt`                      | Samma slug; 308 tar bort avslutande snedstreck |
| `/om-oss/`                       | `/om-oss`                       | Samma slug; 308 tar bort avslutande snedstreck |
| `/totalentreprenad-goteborg/`    | `/totalentreprenad-goteborg`    | Samma slug; 308 tar bort avslutande snedstreck |
| `/totalrenovering-goteborg/`     | `/totalrenovering-goteborg`     | Samma slug; 308 tar bort avslutande snedstreck |
| `/lagenhetsrenovering-goteborg/` | `/lagenhetsrenovering-goteborg` | Samma slug; 308 tar bort avslutande snedstreck |
| `/tillbyggnad-goteborg/`         | `/tillbyggnad-goteborg`         | Samma slug; 308 tar bort avslutande snedstreck |

Även det bekräftade gamla startsidesaliaset `/hem` omdirigeras med 301 till `/`.
Stavningsvarianten `/intresse-anmalan` går till `/offert`; den finns inte som
publicerad sida på den tidigare webbplatsen.

De gamla tekniska adresserna `/sitemap_index.xml`, `/page-sitemap.xml` och
`/wp-sitemap.xml` omdirigeras med 301 till den nya `/sitemap.xml`.

## Implementation

Flyttens få, fasta regler finns i [redirects.ts](redirects.ts). De körs i Next.js
innan sidor renderas och kräver ingen databashämtning. Både adresser med och utan
avslutande snedstreck går direkt till sitt slutmål. Query-parametrar, exempelvis
`utm_source`, följer med.

Next.js vanliga borttagning av avslutande snedstreck ligger efter flyttreglerna,
så att `/intresseanmalan/` inte först omdirigeras till `/intresseanmalan`.

Reglerna börjar gälla på domänen när denna Next.js-version deployas där. Om fasta
regler ändras krävs en ny deploy. Det befintliga Payload-registret för ytterligare
omdirigeringar finns kvar; flyttreglerna ovan hanteras i koden.

Verifiera mot en körande server med:

```sh
node scripts/check-redirects.mjs
# Eller mot en annan miljö:
SMOKE_BASE_URL=https://www.dkbyggkoncept.se node scripts/check-redirects.mjs
```
