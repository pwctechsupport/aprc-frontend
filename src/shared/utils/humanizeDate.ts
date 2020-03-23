import { date as formatDate } from "../formatter";

export default function humanizeDate(
  date: Date | string | undefined | null
): string {
  if (!date) {
    return "";
  }
  date = new Date(date);
  const delta = Math.round((+new Date() - +date) / 1000);

  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;

  let fuzzy: string;

  if (delta < 30) {
    fuzzy = "just now";
  } else if (delta < minute) {
    fuzzy = delta + " seconds ago";
  } else if (delta < 2 * minute) {
    fuzzy = "a minute ago";
  } else if (delta < hour) {
    fuzzy = Math.floor(delta / minute) + " minutes ago";
  } else if (Math.floor(delta / hour) === 1) {
    fuzzy = "1 hour ago";
  } else if (delta < day) {
    fuzzy = Math.floor(delta / hour) + " hours ago";
  } else if (delta < day * 2) {
    fuzzy = "yesterday";
  } else if (delta < week * 2) {
    fuzzy = "last week";
  } else if (delta < month) {
    fuzzy = "last month";
  } else {
    fuzzy = formatDate(new Date(date), {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  return fuzzy;
}
