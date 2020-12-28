import React, { useState } from "react"
import { useQuery } from "react-query"
import { EuiComboBox } from "@elastic/eui"
import { useObservableEagerState } from "observable-hooks"

import { ListOptions } from "./lib/api"
import { isNotEmpty } from "./lib/observables"
import { Taxon, get as getTaxa, list as listTaxa } from "./lib/taxon"
import { currentOrganization$ } from "./lib/organization"

interface Completion {
  label: string
  value: Taxon
}

interface Props {
  value: number | null
  onChange: (taxon: Taxon | null) => void
}

export const TaxonField: React.FC<Props> = ({ onChange, value, ...props }) => {
  const [selectedOption, setSelectedOption] = useState<Completion | null>(null)
  const org = useObservableEagerState(currentOrganization$.pipe(isNotEmpty()))
  const [query, setQuery] = useState<string | null>()
  const { data: completions } = useQuery(
    ["taxa", org.id, { query }],
    async () => {
      const taxa = await listTaxa(org.id, { query })
      return taxa.map((taxon) => ({ label: taxon.name, value: taxon }))
    },
    {
      enabled: !!query,
    },
  )

  useQuery(["taxa", org.id, value], () => getTaxa(org.id, value as number), {
    enabled: !!(value && value > 0),
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
