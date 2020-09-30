import React, { useState } from "react"
import { useLocation, useParams } from "react-router-dom"
import {
  EuiAccordion,
  EuiListGroup,
  EuiListGroupItem,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
} from "@elastic/eui"
import { useParamsValueObservable } from "./hooks/params"
import {
  pluckFirst,
  useObservable,
  useObservableGetState,
  useObservableState,
} from "observable-hooks"
import { EMPTY, Observable, combineLatest } from "rxjs"
import { catchError, map, switchMap, tap } from "rxjs/operators"

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
  console.log("Search()")
  const [selected, setSelected] = useState()
  const [selectedType, setSelectedType] = useState()
  const org$ = useObservable(() => currentOrganization$.pipe(isNotEmpty()))
  const query$ = useParamsValueObservable("q")

  function makeSearchObservable<T>(search: SearchFunc<T>) {
    return combineLatest(org$, query$).pipe(
      tap(([_, query]) => console.log(`query: ${query}`)),
      switchMap(([org, query]) => search(org.id, query as string)),
      catchError((err) => {
        // this.notificationSvc.error("Search failed.");
        // TODO: handle error
        console.log(err)
        return EMPTY
      }),
    )
  }

  const [taxa] = useObservableState(
    () => makeSearchObservable<Taxon>(taxonSvc.search),
    [], // initial value
  )

  const [accessions] = useObservableState(
    () => makeSearchObservable<Accession>(accessionSvc.search),
    [], // initial value
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
