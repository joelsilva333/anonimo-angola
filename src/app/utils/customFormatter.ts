/* eslint-disable @typescript-eslint/no-explicit-any */

import ptBRStrings from "react-timeago/lib/language-strings/pt";
import buildFormatter from "react-timeago/lib/formatters/buildFormatter";

export const customFormatter = (
  value: number,
  unit: string,
  suffix: string,
  epochMilliseconds: number,
  nextFormatter: any,
  now: () => number
) => {
  if (unit === "second" && value < 60) {
    return "agora mesmo";
  }
  const formatter = buildFormatter(ptBRStrings);
  return formatter(
    value,
    unit as any,
    suffix as any,
    epochMilliseconds,
    nextFormatter,
    now
  );
};
