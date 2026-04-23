import briefcaseOutline from "@iconify-icons/mdi/briefcase-outline.js";
import calendarEnd from "@iconify-icons/mdi/calendar-end.js";
import calendarStart from "@iconify-icons/mdi/calendar-start.js";
import clockOutline from "@iconify-icons/mdi/clock-outline.js";
import formatListBulleted from "@iconify-icons/mdi/format-list-bulleted.js";
import informationOutline from "@iconify-icons/mdi/information-outline.js";
import mapMarkerOutline from "@iconify-icons/mdi/map-marker-outline.js";
import magnify from "@iconify-icons/mdi/magnify.js";
import numeric from "@iconify-icons/mdi/numeric.js";
import openInNew from "@iconify-icons/mdi/open-in-new.js";
import schoolOutline from "@iconify-icons/mdi/school-outline.js";
import bookOpenOutline from "@iconify-icons/mdi/book-open-outline.js";
import domain from "@iconify-icons/mdi/domain.js";
import creditCardOutline from "@iconify-icons/mdi/credit-card-outline.js";
import tagOutline from "@iconify-icons/mdi/tag-outline.js";
import emailOutline from "@iconify-icons/mdi/email-outline.js";

export const appIcons = {
  search: magnify,
  callNumber: numeric,
  department: mapMarkerOutline,
  status: informationOutline,
  taskType: briefcaseOutline,
  jobsCount: formatListBulleted,
  updatedAt: clockOutline,
  openingDate: calendarStart,
  closingDate: calendarEnd,
  externalLink: openInNew,
  school: schoolOutline,
  book: bookOpenOutline,
  institution: domain,
  cost: creditCardOutline,
  tag: tagOutline,
  email: emailOutline,
} as const;

export type AppIconName = keyof typeof appIcons;
