export const isCharNumber = (c: string) =>
  c.length === 1 && '0' <= c && c <= '9';

export const isCharAlpha = (c: string) =>
  c.length === 1 &&
  (('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || c === '_');

export const isCharAlphaNumeric = (c: string) =>
  isCharAlpha(c) || isCharNumber(c);
