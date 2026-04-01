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
} as const;

export type AppIconName = keyof typeof appIcons;
