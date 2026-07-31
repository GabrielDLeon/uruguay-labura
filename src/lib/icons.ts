import bookOpenOutline from "@iconify-icons/mdi/book-open-outline.js";
import bookmarkOutline from "@iconify-icons/mdi/bookmark-outline.js";
import briefcaseOutline from "@iconify-icons/mdi/briefcase-outline.js";
import calendarEnd from "@iconify-icons/mdi/calendar-end.js";
import calendarStart from "@iconify-icons/mdi/calendar-start.js";
import check from "@iconify-icons/mdi/check.js";
import clockOutline from "@iconify-icons/mdi/clock-outline.js";
import creditCardOutline from "@iconify-icons/mdi/credit-card-outline.js";
import domain from "@iconify-icons/mdi/domain.js";
import emailOutline from "@iconify-icons/mdi/email-outline.js";
import formatListBulleted from "@iconify-icons/mdi/format-list-bulleted.js";
import heart from "@iconify-icons/mdi/heart.js";
import heartOutline from "@iconify-icons/mdi/heart-outline.js";
import informationOutline from "@iconify-icons/mdi/information-outline.js";
import magnify from "@iconify-icons/mdi/magnify.js";
import mapMarkerOutline from "@iconify-icons/mdi/map-marker-outline.js";
import numeric from "@iconify-icons/mdi/numeric.js";
import openInNew from "@iconify-icons/mdi/open-in-new.js";
import schoolOutline from "@iconify-icons/mdi/school-outline.js";
import shareVariant from "@iconify-icons/mdi/share-variant.js";
import tagOutline from "@iconify-icons/mdi/tag-outline.js";

export const appIcons = {
  book: bookOpenOutline,
  bookmark: bookmarkOutline,
  callNumber: numeric,
  check,
  closingDate: calendarEnd,
  cost: creditCardOutline,
  department: mapMarkerOutline,
  email: emailOutline,
  externalLink: openInNew,
  heart,
  heartOutline,
  institution: domain,
  jobsCount: formatListBulleted,
  openingDate: calendarStart,
  school: schoolOutline,
  search: magnify,
  share: shareVariant,
  status: informationOutline,
  tag: tagOutline,
  taskType: briefcaseOutline,
  updatedAt: clockOutline,
} as const;

export type AppIconName = keyof typeof appIcons;

export function iconToSvg(
  icon: { body: string; width?: number; height?: number },
  className = "size-5",
): string {
  const width = icon.width ?? 24;
  const height = icon.height ?? 24;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="${className}" aria-hidden="true">${icon.body}</svg>`;
}
