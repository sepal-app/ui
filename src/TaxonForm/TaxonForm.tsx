import React, { useState, useEffect } from "react"
import { useHistory, useParams } from "react-router-dom"
import { EuiTabbedContent } from "@elastic/eui"
import { useObservableEagerState } from "observable-hooks"
import { Observable } from "rxjs"
import { map, tap } from "rxjs/operators"

import Page from "../Page"
import * as TaxonService from "../lib/taxon"
import { Taxon, TaxonFormValues } from "../lib/taxon"
import { currentOrganization$ } from "../lib/user"
import {
  useParamsObservable,
  useParamsValueObservableState,
  useSearchParams,
} from "../hooks"
import { isNotEmpty } from "../lib/observables"
import { GeneralTab } from "./GeneralTab"

export const TaxonForm: React.FC = () => {
  const org = useObservableEagerState(currentOrganization$.pipe(isNotEmpty()))
  const params = useParams<{ id: string }>()
  const history = useHistory()
  const [taxon, setTaxon] = useState<Taxon>({
    id: -1,
    name: "",
    rank: "",
    parentId: -1,
  })

  useEffect(() => {
    if (!params.id) {
      return
    }

    TaxonService.get(org.id, params.id).toPromise().then(setTaxon)
  }, [org, params.id])

  function onSubmit(values: TaxonFormValues): Observable<Taxon> {
    return taxon.id < 0
      ? TaxonService.create(org.id, values).pipe(
          tap(({ id }) => {
            history.push(`/taxon/${id}`)
            history.goForward()
          }),
        )
      : TaxonService.update(org.id, taxon.id, values)
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
    <Page contentTitle={taxon.id ? taxon.name : "New taxon"}>
      <EuiTabbedContent tabs={tabs} />
    </Page>
  )
}
