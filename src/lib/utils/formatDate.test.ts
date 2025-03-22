import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { formatDate, getRelativeTimeString } from "./formatDate";

describe("formatDate", () => {
  it("formats date objects correctly", () => {
    const date = new Date("2023-05-15");
    expect(formatDate(date)).toMatch(/May 15, 2023/);
  });

  it("formats string dates correctly", () => {
    expect(formatDate("2023-05-15")).toMatch(/May 15, 2023/);
  });

  it("formats timestamp correctly", () => {
    const timestamp = new Date("2023-05-15").getTime();
    expect(formatDate(timestamp)).toMatch(/May 15, 2023/);
  });

  it("uses provided locale for formatting", () => {
    const date = new Date("2023-05-15");
    expect(formatDate(date, "es-ES")).toMatch(/15 de mayo de 2023/);
  });
});

describe("getRelativeTimeString", () => {
  // Save original Date implementation
  const OriginalDate = global.Date;

  beforeAll(() => {
    // Mock current date to be fixed
    const mockDate = new Date("2023-05-15T12:00:00Z");

    global.Date = class extends OriginalDate {
      constructor(...args: unknown[]) {
        if (args.length === 0) {
          super(mockDate.getTime());
          return this;
        }
        super(...(args as ConstructorParameters<typeof OriginalDate>));
      }
    } as DateConstructor;
  });

  afterAll(() => {
    // Restore original Date implementation
    global.Date = OriginalDate;
  });

  it("returns relative days in the past", () => {
    const date = new Date("2023-05-13T12:00:00Z"); // 2 days ago
    expect(getRelativeTimeString(date)).toBe("2 days ago");
  });

  it("returns relative days in the future", () => {
    const date = new Date("2023-05-17T12:00:00Z"); // 2 days in future
    expect(getRelativeTimeString(date)).toBe("in 2 days");
  });

  it("returns relative hours", () => {
    const date = new Date("2023-05-15T15:00:00Z"); // 3 hours in future
    expect(getRelativeTimeString(date)).toBe("in 3 hours");
  });

  it("returns relative minutes that are rounded to hours", () => {
    const date = new Date("2023-05-15T12:30:00Z"); // 30 minutes in future
    expect(getRelativeTimeString(date)).toBe("in 1 hour");
  });

  it("returns relative seconds that are rounded to minutes", () => {
    const date = new Date("2023-05-15T12:00:45Z"); // 45 seconds in future
    expect(getRelativeTimeString(date)).toBe("in 1 minute");
  });

  it("uses provided locale for formatting", () => {
    const date = new Date("2023-05-13T12:00:00Z"); // 2 days ago
    // RelativeTimeFormat can return different strings depending on the locale
    // Just check that it contains the correct value in Spanish
    const result = getRelativeTimeString(date, "es-ES");
    expect(["hace 2 días", "anteayer"]).toContain(result);
  });
});
