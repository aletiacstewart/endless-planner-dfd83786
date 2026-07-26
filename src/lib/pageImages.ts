import { getCoverPageIcon } from "@/lib/coverIcons";

import myGoals from "@/assets/page-icons/patriotic-roses/my-goals.jpg";
import yearlyCalendar from "@/assets/page-icons/patriotic-roses/yearly-calendar.jpg";
import monthlyCalendar from "@/assets/page-icons/patriotic-roses/monthly-calendar.jpg";
import weeklyCalendar from "@/assets/page-icons/patriotic-roses/weekly-calendar.jpg";
import dailyTracker from "@/assets/page-icons/patriotic-roses/daily-tracker.jpg";
import completeTracker from "@/assets/page-icons/patriotic-roses/complete-tracker.jpg";
import yearlyHabitTracker from "@/assets/page-icons/patriotic-roses/yearly-habit-tracker.jpg";
import weightTracker from "@/assets/page-icons/patriotic-roses/weight-tracker.jpg";
import measurementTracker from "@/assets/page-icons/patriotic-roses/measurement-tracker.jpg";
import bloodSugarTracker from "@/assets/page-icons/patriotic-roses/blood-sugar-tracker.jpg";
import bloodPressureTracker from "@/assets/page-icons/patriotic-roses/blood-pressure-tracker.jpg";
import oxygenTracker from "@/assets/page-icons/patriotic-roses/oxygen-tracker.jpg";
import selfCareChecklist from "@/assets/page-icons/patriotic-roses/self-care-checklist.jpg";
import cleaningChecklist from "@/assets/page-icons/patriotic-roses/cleaning-checklist.jpg";
import recipe from "@/assets/page-icons/patriotic-roses/recipe.jpg";
import notes from "@/assets/page-icons/patriotic-roses/notes.jpg";
import workoutTracker from "@/assets/page-icons/patriotic-roses/workout-tracker.jpg";
import medications from "@/assets/page-icons/patriotic-roses/medications.jpg";
import medicalRecords from "@/assets/page-icons/patriotic-roses/medical-records.jpg";
import yearlyFocus from "@/assets/page-icons/patriotic-roses/yearly-focus.jpg";
import brainDump from "@/assets/page-icons/patriotic-roses/brain-dump.jpg";
import fitnessTracker from "@/assets/page-icons/patriotic-roses/fitness-tracker.jpg";
import adhdToolkit from "@/assets/page-icons/patriotic-roses/adhd-toolkit.jpg";
import budgetMonthly from "@/assets/page-icons/patriotic-roses/budget-monthly.jpg";
import debtTracker from "@/assets/page-icons/patriotic-roses/debt-tracker.jpg";
import savingsGoals from "@/assets/page-icons/patriotic-roses/savings-goals.jpg";
import homeInfo from "@/assets/page-icons/patriotic-roses/home-info.jpg";
import weeklyCleaning from "@/assets/page-icons/patriotic-roses/weekly-cleaning.jpg";
import mealPlanning from "@/assets/page-icons/patriotic-roses/meal-planning.jpg";
import moodJournal from "@/assets/page-icons/patriotic-roses/mood-journal.jpg";
import therapySession from "@/assets/page-icons/patriotic-roses/therapy-session.jpg";
import copingToolkit from "@/assets/page-icons/patriotic-roses/coping-toolkit.jpg";

export const PAGE_IMAGES: Record<string, string> = {
  "my-goals": myGoals,
  "yearly-calendar": yearlyCalendar,
  "monthly-calendar": monthlyCalendar,
  "weekly-calendar": weeklyCalendar,
  "daily-tracker": dailyTracker,
  "complete-tracker": completeTracker,
  "yearly-habit-tracker": yearlyHabitTracker,
  "weight-tracker": weightTracker,
  "measurement-tracker": measurementTracker,
  "blood-sugar-tracker": bloodSugarTracker,
  "blood-pressure-tracker": bloodPressureTracker,
  "oxygen-tracker": oxygenTracker,
  "self-care-checklist": selfCareChecklist,
  "cleaning-checklist": cleaningChecklist,
  recipe,
  notes,
  "workout-tracker": workoutTracker,
  medications,
  "medical-records": medicalRecords,
  "yearly-focus": yearlyFocus,
  "brain-dump": brainDump,
  "fitness-tracker": fitnessTracker,
  "adhd-toolkit": adhdToolkit,
  "budget-monthly": budgetMonthly,
  "debt-tracker": debtTracker,
  "savings-goals": savingsGoals,
  "home-info": homeInfo,
  "weekly-cleaning": weeklyCleaning,
  "meal-planning": mealPlanning,
  "mood-journal": moodJournal,
  "therapy-session": therapySession,
  "coping-toolkit": copingToolkit,
};

export function getPageImage(id: string, coverId?: string | null): string | undefined {
  return getCoverPageIcon(coverId, id) ?? PAGE_IMAGES[id];
}
