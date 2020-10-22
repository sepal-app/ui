export type Rank =
  | "kingdon"
  | "phylum"
  | "class"
  | "order"
  | "family"
  | "tribe"
  | "genus"
  | "section"
  | "series"
  | "species"
  | "variety"
  | "form"

export type RankOption = { label: string; value: Rank }
