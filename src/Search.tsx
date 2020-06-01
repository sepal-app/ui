import React, { useState } from "react"
import {
  EuiAccordion,
  EuiListGroup,
  EuiListGroupItem,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
} from "@elastic/eui"
import useSearchParams from "./hooks/search-params"
import { pluckFirst, useObservable, useObservableState } from "observable-hooks"
import { switchMap } from "rxjs/operators"
import { Observable, combineLatest } from "rxjs"

import Page from "./Page"
import * as taxonSvc from "./lib/taxon"
import { Taxon } from "./lib/taxon"
import { TaxonSummaryBox } from "./TaxonSummaryBox"
import { currentOrganization$ } from "./lib/user"
import * as accessionSvc from "./lib/accession"
import { Accession } from "./lib/accession"
import { AccessionSummaryBox } from "./AccessionSummaryBox"
import { isNotEmpty } from "./lib/observables"

type SearchFunc<T> = (orgId: number, q: string) => Observable<T[]>

export const Search: React.FC = () => {
  const [selected, setSelected] = useState()
  const [selectedType, setSelectedType] = useState()
  const org$ = useObservable(() => currentOrganization$.pipe(isNotEmpty()))
  const params = useSearchParams()
  const query$ = useObservable((input$) => pluckFirst(input$).pipe(isNotEmpty()), [
    params.get("q"),
  ])

  function makeSearchObservable<T>(search: SearchFunc<T>) {
    return combineLatest(org$, query$).pipe(
      switchMap(([org, query]) => search(org.id, query)),
    )
  }

  const [taxa] = useObservableState(
    () => makeSearchObservable<Taxon>(taxonSvc.search),
    [],
  )

  const [accessions] = useObservableState(
    () => makeSearchObservable<Accession>(accessionSvc.search),
    [],
  )

  function renderSearchResults() {
    function handleClick(item: Taxon | Accession, type: string) {
      setSelected(item)
      setSelectedType(type)
    }
    const accessionItems = accessions?.map((accession) => {
      return (
        <EuiListGroupItem
          label={
            <EuiText>
              <h5>{accession.code}</h5>
            </EuiText>
          }
          key={accession.id}
          onClick={() => handleClick(accession, "accession")}
          isActive={selected === accession}
        />
      )
    })

    const taxonItems = taxa?.map((taxon) => {
      return (
        <EuiListGroupItem
          label={
            <EuiText>
              <h5>{taxon.name}</h5>
              <p>
                <small>{taxon.rank}</small>
              </p>
            </EuiText>
          }
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
