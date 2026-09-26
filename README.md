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

Ten gentle missions, all played on the same screen, with six kinds of play: find a picture on the globe, spin the globe until a place sits inside a circle, drag the lion to its home, pick the right picture, tap an animal to make it hop or waddle, and turn the whole globe once. Each has a bundled Cantonese prompt and fact. There are no time limits or penalties, and “Help me turn” buttons avoid getting stuck. Progress lasts for the current game only; nothing is uploaded or tracked. The pins mark example locations, not boundaries or complete habitat ranges.

Collecting all ten stars turns the globe area into an after-the-rain valley: rain stops, the sky clears and a glowing rainbow appears (red outside, violet inside, with a fainter reversed secondary bow), its feet fading behind the hills. Dragging moves the grass, valley and sky at different speeds and turns the bow in 3D. The painted valley (`images/rainbow-valley.jpg`) was generated for this site with an AI image tool (prompt in `tools/image-prompts.md`); the rainbow, rain, mist and depth layers are drawn in code. Reduced-motion settings show the finished scene without animation.

## On-demand terrain imagery

NASA Blue Marble Next Generation January 2004 A1–D2 images (each 21600 × 21600) are the source for the `terrain/` JPEG pyramid. Official source designation: 500 m/pixel. Source page and original image URLs were checked on 2026-09-26. Original images stay outside the published repository; only locally generated 1350-pixel tiles are served. Detail downloads start at 3× for modern imagery. The viewer wraps at the date line, falls back to the base map if a tile fails, and disables detail requests in the standalone offline file. Imagery is a historical satellite mosaic, not live or street-level imagery.

## Earth story films

Each of the six moves between adjacent Earth-history stops plays a narrated story film of 2 min 19 s to 2 min 59 s (twelve lines each). Every line has its own painted scene that shows what the narration describes — forming planet and Moon, lava, volcanoes, rain filling oceans, microbes, stromatolites, trilobites, drifting continents, dinosaurs, ice age, farming, cities — and the WebGL globe returns for planet-scale lines, blending epochs at the matching line. Captions, the chapter bar and scenes follow the real Cantonese recording; English uses the device voice per line. Back / next line, pause, replay, skip, Escape and reduced-motion settings are supported. Scenes are illustrations, not physical simulations; facts were checked for a young audience (for example, plates move about as fast as fingernails grow, pterosaurs were not dinosaurs, birds descend from dinosaurs).

## Narration

All Cantonese audio is generated with the built-in macOS Sinji voice by `tools/build-audio.py` (no downloads): speaking rate 140 plus short pauses after commas and full stops, so stories run about 20–24 s instead of about 18 s. The tool writes each film's line start times into `transitions.js`, refuses film scripts that do not match the captions, refuses game scripts that do not contain their mission question, and fails on empty output. `tools/build-single-file.py` stops if any audio file is not embedded in the offline edition.

## Melbourne 10 m close-up (demo)

When the modern-Earth globe is zoomed to about 2.4× or more with Melbourne facing the viewer, a “🔍 近看墨爾本” button opens a flat close-up. It covers about 16 × 10 km around central Melbourne at 10 m per pixel. The globe’s 32× limit is about 0.85 km per screen point, so 10 m detail needs this separate view rather than more globe zoom. A switch compares the new 10 m image with the old 500 m NASA tile at the same place and scale; five landmark labels can be hidden. One finger pans, two fingers pinch (about 4–200 m per screen point), and + / − / fit buttons work too.

Imagery: Copernicus Sentinel-2 L2A true-colour (TCI) scene `S2C_T55HCU_20260908T001553_L2A`, taken 2026-09-08, 10 m per pixel, from Element 84 Earth Search on AWS Open Data (free, no account). `tools/build-sentinel.py` reads only the four needed internal tiles (9.0 MB) with HTTP range requests, reprojects UTM 55S to the site’s lat/lon grid (64-pixel mesh), and writes 11 JPEG tiles (0.71 MB) in `closeup/melbourne/`. The raw crop stays in the ignored `tools/_source/` folder. Opening the whole area on a 2× screen downloads about 0.82 MB including the NASA context tile; closer views need fewer tiles. If a 10 m tile fails, the old 500 m image stays visible with a notice. The offline single file disables the close-up.

Credit: Contains modified Copernicus Sentinel data 2026. [Legal notice](https://sentinels.copernicus.eu/documents/247904/690755/Sentinel_Data_Legal_Notice), checked 2026-09-26. Not live imagery; people and vehicles are not identifiable at 10 m.
