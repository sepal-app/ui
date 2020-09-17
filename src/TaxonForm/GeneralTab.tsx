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
import { useObservable, useObservableState } from "observable-hooks"
import { Observable, iif, of } from "rxjs"
import { map, mergeMap, switchMap, tap } from "rxjs/operators"
import _ from "lodash"

import * as TaxonService from "../lib/taxon"
import { Taxon, TaxonFormValues } from "../lib/taxon"
import { currentOrganization$ } from "../lib/user"
import { useExpiringState, useParamsObservable } from "../hooks"
import { isNotEmpty } from "../lib/observables"

interface Props {
  taxon: Taxon
  onSubmit: (values: TaxonFormValues) => Observable<any>
}

interface ParentCompletion {
  label: string
  taxon: Taxon
}

export const GeneralTab: React.FC<Props> = ({ taxon, onSubmit }) => {
  // const [org, ,] = useCurrentOrganization();
  const params$ = useParamsObservable<{ id: string }>()
  const [success, setSuccess] = useExpiringState(false, 1000)
  const org$ = useObservable(() => currentOrganization$.pipe(isNotEmpty()))
  const [selectedParents, setSelectedParents] = useState<ParentCompletion[] | undefined>(
    [],
  )

  // const meta = useObservableState(() => TaxonService.meta())

  const [parentCompletions, updateParentCompletions] = useObservableState(($input) =>
    $input.pipe(
      tap((input) => console.log(input)),
      mergeMap((input) =>
        iif(
          () => _.isString(input),
          // if the input is a string then search for completions
          org$.pipe(
            switchMap((org) => TaxonService.search(org.id, input)),
            map((taxa) => taxa.map((taxon) => ({ label: taxon.name, taxon }))),
          ),
          // if the input is not a string then assume it's a taxon and set it
          // as the only completion
          of([{ label: input.name, taxon: input }]).pipe(
            tap((completions) => setSelectedParents(completions)),
          ),
        ),
      ),
    ),
  )

  useEffect(() => {
    if (taxon?.parent && taxon.parent.id !== -1) {
      updateParentCompletions(taxon.parent)
    }
  }, [taxon])

  function handleParentChange(selectedOptions: any) {
    setSelectedParents(selectedOptions)
  }

  function handleSubmit(
    values: TaxonFormValues,
    { setSubmitting }: FormikHelpers<Taxon>,
  ) {
    values.parentId = (selectedParents as ParentCompletion[])[0].taxon.id
    onSubmit(values)
      .pipe(
        tap(() => setSubmitting(false)),
        tap(() => setSuccess(true)),
      )
      .subscribe()
  }

  return (
    <Formik enableReinitialize={true} initialValues={taxon} onSubmit={handleSubmit}>
      {({ values, handleChange }) => (
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
              <EuiComboBox
                async
                placeholder="Search for a taxon"
                singleSelection={{ asPlainText: true }}
                options={parentCompletions}
                selectedOptions={selectedParents}
                onChange={handleParentChange}
                onSearchChange={updateParentCompletions}
              />
            </EuiFormRow>
            <EuiFormRow label="Rank">
              <EuiFieldText
                name="rank"
                value={values.rank || ""}
                onChange={handleChange}
              />
            </EuiFormRow>
            <div style={{ marginTop: "20px" }}>
              <EuiButton fill type="submit">
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
