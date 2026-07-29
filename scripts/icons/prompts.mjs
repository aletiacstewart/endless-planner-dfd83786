// JS mirror of prompts.ts for the Node generation runner.
// Keep the two files in sync — the TS version is the source of truth used by
// any app-side tooling; this one is what scripts/generate-cover-icons.mjs
// imports at runtime.

export const UNIVERSAL_NEGATIVE = [
  "no text", "no letters", "no words", "no typography", "no numbers", "no digits",
  "no calendar grid", "no date labels", "no month names", "no day names",
  "no watermark", "no logo", "no signature", "no captions", "no writing of any kind",
  "no compass letters", "no N E S W marks", "no roman numerals", "no tiny written marks",
].join(", ");

export const PAGE_SUBJECTS = {
  "my-goals": "a single glowing shooting star arcing over a blank round medallion with a simple eight-point guiding star motif — no letters or marks anywhere",
  "yearly-calendar": "four small nested rings representing the four seasons — spring bud, summer sun, autumn leaf, winter snowflake — arranged as a circular emblem",
  "monthly-calendar": "a graceful crescent-to-full moon phase arc, five moons in a soft curve, celestial and clean",
  "weekly-calendar": "seven small round pebbles arranged in a gentle horizontal row, meditative and balanced",
  "daily-tracker": "a small hourglass beside a rising sun with soft rays, symbolizing one day",
  "complete-tracker": "a small treasure chest with a wax seal bearing a stylized checkmark motif",
  "yearly-habit-tracker": "a circular growing vine wreath with small buds along its length, forming a full ring",
  "weight-tracker": "a delicate balance scale holding a feather on one side and a smooth pebble on the other",
  "measurement-tracker": "a softly coiled measuring ribbon shaped like a decorative curl",
  "blood-sugar-tracker": "a single translucent honey droplet resting on a curled leaf",
  "blood-pressure-tracker": "a small stylized anatomical heart with three concentric soft rings radiating outward",
  "oxygen-tracker": "a pair of lung-shaped leaves joined at the stem, symbolizing breath",
  "self-care-checklist": "a small round bathtub with a lit candle beside it and a steaming teacup, cozy trio",
  "cleaning-checklist": "a slender broom crossed with a folded stack of linen and a small spray bottle",
  recipe: "a wooden spoon, a sprig of fresh herbs, and a small round bowl, arranged as a still life",
  notes: "a single feather quill resting on a folded blank parchment sheet — the parchment is completely blank",
  "workout-tracker": "a small kettlebell wrapped with a laurel sprig, symbolizing strength",
  medications: "a small amber pill vial next to a sprig of herbs, apothecary aesthetic",
  "medical-records": "a folded chart with a small emblem — a plus-cross sigil, no letters — resting on top",
  "yearly-focus": "an ornate blank round focus medallion with a single guiding star at the top and soft radiant rings — no letters, no cardinal marks, no symbols that look like writing",
  "brain-dump": "a soft cloud-shaped thought bubble tangled with delicate ribbons unspooling into a small folded paper — mind emptying onto the page, symbolic and airy",
  "fitness-tracker": "a small hand-weight resting beside a laurel sprig and a slender water flask, symbolic strength still-life",
  "adhd-toolkit": "a small sand-timer beside three tiny check-bullet dots and a coiled fidget spiral, symbolic focus toolkit",
  "budget-monthly": "three neatly stacked coin discs beside a small folded envelope with a wax seal, symbolic monthly budget still-life",
  "debt-tracker": "a descending chain of three linked coin discs with the lowest link opening — freedom from debt, symbolic emblem",
  "savings-goals": "a small round piggy-bank silhouette with a single golden coin arcing above it, symbolic saving emblem",
  "home-info": "a small pitched-roof house silhouette with a decorative key crossed in front, symbolic hearth emblem",
  "weekly-cleaning": "a small pail, a folded linen cloth, and a slender spray bottle arranged as a still-life trio, symbolic weekly reset",
  "meal-planning": "a small paper grocery sack with a sprig of leafy greens and a round apple resting beside it, symbolic still-life",
  "mood-journal": "a soft feminine profile silhouette with three tiny hearts drifting like breath — symbolic emblem of felt emotion",
  "therapy-session": "two small facing armchair silhouettes with a slender lamp between them, symbolic quiet conversation",
  "coping-toolkit": "a small anchor with three gentle concentric ripple rings radiating outward, symbolic grounding emblem",
};

export const COLLECTION_STYLE = {
  classic: "Patriotic still-life style — deep navy, cream, and rich red palette with soft gold highlights, painterly, elegant, refined vintage Americana feel. Red roses when florals appear.",
  "black-moon": "Celestial night palette — deep indigo with warm gold and ivory highlights, softly glowing full-moon backdrop with delicate starfield, painterly and reverent. Composition mirrors the Luminous Hummingbird Celestial Wings icon set: single centered emblem with subtle wing/feather or moon-arc accent, gold-leaf detailing.",
  "celestial-birds-insects": "Ethereal celestial palette — indigo, dusk blue, warm gold, ivory — with soft starfield backdrop, refined watercolor + gold-leaf feel, feathered accents.",
  garden: "Botanical illustration style — soft blush, sage green, warm cream, with delicate ink linework and gentle watercolor washes, like a vintage flora plate. No dragonflies unless the cover explicitly features one.",
  sparrow: "Warm dusk palette — golden amber, twilight blue, ivory — small sparrow silhouettes perched on branches with soft moon and lantern glow, storybook illustration feel.",
  "celestial-florals": "Ivory and gold-leaf palette with silvery moonlight highlights, floral + celestial fusion, delicate and airy. No gemstones or crystal facets.",
  "sky-wings-arrows": "Sky-blue to sunset-gold gradient background with cloud wisps, feathered edges, arrow motifs, feels like an heirloom emblem.",
  scrapbook: "Vintage scrapbook aesthetic — cream paper, torn edges, subtle washi-tape accents, hand-drawn ink outlines with soft pastel fills.",
  affirmations: "Warm ivory paper background with hand-lettered ornamental flourishes (no readable text), muted rose + dusty gold accents, gentle and reverent.",
  faith: "Sacred and reverent — cream, gold-leaf, deep burgundy palette, subtle radiant halo behind the subject, chapel-window softness.",
  chronicles: "Old-world manuscript feel — parchment cream, sepia ink, faded gold accents, tarot-card composition, softly textured background.",
  "change-of-life": "Wellness journey palette — soft blush, sage, dusty rose, ivory — botanical + butterfly motifs woven in, dreamy and gentle, watercolor + gouache feel.",
  "pop-art": "Pop-art palette — bold cerulean, magenta, sun yellow, ivory — clean flat color, subtle halftone dots, playful and modern.",
  grit: "Grit-and-grace mono palette — warm charcoal, bone ivory, hints of ochre — cracked-plaster texture, brave and quiet.",
  feathers: "Cloud-soft sky background with a single hero object rendered as iridescent feather barbs, jewel-tone accents matching the specific cover.",
  dragons: "Cinematic heraldic dragon fantasy — moody sunset ember palette of burnt orange, deep gold, oxblood, obsidian black. Every subject is silhouetted or entwined with a stylized dragon form (scales, wings, curled tail, forged filigree) rendered with realistic scaled texture and dramatic rim-light against a sunset or ember sky. Serious, mature, painterly — NOT whimsical, NOT cute, NOT cartoon.",
  "gothic-sirens": "Gothic siren ink-on-parchment style — cream/ivory paper background lightly aged with soft sepia edges (matching the siren cover paper), the subject rendered in pure BLACK INK with fine engraved linework and stippling, occasional touches of muted teal or bone-white shell texture. Mournful, reverent, cathedral-quiet.",
};

export const DEFAULT_COLLECTION_STYLE = "Refined editorial illustration, soft warm palette, hand-crafted feel, gentle painted textures, museum-quality.";

export const COVER_STYLE_OVERRIDE = {
  "feather-emerald": "Cloud-soft sky background, single hero object rendered from iridescent EMERALD-GREEN feather barbs, luminous jewel highlights.",
  "feather-phoenix": "Cloud-soft sky background, single hero object rendered from iridescent PHOENIX-ORANGE and crimson feather barbs, ember highlights.",
  "feather-sapphire": "Cloud-soft sky background, single hero object rendered from iridescent SAPPHIRE-BLUE feather barbs on a cool blue-cream sky — every accent is BLUE, absolutely no orange or warm tones.",
  "feather-amethyst": "Cloud-soft sky background, single hero object rendered from iridescent AMETHYST-PURPLE feather barbs.",
  "feather-crimson": "Cloud-soft sky background, single hero object rendered from iridescent DEEP-CRIMSON feather barbs.",
  "feather-gold": "Warm ivory sky background, single hero object rendered from iridescent RICH YELLOW-GOLD feather barbs, sunlit gold highlights — every accent is GOLD/YELLOW, absolutely no orange, red, or ember tones.",
  "wellness-roots": "Wellness palette anchored in DEEP SAGE and warm terracotta.",
  "wellness-river": "Wellness palette anchored in COOL RIVER BLUE and soft ivory.",
  "wellness-bloom": "Wellness palette anchored in BLUSH PINK and warm gold with blooming florals and butterflies.",
  "wellness-still-water": "Wellness palette anchored in MISTY LAVENDER and pale sage.",
  "patriotic-roses": "MATCH THE SAME AESTHETIC FOR EVERY ICON IN THIS PACK: soft cream parchment square, warm ivory vignette, airy watercolor-and-gouache planner icon, delicate blue-grey shadow bloom, centered subject wrapped with a thin flowing satin ribbon and paired with two or three velvety RED garden roses. Elegant keepsake stationery mood like a handmade heirloom planner sticker, not photography, not dark cinematic flatlay. Absolutely no American flags, no flag fabric, no stars, no navy background, no black background, no harsh contrast, no mixed rose colors. Roses are always RED.",
  "patriotic-blue-rose": "MATCH THE SAME AESTHETIC FOR EVERY ICON IN THIS PACK: soft cream parchment square, warm ivory vignette, airy watercolor-and-gouache planner icon, delicate blue-grey shadow bloom, centered subject wrapped with a thin flowing satin ribbon and paired with two or three velvety BLUE garden roses. Elegant keepsake stationery mood like a handmade heirloom planner sticker, not photography, not dark cinematic flatlay. Absolutely no American flags, no flag fabric, no stars, no navy background, no black background, no harsh contrast, no red roses, no mixed rose colors. Roses are always BLUE.",
  "red-rose-moonlight": "Moonlit deep-charcoal background with a luminous cream moon and RED rose accents, soft gold light, painterly and romantic. Roses are always RED.",
  "white-rose-moonlight": "Moonlit deep-charcoal background with a luminous cream moon and WHITE rose accents, soft silver-gold light, painterly and romantic. Roses are always WHITE — absolutely no red or pink roses.",
  "black-dahlia-moon": "Celestial night palette — deep indigo, warm gold, ivory highlights, luminous full-moon halo with delicate starfield and soft feathered wing accents, matches the Luminous Hummingbird Celestial Wings icon set.",
  "black-rose-moon": "Celestial night palette — deep indigo, warm gold, ivory highlights, luminous full-moon halo with delicate starfield and soft feathered wing accents, matches the Luminous Hummingbird Celestial Wings icon set.",
  "black-lily-moon": "Celestial night palette — deep indigo, warm gold, ivory highlights, luminous full-moon halo with delicate starfield and soft feathered wing accents, matches the Luminous Hummingbird Celestial Wings icon set.",
  "midnight-iris-moon": "Celestial night palette — deep indigo, warm gold, ivory highlights, luminous full-moon halo with delicate starfield and soft feathered wing accents, matches the Luminous Hummingbird Celestial Wings icon set.",
  "swallowtail-moon": "Celestial night palette — deep indigo, warm gold, ivory highlights, luminous full-moon halo with delicate starfield and a soft swallowtail-butterfly wing accent, matches the Luminous Hummingbird Celestial Wings icon set.",
  "sparrow-moon-lights": "Warm dusk palette — golden amber, twilight blue, ivory — every icon features a small dark sparrow silhouette perched on a slender branch beside a soft glowing moon and tiny paper lanterns, storybook illustration feel.",
  "english-rose-dew": "Soft cottage-garden palette — dusty pink, sage, cream — delicate PINK english roses with dew drops and gentle ink linework. Absolutely NO dragonflies, NO insects, NO butterflies.",
  "cream-ribbons": "Warm ivory background with flowing CREAM SATIN RIBBONS softly curling around the subject, delicate gold-thread accents, elegant and heirloom. Absolutely NO gemstones, NO crystal facets, NO jewelry.",
  "dove-raven-roses": "Cream paper background with rich red rose accents. Every icon features BOTH a small WHITE DOVE and a small BLACK RAVEN — both birds always visible together, painterly heirloom style. Not a single-bird composition.",
  "dove-white-roses": "Cream paper background with soft blush and ivory tones. Every icon features a single WHITE DOVE with delicate WHITE roses — painterly heirloom style, reverent and peaceful. Absolutely no ravens or other birds.",
  "rose-cross-stars": "Deep burgundy and cream flatlay with rich red roses, a small ornate CROSS, and scattered gold STARS around each subject. Sacred still-life aesthetic. Absolutely NO flags.",
  "woven-heart-cross": "Rustic linen and natural jute background with a small woven raffia HEART and a wooden CROSS beside each subject object. Warm sepia and cream palette. Absolutely NO flags, NO roses.",
  "patriotic-white-rose": "MATCH THE SAME AESTHETIC FOR EVERY ICON IN THIS PACK: soft cream parchment square, warm ivory vignette, airy watercolor-and-gouache planner icon, delicate blue-grey shadow bloom, centered subject wrapped with a thin flowing satin ribbon and paired with two or three velvety WHITE garden roses. Elegant keepsake stationery mood like a handmade heirloom planner sticker, not photography, not dark cinematic flatlay. Absolutely no American flags, no flag fabric, no stars, no navy background, no black background, no harsh contrast, no red roses, no blue roses, no mixed rose colors. Roses are always WHITE.",
  "faith-affirmations-bright": "Bright cheerful sticker-book palette drawn from the cover: pastel rainbow (peach, buttercream, sky blue, mint, blush, lavender) with hand-lettered ornamental flourishes (no readable text), joyful and playful. Feels like modern faith-sticker art.",
  "black-moon-flora": "Celestial night palette — deep indigo, warm gold, ivory highlights, luminous full-moon halo with delicate starfield and soft feathered wing accents, matches the Luminous Hummingbird Celestial Wings icon set exactly.",
  "dove-ink": "Cream paper background with rich red rose accents. Every icon features BOTH a small WHITE DOVE and a small BLACK RAVEN — both birds always visible together, painterly heirloom style. Not a single-bird composition.",

  // Dragons — per-cover cinematic flatlays with distinct palettes drawn from each cover
  "dragon-onyx": "Cinematic flatlay: subject object rendered on a slate/obsidian surface with polished BLACK ONYX scales, tarnished SILVER filigree, and cold moonlight rim. Palette: deep black, gunmetal, cool silver. Serious heraldic mood. No cartoon, no cute.",
  "dragon-thornwood": "Cinematic flatlay: subject object nested in mossy FOREST GREEN thorns, aged BRONZE dragon-scale accents, dark oak wood, dew highlights. Palette: forest green, bronze, moss, walnut. Serious woodland-dragon mood.",
  "dragon-curling-ember": "Cinematic flatlay: subject object wrapped in glowing EMBER coils, curled ORANGE-RED dragon tail, drifting sparks and ash. Palette: burnt orange, ember red, molten gold, charcoal. Serious fire-forge mood.",
  "dragon-skull-ember": "Cinematic flatlay: subject object staged beside a small dragon SKULL and glowing embers, bone ivory + rust red palette. Palette: bone, ash, rust, ember red. Serious gothic dragon-crypt mood.",
  "dragon-filigree": "Cinematic flatlay: subject object framed with ornate IVORY and GOLD FILIGREE dragon scrollwork, warm parchment surface. Palette: ivory, gilded gold, warm cream. Serious heraldic-manuscript mood.",
  "dragon-sovereign": "Cinematic flatlay: subject object crowned with regal PURPLE velvet drapery, ornate GOLD dragon crest, deep royal palette. Palette: royal purple, imperial gold, midnight navy. Serious sovereign mood.",
  "dragon-heart-flame": "Cinematic flatlay: subject object cradled in a stylized CRIMSON heart-flame with soft golden glow, deep red silk backdrop. Palette: crimson, blood red, warm gold. Serious devotional-flame mood.",
  "dragon-twin-flame": "Cinematic flatlay: subject object flanked by TWO facing dragon flames — one warm gold, one cool teal — mirrored composition. Palette: gold + teal + charcoal. Serious dual-flame mood.",
  "dragon-whirlwind": "Cinematic flatlay: subject object caught in swirling STORM CLOUDS with lightning glints and grey-blue dragon coils. Palette: storm grey, slate blue, silver-white. Serious tempest mood.",
  "dragon-winged-cross": "Cinematic flatlay: subject object beneath a small gothic CROSS with outstretched dragon wings, black + oxidized gold. Palette: obsidian black, tarnished gold, deep ruby. Serious gothic-cathedral mood.",

  // Gothic Sirens — per-cover: SAME background aesthetic as the siren cover, subject objects rendered as silhouetted BLACK INK
  "gothic-siren-cathedral-throne": "Aged sepia parchment background evoking a stone cathedral throne. Subject rendered as pure BLACK INK silhouette with fine stippling. Palette: bone, sepia, ink black. Cathedral-quiet.",
  "gothic-siren-nautilus": "Deep-sea teal and bone-white nautilus-shell background with faint spiral texture. Subject rendered as pure BLACK INK silhouette. Palette: deep teal, bone, ink black.",
  "gothic-siren-horned-queen": "Aged parchment with faint horned crown filigree. Subject rendered as pure BLACK INK silhouette with heavy stippling. Palette: cream, ash, ink black.",
  "gothic-siren-ribbed-crown": "Bone-cream background with subtle ribbed-crown ridges. Subject rendered as pure BLACK INK silhouette. Palette: bone, ivory, ink black.",
  "gothic-siren-winged-fae": "Misty grey-cream background with faint feathered wing shadow. Subject rendered as pure BLACK INK silhouette. Palette: mist grey, cream, ink black.",
  "gothic-siren-cathedral-nautilus": "Aged sepia parchment with faint cathedral arch AND nautilus spiral overlay. Subject rendered as pure BLACK INK silhouette. Palette: sepia, bone, ink black.",
  "gothic-siren-conch-skull": "Warm bone-ivory background with faint conch-shell and skull motif texture. Subject rendered as pure BLACK INK silhouette. Palette: bone, warm ivory, ink black.",
  "gothic-siren-webbed": "Cool ash-grey background with faint webbed-membrane texture. Subject rendered as pure BLACK INK silhouette. Palette: ash, pale blue-grey, ink black.",
  "gothic-siren-skeleton": "Cold bone-white background with faint skeletal-ribcage texture. Subject rendered as pure BLACK INK silhouette. Palette: bone white, cool grey, ink black.",
  "gothic-siren-haloed-conch": "Warm ivory background with faint gilded halo behind a conch-shell motif. Subject rendered as pure BLACK INK silhouette with a touch of tarnished gold halo. Palette: warm ivory, dim gold, ink black.",
};

export const STICKER_CATEGORY_PROMPT = {
  motifs: "single hero motif sticker — the most iconic decorative object of the theme, rendered as die-cut clip art, centered",
  banners: "single ribbon-banner or tag sticker — ornamental banner shape (blank surface, absolutely NO text inside), centered",
  washi: "single horizontal washi-tape strip with a repeating theme-inspired pattern and slightly torn edges",
  icons: "single small utility icon sticker (leaf, star, heart, key, tea cup, candle) reimagined in the theme's palette and texture",
};

export function buildIconPrompt(coverId, collection, pageId) {
  const subject = PAGE_SUBJECTS[pageId] ?? `a symbolic emblem for ${pageId}`;
  const style = COVER_STYLE_OVERRIDE[coverId] ?? COLLECTION_STYLE[collection] ?? DEFAULT_COLLECTION_STYLE;
  return `Small square editorial ICON illustration: ${subject}. Style: ${style} Composition: single centered subject, generous negative space, painterly finish, museum-quality craftsmanship. Strictly: ${UNIVERSAL_NEGATIVE}.`;
}

export function buildStickerPrompt(collection, category, variantIndex) {
  const style = COLLECTION_STYLE[collection] ?? DEFAULT_COLLECTION_STYLE;
  const role = STICKER_CATEGORY_PROMPT[category] ?? "themed sticker";
  return `Die-cut STICKER piece #${variantIndex + 1} for a planner sticker library. Role: ${role}. Theme: ${style} Rendering: clean gouache feel with subtle die-cut white halo, centered on a plain solid off-white background, no drop shadow, no scene. Strictly: ${UNIVERSAL_NEGATIVE}.`;
}
