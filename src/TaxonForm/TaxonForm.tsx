import React from "react"
import { useHistory } from "react-router-dom"
import { EuiTabbedContent } from "@elastic/eui"
import {
  useObservable,
  useObservableEagerState,
  useObservableState,
} from "observable-hooks"
import { EMPTY, Observable, iif, zip } from "rxjs"
import { catchError, filter, mergeMap, switchMap, take, tap } from "rxjs/operators"

import Page from "../Page"
import * as TaxonService from "../lib/taxon"
import { Taxon, TaxonFormValues } from "../lib/taxon"
import { currentOrganization$ } from "../lib/user"
import { useParamsObservable } from "../hooks"
import { isNotEmpty } from "../lib/observables"

import { GeneralTab } from "./GeneralTab"

export const TaxonForm: React.FC = () => {
  const org$ = useObservable(() => currentOrganization$.pipe(isNotEmpty()))
  const org = useObservableEagerState(currentOrganization$.pipe(isNotEmpty()))
  const params$ = useParamsObservable<{ id: string }>()
  const history = useHistory()

  const [taxon] = useObservableState(
    () =>
      zip(params$, org$).pipe(
        filter(([{ id }]) => !!id),
        switchMap(([{ id }, { id: orgId }]) =>
          TaxonService.get(orgId, id, {
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
    return params$.pipe(
      switchMap(({ id }) =>
        iif(
          () => !id,
          TaxonService.create(org.id, values).pipe(
            tap(({ id }) => {
              history.push(`/taxon/${id}`)
              history.goForward()
            }),
          ),
          TaxonService.update(org.id, id, values),
        ),
      ),
      take(1),
      catchError((err) => {
        // this.notificationSvc.error("Search failed.");
        console.log(err)
        return EMPTY
      }),
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
