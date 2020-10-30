import React, { useEffect, useState } from "react"
import {
  EuiAccordion,
  EuiLink,
  EuiListGroup,
  EuiFlexGroup,
  EuiFlexItem,
} from "@elastic/eui"
import { useObservableEagerState } from "observable-hooks"
import _ from "lodash"

import Page from "../Page"
import { useSearchParams } from "../hooks/params"
import * as TaxonService from "../lib/taxon"
import { Taxon } from "../lib/taxon"
import { TaxonSummaryBox } from "../TaxonSummaryBox"
import { currentOrganization$ } from "../lib/user"
import * as AccessionService from "../lib/accession"
import { Accession } from "../lib/accession"
import { AccessionSummaryBox } from "../AccessionSummaryBox"
import { isNotEmpty } from "../lib/observables"
import { ListResponse } from "../lib/api"
import { ListItem } from "./ListItem"

type SearchFunc<T> = (query: string) => ListResponse<T>

const useSearchObservableState = <T,>(
  searchFunc: SearchFunc<T>,
  query: string | null,
): [T[], (() => Promise<void>) | null] => {
  const [data, setData] = useState<T[]>([])
  const [nextPage$, setNextPage$] = useState<ListResponse<T> | null>(null)

  const fetchNextPage = async (): Promise<void> => {
    if (!nextPage$) {
      return Promise.resolve()
    }

    return nextPage$.toPromise().then(([page, nextPage$]) => {
      setData((data) => [...data, ...page])
      setNextPage$(nextPage$)
    })
  }

  useEffect(() => {
    if (!query) {
      return
    }

    setData([])
    setNextPage$(null)

    searchFunc(query)
      .toPromise()
      .then(([page, nextPage$]) => {
        setData(page)
        setNextPage$(nextPage$)
      })
  }, [query])

  return [data, nextPage$ ? fetchNextPage : null]
}

type SearchResultItem = Accession | Taxon
const pageSize = 10

export const Search: React.FC = () => {
  const [selected, setSelected] = useState<SearchResultItem | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const org = useObservableEagerState(currentOrganization$.pipe(isNotEmpty()))
  const searchParams = useSearchParams()
  const q = searchParams.get("q")

  const [taxa, fetchNextTaxaPage] = useSearchObservableState(
    (q: string) => TaxonService.list(org.id, { limit: pageSize, query: q }),
    q,
  )
  const [accessions, fetchNextAccessionsPage] = useSearchObservableState(
    (q: string) =>
      AccessionService.list(org.id, { limit: pageSize, query: q, include: ["taxon"] }),
    q,
  )

  function renderSearchResults() {
    function handleClick(item: SearchResultItem, type: string) {
      setSelected(item)
      setSelectedType(type)
    }
    const accessionItems = accessions?.map((accession) => {
      return (
        <ListItem
          title={accession.code}
          subtitle={accession.taxon?.name ?? ""}
          key={accession.id}
          onClick={() => handleClick(accession, "accession")}
          isActive={selected === accession}
        />
      )
    })

    const taxonItems = taxa?.map((taxon) => {
      return (
        <ListItem
          title={taxon.name}
          subtitle={taxon.rank}
          key={taxon.id}
          onClick={() => handleClick(taxon, "taxon")}
          isActive={selected === taxon}
        />
      )
    })

    return (
      <>
        <EuiAccordion
          buttonContent="Accessions"
          id="accessionsAccordion"
          initialIsOpen={true}
        >
          <EuiListGroup>{accessionItems}</EuiListGroup>
        </EuiAccordion>
        {q && fetchNextAccessionsPage && (
          <EuiLink onClick={() => fetchNextAccessionsPage()}>Load more</EuiLink>
        )}
        <EuiAccordion buttonContent="Taxa" id="taxaAccordion" initialIsOpen={true}>
          <EuiListGroup>{taxonItems}</EuiListGroup>
          {q && fetchNextTaxaPage && (
            <EuiLink onClick={() => fetchNextTaxaPage()}>Load more</EuiLink>
          )}
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
