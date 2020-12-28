import flatMap from "lodash/flatMap"
import { useObservableEagerState } from "observable-hooks"
import React, { useState } from "react"
import { useInfiniteQuery } from "react-query"
import {
  EuiAccordion,
  EuiLink,
  EuiListGroup,
  EuiFlexGroup,
  EuiFlexItem,
} from "@elastic/eui"

import Page from "../Page"
import { useSearchParams } from "../hooks/params"
import { isNotEmpty } from "../lib/observables"
import { Taxon, list as listTaxa } from "../lib/taxon"
import { TaxonSummaryBox } from "../TaxonSummaryBox"
import { currentOrganization$ } from "../lib/organization"
import { Accession, list as listAccessions } from "../lib/accession"
import { AccessionSummaryBox } from "../AccessionSummaryBox"
import { ListOptions, ListResponse } from "../lib/api"
import { ListItem } from "./ListItem"

type SearchResultItem = Accession | Taxon
const pageSize = 4

export const Search: React.FC = () => {
  const [selected, setSelected] = useState<SearchResultItem | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const org = useObservableEagerState(currentOrganization$.pipe(isNotEmpty()))
  const searchParams = useSearchParams()
  const q = searchParams.get("q")

  const {
    hasNextPage: canFetchMoreTaxa,
    data: taxaData,
    fetchNextPage: fetchMoreTaxa,
  } = useInfiniteQuery(
    ["taxa", org?.id, { limit: pageSize, query: q }],
    async ({ pageParam: cursor }) => {
      const opts = cursor ? { cursor } : undefined
      return await listTaxa(org.id, opts)
    },
    {
      enabled: !!(org && q),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  )

  const taxaPages = taxaData?.pages ?? []

  const {
    hasNextPage: canFetchMoreAccessions,
    data: accessionsData,
    fetchNextPage: fetchMoreAccessions,
  } = useInfiniteQuery(
    ["accessions", org?.id, { limit: pageSize, query: q, include: ["taxon"] }],
    ({ pageParam: cursor }) =>
      listAccessions(org.id, { cursor, include: ["taxon"], limit: pageSize, query: q }),
    {
      enabled: !!(org && q),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  )

  const accessionsPages = accessionsData?.pages ?? []

  function renderSearchResults() {
    function handleClick(item: SearchResultItem, type: string) {
      setSelected({ ...item })
      setSelectedType(type)
    }

    const accessionItems = flatMap(accessionsPages, (accessions) =>
      accessions.map((accession) => (
        <ListItem
          title={accession.code}
          subtitle={accession.taxon?.name ?? ""}
          key={accession.id}
          onClick={() => handleClick(accession, "accession")}
          isActive={selected === accession}
        />
      )),
    )

    const taxonItems = flatMap(taxaPages, (taxa) =>
      taxa.map((taxon) => (
        <ListItem
          title={taxon.name}
          subtitle={taxon.rank}
          key={taxon.id}
          onClick={() => handleClick(taxon, "taxon")}
          isActive={selected === taxon}
        />
      )),
    )

    return (
      <>
        <EuiAccordion
          buttonContent="Accessions"
          id="accessionsAccordion"
          initialIsOpen={true}
        >
          <EuiListGroup>
            {accessionItems}
            {canFetchMoreAccessions && fetchMoreAccessions && (
              <EuiLink className="Search--loadMore" onClick={() => fetchMoreAccessions()}>
                Load more
              </EuiLink>
            )}
          </EuiListGroup>
        </EuiAccordion>
        <EuiAccordion buttonContent="Taxa" id="taxaAccordion" initialIsOpen={true}>
          <EuiListGroup>
            {taxonItems}
            {canFetchMoreTaxa && fetchMoreTaxa && (
              <EuiLink className="Search--loadMore" onClick={() => fetchMoreTaxa()}>
                Load more
              </EuiLink>
            )}
          </EuiListGroup>
        </EuiAccordion>
      </>
    )
  }

  function renderSelected() {
    switch (selectedType) {
      case "taxon":
        return <TaxonSummaryBox item={selected as Taxon} />
      case "accession":
        return <AccessionSummaryBox item={selected as Accession} />
      default:
        return <></>
    }
  }

  return (
    <Page contentTitle="Search">
      <EuiFlexGroup>
        <EuiFlexItem>{renderSearchResults()}</EuiFlexItem>
        <EuiFlexItem>{renderSelected()}</EuiFlexItem>
      </EuiFlexGroup>
    </Page>
  )
}
