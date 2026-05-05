// Per-cover page icon overrides.
// When a cover defines an icon for a page id, it replaces the default in pageImages.ts.
// Add new covers by creating src/assets/cover-icons/<cover-id>/<page-id>.png and importing below.

import fmnlMeasurement from "@/assets/cover-icons/forget-me-nots-ladybugs/measurement-tracker.png";
import fmnlWeight from "@/assets/cover-icons/forget-me-nots-ladybugs/weight-tracker.png";
import fmnlCleaning from "@/assets/cover-icons/forget-me-nots-ladybugs/cleaning-checklist.png";
import fmnlComplete from "@/assets/cover-icons/forget-me-nots-ladybugs/complete-tracker.png";
import fmnlFun from "@/assets/cover-icons/forget-me-nots-ladybugs/fun-tracker.png";
import fmnlHabit from "@/assets/cover-icons/forget-me-nots-ladybugs/habit-tracker.png";
import fmnlMedical from "@/assets/cover-icons/forget-me-nots-ladybugs/medical-records.png";
import fmnlMedications from "@/assets/cover-icons/forget-me-nots-ladybugs/medications.png";
import fmnlRecipe from "@/assets/cover-icons/forget-me-nots-ladybugs/recipe.png";
import fmnlSelfCare from "@/assets/cover-icons/forget-me-nots-ladybugs/self-care-checklist.png";

export const COVER_ICONS: Record<string, Record<string, string>> = {
  "forget-me-nots-ladybugs": {
    "measurement-tracker": fmnlMeasurement,
    "weight-tracker": fmnlWeight,
    "cleaning-checklist": fmnlCleaning,
    "complete-tracker": fmnlComplete,
    "fun-tracker": fmnlFun,
    "habit-tracker": fmnlHabit,
    "medical-records": fmnlMedical,
    "medications": fmnlMedications,
    "recipe": fmnlRecipe,
    "self-care-checklist": fmnlSelfCare,
  },
};

export function getCoverPageIcon(coverId: string | null | undefined, pageId: string): string | undefined {
  if (!coverId) return undefined;
  return COVER_ICONS[coverId]?.[pageId];
}
