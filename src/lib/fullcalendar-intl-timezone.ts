import { createPlugin } from "@fullcalendar/core";
import { NamedTimeZoneImpl } from "@fullcalendar/core/internal";

function arrayToUtcMs(parts: number[]) {
  return Date.UTC(
    parts[0] ?? 0,
    parts[1] ?? 0,
    parts[2] ?? 1,
    parts[3] ?? 0,
    parts[4] ?? 0,
    parts[5] ?? 0,
    parts[6] ?? 0,
  );
}

export class IntlNamedTimeZoneImpl extends NamedTimeZoneImpl {
  private readonly formatter: Intl.DateTimeFormat;

  constructor(timeZoneName: string) {
    super(timeZoneName);
    this.formatter = new Intl.DateTimeFormat("en-US-u-ca-gregory-nu-latn", {
      timeZone: timeZoneName,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
  }

  timestampToArray(ms: number) {
    const values = Object.fromEntries(
      this.formatter
        .formatToParts(new Date(ms))
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, Number(part.value)]),
    ) as Record<string, number>;

    return [
      values.year,
      values.month - 1,
      values.day,
      values.hour,
      values.minute,
      values.second,
      new Date(ms).getUTCMilliseconds(),
    ];
  }

  offsetForArray(parts: number[]) {
    const utcGuess = arrayToUtcMs(parts);
    const firstOffset = (arrayToUtcMs(this.timestampToArray(utcGuess)) - utcGuess) / 60000;
    const instantGuess = utcGuess - firstOffset * 60000;
    return (arrayToUtcMs(this.timestampToArray(instantGuess)) - instantGuess) / 60000;
  }
}

export const intlNamedTimeZonePlugin = createPlugin({
  name: "streex-intl-named-timezone",
  namedTimeZonedImpl: IntlNamedTimeZoneImpl,
});
