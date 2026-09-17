# Final report

Aloha Olin. The site is built, pushed, and live.

## Status

- **Push: worked.** `gh` was signed in, so the repo was created at https://github.com/olagon/canoe-plants and every phase was pushed.
- **GitHub Pages: enabled** from `main`, root folder, with a `.nojekyll` file.
- **Live URL: https://olagon.github.io/canoe-plants/**
- Nothing is waiting on you. The one thing I changed outside the repo is described under Setup in the decisions below (a `safe.directory` line in your global git config, because this folder is owned by root).

## What was built

- **Home.** The night crossing hero. A star field with a faint star compass, 26 plant names that rise from the horizon and settle into a constellation (each one is a link), a waʻa that crosses slowly, and a scroll that brings dawn and fades into the kapa surface. With reduced motion it is a still composition. Below it, what a canoe plant is, the four reasons, a plant of the day, a progress strip once you have met a plant, and four doorways.
- **The voyage.** An SVG Pacific map. Land shapes come from public domain Natural Earth data, simplified by `tools/map.py`. Seven route legs draw on tap, with one gentle draw on first view. Six origin regions show which plants started there. Below are a 12 entry timeline and a "How do we know?" panel, every entry with a source link.
- **The plants.** A full bleed wall of all 26. Multi select filters for use, plant part, and origin, fuzzy search that ignores ʻokina and kahakō so "olena" finds ʻōlena, sort by name or most uses, a live count, a quiet "Met" mark, and all of it kept in the URL.
- **Plant pages.** Big photo, the Hawaiian name set huge on a kapa label, a sound guide with a "How to say it" popover, names block, why it was in the canoe, uses grouped by plant part with icons I drew, numbered cool facts on a gold ground, a moʻolelo marked as tradition with kinolau where recorded, today, grow it, a Swiper gallery with a credit under every photo, sources, mark as met (also automatic after the facts), previous and next, and a print sheet.
- **Pack the canoe.** 26 tiles, 8 slots, a short crossing, and a landing report scored on six needs with plain consequences, then what the voyagers actually did. Confetti for a balanced canoe. Best score saved.
- **Test yourself.** 60 questions (20 easy, 25 medium, 15 hard, 12 with photos). Ten per round, easy first, shuffled choices, streak, explanations, best score, confetti at ten.
- **Myth busters.** 11 native plants and 10 post contact plants, plus a ten round "Canoe plant or not?" game.
- **Voyaging companions.** Puaʻa, ʻīlio, moa, ʻiole, and the small stowaways, four sourced facts and a photo each.
- **Glossary.** 99 words, each checked against Pukui and Elbert, with a search box.
- **For teachers.** Five lessons with discussion questions, honest notes on HĀ and science connections with no invented standard codes, a guide to saying the names, and a print link for every plant.
- **Sources and credits.** All 109 image credits grouped by plant, all 153 text sources, the cultural statement, and licenses.
- **Everywhere.** Skip link, search dialog on the `/` key, keyboard friendly controls, focus rings that change color with the ground, a collapsing nav, and a footer that says Made in Honolulu.

## QA results

- Every route was loaded at 360, 768, 1024, and 1440 pixels in headless Chrome. No horizontal scroll, no console errors, no failed requests, no broken images, no missing alt text, exactly one h1 on every view.
- `tools/check-data.py` reports 0 problems. It checks 26 plants, every field, every source id, every credit id, every image file on disk, quiz shape, and scans the repo for em dashes, en dashes, and fake ʻokina.
- `tools/contrast.py` passes all 56 text and background pairs at WCAG AA.
- Lighthouse, run locally against the simple Python server (mobile, throttled). Home 94, voyage 94, quiz 96, plant wall 88, plant page 89 for performance. Accessibility, best practices, and SEO were 100 on every route tested. The two scores just under 90 are limited by how late a JavaScript rendered page can discover its main photo. GitHub Pages serves with compression and HTTP/2, so the live numbers should be a little better. See the note at the end of this section if I was able to measure the live site.
- Print to PDF was checked on the ipu page. It gives a clean black and white handout.
- Reduced motion was checked on the hero, the map, and the game.

LIVE_LIGHTHOUSE

## Decisions made without you

Copied from DECISIONS.md. The ones marked **(review)** are the ones you are most likely to want to change.


## Setup

- The brief says to `mkdir canoe-plants` and build inside it. CLAUDE.md was already sitting in an empty folder named `canoeplants` under the local web server root, so the repo lives right here instead of in a nested folder. The GitHub repo is still named `canoe-plants`.
- CLAUDE.md (the build brief) is committed with the code so the history explains itself. **(review)** Delete it from the repo if you would rather keep the brief private.
- Image processing uses ImageMagick (`magick`) called from `tools/images.py`, because Pillow was not installed and ImageMagick was. The tool only runs at build time.

## Design plan

### Palette

Named for the materials of the waʻa and the loʻi. Every view stands on one material, so the site changes ground as you move through it instead of being one cream page.

| Token | Hex | Material | Where it is used |
|---|---|---|---|
| kai | `#0C1E33` | Night ocean | Nav, footer, hero, the voyage map |
| kai deep | `#071424` | Deep water | Hero water, map ocean shadow |
| wai | `#1A7A8A` | Lagoon | Pack the canoe, links on light ground |
| kapa | `#EFE4CC` | Unbleached bark cloth | Reading surfaces: plant pages, glossary, teachers |
| kapa light | `#F8F2E3` | Fresh beaten kapa | Panels that sit on kapa |
| ʻōlena | `#D9A21B` | Turmeric dye | Stars, routes, focus rings on dark ground, the one warm accent |
| lau | `#2F5D3A` | Banana and ti leaf | Uses section, myth busters |
| kukui | `#1B1712` | Kukui soot ink | Text on light ground, the plant explorer ground |
| ʻalaea | `#9A3324` | Red clay | Only for wrong answers and warnings, never as decoration |

### Type

- Display: **Alegreya** at weight 800. Text: **Source Sans 3**.
- The brief suggested Fraunces, Newsreader, or Gloock for display and Figtree or Instrument Sans for text. I checked the actual font files from Google Fonts with fontTools. None of those five contain the ʻokina (U+02BB), so every ʻokina would have dropped to a fallback font. Source Sans 3 passed. For display I tested about forty faces for coverage, then rendered the thirteen that passed with the test string and looked at them. Young Serif has the glyph but sets it tiny with a wide gap on both sides, so Maiʻa read as three pieces. Literata crashes the ʻokina into the next letter. Alegreya draws a clear, well spaced ʻokina and strong kahakō, and its calligraphic, slightly hand cut shapes suit a site about things made by hand. **(review)**
- The Hawaiian plant name is set as large as the screen allows on plant pages. It is the main visual on the page along with the photo.
- Body text is capped at 68 characters per line with a 1.6 line height.

### Layout concept

The site opens at night on the ocean and ends each visit on land. The hero is the only staged moment. After dawn breaks, every view stands on a single flat material: ocean for the voyage, soot for the plant wall, kapa for the field guide pages, leaf for myth busters, lagoon for the game. Edges are square. Panels are separated by stamped kapa bands and open space, not by floating cards with shadows. Photos run full bleed. The Hawaiian names do the decorative work.

### Three principles that keep this from being a generic education site

1. **The name is the picture.** Hawaiian names are set huge in the display face and treated with the same respect as the photos. No icon, badge, or label competes with them.
2. **Materials, not themes.** Every color is a real thing from the canoe or the garden, and each view stands on one of them. No gradients as decoration, no shadows, no rounded card grid. The only gradient on the site is the sky, because skies are gradients.
3. **Motion belongs to the visitor.** One orchestrated sequence, the night crossing in the hero. After that nothing moves unless the visitor touches it. Routes draw when tapped. The canoe sails when they say so.

### Review against the brief's trap list

- Cream page with terracotta accent: avoided. Kapa is one ground among five, and the red clay is reserved for wrong answers.
- Near black page with a neon accent: the dark grounds are ocean blue and soot, and the gold is a dye color, not neon. It shares the dark ground with kapa toned type.
- Identical rounded cards with soft shadows: no shadows anywhere, no border radius above 2px.
- Gradient blobs: none.
- Tracked out caps labels: none. Small labels are sentence case in the text face.
- Fade and slide on scroll: none outside the hero.
- Arrows on buttons, middle dots in metadata: none.

## Content and data

- Origin regions are grouped into six map keys so the map dots and the explorer filter share one list: `taiwan`, `sea` (South and Southeast Asia), `newguinea` (New Guinea and Melanesia), `vanuatu`, `indopacific` (coastal plants found across the Indo Pacific), `southamerica`. Ipu and hoi have roots in Africa, which is off the map, so they sit on the `sea` dot because they reached Polynesia through Asia. Their plant pages give the full story.
- Use filter tags are `food`, `medicine`, `cloth-cordage`, `wood-tools`, `light-dye`, `ceremony`. Part tags are `root`, `stem`, `leaf`, `flower`, `fruit`, `seed`, `bark`, `wood`, `sap`. Corms, tubers, and rhizomes count as root. Nuts count as seed.
- Hawaiian words in running text are wrapped in `<span lang="haw">` automatically. Any word with an ʻokina or a kahakō is wrapped, plus every plant name and glossary term. Words that look like English (like "hale" inside an English sentence) are covered by the glossary list.
- Extra data files beyond the brief's list: `data/sources.json` (in the brief's schema section), `data/pack-the-canoe.json` (game scoring), `data/teachers.json` (lesson ideas). All content stays in JSON.
- The project folder is owned by root (it sits in the macOS web server root), so git refused to run in it. I added this one folder to git's `safe.directory` list in the global git config. Nothing else in the global config was touched.
- Added an empty `.nojekyll` file so GitHub Pages serves the files as they are and skips the Jekyll build.
- The brief asks for CDN libraries loaded with `defer` in the page head. Lighthouse scored the home page 53 for performance that way, because every page paid for Swiper, Fuse, and confetti. Now each library is injected with a pinned version only by the view that needs it (`libs` in `js/util.js`). The home page went to 97. If a CDN is blocked, the hero shows its still version, galleries become a plain scrolling row, and the explorer search falls back to simple name matching.
- The kukui "string of nuts was a clock" fact from the brief was cut. The 15 minute burn time only traces to Wikipedia. William Ellis in 1826 and CTAHR say each nut burns 2 to 3 minutes. See RESEARCH_NOTES.md for every cut and correction.
- Photo credits appear under every hero photo, gallery photo, companion photo, and the plant of the day. On the plant wall, the quiz, and the game tiles a caption on every tile would bury the names, so those pages carry one line that points to the plant pages and the credits page, where every image is listed with its photographer, license, and source. **(review)**
- One kukui lei photo was left out because it showed identifiable children. Kukui has three photos instead of four.


## Facts cut, corrected, or flagged

The full list, plant by plant, is in RESEARCH_NOTES.md. The ones that matter most, because they change something in your brief:

- **Kukui as a clock, cut.** The 15 minute burn time only traces to Wikipedia. William Ellis in 1826 and CTAHR say 2 to 3 minutes a nut. The hook was rewritten.
- **ʻAuhuhu and rotenone, corrected.** The sources name tephrosin, a close relative of rotenone. The page also notes that Hawaiʻi law bans fishing with this plant.
- **Kou evidence, corrected.** The brief said fossil pollen and charcoal. The original paper (Burney and colleagues 2001) dated preserved kou fruits from Makauwahi Cave on Kauaʻi to more than 5,000 years ago. The page says fruits.
- **ʻApe near houses, corrected.** Pukui and Elbert say it was planted by gates and fences and on purpose not near homes.
- **ʻŌlena as the only spice, cut.** No source shows Hawaiians used it to season food. New hook.
- **Milo as medicine, cut.** The Bishop Museum database records no Hawaiian medicinal use, so the tag is gone.
- **Kohala field system, corrected** to more than 60 square kilometers. **ʻUala harvest, corrected** to 4 to 6 months.
- **Cut for lack of a source.** Around 50 banana varieties, banana stalks as spear targets, the 110 day coconut float, "only one soft eye", named kō varieties, ʻohe flowering once in decades, the Waipiʻo smell of ʻōhiʻa ʻai, hau needing permission to cut, ʻape leaves as umbrellas, the noni "vomit fruit" nickname and industry dollar value, kapa as "the finest in the Pacific", William Stevenson and ʻōkolehao, Niʻihau as Yam Island.
- **Kept and presented as debates.** How ʻuala reached Polynesia, the status of milo and hau, the Asian plus American ancestry of Polynesian gourds, the settlement date of Hawaiʻi, kukui's kinolau (Kamapuaʻa in most sources, Lono in the Bishop Museum database), whether piʻa was good food or famine food, and whether rats were stowaways or cargo.
- **Worth a second look by a person.** Three items were confirmed only from search excerpts because the full pages blocked automated reading. The Niuolahiki story details and Kāne and Kanaloa farming bananas at Alakahi (both Beckwith), and the 1789 Bounty date. The 28,000 year old taro starch claim rests on one source. A Hawaiian language speaker should confirm the ʻawa variety spelling mōʻī and the cane name pāpaʻa.
- **About the classic books.** Abbott 1992, Krauss 1993, and Handy and Handy 1972 could not be read online. They are cited only where the Bishop Museum ethnobotany database or another page credits a specific claim to them, and their source records say so.

## Images

109 images, all downloaded into the repo in three sizes with WebP and JPEG. 59 are by Forest and Kim Starr. Licenses: 69 CC BY, 21 CC BY-SA, 12 public domain, 7 CC0. Nothing NC or ND was used, so there are no weaker licenses to flag. `tools/images.py` asks Wikimedia for each file's license again at download time and refuses anything outside that list.

Hard ones:

- **ʻOhe.** Only one live photo of the right bamboo species exists on Commons, a tall portrait from French Polynesia. The tool crops it to landscape.
- **Piʻa, ʻauhuhu, hau.** No cultural or use photos exist. They have plant photos only. Two ʻauhuhu photos are from Oman and India.
- **Culture photos that are Polynesian, not Hawaiian.** ʻAwa (a kava bowl in Fiji), niu (coconut fiber rope from the Loyalty Islands), ʻuala (a Māori kūmara variety). The alt text says where each is from.
- **ʻŌhiʻa ʻai hero** was taken in Jakarta because the Hawaiʻi photos were cluttered.
- **Poi dog.** The only free image is an 1816 line sketch by Louis Choris.
- **Left out on purpose.** A kukui lei photo that showed identifiable children, a giant taro photo whose species was uncertain, and a kamani bowl that the museum labels two different ways.

## Ideas for version two

- A Hawaiian language toggle, once a fluent speaker has reviewed every line.
- Audio for every name, recorded by a native speaker, in place of the respelled sound guides.
- A "canoe plants near me" map of gardens, loʻi, and farms that welcome school visits.
- Your own photos. A few heroes are good rather than stunning, and local culture photos (ʻaha cordage, an ʻawa bowl, hau cordage) would replace the Pacific stand ins.
- A review of every moʻolelo by a Hawaiian cultural practitioner before wide classroom use.
- A teacher mode for the quiz with a printable answer key, and a shareable result for Pack the canoe.
- An offline version (a service worker) for classrooms with weak wifi.

## Totals

COMMITS commits. The build started at 10:30 pm on September 16, 2026 and finished around FINISH on September 17 (Hawaiʻi time). That span includes a pause of a few hours when the usage limit was reached mid build, so the working time was roughly four to five hours.
