import React from "react"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { useHistory, useParams } from "react-router-dom"
import { EuiTabbedContent } from "@elastic/eui"

import Page from "../Page"
import { Taxon, TaxonFormValues, create, get as getTaxon, update } from "../lib/taxon"
import { useCurrentOrganization } from "../lib/organization"
import { GeneralTab } from "./GeneralTab"

export const TaxonForm: React.FC = () => {
  const [org] = useCurrentOrganization()
  const queryClient = useQueryClient()
  const params = useParams<{ id: string }>()
  const history = useHistory()

  const { data: taxon } = useQuery(
    ["taxon", org.id, params.id],
    () => getTaxon([org.id, params.id]),
    {
      enabled: !!(org.id && params.id),
      initialData: {
        id: "",
        name: "",
        rank: "",
        parentId: null,
      },
    },
  )

  const { mutateAsync: createTaxon } = useMutation((values: TaxonFormValues) =>
    create([org?.id ?? ""], values),
  )

  const { mutateAsync: updateTaxon } = useMutation((values: TaxonFormValues) =>
    update([org?.id ?? "", taxon?.id ?? ""], values),
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
      queryClient.setQueryData(["taxon", org.id, txn.id], txn)
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
