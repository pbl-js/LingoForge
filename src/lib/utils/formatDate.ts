/**
 * Formats a date into a localized string
 * @param date - The date to format
 * @param locale - The locale to use for formatting, defaults to 'en-US'
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string | number, locale: string = "en-US"): string => {
  const dateObj = date instanceof Date ? date : new Date(date);

  return dateObj.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Returns a relative time string (e.g., "2 days ago", "in 3 hours")
 * @param date - The date to format
 * @param locale - The locale to use for formatting, defaults to 'en-US'
 * @returns Relative time string
 */
export const getRelativeTimeString = (
  date: Date | string | number,
  locale: string = "en-US"
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffInMs = dateObj.getTime() - now.getTime();
  const diffInSecs = Math.round(diffInMs / 1000);
  const diffInMins = Math.round(diffInSecs / 60);
  const diffInHours = Math.round(diffInMins / 60);
  const diffInDays = Math.round(diffInHours / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (Math.abs(diffInDays) >= 1) {
    return rtf.format(diffInDays, "day");
  } else if (Math.abs(diffInHours) >= 1) {
    return rtf.format(diffInHours, "hour");
  } else if (Math.abs(diffInMins) >= 1) {
    return rtf.format(diffInMins, "minute");
  } else {
    return rtf.format(diffInSecs, "second");
  }
};
