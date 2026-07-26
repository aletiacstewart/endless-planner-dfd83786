// JS mirror of prompts.ts for the Node generation runner.
// Keep the two files in sync — the TS version is the source of truth used by
// any app-side tooling; this one is what scripts/generate-cover-icons.mjs
// imports at runtime.

export const UNIVERSAL_NEGATIVE = [
  "no text", "no letters", "no words", "no typography", "no numbers", "no digits",
  "no calendar grid", "no date labels", "no month names", "no day names",
  "no watermark", "no logo", "no signature", "no captions", "no writing of any kind",
].join(", ");

export const PAGE_SUBJECTS = {
  "my-goals": "a single glowing shooting star arcing over a small compass rose, symbolizing personal goals",
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
  "yearly-focus": "an ornate compass rose emblem with a single guiding star at true north — no letters or cardinal marks",
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
  classic: "Patriotic still-life style — deep navy, cream, and rich red palette with soft gold highlights, painterly, elegant, refined vintage Americana feel.",
  "black-moon": "Moonlit black background with luminous gold and cream detailing, celestial and reverent, painted like a night-sky illustration with soft glow around the subject.",
  "celestial-birds-insects": "Ethereal celestial palette — indigo, dusk blue, warm gold, ivory — with soft starfield backdrop, refined watercolor + gold-leaf feel.",
  garden: "Botanical illustration style — soft blush, sage green, warm cream, with delicate ink linework and gentle watercolor washes, like a vintage flora plate.",
  sparrow: "Warm dusk palette — golden amber, twilight blue, ivory — sparrow silhouettes and soft feather textures, storybook illustration feel.",
  "celestial-florals": "Ivory and gold-leaf palette with silvery moonlight highlights, floral + celestial fusion, delicate and airy.",
  "sky-wings-arrows": "Sky-blue to sunset-gold gradient background with cloud wisps, feathered edges, arrow motifs, feels like an heirloom emblem.",
  scrapbook: "Vintage scrapbook aesthetic — cream paper, torn edges, subtle washi-tape accents, hand-drawn ink outlines with soft pastel fills.",
  affirmations: "Warm ivory paper background with hand-lettered ornamental flourishes (no readable text), muted rose + dusty gold accents, gentle and reverent.",
  faith: "Sacred and reverent — cream, gold-leaf, deep burgundy palette, subtle radiant halo behind the subject, chapel-window softness.",
  chronicles: "Old-world manuscript feel — parchment cream, sepia ink, faded gold accents, tarot-card composition, softly textured background.",
  "change-of-life": "Wellness journey palette — soft blush, sage, dusty rose, ivory — botanical + butterfly motifs woven in, dreamy and gentle, watercolor + gouache feel.",
  "pop-art": "Pop-art palette — bold cerulean, magenta, sun yellow, ivory — clean flat color, subtle halftone dots, playful and modern.",
  grit: "Grit-and-grace mono palette — warm charcoal, bone ivory, hints of ochre — cracked-plaster texture, brave and quiet.",
  feathers: "Cloud-soft sky background with a single hero object rendered as iridescent feather barbs, jewel-tone accents matching the specific cover.",
  dragons: "Sunset ember palette — burnt orange, deep gold, oxblood, obsidian — subject rendered with scaled or forged texture, heraldic and cinematic.",
  "gothic-sirens": "Deep-sea gothic palette — abyss black, pearl ivory, muted teal, bone white — cathedral-shell textures, mournful and reverent.",
};

export const DEFAULT_COLLECTION_STYLE = "Refined editorial illustration, soft warm palette, hand-crafted feel, gentle painted textures, museum-quality.";

export const COVER_STYLE_OVERRIDE = {
  "feather-emerald": "Cloud-soft sky background with a hero object rendered from iridescent EMERALD-GREEN feather barbs, luminous jewel highlights.",
  "feather-phoenix": "Cloud-soft sky background with a hero object rendered from iridescent PHOENIX-ORANGE and crimson feather barbs.",
  "feather-sapphire": "Cloud-soft sky background with a hero object rendered from iridescent SAPPHIRE-BLUE feather barbs.",
  "feather-amethyst": "Cloud-soft sky background with a hero object rendered from iridescent AMETHYST-PURPLE feather barbs.",
  "feather-crimson": "Cloud-soft sky background with a hero object rendered from iridescent DEEP-CRIMSON feather barbs.",
  "feather-gold": "Cloud-soft sky background with a hero object rendered from iridescent WARM-GOLD feather barbs.",
  "wellness-roots": "Wellness palette anchored in DEEP SAGE and warm terracotta.",
  "wellness-river": "Wellness palette anchored in COOL RIVER BLUE and soft ivory.",
  "wellness-bloom": "Wellness palette anchored in BLUSH PINK and warm gold with blooming florals and butterflies.",
  "wellness-still-water": "Wellness palette anchored in MISTY LAVENDER and pale sage.",
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
