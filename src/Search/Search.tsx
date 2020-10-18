import React, { useEffect, useState } from "react"
import { EuiAccordion, EuiListGroup, EuiFlexGroup, EuiFlexItem } from "@elastic/eui"
import { useObservableEagerState, useObservableState } from "observable-hooks"
import { EMPTY, iif } from "rxjs"
import { map, switchMap, tap } from "rxjs/operators"
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
import { ListOptions, ListResponse } from "../lib/api"
import { ListItem } from "./ListItem"

type SearchFunc<T> = (orgId: string | number, options: ListOptions) => ListResponse<T>

const useSearchObservableState = <T,>(orgId: number, searchFunc: SearchFunc<T>) =>
  useObservableState<T[], string>((input$, initialState) => {
    let nextPage$: ListResponse<T> | null = null
    let data: T[] = initialState
    return input$.pipe(
      tap((q) => console.log(`q: ${q}`)),
      switchMap((q) =>
        iif(
          () => !nextPage$,
          searchFunc(orgId, { limit: 2, query: q }),
          nextPage$ ? nextPage$ : EMPTY,
        ),
      ),
      map(([d, next$]) => {
        nextPage$ = next$ ?? EMPTY
        data = d ? [...data, ...d] : data
        return data
      }),
    )
  }, [])

export const Search: React.FC = () => {
  const [selected, setSelected] = useState()
  const [selectedType, setSelectedType] = useState()
  const org = useObservableEagerState(currentOrganization$.pipe(isNotEmpty()))
  const searchParams = useSearchParams()

  const [taxa, fetchNextTaxaPage] = useSearchObservableState(org.id, TaxonService.list)
  const [accessions, fetchNextAccessionsPage] = useSearchObservableState(
    org.id,
    AccessionService.list,
  )

  const q = searchParams.get("q")
  useEffect(() => {
    if (!q) {
      return
    }

    fetchNextTaxaPage(q)
    fetchNextAccessionsPage(q)
  }, [q])

  function renderSearchResults() {
    function handleClick(item: Taxon | Accession, type: string) {
      setSelected(item)
      setSelectedType(type)
    }
    const accessionItems = accessions?.map((accession) => {
      return (
        <ListItem
          title={accession.code}
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
        <EuiAccordion buttonContent="Taxa" id="taxaAccordion" initialIsOpen={true}>
          <EuiListGroup>{taxonItems}</EuiListGroup>
        </EuiAccordion>
      </>
    )
  }

  function renderSelected() {
    switch (selectedType) {
      case "taxon":
        return <TaxonSummaryBox item={selected} />
      case "accession":
        return <AccessionSummaryBox item={selected} />
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
