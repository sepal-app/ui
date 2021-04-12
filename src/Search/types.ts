import { ReactNode } from "react"

import { Location } from "../lib/location"
import { Taxon } from "../lib/taxon"
import { Accession } from "../lib/accession"

export type SearchResultItem = Accession | Taxon | Location

export type SearchResultItemRenderFunction<T extends SearchResultItem> = (
  item: T,
  isActive: boolean,
  onClick: (item: T) => void,
) => ReactNode
