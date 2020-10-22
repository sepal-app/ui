import React, { useEffect, useState } from "react"
import {
  EuiButton,
  EuiComboBox,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiTextColor,
} from "@elastic/eui"
import { Form, Formik, FormikHelpers } from "formik"
import {
  useObservable,
  useObservableEagerState,
  useObservableState,
} from "observable-hooks"
import { Observable, iif, of } from "rxjs"
import { finalize, map, mergeMap, switchMap, tap } from "rxjs/operators"
import _ from "lodash"

import * as TaxonService from "../lib/taxon"
import { Taxon, TaxonFormValues } from "../lib/taxon"
import { currentOrganization$ } from "../lib/user"
import { useExpiringState } from "../hooks"
import { isNotEmpty } from "../lib/observables"
import { GeneralTabSchema } from "./formSchemas"
import { Rank, RankOption } from "./types"

interface Props {
  taxon: Taxon
  onSubmit: (values: TaxonFormValues) => Observable<Taxon>
}

interface ParentCompletion {
  label: string
  value: Taxon
}

const rankOptions: RankOption[] = [
  {
    label: "Family",
    value: "family",
  },
  {
    label: "Genus",
    value: "genus",
  },
  {
    label: "Species",
    value: "species",
  },
]

export const GeneralTab: React.FC<Props> = ({ taxon, onSubmit }) => {
  const [success, setSuccess] = useExpiringState(false, 1000)
  const org = useObservableEagerState(currentOrganization$.pipe(isNotEmpty()))
  const org$ = useObservable(() => currentOrganization$.pipe(isNotEmpty()))
  const [
    selectedParentCompletion,
    setSelectedParentCompletion,
  ] = useState<ParentCompletion | null>(null)
  const [selectedRankOption, setSelectedRankOption] = useState<RankOption | null>(
    () => rankOptions.find((o) => o.value === taxon.rank) ?? null,
  )

  useEffect(() => {
    const rankOption = rankOptions.find((o) => o.value === taxon.rank) ?? null
    setSelectedRankOption(rankOption)
  }, [taxon])

  useEffect(() => {
    if (!taxon?.parentId) {
      setSelectedParentCompletion(null)
    }

    // get the parent data
    const subscription = TaxonService.get(org.id, taxon.parentId as number)
      .pipe(
        tap((parentTaxon) =>
          setSelectedParentCompletion({ label: parentTaxon.name, value: parentTaxon }),
        ),
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [org.id, taxon.parentId])

  const [parentCompletions, updateParentCompletions] = useObservableState<
    ParentCompletion[],
    Taxon | string
  >(
    (input$) =>
      input$.pipe(
        mergeMap((input) =>
          iif(
            () => _.isString(input),
            // if the input is a string then search for completions
            org$.pipe(
              switchMap((org) => TaxonService.list(org.id, { query: input as string })),
              map(([taxa]) => taxa.map((taxon) => ({ label: taxon.name, value: taxon }))),
            ),
            // if the input is not a string then assume it's a taxon and set it
            // as the only completion
            of([{ label: input, value: input } as ParentCompletion]).pipe(
              tap((completions) => setSelectedParentCompletion(completions[0])),
            ),
          ),
        ),
      ),
    () => [],
  )

  useEffect(() => {
    if (taxon?.parent && taxon.parent.id !== -1) {
      updateParentCompletions(taxon.parent)
    }
  }, [taxon, updateParentCompletions])

  function handleSubmit(
    values: TaxonFormValues,
    { setSubmitting }: FormikHelpers<Taxon>,
  ) {
    values.parentId = selectedParentCompletion ? selectedParentCompletion.value.id : null
    onSubmit(values)
      .pipe(
        tap(() => setSuccess(true)),
        finalize(() => {
          setSubmitting(false)
        }),
      )
      .subscribe()
  }

  return (
    <Formik
      enableReinitialize={true}
      initialValues={taxon}
      onSubmit={handleSubmit}
      validationSchema={GeneralTabSchema}
    >
      {({ handleChange, dirty, isSubmitting, isValid, values }) => (
        <Form>
          <EuiForm>
            <EuiFormRow label="Name">
              <EuiFieldText
                name="name"
                value={values.name || ""}
                onChange={handleChange}
              />
            </EuiFormRow>
            <EuiFormRow label="Parent">
              <EuiComboBox<Taxon>
                async
                placeholder="Search for a taxon"
                singleSelection={{ asPlainText: true }}
                options={parentCompletions}
                selectedOptions={
                  selectedParentCompletion ? [selectedParentCompletion] : []
                }
                onChange={(completions) => {
                  const completion = completions?.[0]
                  handleChange("parentId")(
                    completion?.value ? completion.value.id.toString() : "",
                  )
                  setSelectedParentCompletion(completion as ParentCompletion)
                }}
                onSearchChange={(value) => value && updateParentCompletions(value)}
              />
            </EuiFormRow>
            <EuiFormRow label="Rank">
              <EuiComboBox<Rank>
                placeholder="Select a taxonomic rank"
                singleSelection={{ asPlainText: true }}
                options={rankOptions}
                selectedOptions={selectedRankOption ? [selectedRankOption] : []}
                onChange={(options) => {
                  const option = options?.[0]
                  handleChange("rank")(option ? (option.value as string) : "")
                  setSelectedRankOption(option as RankOption)
                }}
              />
            </EuiFormRow>
            <div style={{ marginTop: "20px" }}>
              <EuiButton
                fill
                isDisabled={!dirty || !isValid || isSubmitting}
                isLoading={isSubmitting}
                type="submit"
              >
                Save
              </EuiButton>
              {success && (
                <EuiTextColor color="secondary" style={{ marginLeft: "20px" }}>
                  Success!
                </EuiTextColor>
              )}
            </div>
          </EuiForm>
        </Form>
      )}
    </Formik>
  )
}
