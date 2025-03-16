export interface Heuristics {
  disambiguations?: (DisambiguationsEntity)[] | null;
  named_patterns: NamedPatterns;
}
interface DisambiguationsEntity {
  extensions?: (string)[] | null;
  rules?: (RulesEntity)[] | null;
}
interface RulesEntity {
  language?: string | (string)[] | null;
  and?: (AndEntity)[] | null;
  pattern?: string | null | (string)[] | null | string | (string)[] | null | string | (string)[] | null | string | (string)[] | null | (string)[] | null | string;
  named_pattern?: string | null;
  negative_pattern?: string | null | (string)[] | null;
}
interface AndEntity {
  named_pattern?: string | null;
  pattern?: string | null;
  negative_pattern?: string | null;
}
interface NamedPatterns {
  cpp?: (string)[] | null;
  euphoria?: (string)[] | null;
  fortran: string;
  freebasic?: (string)[] | null;
  gsc?: (string)[] | null;
  json: string;
  key_equals_value: string;
  m68k?: (string)[] | null;
  "man-heading": string;
  "man-title": string;
  "mdoc-date": string;
  "mdoc-heading": string;
  "mdoc-title": string;
  objectivec: string;
  perl?: (string)[] | null;
  quickbasic?: (string)[] | null;
  raku: string;
  "vb-class": string;
  "vb-form": string;
  "vb-module": string;
  vba?: (string)[] | null;
}