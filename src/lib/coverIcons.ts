// Per-cover page icon overrides.
// When a cover defines an icon for a page id, it replaces the default in pageImages.ts.
// Add new covers by creating src/assets/cover-icons/<cover-id>/<page-id>.png and importing below.

import fmnlMeasurement from "@/assets/cover-icons/forget-me-nots-ladybugs/measurement-tracker.png";
import fmnlWeight from "@/assets/cover-icons/forget-me-nots-ladybugs/weight-tracker.png";
import fmnlCleaning from "@/assets/cover-icons/forget-me-nots-ladybugs/cleaning-checklist.png";
import fmnlComplete from "@/assets/cover-icons/forget-me-nots-ladybugs/complete-tracker.png";
import fmnlMedical from "@/assets/cover-icons/forget-me-nots-ladybugs/medical-records.png";
import fmnlMedications from "@/assets/cover-icons/forget-me-nots-ladybugs/medications.png";
import fmnlRecipe from "@/assets/cover-icons/forget-me-nots-ladybugs/recipe.png";
import fmnlSelfCare from "@/assets/cover-icons/forget-me-nots-ladybugs/self-care-checklist.png";
import fmnlBloodPressure from "@/assets/cover-icons/forget-me-nots-ladybugs/blood-pressure-tracker.png";
import fmnlBloodSugar from "@/assets/cover-icons/forget-me-nots-ladybugs/blood-sugar-tracker.png";

import fmnlYearlyHabit from "@/assets/cover-icons/forget-me-nots-ladybugs/yearly-habit-tracker.png";
import fmnlOxygen from "@/assets/cover-icons/forget-me-nots-ladybugs/oxygen-tracker.png";

import fmnlWorkout from "@/assets/cover-icons/forget-me-nots-ladybugs/workout-tracker.png";
import fmnlDaily from "@/assets/cover-icons/forget-me-nots-ladybugs/daily-tracker.png";

import fmnlMonthly from "@/assets/cover-icons/forget-me-nots-ladybugs/monthly-calendar.png";
import fmnlNotes from "@/assets/cover-icons/forget-me-nots-ladybugs/notes.png";
import fmnlWeekly from "@/assets/cover-icons/forget-me-nots-ladybugs/weekly-calendar.png";
import fmnlYearlyCal from "@/assets/cover-icons/forget-me-nots-ladybugs/yearly-calendar.png";
import fmnlYearlyFocus from "@/assets/cover-icons/forget-me-nots-ladybugs/yearly-focus.png";

export const COVER_ICONS: Record<string, Record<string, string>> = {
  "forget-me-nots-ladybugs": {
    "measurement-tracker": fmnlMeasurement,
    "weight-tracker": fmnlWeight,
    "cleaning-checklist": fmnlCleaning,
    "complete-tracker": fmnlComplete,
    "medical-records": fmnlMedical,
    "medications": fmnlMedications,
    "recipe": fmnlRecipe,
    "self-care-checklist": fmnlSelfCare,
    "blood-pressure-tracker": fmnlBloodPressure,
    "blood-sugar-tracker": fmnlBloodSugar,
    
    "yearly-habit-tracker": fmnlYearlyHabit,
    "oxygen-tracker": fmnlOxygen,
    
    "workout-tracker": fmnlWorkout,
    "daily-tracker": fmnlDaily,
    
    "monthly-calendar": fmnlMonthly,
    "notes": fmnlNotes,
    "weekly-calendar": fmnlWeekly,
    "yearly-calendar": fmnlYearlyCal,
    "yearly-focus": fmnlYearlyFocus,
  },
};

export function getCoverPageIcon(coverId: string | null | undefined, pageId: string): string | undefined {
  if (!coverId) return undefined;
  return COVER_ICONS[coverId]?.[pageId];
}
