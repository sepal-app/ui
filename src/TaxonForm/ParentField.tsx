import React, { useEffect, useState } from "react"
import { EuiComboBox } from "@elastic/eui"
import { iif, of } from "rxjs"
import { useObservable, useObservableState } from "observable-hooks"
import { map, mergeMap, tap, withLatestFrom } from "rxjs/operators"
import _ from "lodash"

import { isNotEmpty } from "../lib/observables"
import * as TaxonService from "../lib/taxon"
import { Taxon } from "../lib/taxon"
import { currentOrganization$ } from "../lib/user"

interface ParentCompletion {
  label: string
  value: Taxon
}

interface Props {
  value: number | null
  onChange: (taxon: Taxon | null) => void
}

export const ParentField: React.FC<Props> = ({ onChange, value, ...props }) => {
  const [selectedOption, setSelectedOption] = useState<ParentCompletion | null>(null)
  const org$ = useObservable(() => currentOrganization$.pipe(isNotEmpty()))
  const [parentCompletions, updateParentCompletions] = useObservableState<
    ParentCompletion[],
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
            of([{ label: input, value: input } as ParentCompletion]).pipe(
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
    if (!value) {
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
      options={parentCompletions}
      selectedOptions={selectedOption ? [selectedOption] : []}
      onChange={(completions) => {
        const completion = completions?.[0] as ParentCompletion
        setSelectedOption(completion as ParentCompletion)
        onChange(completions?.[0]?.value ?? null)
      }}
      onSearchChange={(value) => value && updateParentCompletions(value)}
      {...props}
    />
  )
}
