import React, { useState } from "react"
import { useQuery } from "react-query"
import { EuiComboBox } from "@elastic/eui"

import { ListOptions } from "./lib/api"
import { Taxon, get as getTaxon, list as listTaxa } from "./lib/taxon"
import { useCurrentOrganization } from "./lib/organization"

interface Completion {
  label: string
  value: Taxon
}

interface Props {
  value: string | null
  onChange: (taxon: Taxon | null) => void
}

export const TaxonField: React.FC<Props> = ({ onChange, value, ...props }) => {
  const [org] = useCurrentOrganization()
  const [selectedOption, setSelectedOption] = useState<Completion | null>(null)
  const [query, setQuery] = useState<string | null>()
  const { data: completions } = useQuery(
    ["taxa", org.id, { query }],
    async () => {
      if (!org) {
        return
      }
      const taxa = await listTaxa([org.id], { query })
      return taxa.map((taxon) => ({ label: taxon.name, value: taxon }))
    },
    {
      enabled: !!query,
    },
  )

  useQuery(["taxa", org.id, value], () => getTaxon([org.id, value as string]), {
    enabled: !!value && !!value.length,
    onSuccess: (taxon) => {
      setSelectedOption({ label: taxon.name, value: taxon })
    },
    // initialData: [],
  })

  return (
    <EuiComboBox<Taxon>
      async
      placeholder="Search for a taxon"
      singleSelection={{ asPlainText: true }}
      options={completions}
      selectedOptions={selectedOption ? [selectedOption] : []}
      onChange={(completions) => {
        const completion = completions?.[0] as Completion
        setSelectedOption(completion as Completion)
        onChange(completions?.[0]?.value ?? null)
      }}
      // onSearchChange={(value) => value && updateCompletions(value)}
      onSearchChange={setQuery}
      {...props}
    />
  )
}
