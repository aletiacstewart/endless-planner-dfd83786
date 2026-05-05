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
import fmnlBloodPressure from "@/assets/cover-icons/forget-me-nots-ladybugs/blood-pressure-tracker.png";
import fmnlBloodSugar from "@/assets/cover-icons/forget-me-nots-ladybugs/blood-sugar-tracker.png";
import fmnlDailyGoal from "@/assets/cover-icons/forget-me-nots-ladybugs/daily-goal-tracker.png";
import fmnlYearlyHabit from "@/assets/cover-icons/forget-me-nots-ladybugs/yearly-habit-tracker.png";
import fmnlOxygen from "@/assets/cover-icons/forget-me-nots-ladybugs/oxygen-tracker.png";
import fmnlWellness from "@/assets/cover-icons/forget-me-nots-ladybugs/wellness-tracker.png";
import fmnlWorkout from "@/assets/cover-icons/forget-me-nots-ladybugs/workout-tracker.png";
import fmnlDaily from "@/assets/cover-icons/forget-me-nots-ladybugs/daily-tracker.png";
import fmnlGoalsReflection from "@/assets/cover-icons/forget-me-nots-ladybugs/goals-reflection.png";
import fmnlMonthly from "@/assets/cover-icons/forget-me-nots-ladybugs/monthly-calendar.png";

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
    "blood-pressure-tracker": fmnlBloodPressure,
    "blood-sugar-tracker": fmnlBloodSugar,
    "daily-goal-tracker": fmnlDailyGoal,
    "yearly-habit-tracker": fmnlYearlyHabit,
    "oxygen-tracker": fmnlOxygen,
    "wellness-tracker": fmnlWellness,
    "workout-tracker": fmnlWorkout,
    "daily-tracker": fmnlDaily,
    "goals-reflection": fmnlGoalsReflection,
    "monthly-calendar": fmnlMonthly,
  },
};

export function getCoverPageIcon(coverId: string | null | undefined, pageId: string): string | undefined {
  if (!coverId) return undefined;
  return COVER_ICONS[coverId]?.[pageId];
}
