# Little Planet · 小小地球

An interactive Earth time machine for young children and the grown-ups exploring with them. Traditional Chinese and English, with tiny stories, a touchable globe and two journeys through time.

## Play

Open the published GitHub Pages site in Safari on iPad, or any modern browser. Use Safari’s Share menu → Add to Home Screen for a home-screen shortcut. A hosted link is more reliable on iPad than opening an HTML attachment in Files.

- One finger: turn the globe.
- Two fingers: pinch to zoom; + / − buttons also work.
- Tap a story stop, or use the large next-stop button.
- Read to me uses the device’s speech service. Voice availability varies; some voices require a network connection.
- Arrow keys rotate the focused globe. The range control selects a story stop.
- Automatic rotation respects the system’s reduced-motion preference.

## What is included

Seven Earth-history stops, six selected human-dispersal stops, a parent guide, and official-source references checked on 2026-09-26. No accounts, analytics, ads, package downloads or build dependencies are required to run the site.

The app is plain HTML, CSS and JavaScript. Native WebGL renders the planet, with a Canvas overlay for geographical routes. Modern satellite imagery comes from NASA’s Blue Marble collection. Ancient landscapes, cloud effects, lighting and migration lines are illustrative.

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

NASA/Goddard Space Flight Center Scientific Visualization Studio. Blue Marble data courtesy of Reto Stockli (NASA/GSFC) and NASA Earth Observatory. [Source and credits](https://svs.gsfc.nasa.gov/2915), retrieved 2026-09-26. The 2048 × 1024 image is bundled as `earth.png`; this is an observation mosaic, not a live image.

The geography explorer uses the seven-continent / five-ocean naming convention described by the [National Geographic Society](https://www.nationalgeographic.org/national-geographic-map-policy), checked 2026-09-26.
