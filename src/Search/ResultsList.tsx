import flatMap from "lodash/flatMap"
import React, { ReactNode, useCallback, useState } from "react"
import { EuiAccordion, EuiLink, EuiListGroup } from "@elastic/eui"

import { useSearchParams } from "../hooks/params"
import { Location } from "../lib/location"
import { Taxon } from "../lib/taxon"
import { useCurrentOrganization } from "../lib/organization"
import { Accession } from "../lib/accession"
import { useAccessionsSearchProvider } from "./accessionsSearchProvider"
import { useLocationsSearchProvider } from "./locationsSearchProvider"
import { useTaxaSearchProvider } from "./taxaSearchProvider"
import { SearchResultItem, SearchResultItemRenderFunction } from "./types"

type Props = {
  onSelected: (item: SearchResultItem, itemType: string) => void
}

export const ResultsList: React.FC<Props> = ({ onSelected }) => {
  const [selected, setSelected] = useState<SearchResultItem | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [org] = useCurrentOrganization()
  const searchParams = useSearchParams()
  const q = searchParams.get("q")

  const {
    hasNextPage: canFetchMoreAccessions,
    pages: accessionsPages,
    fetchNextPage: fetchMoreAccessions,
    renderItem: renderAccessionItem,
  } = useAccessionsSearchProvider(org.id, q)

  const {
    hasNextPage: canFetchMoreLocations,
    pages: locationsPages,
    fetchNextPage: fetchMoreLocations,
    renderItem: renderLocationItem,
  } = useLocationsSearchProvider(org.id, q)

  const {
    hasNextPage: canFetchMoreTaxa,
    pages: taxaPages,
    fetchNextPage: fetchMoreTaxa,
    renderItem: renderTaxonItem,
  } = useTaxaSearchProvider(org.id, q)

  function handleClick(item: SearchResultItem, type: string) {
    console.log(item)
    setSelected({ ...item })
    setSelectedType(type)
    onSelected(item, type)
  }

  const renderPages = useCallback(
    <T extends SearchResultItem>(
      pages: any, // TODO: what do we do about this "any"
      render: SearchResultItemRenderFunction<T>,
      itemType: string,
    ) =>
      flatMap(pages, (page) =>
        page.map((item: T) =>
          render(item, selectedType === itemType && selected?.id == item.id, () =>
            handleClick(item, itemType),
          ),
        ),
      ),
    [selected, selectedType],
  )

  return (
    <>
      <EuiAccordion
        buttonContent="Accessions"
        id="accessionsAccordion"
        initialIsOpen={true}
      >
        <EuiListGroup>
          {renderPages<Accession>(accessionsPages, renderAccessionItem, "accession")}
          {canFetchMoreAccessions && fetchMoreAccessions && (
            <EuiLink className="Search--loadMore" onClick={() => fetchMoreAccessions()}>
              Load more
            </EuiLink>
          )}
        </EuiListGroup>
      </EuiAccordion>
      <EuiAccordion buttonContent="Taxa" id="taxaAccordion" initialIsOpen={true}>
        <EuiListGroup>
          {renderPages<Taxon>(taxaPages, renderTaxonItem, "taxon")}
          {canFetchMoreTaxa && fetchMoreTaxa && (
            <EuiLink className="Search--loadMore" onClick={() => fetchMoreTaxa()}>
              Load more
            </EuiLink>
          )}
        </EuiListGroup>
      </EuiAccordion>
      <EuiAccordion
        buttonContent="Locations"
        id="locationsAccordion"
        initialIsOpen={true}
      >
        <EuiListGroup>
          {renderPages<Location>(locationsPages, renderLocationItem, "location")}
          {canFetchMoreLocations && fetchMoreLocations && (
            <EuiLink className="Search--loadMore" onClick={() => fetchMoreLocations()}>
              Load more
            </EuiLink>
          )}
        </EuiListGroup>
      </EuiAccordion>
    </>
  )
}
