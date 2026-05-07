# JobFinder Frontend Vaze

Vue 3 + TypeScript + Vite alap frontend a projektmunka 1. merfoldko kovetelmenyeihez.

## Inditas

1. `npm install`
2. `npm run dev`
3. `npm run build`

## Megvalositott elemek

- Vue Router alapu tobboldalas alkalmazas lazy loaded oldalakkal
- Vedett route-ok (dashboard, recruiter, admin) egyszeru szerepkor alapu guarddal
- 403 es 404 oldalak
- Pinia allapotkezeles
- Allaslista kereses + szures + rendezes
- Loading, error es empty state komponensek
- Mobile-first, token alapu responsive stilusrendszer 3 breakpointtal
- Accessibility alapok: skip link, semantic HTML, focus-visible, aria attributumok

## Mappa attekintes

- `src/components`: ujrafelhasznalhato UI komponensek
- `src/pages`: route szint oldalak
- `src/router`: route definiciok es guardok
- `src/stores`: Pinia store-ok
- `src/data`: mock adatok
