# Canoe Plants of Hawaiʻi
## Build brief for Claude Code

You are building a complete, finished, beautiful educational web app about the canoe plants, the plants Polynesian voyagers carried across the Pacific to Hawaiʻi in their waʻa (voyaging canoes). The audience is students in roughly grades 5 through 12, their teachers, and curious adults. Students should be able to click through, explore, get lost in it, and come out knowing a ton.

Build the whole thing from start to finish. Do not stop to ask questions. When something is unclear, make a sensible choice, write it down in DECISIONS.md, and keep going. The owner of this project is Olin (GitHub user olagon). He will not be available during the build. Your job is to hand him a finished, pushed, deployed site.

---

## 1. Ground rules

1. Never pause to ask Olin anything. If you hit a fork, pick the better path, log it in DECISIONS.md, and move on.
2. Commit and push often. At minimum after every phase in section 12, and any time a feature starts working. Small commits with plain language messages. Never let more than an hour of work sit unpushed.
3. Every fact gets checked against at least one trusted source before it goes in (see section 10). If you cannot confirm a fact, cut it or clearly label it as a tradition or a debate. Wrong facts in a school app are worse than fewer facts.
4. Every image must be free to use. Public domain, CC0, CC BY, or CC BY-SA only. Record the photographer, license, and source URL for every single image. No hotlinking. Download everything into the repo.
5. Hawaiian spelling is not optional. Use the real ʻokina (U+02BB, the character ʻ) and never a straight apostrophe or a backtick. Use kahakō (macrons) where they belong. Section 8 has the correct spellings. Copy them exactly. Wrap Hawaiian words in `<span lang="haw">` where practical.
6. Pure HTML, CSS, and JavaScript. No React, no Vue, no bundler, no build step required to view the site. Libraries loaded from a CDN are fine (section 4). A small Python or Node script in `/tools` for image processing is fine because it runs once, not in the browser.
7. The bar is stunning. Not "clean and modern." Stunning. Something a teacher would put on the classroom projector just because it looks good. See section 5.
8. Never use em dashes or en dashes anywhere in the site copy, code comments, README, or commit messages. Hyphens are fine. Avoid colons and semicolons in the copy unless they are truly needed.
9. Write for students. Short sentences. Plain words. Vivid details. No lecture voice.

---

## 2. Repo and git workflow

GitHub user: `olagon`
Repo name: `canoe-plants`
Remote (SSH): `git@github.com:olagon/canoe-plants.git`
Site will live at: `https://olagon.github.io/canoe-plants/`

Olin pushes over SSH from his Mac. His git config rewrites https URLs to SSH. The `gh` CLI is installed but may not be signed in to the API.

Setup steps, in order:

```bash
mkdir -p canoe-plants && cd canoe-plants
git init -b main
# scaffold files first (see phase 0), then:
git add -A && git commit -m "Scaffold canoe plants app"

# Try to create the repo with gh. If it works, great.
gh repo create olagon/canoe-plants --public --source=. --remote=origin --push \
  --description "Interactive guide to the canoe plants Polynesian voyagers brought to Hawaiʻi"

# If gh is not authenticated, fall back to this:
git remote add origin git@github.com:olagon/canoe-plants.git
git push -u origin main
```

If the push fails because the remote repo does not exist yet, do not stop. Keep building and committing locally. Retry the push at the end of every phase. Put a clear line at the very top of FINAL_REPORT.md saying the repo needs to be created at github.com/new (name it `canoe-plants`, public, no README) and then `git push -u origin main` will work.

GitHub Pages: the site is served from the `main` branch, root folder. If `gh` is authenticated, enable it:

```bash
gh api -X POST repos/olagon/canoe-plants/pages -f "source[branch]=main" -f "source[path]=/" || true
```

If that fails, note in FINAL_REPORT.md that Olin should turn on Pages in the repo settings (Settings, Pages, Deploy from branch, main, root).

Because the site lives at a subpath (`/canoe-plants/`), every link, script, stylesheet, and image path must be relative. Never start a path with `/`. Use hash routing for in-app navigation (see section 4) so deep links and the back button work without a server.

Commit message style: short, plain, present tense. Examples: "Add plant explorer grid with filters", "Download and credit images for 26 plants", "Fix ʻokina rendering in display font".

---

## 3. How Olin will run this

Olin will drop this file into an empty folder as `CLAUDE.md`, open Claude Code in that folder, and say something like "Read CLAUDE.md and build the whole thing. Do not ask me anything." He may run it in a mode that skips permission prompts. Treat the whole brief as already approved.

---

## 4. Tech stack and constraints

Structure
- `index.html` is a single page app. Sections are rendered from data and swapped in with hash routes, for example `#/`, `#/voyage`, `#/plants`, `#/plant/kalo`, `#/pack-the-canoe`, `#/quiz`, `#/myths`, `#/companions`, `#/glossary`, `#/teachers`, `#/credits`.
- Routing is a tiny hand written router in `js/router.js`. Listen to `hashchange`, render the matching view, scroll to top, update `document.title`, move focus to the new heading.
- All content lives in JSON under `data/`. Views are built from that data. No content hardcoded in HTML except the hero and nav.

Files
```
index.html
css/
  tokens.css        custom properties, type scale, spacing
  base.css          reset, typography, layout primitives
  components.css    nav, buttons, chips, panels, gallery
  views.css         per view styles
  print.css         printable plant fact sheets
js/
  app.js            boot, nav, progress
  router.js
  data.js           loads and caches the JSON
  views/            one module per view
  components/       reusable pieces (gallery, filter chips, quiz engine, canoe game)
  patterns.js       generates the kapa style SVG patterns
data/
  plants.json
  companions.json
  myths.json
  glossary.json
  quiz.json
  timeline.json
  voyage-map.json
  credits.json      auto generated by the image tool
assets/
  img/plants/<slug>/   downloaded and resized images
  img/site/            hero, textures, icons
  svg/                 map, star compass, plant part icons
tools/
  images.py         downloads, resizes, converts, writes credits.json
  image-manifest.json
README.md
DECISIONS.md
FINAL_REPORT.md
LICENSE
```

Allowed libraries (CDN, pinned versions, loaded with `defer`)
- GSAP with ScrollTrigger for the hero sequence and a few scroll moments.
- Swiper for image galleries on plant pages.
- Fuse.js for fuzzy search across plants and glossary.
- canvas-confetti for quiz and game wins.
- Lenis for smooth scroll is optional. Skip it if it fights with reduced motion.
- Google Fonts for type.
- No Leaflet. Build the Pacific map as a hand drawn SVG (section 6). It will be faster, prettier, and needs no tile server.

Browser storage
- `localStorage` for progress (plants explored, quiz best scores, game results). Wrap every read and write in try and catch. The site must work fine when storage is empty or blocked.

Performance targets
- First view loads under 1.5 MB.
- Plant images lazy load. WebP with a JPEG fallback in `<picture>`.
- Lighthouse 90 or better on Performance, Accessibility, Best Practices, and SEO.

Accessibility (non negotiable)
- Semantic HTML with one `h1` per view and a proper heading order.
- Every image has real alt text that describes the plant or scene. No "image of plant."
- Every interactive element works with a keyboard. Visible focus rings that match the design.
- Color contrast meets WCAG AA.
- `prefers-reduced-motion` turns off the hero animation and any autoplay.
- Hawaiian words in `<span lang="haw">` where practical so screen readers do not mangle them.
- Skip link to main content.

---

## 5. Design direction

Read this section twice. It matters as much as the code.

The design comes from the subject. The materials of the waʻa and the loʻi. Night ocean, a star field, wet stone, kapa cloth, banana leaf, kukui soot, ʻōlena gold. Not a SaaS template with Hawaiʻi words on it.

Before writing any CSS, write a short design plan in DECISIONS.md with the palette, the type choices, a one paragraph layout concept, and three principles that make this site unlike a generic educational site. Then review it and change anything that looks like a default you would produce for any other project.

Palette starting point (refine it, but stay in this world)
- Kai, deep night ocean, around `#0C1E33`
- Wai, lagoon teal, around `#1A7A8A`
- Kapa, unbleached bark cloth, around `#EFE4CC` (use as a surface, not as the whole site)
- ʻŌlena, turmeric gold, around `#D9A21B`
- Lau, deep leaf green, around `#2F5D3A`
- Kukui, soot near black for text on light, around `#1B1712`

Do not fall into these traps
- A cream page with a terracotta accent. That is the most common AI generated look right now.
- A near black page with one neon accent.
- Identical rounded cards with the same soft gray shadow on everything.
- Gradient blobs as decoration.
- Tracked out ALL CAPS labels above every heading.
- A fade and slide up animation on every section as it scrolls in.
- Arrows glued to the end of every button and link.
- Middle dots between metadata.

Typography
- One expressive display face for Hawaiian plant names and headings, one calm text face for reading. Candidates for display: Fraunces, Newsreader, or Gloock. Candidates for text: Figtree, Instrument Sans, or Source Sans 3. Pick one pair and commit.
- Before committing, render this test string in both faces at several sizes and check every glyph: `ʻŌlena, Kī, Maiʻa, ʻĀina, ʻūlū, Hāloa`. The ʻokina (U+02BB) and all macron vowels must render from the font itself, not a fallback. If a face fails, pick another.
- The Hawaiian plant name is the design. Set it huge on plant pages. Let the type do the work instead of decoration.
- Body text line length under 75 characters. Generous line height.

Pattern and texture
- Write `js/patterns.js` to generate original geometric patterns in the spirit of ʻohe kāpala (bamboo stamp) designs: repeating triangles, chevrons, nested diamonds, dotted lines. Use them as subtle textures on section backgrounds and as dividers. Generate your own. Do not copy any specific artist's or museum's pattern.
- Plant part icons (root, leaf, fruit, bark, wood, flower, seed) as a small consistent SVG set you draw yourself.

The hero (spend your boldness here, keep everything else calm)
- Full viewport. Night ocean at the bottom, star field above. The Hawaiian star compass idea is present but quiet: faint house lines around the horizon.
- A single waʻa silhouette with a crab claw sail crosses the water slowly.
- The plant names rise one by one from the horizon like stars, then settle into a constellation. Twenty six names.
- As the visitor scrolls, dawn comes up over the horizon and the page transitions into the light kapa surface of the rest of the site.
- Headline is plain and strong, something like "Twenty six plants sailed to Hawaiʻi in a canoe. Meet them." Write a better one if you can.
- This is the one orchestrated motion moment on the site. Everything after it moves only in response to what the visitor does.
- With reduced motion on, the hero is a still composition that still looks great.

Everything else
- Plant explorer is a generous grid with big names and full bleed photos. Hover reveals a one line hook, not a shadow lift.
- Plant pages read like a beautiful field guide. Big image, big name, then clear sections.
- Use a few of the kapa patterns as section separators. Use whitespace to separate the rest.
- Buttons say exactly what they do. "Explore the plants." "Start the quiz." "Pack the canoe."
- Sentence case everywhere.

Take screenshots as you build if your environment allows it. Look at them. Fix what looks generic.

---

## 6. Site map and feature specs

### 6.1 Home (`#/`)
- The hero from section 5.
- Below it, a short "What is a canoe plant?" block in three or four sentences. Plain language. Polynesian voyagers could not know what they would find on a new island. So they packed a living toolkit: food, medicine, cloth, rope, wood, light, and the plants for their ceremonies. Then a small row of the four "why they packed it" reasons with an icon each.
- A featured plant that changes daily (pick by day of year). Big image, a single cool fact, "Meet this plant."
- A progress strip if the visitor has explored any plants. "You have met 7 of 26 plants."
- Doorways to The Voyage, The Plants, Pack the Canoe, and Test Yourself.

### 6.2 The Voyage (`#/voyage`)
An interactive SVG map of the Pacific, drawn by you, from Taiwan and Southeast Asia in the west to the Americas in the east, Hawaiʻi at the top, Aotearoa at the bottom. Simple, elegant coastlines. Not a tile map.

- Animated routes (only on click or tap, plus one gentle draw on first view): out of Taiwan and Southeast Asia through Near Oceania to Samoa and Tonga, the long pause, then out to the Marquesas and Tahiti, then north to Hawaiʻi. A separate route from South America carrying ʻuala.
- Each plant has an origin dot. Tap a dot to see which plants came from that region and jump to them.
- A timeline beneath the map from `data/timeline.json`. Seed entries below. Verify every date and phrase uncertainty honestly ("around", "roughly", "scholars now think").

Timeline seed (verify each)
- Around 3000 BCE, Austronesian speaking people begin sailing out from Taiwan and island Southeast Asia.
- Around 1500 to 1000 BCE, Lapita people reach the Bismarck Archipelago, Vanuatu, Fiji, Tonga, and Samoa, carrying plants, pigs, dogs, and chickens.
- A long pause of many centuries in western Polynesia.
- Around 1000 CE, a fast burst of voyaging settles East Polynesia including the Society Islands and the Marquesas.
- Around 1000 to 1200 CE, voyagers reach Hawaiʻi. Older claims of settlement in 300 to 600 CE are no longer accepted by most archaeologists because of better radiocarbon dating.
- 1200s to 1400s, oral traditions describe round trips between Hawaiʻi and Kahiki (Tahiti), including the voyages of Paʻao and Moʻikeha. Long distance voyaging later stops.
- 1976, Hōkūleʻa sails from Hawaiʻi to Tahiti with no instruments, navigated by Mau Piailug of Satawal, proving the voyages were possible.
- 2014 to 2017, Hōkūleʻa completes the Mālama Honua voyage around the world.
- 2023, Hōkūleʻa begins the Moananuiākea voyage around the Pacific.

Also on this page: a short "How do we know?" panel. Radiocarbon dating, DNA of plants like wauke and ʻuala, language (the sweet potato word), and oral tradition all point the same way.

### 6.3 The Plants (`#/plants`)
The explorer. A grid of all 26 plants (section 8).

- Each tile: photo, Hawaiian name large, common name small, and on hover or focus a one line hook ("The nut that was a clock").
- Filter chips by use: Food, Medicine, Cloth and cordage, Wood and tools, Light and dye, Ceremony and protection. Multi select. Update the count live ("Showing 9 plants").
- Filter by plant part used: Root, Stem, Leaf, Flower, Fruit, Seed or nut, Bark, Wood, Sap.
- Filter by origin region.
- Search box powered by Fuse.js across Hawaiian name, common name, scientific name, and facts.
- Sort by Hawaiian name (default) or by "most uses."
- Tiles the visitor has already opened get a small quiet mark.
- The URL reflects filters so a teacher can link to "all the medicine plants."

### 6.4 Plant page (`#/plant/<slug>`)
A field guide page. Same structure for every plant, built from `plants.json`.

1. Hero image, full width. The Hawaiian name set very large over or beside it. Pronunciation guide under it, like `ʻŌlena (oh-LEH-nah)`. A tiny "How to say it" popover explains that the ʻokina is a quick catch in the throat like the middle of "uh-oh," and the kahakō means hold the vowel a little longer.
2. Names block: common name, scientific name in italics, family, where it came from.
3. "Why it was in the canoe." Two or three sentences.
4. "How Hawaiians used it." A row of the plant part icons, each with a short list. This is the practical heart of the page.
5. "Crazy cool facts." Four to six facts, each one or two sentences, each surprising. This is the section students will screenshot. Make them earn it.
6. "Moʻolelo." One story or tradition tied to the plant, told in a paragraph or two. Label it clearly as a tradition. If the plant has kinolau (a god's physical form), say which god.
7. "Today." How the plant shows up now. Poi at the store, kava bars, tamanu oil, ti leaf lei, the state tree.
8. "Grow it." Three or four lines for a school garden. Sun, water, how it is planted (cutting, corm, sucker, seed), how long until harvest.
9. Gallery with Swiper. Every image shows its credit and license below it.
10. Sources for this plant, listed.
11. Previous plant and next plant links. A "Mark as met" button that saves to progress. Auto mark after the visitor scrolls past the facts.
12. A "Print fact sheet" button that uses `print.css` to produce a clean one or two page handout.

### 6.5 Pack the Canoe (`#/pack-the-canoe`)
A game. The visitor is leaving Tahiti for an island nobody has seen. There is room for only 8 plants in the waʻa. Pick wisely.

- All 26 plants shown as small tiles. Tap to add or remove. A canoe illustration fills up as they pick.
- When they hit 8, "Set sail." A short animated crossing (skip if reduced motion), then a landing report card scored on six needs: Food for the first months, Food that lasts, Medicine, Rope and cloth, Wood and tools, Ceremony and protection. Show what they covered and what they missed with plain consequences ("No kō or niu, so no sweetener and no sennit rope for lashing your hale").
- Then reveal "What the voyagers actually did" with a short explanation that they brought them all, over many voyages, and that some plants like ʻuala came from a different direction entirely.
- Confetti for a balanced canoe. Let them play again. Save their best balance score.

### 6.6 Test Yourself (`#/quiz`)
- At least 40 questions in `quiz.json`, tagged easy, medium, hard. Each has four choices, the answer, and a one or two sentence explanation shown after answering.
- A round is 10 questions drawn to include a mix of tiers. Shuffle choices.
- Track the streak. Show the plant image for image based questions ("Which plant is this?").
- Confetti at 10 out of 10. Save best score.
- Mix question types: identify from photo, match use to plant, origin region, true or false myth busters, "which of these is NOT a canoe plant."

### 6.7 Myth Busters (`#/myths`)
Plants people think are canoe plants but are not, from `myths.json`. Two groups.

Native plants that were already here (indigenous or endemic): hala, kou (see section 8 note), koa, ʻōhiʻa lehua, olonā, ʻilima, naupaka, ʻōhelo, wiliwili, loulu, māmaki. One line each on why people get confused and what they really are.

Plants that came after 1778 (Western contact): pineapple, mango, papaya, guava, macadamia, plumeria, coffee, passion fruit (lilikoʻi), avocado, kiawe. One line each on when and how they arrived.

Make it playful. A "Canoe plant or not?" tap game on this page with instant answers.

### 6.8 Voyaging Companions (`#/companions`)
The animals in the canoe, from `companions.json`.
- Puaʻa, the pig. Food, offerings, and a big deal in ceremony and moʻolelo (Kamapuaʻa).
- ʻĪlio, the dog. The Hawaiian poi dog, a companion and also food. Now extinct as a breed.
- Moa, the chicken. Red junglefowl. Kauaʻi's famous feral chickens carry some of this ancestry (verify how the story is usually told and phrase it carefully).
- ʻIole, the Polynesian rat. A stowaway that spread across the islands and changed forests and bird life.
- Small stowaways: geckos, skinks, land snails, and a few weeds likely came along too.
Verify each and keep it short. Three or four facts per companion plus one image each.

### 6.9 Glossary (`#/glossary`)
At least 50 terms with a plain definition and a pronunciation guide. Searchable. Include at minimum: waʻa, loʻi, ʻauwai, kapa, kinolau, ʻai kapu, kapu, lāʻau lapaʻau, imu, poi, ʻumeke, ʻohana, ʻāina, mālama, moʻolelo, kahuna, aliʻi, makaʻāinana, ahupuaʻa, hōlua, laulau, ʻinamona, ʻōkolehao, ipu heke, iʻe kuku, kua, ʻohe kāpala, ʻaha, hoʻokupu, Hāloa, Kāne, Lono, Kū, Kanaloa, Laka, Kamapuaʻa, Hōkūleʻa, Kahiki, hale, lei, kalo varieties words like ʻohā and huli, kumu, keiki, haumāna.

### 6.10 For Teachers (`#/teachers`)
- Five lesson ideas, each one paragraph plus three discussion questions. Examples: a "Pack the canoe" debate, a school garden plan using three canoe plants, a family interview about kalo or ti in their own lives, a mapping exercise on the voyage page, a myth busters sorting activity.
- A note on how the site connects to Hawaiʻi's Nā Hopena Aʻo (HĀ) framework and to science standards on ecosystems and human impact. Keep alignment claims general and honest. Do not invent standard codes.
- Links to every printable fact sheet.
- A short guide to saying the names right.

### 6.11 Sources and Credits (`#/credits`)
- Every image, grouped by plant, with photographer, license, and a link back to the source. Generated from `credits.json`.
- Every text source used.
- A statement that the plants and traditions described belong to Hawaiian culture and knowledge, and that this site is a starting point, not the last word.
- Code license (MIT) and text license (CC BY 4.0). Images keep their own licenses.

Persistent chrome
- A simple top nav with the site name and the main sections. Collapses to a menu on small screens.
- A footer with the credits link and "Made in Honolulu."
- A search shortcut (press `/`).

---

## 7. Data schema

`data/plants.json` is an array of objects. Every plant must fill every field. Empty strings are a bug.

```json
{
  "slug": "olena",
  "nameHaw": "ʻŌlena",
  "pronunciation": "oh-LEH-nah",
  "nameCommon": "Turmeric",
  "nameSci": "Curcuma longa",
  "family": "Zingiberaceae",
  "originRegion": "South Asia and Southeast Asia",
  "originMapKey": "sea",
  "hook": "The only spice in the canoe",
  "whyInCanoe": "...",
  "uses": [
    { "part": "root", "text": "The rhizome was grated for a bright yellow kapa dye." },
    { "part": "root", "text": "Mixed with salt water for pī kai, a purifying sprinkle." }
  ],
  "useTags": ["medicine", "light-dye", "ceremony"],
  "partTags": ["root", "leaf"],
  "facts": [
    { "text": "...", "source": "abbott-1992" }
  ],
  "moolelo": { "title": "...", "text": "...", "kinolau": "" },
  "today": "...",
  "grow": { "sun": "...", "water": "...", "planting": "...", "harvest": "..." },
  "images": [
    { "file": "olena-01.webp", "alt": "...", "creditId": "c-olena-01", "role": "hero" }
  ],
  "sources": ["abbott-1992", "krauss-1993", "bishop-ethnobotany"],
  "status": "canoe"
}
```

`status` is one of `canoe`, `debated`, or `reclassified`. Milo and hau are `debated`. Kou is `reclassified`. Everything else is `canoe`.

`data/sources.json` holds the source list keyed by id with title, author, year, and URL. Facts reference sources by id.

`data/credits.json` is generated by `tools/images.py` from `tools/image-manifest.json`. Fields: creditId, file, plantSlug, author, license, licenseUrl, sourceUrl, title.

---

## 8. The plants

Twenty six entries. Copy the spellings exactly. The seed facts below are starting points. Research each plant properly and expand to at least four verified facts, a moʻolelo, uses, and growing notes. Where a seed says "verify," treat it as a lead, not a fact.

| slug | Hawaiian | Common | Scientific | Family | Came from | Main uses |
|---|---|---|---|---|---|---|
| kalo | Kalo | Taro | Colocasia esculenta | Araceae | Southeast Asia and Near Oceania | Food, ceremony, medicine |
| uala | ʻUala | Sweet potato | Ipomoea batatas | Convolvulaceae | South America | Food |
| ulu | ʻUlu | Breadfruit | Artocarpus altilis | Moraceae | New Guinea and Melanesia | Food, wood, sap |
| niu | Niu | Coconut | Cocos nucifera | Arecaceae | Indo Pacific | Food, cordage, containers, thatch |
| maia | Maiʻa | Banana | Musa species (Musa acuminata × balbisiana hybrids) | Musaceae | Southeast Asia and New Guinea | Food, ceremony |
| ko | Kō | Sugarcane | Saccharum officinarum | Poaceae | New Guinea | Food, medicine, thatch |
| awa | ʻAwa | Kava | Piper methysticum | Piperaceae | Vanuatu region | Ceremony, medicine |
| kukui | Kukui | Candlenut | Aleurites moluccanus | Euphorbiaceae | Southeast Asia | Light, oil, dye, food, medicine |
| noni | Noni | Indian mulberry | Morinda citrifolia | Rubiaceae | Southeast Asia and Australia | Medicine, dye, famine food |
| wauke | Wauke | Paper mulberry | Broussonetia papyrifera | Moraceae | Taiwan and East Asia | Kapa cloth |
| ohe | ʻOhe | Polynesian bamboo | Schizostachyum glaucifolium | Poaceae | Melanesia and Polynesia | Tools, music, containers |
| olena | ʻŌlena | Turmeric | Curcuma longa | Zingiberaceae | South Asia and Southeast Asia | Dye, medicine, purification |
| awapuhi | ʻAwapuhi | Shampoo ginger | Zingiber zerumbet | Zingiberaceae | South Asia and Southeast Asia | Shampoo, scent, medicine |
| uhi | Uhi | Greater yam | Dioscorea alata | Dioscoreaceae | Southeast Asia | Food, voyaging staple |
| pia-five-leaf-yam | Piʻa | Five leaf yam | Dioscorea pentaphylla | Dioscoreaceae | South and Southeast Asia | Famine food |
| hoi | Hoi | Bitter yam, air potato | Dioscorea bulbifera | Dioscoreaceae | Asia and Africa | Famine food |
| pia | Pia | Polynesian arrowroot | Tacca leontopetaloides | Dioscoreaceae (formerly Taccaceae) | Southeast Asia and Pacific | Food starch, medicine |
| ape | ʻApe | Giant taro | Alocasia macrorrhizos | Araceae | Southeast Asia | Famine food, medicine, protection |
| kamani | Kamani | Tamanu, Alexandrian laurel | Calophyllum inophyllum | Calophyllaceae | Indo Pacific coasts | Wood, oil, lei |
| milo | Milo | Portia tree | Thespesia populnea | Malvaceae | Indo Pacific coasts | Wood for bowls, medicine (status debated) |
| ipu | Ipu | Bottle gourd | Lagenaria siceraria | Cucurbitaceae | Africa originally, then Asia and the Americas | Containers, music, hula |
| ohia-ai | ʻŌhiʻa ʻai | Mountain apple | Syzygium malaccense | Myrtaceae | Malesia | Food, medicine, wood |
| hau | Hau | Sea hibiscus | Hibiscus tiliaceus | Malvaceae | Pantropical coasts | Wood, cordage, fire making (status debated) |
| auhuhu | ʻAuhuhu | Fish poison plant | Tephrosia purpurea | Fabaceae | Tropical Asia and Pacific | Fishing |
| ki | Kī | Ti | Cordyline fruticosa | Asparagaceae | Southeast Asia and Melanesia | Food wrap, clothing, ceremony, protection |
| kou | Kou | Kou | Cordia subcordata | Boraginaceae | Indo Pacific coasts | Wood for bowls (reclassified, see note) |

Note on kou: for a long time kou was listed as a canoe plant. Then fossil pollen and other evidence showed it was growing in Hawaiʻi before people arrived. Include it as the plant that science reclassified. It is a great lesson in how knowledge updates.

Note on milo and hau: some botanists think one or both may be indigenous. Present both honestly as "probably brought by voyagers, but scientists are not fully sure."

Note on Hawaiian names with more than one meaning: pia (arrowroot) and piʻa (yam) are different plants. Do not merge them. ʻawapuhi is sometimes written ʻawapuhi kuahiwi to mark it apart from later gingers.

### Seed facts, moʻolelo leads, and cool details

Kalo
- Hāloa. In tradition, the first child of Wākea and Hoʻohōkūkalani was stillborn and buried, and kalo grew from that spot. The second child, Hāloa, became the first Hawaiian. So kalo is the elder sibling of the Hawaiian people, and caring for it is caring for family.
- The word ʻohana (family) comes from ʻohā, the small shoots that grow off the main corm.
- Hawaiians once grew roughly 300 named varieties. Fewer than 100 survive today. Each had its own color, taste, and best use.
- Raw kalo burns your mouth because of tiny calcium oxalate crystals. Cooking fixes it. Voyagers had to know this.
- The old rule at the table: when the poi bowl is open, no arguing. Hāloa is present.
- Loʻi (flooded terraces) fed by ʻauwai (ditches) turned whole valleys into food systems that still work today.

ʻUala
- It came from South America. Sweet potato DNA and the word itself point that way. The Polynesian word kumara or kūmala matches a word from the Andes. Most researchers think Polynesians reached South America and came back with it centuries before Columbus. A few argue seeds floated across on their own. Present the debate.
- It grows fast, in dry places where kalo will not, so it fed the leeward sides of the islands. The Kohala field system on Hawaiʻi Island covered tens of square kilometers of dryland farms (verify the figure).
- Three to six months from planting to harvest. A famine hedge.
- Leaves were eaten too, and the crop fed pigs.

ʻUlu
- Polynesian breadfruit is seedless. You cannot plant it from a seed. Voyagers had to carry live root cuttings across the ocean and keep them alive.
- One mature tree can drop 150 to 200 fruits or more a year. A few trees feed a family.
- Moʻolelo: during a famine the god Kū buried himself in the earth and rose again as an ʻulu tree to feed his family.
- The wood was carved into surfboards and poi boards. The sticky sap caulked canoes and was smeared on branches to catch birds for feather work.
- The mutiny on the Bounty (1789) happened on a mission to carry breadfruit from Tahiti to the Caribbean.
- The National Tropical Botanical Garden on Kauaʻi keeps the world's largest collection of breadfruit varieties (verify current claim).

Niu
- A coconut can float for weeks and still sprout. It travels on its own, but voyagers still packed it.
- The fiber around the shell was twisted into ʻaha, sennit cord, which lashed together canoes and houses. No nails.
- Under the ʻai kapu, women were forbidden to eat coconut (verify and phrase carefully).
- Trunks became pahu drums for hula. Shells became cups and bowls. Leaves became thatch, baskets, fans.
- A coconut has three "eyes." Only one is soft enough for the sprout to push through.

Maiʻa
- Hawaiians grew around 50 named varieties (verify count).
- Under the ʻai kapu, women could eat only a few varieties such as pōpōʻulu and iholena (verify).
- The banana "trunk" is not wood. It is tightly wrapped leaf bases. Each stem fruits once and dies, and a new keiki takes its place.
- Maiʻa is a kinolau of Kanaloa (verify).
- Fishermen believed carrying bananas in a canoe brought bad luck. Verify how this tradition is usually described.
- Banana stalks were used as targets for spear practice and as rollers for moving canoes (verify).

Kō
- Over 40 named Hawaiian varieties, sorted by stripe and color, with names like kō kea, ʻainakea, manulele, and uahiapele (verify names).
- The variety manulele, "flying bird," was used in love charms (verify, Handy and Handy).
- Juice sweetened bitter medicines so children would take them. Chewing the cane cleaned teeth.
- Leaves went into thatch. Later, this plant built the plantation economy of Hawaiʻi, but it had been here for centuries first.

ʻAwa
- The cultivated plant is sterile. It makes no viable seed. Every ʻawa plant in the Pacific came from a cutting of a cutting of a cutting.
- Hawaiians kept around 13 named varieties (verify). Hiwa, the dark variety, was reserved for offerings to the gods.
- The drink calms the body without clouding the mind. Chiefs, priests, and workers all drank it, each in their own way.
- Kava bars are now common in Hawaiʻi and on the continent.

Kukui
- Hawaiʻi's state tree since 1959.
- Nuts were strung on a coconut leaf midrib and lit. Each nut burned for about 15 minutes, so a string of nuts was also a clock. The name means light and stands for knowledge.
- Fishermen chewed the nut and spat the oil on the water to smooth the surface so they could see fish below.
- Soot from burned nuts made black ink for tattoos and black paint for canoes.
- Roasted nut with salt is ʻinamona, a relish still eaten with poke. Raw nuts are a powerful laxative. Do not try it.
- The pale silvery leaves make kukui groves easy to spot on a green hillside from far away.
- Kukui is a kinolau of Kamapuaʻa, the pig god (verify).

Noni
- It smells like strong cheese when ripe. Some call it vomit fruit. Hawaiians used it anyway, as medicine and as famine food.
- Roots and bark gave yellow and red dyes for kapa.
- Poultices of noni treated wounds and bruises.
- Today noni juice is a global business worth a lot of money, and Hawaiʻi grows some of it.

Wauke
- The inner bark was soaked and beaten into kapa, Hawaiʻi's bark cloth. Hawaiian kapa was the finest in the Pacific, thin, soft, scented, and watermarked with patterns carved into the beaters.
- Kapa makers grew wauke in tight stands and snapped off side branches so the stems grew straight and smooth.
- A 2015 DNA study of paper mulberry across the Pacific traced it back to Taiwan, backing the idea that the ancestors of Polynesians started there.
- Kapa was clothing, bedding, and wrapping for the dead. Making it was women's expert work.

ʻOhe
- The nose flute, ʻohe hano ihu, is played by breathing through one nostril.
- Bamboo strips carved with patterns, ʻohe kāpala, stamped designs onto kapa.
- A sharp bamboo splint was the blade used to cut a newborn's umbilical cord (verify).
- Kāʻekeʻeke, bamboo tubes of different lengths, were thumped on the ground to make music for hula.
- This bamboo flowers only once every few decades (verify).

ʻŌlena
- The only spice plant in the canoe. Same species as the turmeric in curry.
- The orange rhizome dyed kapa yellow and was rubbed on skin and dripped in ears and noses as medicine.
- Mixed with salt water it became pī kai, sprinkled to cleanse a place or a person of bad influence.
- It goes dormant and disappears in winter, then pops back up. Farmers had to remember where it slept.

ʻAwapuhi
- Squeeze the red cone and a clear slippery liquid comes out. That is shampoo and conditioner. This is why it is called shampoo ginger.
- A hair care brand on the continent still uses the name.
- Dried and powdered rhizome scented kapa. Crushed rhizome eased headaches.

Uhi
- Tubers can grow huge, sometimes tens of pounds (verify a solid range).
- It stores for months without spoiling, which made it a perfect food to carry on a long voyage and to plant on arrival.
- A climbing vine planted in mounds. Hawaiians grew it in drier valleys.

Piʻa
- A wild looking yam with leaves split into five leaflets.
- A famine food, dug when kalo and ʻuala failed.

Hoi
- Grows potato like bulbils in the air along the vine. Air potatoes.
- Bitter and mildly toxic raw. It had to be sliced, soaked, and cooked. Famine food.
- The same species is now a notorious invasive weed in Florida (verify).

Pia
- Grate the tubers, wash the starch out, dry it. That starch was the original thickener in haupia, the coconut pudding. Most haupia today uses cornstarch instead.
- The starch was also medicine for stomach trouble.
- The plant dies back in the dry season and hides underground.

ʻApe
- Looks like a giant kalo. Leaves can be taller than a person.
- Famine food that needed long, careful cooking to destroy the burning crystals.
- Planted near houses to keep away evil. Some traditions say the leaves were held up as umbrellas (verify).

Kamani
- Hard, beautiful reddish wood carved into bowls and calabashes.
- Oil pressed from the nuts is sold worldwide today as tamanu oil for skin.
- The nuts float and the tree grows right at the shoreline. Fragrant white flowers went into lei.

Milo
- Prized for food bowls because the wood does not give poi a bad taste.
- Kamehameha planted milo trees around his home in Waikīkī (verify how this is usually told).
- Flowers open pale yellow in the morning and turn purple by evening.
- Some botanists think it may have been here before people. Say so.

Ipu
- Water bottles, storage, drums, rattles. The ipu heke, two gourds joined, is the heartbeat of hula.
- Gourds were also floats for fishing nets.
- Cook's artist John Webber drew Hawaiians wearing gourd helmets in 1779 (verify and use the public domain drawing if it is a good fit).
- DNA studies suggest the Polynesian bottle gourd carries both Asian and American ancestry, another clue that voyagers reached the Americas (verify the current reading of this research).
- Decorated gourds from Niʻihau and Kauaʻi, ipu pāwehe, were dyed with patterns and are now rare treasures.

ʻŌhiʻa ʻai
- In spring the trees drop pink and red pom pom flowers until the forest floor is carpeted.
- The fruit is crisp, watery, and does not keep. Eat it within a few days.
- Bark was medicine for sore throats. Wood went into house posts.
- Whole valleys, like Waipiʻo, still fill with the smell in fruiting season.

Hau
- The light wood was used for the ama, the outrigger float, and for fire making by rubbing a harder stick along a hau base.
- Bark fiber made rope and sandals.
- Flowers open yellow and turn orange red by evening, then drop.
- Hau was so useful that in some places you needed permission to cut it (verify).

ʻAuhuhu
- Pound the leaves, toss them in a tide pool, and the fish go still and float. The chemical is rotenone, which stuns fish but did not harm the people who ate them. This method is called hola.
- Rotenone later became a pesticide used around the world.
- Cultivated near fishing spots. A small shrub with pea flowers.

Kī
- Leaves wrapped food for the imu and still wrap laulau today.
- Rain capes, sandals, thatch, hula skirts, and plates.
- Planted around homes for protection and used by kahuna to bless. Sacred to Lono and Laka.
- Kids and adults rode ti leaves down grassy hillsides. Hōlua sledding on a bigger scale used a different sled, but ti leaf sliding is its own tradition.
- The baked root is sweet like molasses. After Western contact people distilled it into ʻōkolehao.
- The green Polynesian ti almost never sets seed in Hawaiʻi. It is grown from stem cuttings, the same way the voyagers carried it (verify).

Kou
- Beautiful wood for bowls and platters that never flavored the food.
- Everyone called it a canoe plant until fossil pollen and charcoal turned up from before people arrived. Now it is considered indigenous.
- Its orange flowers went into lei. Introduced moths nearly wiped it out in the 1800s (verify).

---

## 9. Images

Sources, in order of preference
1. Forest and Kim Starr, Starr Environmental (starrenvironmental.com). Thousands of Hawaiʻi plant photos under a Creative Commons attribution license. Confirm the exact license on the page. This will cover most plants.
2. Wikimedia Commons. Filter by license. Download the original file. Record author, license, and the file page URL.
3. iNaturalist observations with CC0, CC BY, or CC BY-SA licenses. Skip NC licensed photos unless nothing else exists, and then flag them in DECISIONS.md.
4. United States government sources such as USDA NRCS PLANTS and USDA Forest Service. These are public domain.
5. Public domain historical art: John Webber's drawings from Cook's 1779 visit, Hawaiʻi State Archives images that are clearly out of copyright.
6. Unsplash or Pexels for a few ocean, sky, and texture shots in the hero. Not for plant identification.

Do not use Bishop Museum images or any museum collection photo unless the page states it is public domain or CC. Do not use stock sites that require a license. Do not use anything from a Google Images result without tracing it back to a real source and a real license.

Rules
- At least three images per plant: the whole plant, a close up of the part people used, and a cultural or use image where one exists (a poi bowl, kapa, an ipu heke, a lei).
- Verify the photo actually shows the right species. Read the scientific name on the source page. Look at the photo. ʻŌhiʻa ʻai is not ʻōhiʻa lehua. Pia is not piʻa. Polynesian bamboo is not the bamboo in a garden store.
- `tools/image-manifest.json` lists every image with plantSlug, sourceUrl, author, license, licenseUrl, and the intended role.
- `tools/images.py` reads the manifest, downloads each file, strips metadata, resizes to 1600px wide and 480px wide, converts to WebP and keeps a JPEG fallback, and writes `data/credits.json`. Run it, commit the images, commit the credits.
- Every image shows its credit in the UI. The credits page lists them all.
- Alt text describes what is in the picture in one sentence a student would understand.

---

## 10. Facts and sources

Trusted starting points for text research
- Isabella Aiona Abbott, Lāʻau Hawaiʻi: Traditional Hawaiian Uses of Plants (Bishop Museum Press, 1992).
- Beatrice Krauss, Plants in Hawaiian Culture (University of Hawaiʻi Press, 1993).
- E. S. Craighill Handy and Elizabeth Green Handy, Native Planters in Old Hawaii (Bishop Museum Bulletin 233).
- Bishop Museum Hawaiian Ethnobotany Online Database.
- Native Plants Hawaiʻi (University of Hawaiʻi) and the Hawaiʻi Native Plant Society.
- National Tropical Botanical Garden pages, including the Breadfruit Institute.
- University of Hawaiʻi College of Tropical Agriculture and Human Resources (CTAHR) publications on kalo, ʻulu, ʻawa, and ʻuala.
- Patrick Kirch's work on Polynesian settlement, and Wilmshurst and colleagues (2011) on East Polynesian settlement dates.
- Roullier and colleagues (2013) on sweet potato origins. Chang and colleagues (2015) on paper mulberry DNA.
- Polynesian Voyaging Society for Hōkūleʻa dates.
- Ulukau Hawaiian Electronic Library and wehewehe.org for Hawaiian word meanings and spellings.

Rules
- One trusted source per fact, two for anything surprising.
- If two sources disagree, say so in the text in plain words.
- Traditions, moʻolelo, and kapu are described as traditions, not as science.
- Put every source in `data/sources.json` and on the credits page.
- Do not invent quotes, statistics, or dates. If you cannot find it, leave it out.

---

## 11. Quality bar and QA

Before you call it done, run through all of this and fix what fails.

- Serve locally with `python3 -m http.server 8080` and click through every route. Nothing 404s. Every image loads. The back button works everywhere.
- Test at 360px, 768px, 1024px, and 1440px wide. No horizontal scroll. Nav collapses cleanly. Galleries fit.
- Turn on reduced motion in the OS or with a CSS override and check that the hero, map, and canoe game still make sense and look good.
- Keyboard only pass: tab through the whole site, open a plant, filter the grid, play the game, take the quiz. Focus is always visible. Nothing is a trap.
- Run a contrast check on every text and background pair in `tokens.css`.
- Run Lighthouse if a headless browser is available. Fix anything under 90.
- Grep the entire repo for a straight apostrophe inside Hawaiian words, for em dashes, and for en dashes. Fix all of them. `grep -rn -e $'\u2014' -e $'\u2013' . --include=*.html --include=*.js --include=*.json --include=*.css --include=*.md` should return nothing.
- Check `plants.json` with a small script: 26 entries, every field filled, every image file in the manifest exists on disk, every source id exists in `sources.json`, every creditId exists in `credits.json`.
- Print a plant page to PDF and check `print.css` gives a clean handout.
- Open the site at the subpath in your head. Are all paths relative? `grep -rn 'href="/' .` and `grep -rn 'src="/' .` should return nothing.

---

## 12. Build order and commit checkpoints

Push at the end of every phase. Commit inside a phase whenever something works.

Phase 0, scaffold and first push
- Folder structure, `index.html` shell, empty JSON files, README stub, LICENSE, DECISIONS.md, `.gitignore`.
- git init, first commit, create the remote, push.

Phase 1, design system and hero
- Write the design plan in DECISIONS.md. Review it against section 5. Revise.
- `tokens.css`, `base.css`, type test for ʻokina and macrons.
- Router working with placeholder views.
- The hero, fully built, with reduced motion fallback. Screenshot it. Judge it. Improve it.
- Commit and push.

Phase 2, plant data and explorer
- `plants.json` with all 26 entries filled from section 8 (seed level content, correct spellings, pronunciation guides, tags).
- The explorer grid with filters, search, sort, and URL state.
- Commit and push.

Phase 3, plant pages
- The full plant page template working from data. Previous and next. Progress marking. Print stylesheet.
- Commit and push.

Phase 4, images
- Build the manifest, run the image tool, commit images and credits. Wire galleries and hero images. Alt text for all.
- Commit and push.

Phase 5, research and writing
- Go plant by plant. Verify seeds, expand facts to four to six each, write the moʻolelo, uses by part, today, and grow sections. Fill `sources.json`. This phase is the heart of the app. Take it seriously. Commit after every five plants.
- Push.

Phase 6, the voyage
- SVG Pacific map, routes, origin dots, timeline, "How do we know?" panel.
- Commit and push.

Phase 7, games
- Pack the Canoe with scoring and the reveal. Quiz with 40 or more questions. Confetti.
- Commit and push.

Phase 8, the rest
- Myth Busters with the sorting game, Voyaging Companions, Glossary, For Teachers, Sources and Credits, footer, search shortcut.
- Commit and push.

Phase 9, polish and ship
- Full QA from section 11. Fix everything.
- README with a description, screenshots, how to run locally, how content is structured, how to add a plant, and licenses.
- Enable GitHub Pages if possible.
- Write FINAL_REPORT.md.
- Final commit and push.

---

## 13. Definition of done

- 26 plants, every field filled, every fact sourced, every image credited.
- All 11 routes work at the subpath with relative links and hash routing.
- Hero is memorable and calm everywhere else.
- Works on a phone.
- Keyboard accessible, reduced motion respected, contrast passes.
- No em or en dashes anywhere. Real ʻokina everywhere.
- Repo pushed to `olagon/canoe-plants` with a clean history of many small commits.
- Pages enabled, or exact instructions to enable it at the top of FINAL_REPORT.md.

---

## 14. FINAL_REPORT.md

Write it last, for Olin, in plain language. Include
- Whether the push and Pages setup succeeded, and the exact next step if not.
- The live URL.
- What was built, section by section, in a few lines each.
- Every decision you made without him, copied from DECISIONS.md, with the ones he might want to change marked.
- Facts you could not verify and cut, and facts you kept but flagged as debated.
- Images that were hard to find and any that used a weaker license.
- Ideas for a version two. A Hawaiian language toggle once a fluent speaker reviews the text. Audio pronunciations recorded by a native speaker. A "canoe plants near me" map of gardens and loʻi that welcome school visits.
- Total commits and total time.

Aloha. Build something students will love.
