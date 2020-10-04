import React from "react"
import { EuiTabbedContent } from "@elastic/eui"
import { useObservable, useObservableState } from "observable-hooks"
import { EMPTY, Observable, iif, zip } from "rxjs"
import { catchError, filter, mergeMap, switchMap } from "rxjs/operators"
import { useParams } from "react-router-dom"

import Page from "../Page"
import * as TaxonService from "../lib/taxon"
import { Taxon, TaxonFormValues } from "../lib/taxon"
import { currentOrganization$ } from "../lib/user"
import { useParamsObservable } from "../hooks"
import { isNotEmpty } from "../lib/observables"

import { GeneralTab } from "./GeneralTab"

export const TaxonForm: React.FC = () => {
  const org$ = useObservable(() => currentOrganization$.pipe(isNotEmpty()))
  const params = useParams()
  console.log(`params: ${JSON.stringify(params)}`)
  const params$ = useParamsObservable<{ id: string }>()

  const [taxon] = useObservableState(
    () =>
      zip(params$, org$).pipe(
        filter(([{ id }]) => !!id),
        switchMap(([{ id }, org]) =>
          TaxonService.get(org.id, id, {
            expand: ["parent"],
          }),
        ),
        // tap(taxon => updateParentCompletions(taxon.parent)),
      ),
    {
      id: -1,
      name: "",
      rank: "",
      parent: { id: -1, name: "" },
    } as Taxon,
  )

  function onSubmit(values: TaxonFormValues): Observable<Taxon> {
    return zip(params$, org$).pipe(
      mergeMap(([{ id }, org]) =>
        iif(
          () => !id,
          TaxonService.create(org.id, values),
          TaxonService.update(org.id, id, values),
        ),
      ),
      catchError((err) => {
        // this.notificationSvc.error("Search failed.");
        console.log(err)
        return EMPTY
      }),
      // TODO: update taxon?
    )
  }

  const tabs = [
    {
      id: "general",
      name: "General",
      content: <GeneralTab taxon={taxon} onSubmit={onSubmit} />,
    },
    { id: "other", name: "Other", content: <></> },
  ]

  // TODO: don't allow changing tabs unless the form is saved
  return (
    <Page contentTitle="Taxon form">
      <EuiTabbedContent tabs={tabs} />
    </Page>
  )
}
