import React, { useState, useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { useHistory, useParams } from "react-router-dom"
import { EuiTabbedContent } from "@elastic/eui"

import Page from "../Page"
import {
  Accession,
  AccessionFormValues,
  create,
  get as getAccession,
  update,
} from "../lib/accession"
import { useCurrentOrganization } from "../lib/organization"
import { GeneralTab } from "./GeneralTab"

export const AccessionForm: React.FC = () => {
  const [org] = useCurrentOrganization()
  const queryClient = useQueryClient()
  const params = useParams<{ id: string }>()
  const history = useHistory()

  const { data: accession } = useQuery(
    ["accession", org.id, params.id],
    () => getAccession([org.id, params.id]),
    {
      enabled: !!(org.id && params.id),
      initialData: {
        id: "",
        code: "",
        taxonId: "",
      },
    },
  )

  const { mutateAsync: createAccession } = useMutation((values: AccessionFormValues) =>
    create([org?.id ?? ""], values),
  )

  const { mutateAsync: updateAccession } = useMutation((values: AccessionFormValues) =>
    update([org?.id ?? "", accession?.id ?? ""], values),
  )

  const onSubmit = async (values: AccessionFormValues): Promise<Accession> => {
    const save = params.id
      ? updateAccession(values)
      : createAccession(values).then((txn) => {
          if (txn?.id) {
            history.push(`/accession/${txn.id}`)
            history.goForward()
          }
          return txn
        })

    const txn = await save
    if (txn) {
      queryClient.setQueryData(["accession", org.id, txn.id], txn)
    }

    return txn as Accession
  }

  if (!accession) {
    // TODO: this was put here temporary b/c accession is null
    return null
  }

  const tabs = [
    {
      id: "general",
      name: "General",
      content: <GeneralTab accession={accession} onSubmit={onSubmit} />,
    },
    { id: "other", name: "Other", content: <></> },
  ]

  // TODO: don't allow changing tabs unless the form is saved
  return (
    <Page contentTitle={accession.id ? accession.code : "New accession"}>
      <EuiTabbedContent tabs={tabs} />
    </Page>
  )
}
