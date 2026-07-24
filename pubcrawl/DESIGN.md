# Zone 1 Pub Crawl — Design Sketch (v1)

One-screen web app in the visual language of **TfL Go**: a hand-drawn schematic tube map of
central London where **every station carries the name of the best-reviewed pub within a short
walk**. One button picks the next stop at random. That's the whole app.

Visual companion to this doc (phone mockups, palette, storyboard):
published as the "Zone 1 Pub Crawl — Design Sketch" artifact from the Claude session.

## Concept

- **Scope:** Zone 1 only. 37 stations, 37 pubs — one pub per station, curated for reputation
  (consistently ~4.3–4.6★ on Google; CAMRA/heritage favourites).
- **Interaction:** a single button — *Pick a pub*. Tapping runs a short roulette flicker across
  the map, the map glides in to the winner, and a TfL-Go-style bottom sheet shows the pub.
- **No repeats:** picks are remembered (`localStorage`) and dimmed on the map until all 37 are
  visited, then the crawl resets with a toast.

## Look & feel (TfL Go cues, unofficial twist)

| Token | Value | Use |
|---|---|---|
| TfL Corporate Blue | `#113B92` | header, button, station names |
| Pint Amber | `#C77E1F` (`#8A5A00` small text) | the crawl's own colour: badge, highlight ring, pub names |
| Map White | `#FFFFFF` | canvas |
| Thames Blue | `#BFDFF3` | river ribbon |
| Line colours | official TfL values | lines + roundel dots only |

- Type: **Hammersmith One** (open, Johnston-inspired; self-hosted) with Gill Sans → system-ui fallback.
- Badge: roundel-*inspired* mark in amber + navy — deliberately not TfL red; footer carries an
  "unofficial fan project" disclaimer.

## The map

Drawn from scratch in SVG following Beck's rules — horizontals, verticals, 45° diagonals:

- **Lines drawn (8):** Bakerloo, Central, Circle, District, Jubilee, Northern (both Zone 1
  branches), Piccadilly, Victoria. Elizabeth line / Overground / DLR are not drawn (they'd double
  every corridor) but appear as coloured dots in the detail card.
- **Markers:** line-coloured ticks for single-line stops; white/black interchange circles where 2+
  drawn lines meet; Bank–Monument drawn as the classic linked pair.
- **Labels:** station name in TfL blue, pub name beneath in amber italic.
- **The Thames** is drawn with its Vauxhall and Tower bends so Waterloo and London Bridge sit
  south of the river.
- Only crawl stations are drawn — deliberately *not* a complete tube map, so it stays legible at
  phone size. Lines crop cleanly at their last Zone 1 crawl stop.

## Pick flow

1. **Tap** the one button.
2. **Roulette** (~1.5 s): amber ring hops across random stations, decelerating. Skipped under
   `prefers-reduced-motion`.
3. **Glide**: map eases to ~2.4× centred on the winner.
4. **Sheet**: pub name, ~★ rating, one line of character, station + line dots, walk time,
   address, *Open in Maps* link.
5. **Repeat** until 37/37, then reset.

## The roster (37)

| Station | Pub | ~★ | Walk |
|---|---|---|---|
| Paddington | The Victoria | 4.5 | 4 min |
| Baker Street | The Barley Mow | 4.4 | 5 min |
| Euston | Euston Tap | 4.4 | 1 min |
| King's Cross St Pancras | The Parcel Yard | 4.3 | 1 min |
| Angel | The Camden Head | 4.4 | 3 min |
| Old Street | The Wenlock Arms | 4.5 | 9 min |
| Farringdon | The Jerusalem Tavern | 4.6 | 3 min |
| Barbican | Hand & Shears | 4.4 | 3 min |
| Liverpool Street | Dirty Dicks | 4.3 | 1 min |
| Aldgate | Hoop & Grapes | 4.3 | 1 min |
| Tower Hill | Hung, Drawn & Quartered | 4.3 | 3 min |
| Monument | The Lamb Tavern | 4.4 | 3 min |
| Bank | The Counting House | 4.3 | 2 min |
| St Paul's | Ye Olde Watling | 4.3 | 3 min |
| Chancery Lane | Ye Olde Mitre | 4.6 | 4 min |
| Holborn | Princess Louise | 4.4 | 2 min |
| Russell Square | The Lamb | 4.5 | 5 min |
| Goodge Street | The Fitzroy Tavern | 4.4 | 2 min |
| Tottenham Court Road | The Flying Horse | 4.3 | 1 min |
| Oxford Circus | The Argyll Arms | 4.4 | 2 min |
| Bond Street | The Guinea | 4.5 | 4 min |
| Notting Hill Gate | The Churchill Arms | 4.6 | 3 min |
| South Kensington | The Anglesea Arms | 4.5 | 6 min |
| Knightsbridge | The Nag's Head | 4.5 | 5 min |
| Hyde Park Corner | The Grenadier | 4.5 | 5 min |
| Sloane Square | The Antelope | 4.4 | 4 min |
| Victoria | The Albert | 4.3 | 4 min |
| Green Park | The Red Lion (Crown Passage) | 4.4 | 4 min |
| Westminster | St Stephen's Tavern | 4.3 | 2 min |
| Embankment | The Ship & Shovell | 4.4 | 2 min |
| Charing Cross | The Harp | 4.5 | 2 min |
| Leicester Square | The Salisbury | 4.4 | 2 min |
| Covent Garden | The Lamb & Flag | 4.4 | 3 min |
| Piccadilly Circus | The Queens Head | 4.4 | 2 min |
| Waterloo | The Kings Arms | 4.5 | 5 min |
| London Bridge | The George Inn | 4.4 | 3 min |
| Blackfriars | The Blackfriar | 4.5 | 1 min |

Ratings are indicative snapshots, not live; the list is one edit away in `data.js`.

## Build

- Static, dependency-free HTML/CSS/JS at **`/pubcrawl/`** on GitHub Pages (homepage untouched).
- Map generated at runtime from `data.js` (single source of truth for map + picker + cards).
- Mobile-first: full-height map, thumb-reach button, pinch-zoom / drag pan / double-tap re-fit.
- Accessibility: `aria-live` result card, visible focus rings, reduced-motion respected,
  AA-checked label colours.

### Future ideas (not in v1)

PWA/offline manifest · shareable pick links · ordered-route mode (nearest-next crawl) ·
filters (beer gardens, cask focus, food).
