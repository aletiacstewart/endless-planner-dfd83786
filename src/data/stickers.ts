// Shared sticker library — ONE topic-based set used by every cover.
//
// Stickers are grouped by planner topic (birthdays, meals, health, chores, …)
// so every page in the planner has relevant pieces. The same set is shown no
// matter which cover is active — only page icons follow the cover art.
//
// Each slot renders a themed PNG when the art exists in
// `public/stickers/shared/<category>/<n>.png` (registered in the generated
// `stickerPacks.ts` manifest), otherwise a high-quality emoji fallback so the
// library is never empty while art is being produced.

import { SHARED_STICKER_MANIFEST, SHARED_STICKER_PER_CATEGORY } from "@/data/stickerPacks";

export type StickerCategory =
  | "celebrations"
  | "school-work"
  | "meals"
  | "fitness"
  | "health"
  | "selfcare"
  | "chores"
  | "money"
  | "travel"
  | "utility";

export type StickerAsset =
  | { kind: "emoji"; src: string; label?: string }
  | { kind: "img"; src: string; label?: string };

export type StickerSet = Record<StickerCategory, StickerAsset[]>;

export const STICKER_CATEGORIES: StickerCategory[] = [
  "celebrations",
  "school-work",
  "meals",
  "fitness",
  "health",
  "selfcare",
  "chores",
  "money",
  "travel",
  "utility",
];

export const STICKER_CATEGORY_LABEL: Record<StickerCategory, string> = {
  celebrations: "Celebrations",
  "school-work": "School & Work",
  meals: "Meals",
  fitness: "Exercise",
  health: "Health & Medical",
  selfcare: "Self-Care",
  chores: "Chores & Home",
  money: "Money",
  travel: "Travel & Events",
  utility: "Labels & Washi",
};

/** Emoji fallback + generation subject for each slot, per category. */
const SLOTS: Record<StickerCategory, Array<[string, string]>> = {
  celebrations: [
    ["🎂", "birthday cake"], ["🎈", "balloon cluster"], ["🎁", "wrapped gift"],
    ["🎉", "party popper"], ["🎊", "confetti burst"], ["💍", "anniversary rings"],
    ["💐", "anniversary bouquet"], ["🥂", "toasting glasses"], ["🎄", "holiday tree"],
    ["🎃", "autumn pumpkin"], ["🦃", "thanksgiving harvest"], ["❤️", "valentine heart"],
    ["🐣", "spring chick and egg"], ["🎆", "fireworks"], ["🧁", "cupcake"],
    ["🕯️", "birthday candle"], ["🃏", "greeting card"], ["👑", "celebration crown"],
  ],
  "school-work": [
    ["📚", "stack of books"], ["🎒", "backpack"], ["✏️", "pencil"],
    ["📝", "exam paper"], ["📐", "ruler and compass"], ["🖍️", "crayons"],
    ["💻", "laptop"], ["🗂️", "file folders"], ["📅", "deadline calendar"],
    ["📎", "paper clip"], ["🖊️", "fountain pen"], ["📊", "chart"],
    ["🎓", "graduation cap"], ["🔬", "microscope"], ["🧮", "abacus"],
    ["☕", "desk coffee mug"], ["📌", "push pin"], ["🗒️", "notepad"],
  ],
  meals: [
    ["🍳", "breakfast eggs"], ["🥞", "pancakes"], ["🥗", "salad bowl"],
    ["🍲", "dinner stew pot"], ["🛒", "grocery cart"], ["🥑", "avocado"],
    ["🍓", "strawberries"], ["🥕", "carrot"], ["🍞", "bread loaf"],
    ["🧀", "cheese wedge"], ["🥤", "water glass"], ["☕", "coffee cup"],
    ["🍵", "tea cup"], ["🍕", "pizza slice"], ["🍝", "pasta bowl"],
    ["🥡", "takeout box"], ["🍎", "apple"], ["🧊", "meal prep containers"],
  ],
  fitness: [
    ["🧘", "yoga pose"], ["🏋️", "dumbbell"], ["🏃", "running shoe"],
    ["🚶", "walking steps"], ["🤸", "stretching figure"], ["🚴", "bicycle"],
    ["🏊", "swimming"], ["⚽", "sports ball"], ["🥊", "boxing glove"],
    ["🧎", "pilates mat"], ["⌚", "fitness watch"], ["💧", "hydration bottle"],
    ["🔥", "streak flame"], ["🏅", "achievement medal"], ["📈", "progress chart"],
    ["🦵", "leg day icon"], ["💪", "flexed arm"], ["🪢", "jump rope"],
  ],
  health: [
    ["🩺", "stethoscope"], ["💊", "pill capsule"], ["💉", "syringe"],
    ["🏥", "clinic building"], ["🦷", "tooth"], ["🩹", "bandage"],
    ["🌡️", "thermometer"], ["🧪", "lab test tube"], ["🫀", "heart rate"],
    ["🩸", "blood drop"], ["😴", "sleep moon"], ["🙂", "mood face"],
    ["👓", "eye exam glasses"], ["🗓️", "appointment calendar"], ["📋", "medical chart"],
    ["🧴", "prescription bottle"], ["⚖️", "weight scale"], ["🫁", "breathing lungs"],
  ],
  selfcare: [
    ["🛁", "bathtub"], ["🕯️", "candle"], ["🧖", "spa face"],
    ["🧴", "skincare bottle"], ["📖", "reading book"], ["🎧", "headphones"],
    ["🪞", "mirror"], ["🌿", "sprig of greenery"], ["🛌", "rest bed"],
    ["☁️", "calm cloud"], ["🧘", "meditation"], ["✍️", "journaling hand"],
    ["🍵", "herbal tea"], ["💅", "nail care"], ["🌸", "single bloom"],
    ["🫖", "teapot"], ["💤", "sleep zzz"], ["🧦", "cozy socks"],
  ],
  chores: [
    ["🧹", "broom"], ["🧺", "laundry basket"], ["🧼", "soap bar"],
    ["🧽", "sponge"], ["🚿", "shower head"], ["🍽️", "dishes"],
    ["🗑️", "trash bin"], ["🪣", "bucket and mop"], ["🧴", "spray bottle"],
    ["🪟", "window"], ["🛏️", "made bed"], ["🌱", "house plant"],
    ["🐾", "pet paw"], ["🐕", "dog bowl"], ["🚗", "car wash"],
    ["🔧", "wrench repair"], ["🔨", "hammer"], ["🧷", "mending pin"],
  ],
  money: [
    ["💵", "cash bills"], ["🪙", "coins"], ["🏦", "bank building"],
    ["💳", "credit card"], ["🧾", "receipt"], ["📈", "growth chart"],
    ["📉", "debt payoff chart"], ["🐖", "piggy bank"], ["🎯", "savings goal target"],
    ["🔒", "locked safe"], ["🛍️", "shopping bag"], ["📬", "bill envelope"],
    ["💡", "utility bill bulb"], ["🏠", "mortgage house"], ["⛽", "fuel pump"],
    ["📆", "payday calendar"], ["✂️", "coupon"], ["💰", "money bag"],
  ],
  travel: [
    ["✈️", "airplane"], ["🧳", "suitcase"], ["🗺️", "map"],
    ["🚗", "road trip car"], ["🏨", "hotel"], ["🎟️", "event ticket"],
    ["📷", "camera"], ["🏖️", "beach umbrella"], ["⛰️", "mountain"],
    ["🏕️", "camping tent"], ["🚂", "train"], ["⛵", "sailboat"],
    ["🧭", "compass"], ["🌅", "sunrise view"], ["🎡", "fair wheel"],
    ["🎤", "concert mic"], ["🍹", "vacation drink"], ["📍", "location pin"],
  ],
  utility: [
    ["🏷️", "blank ribbon banner"], ["🎀", "bow label"], ["📛", "blank name plate"],
    ["🪧", "blank sign board"], ["〰️", "washi tape strip, floral pattern"],
    ["➰", "washi tape strip, striped"], ["▪️", "washi tape strip, dotted"],
    ["◆", "washi tape strip, gingham"], ["✅", "checkmark seal"],
    ["⭐", "star accent"], ["❗", "priority flag"], ["➡️", "arrow accent"],
    ["🔖", "bookmark tag"], ["⭕", "date circle outline"], ["🗨️", "blank speech bubble"],
    ["💭", "blank thought bubble"], ["📌", "blank pinned tag"], ["✳️", "small divider flourish"],
  ],
};

/** Generation subjects, exported for the sticker art script. */
export const STICKER_SLOT_SUBJECTS: Record<StickerCategory, string[]> = Object.fromEntries(
  STICKER_CATEGORIES.map((c) => [c, SLOTS[c].map(([, subject]) => subject)])
) as Record<StickerCategory, string[]>;

export const STICKER_PER_CATEGORY = SHARED_STICKER_PER_CATEGORY;

const buildCategory = (cat: StickerCategory): StickerAsset[] => {
  const available = new Set(SHARED_STICKER_MANIFEST[cat] ?? []);
  return SLOTS[cat].map(([emoji, label], i) =>
    available.has(i)
      ? { kind: "img", src: `/stickers/shared/${cat}/${i}.png`, label }
      : { kind: "emoji", src: emoji, label }
  );
};

export const SHARED_STICKER_SET: StickerSet = Object.fromEntries(
  STICKER_CATEGORIES.map((c) => [c, buildCategory(c)])
) as StickerSet;

/** The library is cover-independent — the same shared set for every cover. */
export function getStickerSet(): StickerSet {
  return SHARED_STICKER_SET;
}

export const STICKER_TOTAL = STICKER_CATEGORIES.reduce(
  (n, c) => n + SHARED_STICKER_SET[c].length,
  0
);
