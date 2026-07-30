// Shared prompt library for cover icons + stickers.
// Consumed by the Node generation scripts in ../generate-*.mjs.
//
// PRINCIPLE: every page id has a distinct SUBJECT list (what the icon shows).
// Every collection has a STYLE modifier (palette, texture, mood). The final
// prompt = SUBJECT + STYLE + universal negative prompt. This is what makes
// icons "page-specific" and "cover-related" instead of generic.

export const UNIVERSAL_NEGATIVE = [
  "no text",
  "no letters",
  "no words",
  "no typography",
  "no numbers",
  "no digits",
  "no calendar grid",
  "no date labels",
  "no month names",
  "no day names",
  "no watermark",
  "no logo",
  "no signature",
  "no captions",
  "no writing of any kind",
  "no compass letters",
  "no N E S W marks",
  "no roman numerals",
  "no tiny written marks",
].join(", ");

// -- Page subjects ------------------------------------------------------------
// Each page id maps to a short, evocative subject description.
// Kept intentionally symbolic so icons stay clean and not literal.

export const PAGE_SUBJECTS: Record<string, string> = {
  "my-goals":
    "a single glowing shooting star arcing over a blank round medallion with a simple eight-point guiding star motif — no letters or marks anywhere",
  "yearly-calendar":
    "four small nested rings representing the four seasons — spring bud, summer sun, autumn leaf, winter snowflake — arranged as a circular emblem",
  "monthly-calendar":
    "a graceful crescent-to-full moon phase arc, five moons in a soft curve, celestial and clean",
  "weekly-calendar":
    "seven small round pebbles arranged in a gentle horizontal row, meditative and balanced",
  "daily-tracker":
    "a small hourglass beside a rising sun with soft rays, symbolizing one day",
  "complete-tracker":
    "a small treasure chest with a wax seal bearing a stylized checkmark motif",
  "yearly-habit-tracker":
    "a circular growing vine wreath with small buds along its length, forming a full ring",
  "weight-tracker":
    "a delicate balance scale holding a feather on one side and a smooth pebble on the other",
  "measurement-tracker":
    "a softly coiled measuring ribbon shaped like a decorative curl",
  "blood-sugar-tracker":
    "a single translucent honey droplet resting on a curled leaf",
  "blood-pressure-tracker":
    "a small stylized anatomical heart with three concentric soft rings radiating outward",
  "oxygen-tracker":
    "a pair of lung-shaped leaves joined at the stem, symbolizing breath",
  "self-care-checklist":
    "a small round bathtub with a lit candle beside it and a steaming teacup, cozy trio",
  "cleaning-checklist":
    "a slender broom crossed with a folded stack of linen and a small spray bottle",
  recipe:
    "a wooden spoon, a sprig of fresh herbs, and a small round bowl, arranged as a still life",
  notes:
    "a single feather quill resting on a folded blank parchment sheet — the parchment is completely blank",
  "workout-tracker":
    "a small kettlebell wrapped with a laurel sprig, symbolizing strength",
  medications:
    "a small amber pill vial next to a sprig of herbs, apothecary aesthetic",
  "medical-records":
    "a folded chart with a small emblem — a plus-cross sigil, no letters — resting on top",
  "yearly-focus":
    "an ornate blank round focus medallion with a single guiding star at the top and soft radiant rings — no letters, no cardinal marks, no symbols that look like writing",
  "brain-dump":
    "a soft cloud-shaped thought bubble tangled with delicate ribbons unspooling into a small folded paper — mind emptying onto the page, symbolic and airy",
  "fitness-tracker":
    "a small hand-weight resting beside a laurel sprig and a slender water flask, symbolic strength still-life",
  "adhd-toolkit":
    "a small sand-timer beside three tiny check-bullet dots and a coiled fidget spiral, symbolic focus toolkit",
  "budget-monthly":
    "three neatly stacked coin discs beside a small folded envelope with a wax seal, symbolic monthly budget still-life",
  "debt-tracker":
    "a descending chain of three linked coin discs with the lowest link opening — freedom from debt, symbolic emblem",
  "savings-goals":
    "a small round piggy-bank silhouette with a single golden coin arcing above it, symbolic saving emblem",
  "home-info":
    "a small pitched-roof house silhouette with a decorative key crossed in front, symbolic hearth emblem",
  "weekly-cleaning":
    "a small pail, a folded linen cloth, and a slender spray bottle arranged as a still-life trio, symbolic weekly reset",
  "meal-planning":
    "a small paper grocery sack with a sprig of leafy greens and a round apple resting beside it, symbolic still-life",
  "mood-journal":
    "a soft feminine profile silhouette with three tiny hearts drifting like breath — symbolic emblem of felt emotion",
  "therapy-session":
    "two small facing armchair silhouettes with a slender lamp between them, symbolic quiet conversation",
  "coping-toolkit":
    "a small anchor with three gentle concentric ripple rings radiating outward, symbolic grounding emblem",
};

export const PAGE_IDS = Object.keys(PAGE_SUBJECTS);

// -- Collection styles --------------------------------------------------------
// One entry per CoverCollection. The style paragraph is prepended to every
// prompt for covers in that collection.

export const COLLECTION_STYLE: Record<string, string> = {
  classic:
    "Patriotic still-life style — deep navy, cream, and rich red palette with soft gold highlights, painterly, elegant, refined vintage Americana feel. Red roses when florals appear.",
  "black-moon":
    "Celestial night palette — deep indigo with warm gold and ivory highlights, softly glowing full-moon backdrop with delicate starfield, painterly and reverent. Composition mirrors the Luminous Hummingbird/Celestial Wings icon set: single centered emblem with subtle wing/feather or moon-arc accent, gold-leaf detailing.",
  "celestial-birds-insects":
    "Ethereal celestial palette — indigo, dusk blue, warm gold, ivory — with soft starfield backdrop, refined watercolor + gold-leaf feel, feathered accents.",
  garden:
    "Botanical illustration style — soft blush, sage green, warm cream, with delicate ink linework and gentle watercolor washes, like a vintage flora plate. No dragonflies unless the cover explicitly features one.",
  sparrow:
    "Warm dusk palette — golden amber, twilight blue, ivory — small sparrow silhouettes perched on branches with soft moon and lantern glow, storybook illustration feel.",
  "celestial-florals":
    "Ivory and gold-leaf palette with silvery moonlight highlights, floral + celestial fusion, delicate and airy. No gemstones or crystal facets.",
  "sky-wings-arrows":
    "Sky-blue to sunset-gold gradient background with cloud wisps, feathered edges, arrow motifs, feels like an heirloom emblem.",
  scrapbook:
    "Vintage scrapbook aesthetic — cream paper, torn edges, subtle washi-tape accents, hand-drawn ink outlines with soft pastel fills.",
  affirmations:
    "Warm ivory paper background with hand-lettered ornamental flourishes (no readable text), muted rose + dusty gold accents, gentle and reverent.",
  faith:
    "Sacred and reverent — cream, gold-leaf, deep burgundy palette, subtle radiant halo behind the subject, chapel-window softness.",
  chronicles:
    "Old-world manuscript feel — parchment cream, sepia ink, faded gold accents, tarot-card composition, softly textured background.",
  "change-of-life":
    "Wellness journey palette — soft blush, sage, dusty rose, ivory — botanical + butterfly motifs woven in, dreamy and gentle, watercolor + gouache feel.",
  "pop-art":
    "Pop-art palette — bold cerulean, magenta, sun yellow, ivory — clean flat color, subtle halftone dots, playful and modern.",
  grit:
    "Grit-and-grace mono palette — warm charcoal, bone ivory, hints of ochre — cracked-plaster texture, brave and quiet.",
  feathers:
    "Cloud-soft sky background with a single hero object rendered as iridescent feather barbs, jewel-tone accents matching the specific cover.",
  dragons:
    "Cinematic heraldic dragon fantasy — moody sunset ember palette of burnt orange, deep gold, oxblood, obsidian black. Every subject is silhouetted or entwined with a stylized dragon form (scales, wings, curled tail, forged filigree) rendered with realistic scaled texture and dramatic rim-light against a sunset or ember sky. Serious, mature, painterly — NOT whimsical, NOT cute, NOT cartoon.",
  "gothic-sirens":
    "Gothic siren ink-on-parchment style — cream/ivory paper background lightly aged with soft sepia edges (matching the siren cover paper), the subject rendered in pure BLACK INK with fine engraved linework and stippling, occasional touches of muted teal or bone-white shell texture. Mournful, reverent, cathedral-quiet.",
};

export const DEFAULT_COLLECTION_STYLE =
  "Refined editorial illustration, soft warm palette, hand-crafted feel, gentle painted textures, museum-quality.";

// -- Per-cover overrides ------------------------------------------------------

export const COVER_STYLE_OVERRIDE: Record<string, string> = {
  "feather-emerald":
    "Cloud-soft sky background, single hero object rendered from iridescent EMERALD-GREEN feather barbs, luminous jewel-tone highlights.",
  "feather-phoenix":
    "Cloud-soft sky background, single hero object rendered from iridescent PHOENIX-ORANGE and crimson feather barbs, ember highlights.",
  "feather-sapphire":
    "Cloud-soft sky background, single hero object rendered from iridescent SAPPHIRE-BLUE feather barbs on a cool blue-cream sky, cool jewel highlights — every accent is BLUE, absolutely no orange or warm tones.",
  "feather-amethyst":
    "Cloud-soft sky background, single hero object rendered from iridescent AMETHYST-PURPLE feather barbs, soft violet glow.",
  "feather-crimson":
    "Cloud-soft sky background, single hero object rendered from iridescent DEEP-CRIMSON feather barbs, ruby highlights.",
  "feather-gold":
    "Warm ivory sky background, single hero object rendered from iridescent RICH YELLOW-GOLD feather barbs, sunlit gold highlights — every accent is GOLD/YELLOW, absolutely no orange, red, or ember tones.",
  "wellness-roots":
    "Wellness palette anchored in DEEP SAGE and warm terracotta, botanical roots and soft earth textures.",
  "wellness-river":
    "Wellness palette anchored in COOL RIVER BLUE and soft ivory, flowing water textures and river-stones.",
  "wellness-bloom":
    "Wellness palette anchored in BLUSH PINK and warm gold, blooming florals and butterfly wings.",
  "wellness-still-water":
    "Wellness palette anchored in MISTY LAVENDER and pale sage, mirror-still water textures and reflected light.",
  "patriotic-roses":
    "MATCH THE SAME AESTHETIC FOR EVERY ICON IN THIS PACK: soft cream parchment square, warm ivory vignette, airy watercolor-and-gouache planner icon, delicate blue-grey shadow bloom, centered subject wrapped with a thin flowing satin ribbon and paired with two or three velvety RED garden roses. Elegant keepsake stationery mood like a handmade heirloom planner sticker, not photography, not dark cinematic flatlay. Absolutely no American flags, no flag fabric, no stars, no navy background, no black background, no harsh contrast, no mixed rose colors. Roses are always RED.",
  "patriotic-blue-rose":
    "MATCH THE SAME AESTHETIC FOR EVERY ICON IN THIS PACK: soft cream parchment square, warm ivory vignette, airy watercolor-and-gouache planner icon, delicate blue-grey shadow bloom, centered subject wrapped with a thin flowing satin ribbon and paired with two or three velvety BLUE garden roses. Elegant keepsake stationery mood like a handmade heirloom planner sticker, not photography, not dark cinematic flatlay. Absolutely no American flags, no flag fabric, no stars, no navy background, no black background, no harsh contrast, no red roses, no mixed rose colors. Roses are always BLUE.",
  "red-rose-moonlight":
    "Moonlit deep-charcoal background with a luminous cream moon and RED rose accents, soft gold light, painterly and romantic. Roses are always RED.",
  "white-rose-moonlight":
    "Moonlit deep-charcoal background with a luminous cream moon and WHITE rose accents, soft silver-gold light, painterly and romantic. Roses are always WHITE — absolutely no red or pink roses.",
  "black-dahlia-moon":
    "Celestial night palette — deep indigo, warm gold, ivory highlights, luminous full-moon halo with delicate starfield and soft feathered wing accents, matches the Luminous Hummingbird Celestial Wings icon set.",
  "black-rose-moon":
    "Celestial night palette — deep indigo, warm gold, ivory highlights, luminous full-moon halo with delicate starfield and soft feathered wing accents, matches the Luminous Hummingbird Celestial Wings icon set.",
  "black-lily-moon":
    "Celestial night palette — deep indigo, warm gold, ivory highlights, luminous full-moon halo with delicate starfield and soft feathered wing accents, matches the Luminous Hummingbird Celestial Wings icon set.",
  "midnight-iris-moon":
    "Celestial night palette — deep indigo, warm gold, ivory highlights, luminous full-moon halo with delicate starfield and soft feathered wing accents, matches the Luminous Hummingbird Celestial Wings icon set.",
  "swallowtail-moon":
    "Celestial night palette — deep indigo, warm gold, ivory highlights, luminous full-moon halo with delicate starfield and a soft swallowtail-butterfly wing accent, matches the Luminous Hummingbird Celestial Wings icon set.",
  "sparrow-moon-lights":
    "Warm dusk palette — golden amber, twilight blue, ivory — every icon features a small dark sparrow silhouette perched on a slender branch beside a soft glowing moon and tiny paper lanterns, storybook illustration feel.",
  "english-rose-dew":
    "Soft cottage-garden palette — dusty pink, sage, cream — delicate PINK english roses with dew drops and gentle ink linework. Absolutely NO dragonflies, NO insects, NO butterflies.",
  "cream-ribbons":
    "Warm ivory background with flowing CREAM SATIN RIBBONS softly curling around the subject, delicate gold-thread accents, elegant and heirloom. Absolutely NO gemstones, NO crystal facets, NO jewelry.",
  "dove-raven-roses":
    "Cream paper background with rich red rose accents. Every icon features BOTH a small WHITE DOVE and a small BLACK RAVEN — both birds always visible together, painterly heirloom style. Not a single-bird composition.",
  "patriotic-white-rose":
    "MATCH THE SAME AESTHETIC FOR EVERY ICON IN THIS PACK: soft cream parchment square, warm ivory vignette, airy watercolor-and-gouache planner icon, delicate blue-grey shadow bloom, centered subject wrapped with a thin flowing satin ribbon and paired with two or three velvety WHITE garden roses. Elegant keepsake stationery mood like a handmade heirloom planner sticker, not photography, not dark cinematic flatlay. Absolutely no American flags, no flag fabric, no stars, no navy background, no black background, no harsh contrast, no red roses, no blue roses, no mixed rose colors. Roses are always WHITE.",
  // Legacy folder-name style references used by older generated assets only.
  // Do not use these as cross-cover manifest aliases.
  "black-moon-flora":
    "Celestial night palette — deep indigo, warm gold, ivory highlights, luminous full-moon halo with delicate starfield and soft feathered wing accents, matches the Luminous Hummingbird Celestial Wings icon set exactly.",
  "dove-ink":
    "Cream paper background with rich red rose accents. Every icon features BOTH a small WHITE DOVE and a small BLACK RAVEN — both birds always visible together, painterly heirloom style. Not a single-bird composition.",
};

// -- Sticker prompts ----------------------------------------------------------
// Each collection gets 4 sticker categories × 15 pieces.
// The category informs the visual role; the collection informs the theme.

export const STICKER_CATEGORY_PROMPT: Record<string, string> = {
  motifs:
    "single hero motif sticker — the most iconic decorative object of the theme, rendered as die-cut clip art, centered, generous white margin",
  banners:
    "single ribbon-banner or tag sticker — an ornamental banner or label shape decorated with the theme (blank surface, absolutely NO text inside), centered, die-cut",
  washi:
    "single repeating-pattern washi-tape sticker — a horizontal strip of theme-inspired pattern with slightly torn edges, centered on a plain background",
  icons:
    "single small utility icon sticker (like a leaf, star, heart, key, tea cup, candle) reimagined in the theme's palette and texture, die-cut, centered",
};

export function buildIconPrompt(coverId: string, collection: string, pageId: string): string {
  const subject = PAGE_SUBJECTS[pageId] ?? `a symbolic emblem for ${pageId}`;
  const style =
    COVER_STYLE_OVERRIDE[coverId] ?? COLLECTION_STYLE[collection] ?? DEFAULT_COLLECTION_STYLE;
  return [
    `Small square editorial ICON illustration: ${subject}.`,
    `Style: ${style}`,
    "Composition: single centered subject, generous negative space, soft vignette, painterly finish, feels hand-crafted by a master illustrator, museum-quality craftsmanship.",
    `Strictly: ${UNIVERSAL_NEGATIVE}.`,
  ].join(" ");
}

export function buildStickerPrompt(collection: string, category: string, variantIndex: number): string {
  const style = COLLECTION_STYLE[collection] ?? DEFAULT_COLLECTION_STYLE;
  const role = STICKER_CATEGORY_PROMPT[category] ?? "themed sticker";
  return [
    `Die-cut STICKER piece #${variantIndex + 1} for a planner sticker library.`,
    `Role: ${role}.`,
    `Theme: ${style}`,
    "Rendering: clean vector-illustration or gouache feel with a subtle die-cut white halo edge, centered on a plain solid off-white background, no drop shadow, no scene, just the sticker.",
    `Strictly: ${UNIVERSAL_NEGATIVE}.`,
  ].join(" ");
}
