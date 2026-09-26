# Little Planet · 小小地球

An interactive Earth time machine for young children and the grown-ups exploring with them. Traditional Chinese and English, with tiny stories, a touchable globe and two journeys through time.

## Play

Open the published GitHub Pages site in Safari on iPad, or any modern browser. Use Safari’s Share menu → Add to Home Screen for a home-screen shortcut. A hosted link is more reliable on iPad than opening an HTML attachment in Files.

- One finger: turn the globe.
- Two fingers: pinch to zoom up to 32×; + / − buttons and the mouse wheel also work. Close-up mode hides illustrative clouds, and dragging pans the view in two directions.
- Tap a story stop, or use the large next-stop button.
- Cantonese narration uses 13 bundled M4A recordings, synthesized locally with the already-installed macOS Sinji Cantonese voice from original Cantonese scripts. It does not fall back to Mandarin or require an iPad voice download. English narration uses the device’s speech service.
- Arrow keys rotate the focused globe. The range control selects a story stop.
- Automatic rotation respects the system’s reduced-motion preference.

## What is included

Seven Earth-history stops, six selected human-dispersal stops, a parent guide, and official-source references checked on 2026-09-26. No accounts, analytics, ads, package downloads or build dependencies are required to run the site.

The app is plain HTML, CSS and JavaScript. Native WebGL renders the planet, with a Canvas overlay for geographical routes. Zooming shows broad landforms and coastlines, not street-level detail or political borders. Small countries and city detail are limited by the global source imagery. The hosted site loads a local NASA image pyramid on demand, up to the original 500 m/pixel source. A bounded texture window and small image cache limit device memory use; lower levels are used for wider views. The single-file offline edition retains only the base map. Modern satellite imagery comes from NASA’s Blue Marble collection. Ancient landscapes, cloud effects, lighting and migration lines are illustrative.

## Scientific scope

This is an age-appropriate story, not a paleogeographic reconstruction or an exhaustive history. The timeline is not to scale. Dates are rounded; date ranges may overlap. Ancient coastlines and ice extent are approximate artistic impressions. Migration lines are broad teaching cues, not precise routes or a single definitive migration model. Africa’s point is a story anchor, not a claim that Homo sapiens originated at one location. Earlier dispersals existed. The American stop uses evidence of people at White Sands at least 23,000 years ago, not a definite date of first arrival.

The parent guide links NASA, Smithsonian, the Natural History Museum, USGS, NOAA and the National Park Service. NASA imagery is credited separately from the original application code.

## Local preview

From this directory, use an existing Python installation:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765 in the same computer’s browser. This loopback address is only for local development; use GitHub Pages for iPad access.

## Checks

Interactive checks cover all 13 stops, mode/language switching, playback/pause, source-dialog dismissal, keyboard rotation, zoom/reset, narration cancellation, and reduced-motion defaults. Layout checks cover widths from 320 to 1440 CSS pixels. Touch simulation covers iPad portrait and landscape, one-finger dragging and two-finger pinching. Simulation does not replace a real iPad Safari check or listening to the device’s speech voice.

## Image credit

NASA/Goddard Space Flight Center Scientific Visualization Studio. Blue Marble data courtesy of Reto Stockli (NASA/GSFC) and NASA Earth Observatory. [Source and credits](https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-map/), retrieved 2026-09-26. The active 5400 × 2700 image (about 8 km per pixel) is bundled as `earth-hd.jpg`; this is an observation mosaic, not a live image.

The geography explorer uses the seven-continent / five-ocean naming convention described by the [National Geographic Society](https://www.nationalgeographic.org/national-geographic-map-policy), checked 2026-09-26.

## Little explorer game

Six gentle find-the-place missions with large illustrated globe pins and matching answer buttons. Tap the matching picture, collect one star per mission, and try again without time limits or penalties. Cantonese prompts and feedback are bundled recordings. Progress lasts for the current game only; nothing is uploaded or tracked. The pins mark example locations, not boundaries or complete habitat ranges.

Collecting all six stars reveals a CSS 3D rainbow celebration. The rainbow and stars become still when the device requests reduced motion. No flashing effects or timed dismissal are used.

## On-demand terrain imagery

NASA Blue Marble Next Generation January 2004 A1–D2 images (each 21600 × 21600) are the source for the `terrain/` JPEG pyramid. Official source designation: 500 m/pixel. Source page and original image URLs were checked on 2026-09-26. Original images stay outside the published repository; only locally generated 1350-pixel tiles are served. Detail downloads start at 3× for modern imagery. The viewer wraps at the date line, falls back to the base map if a tile fails, and disables detail requests in the standalone offline file. Imagery is a historical satellite mosaic, not live or street-level imagery.
