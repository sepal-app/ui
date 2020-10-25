import React, { useEffect, useState } from "react"
import { EuiComboBox } from "@elastic/eui"
import { iif, of } from "rxjs"
import { useObservable, useObservableState } from "observable-hooks"
import { map, mergeMap, tap, withLatestFrom } from "rxjs/operators"
import _ from "lodash"

import { isNotEmpty } from "./lib/observables"
import * as TaxonService from "./lib/taxon"
import { Taxon } from "./lib/taxon"
import { currentOrganization$ } from "./lib/user"

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
  const org$ = useObservable(() => currentOrganization$.pipe(isNotEmpty()))
  const [completions, updateCompletions] = useObservableState<
    Completion[],
    Taxon | string
  >(
    (input$) =>
      input$.pipe(
        withLatestFrom(org$),
        mergeMap(([input, org]) =>
          iif(
            () => _.isString(input),
            // if the input is a string then search for completions
            TaxonService.list(org.id, { query: input as string }).pipe(
              map(([taxa]) => taxa.map((taxon) => ({ label: taxon.name, value: taxon }))),
            ),
            // if the input is not a string then assume it's a taxon and set it
            // as the only completion
            of([{ label: input, value: input } as Completion]).pipe(
              tap((completions) => {
                setSelectedOption(completions[0])
                onChange(completions[0].value)
              }),
            ),
          ),
        ),
      ),
    () => [],
  )

  useEffect(() => {
    if (!value || value < 0) {
      return
    }

    const subscription = org$
      .pipe(
        mergeMap((org) => TaxonService.get(org.id, value)),
        tap((taxon) => setSelectedOption({ label: taxon.name, value: taxon })),
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [value])

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
      onSearchChange={(value) => value && updateCompletions(value)}
      {...props}
    />
  )
}
