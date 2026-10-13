import bookOpen from "@iconify-icons/keyline-icons/book-open-fill";
import bookmark from "@iconify-icons/keyline-icons/bookmark-fill";
import bookmarkOutline from "@iconify-icons/keyline-icons/bookmark";
import briefcase from "@iconify-icons/keyline-icons/briefcase-fill";
import calendarEnd from "@iconify-icons/keyline-icons/calendar-arrow-right-fill";
import calendarStart from "@iconify-icons/keyline-icons/calendar-arrow-left-fill";
import check from "@iconify-icons/keyline-icons/check-fill";
import chevronDown from "@iconify-icons/keyline-icons/chevron-down-fill";
import clock from "@iconify-icons/keyline-icons/clock-fill";
import close from "@iconify-icons/keyline-icons/x-fill";
import users from "@iconify-icons/keyline-icons/users-fill";
import compass from "@iconify-icons/keyline-icons/compass-fill";
import creditCard from "@iconify-icons/keyline-icons/credit-card-fill";
import building from "@iconify-icons/keyline-icons/building-fill";
import mail from "@iconify-icons/keyline-icons/mail-fill";
import list from "@iconify-icons/keyline-icons/list-fill";
import handCoins from "@iconify-icons/keyline-icons/hand-coins-fill";
import info from "@iconify-icons/keyline-icons/info-fill";
import search from "@iconify-icons/keyline-icons/search";
import mapPin from "@iconify-icons/keyline-icons/map-pin-fill";
import externalLink from "@iconify-icons/keyline-icons/square-arrow-out-up-right-fill";
import pen from "@iconify-icons/keyline-icons/pen-fill";
import graduationCap from "@iconify-icons/keyline-icons/graduation-cap-fill";
import star from "@iconify-icons/keyline-icons/star-fill";
import starOutline from "@iconify-icons/keyline-icons/star";
import tag from "@iconify-icons/keyline-icons/tag-fill";
import bin from "@iconify-icons/keyline-icons/bin-fill";

export const appIcons = {
  book: bookOpen,
  bookmark,
  bookmarkOutline,
  check,
  chevronDown,
  close,
  closingDate: calendarEnd,
  cost: creditCard,
  department: mapPin,
  email: mail,
  quota: users,
  externalLink,
  institution: building,
  jobsCount: list,
  openingDate: calendarStart,
  page: compass,
  pencil: pen,
  school: graduationCap,
  scholarship: handCoins,
  search,
  star,
  starOutline,
  status: info,
  tag,
  taskType: briefcase,
  trash: bin,
  updatedAt: clock,
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
