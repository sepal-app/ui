import React, { useState, useEffect } from "react"
import { useMutation, useQuery, useQueryCache } from "react-query"
import { useHistory, useParams } from "react-router-dom"
import { EuiTabbedContent } from "@elastic/eui"
import { useObservableEagerState } from "observable-hooks"
import { Observable } from "rxjs"
import { map, tap } from "rxjs/operators"

import Page from "../Page"
import * as TaxonService from "../lib/taxon"
import { Taxon, TaxonFormValues, create, get as getTaxon, update } from "../lib/taxon"
import { currentOrganization$ } from "../lib/organization"
import { useSearchParams } from "../hooks"
import { useExpiringState } from "../hooks"
import { isNotEmpty } from "../lib/observables"
import { GeneralTab } from "./GeneralTab"

export const TaxonForm: React.FC = () => {
  const org = useObservableEagerState(currentOrganization$.pipe(isNotEmpty()))
  const queryCache = useQueryCache()
  const params = useParams<{ id: string }>()
  const history = useHistory()
  const [success, setSuccess] = useExpiringState(false, 1000)
  const { data: taxon } = useQuery(["taxon", org.id, params.id], getTaxon, {
    enabled: org.id && params.id,
    initialData: {
      id: -1,
      name: "",
      rank: "",
      parentId: -1,
    },
    initialStale: true,
  })

  const [createTaxon] = useMutation((values: TaxonFormValues) =>
    create(org?.id ?? "", values),
  )

  const [updateTaxon] = useMutation((values: TaxonFormValues) =>
    update(org?.id ?? "", taxon?.id ?? "", values),
  )

  const onSubmit = async (values: TaxonFormValues): Promise<Taxon> => {
    const save = params.id
      ? updateTaxon(values)
      : createTaxon(values).then((txn) => {
          if (txn?.id) {
            history.push(`/taxon/${txn.id}`)
            history.goForward()
          }
          return txn
        })

    const txn = await save
    if (txn) {
      queryCache.setQueryData(["taxon", org.id, txn.id], txn)
      setSuccess(true)
    }

    return txn as Taxon
  }

  if (!taxon) {
    // TODO: this was put here temporary b/c taxon is null
    return null
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
