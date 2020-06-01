import React, { useState } from "react"
import { useParams } from "react-router-dom"
import { EuiButton, EuiComboBox, EuiFieldText, EuiForm, EuiFormRow } from "@elastic/eui"
import { Form, Formik, FormikHelpers } from "formik"
import { pluckFirst, useObservable, useObservableState } from "observable-hooks"
import { EMPTY, iif, of, zip } from "rxjs"
import { catchError, map, mergeMap, switchMap, tap } from "rxjs/operators"
import _ from "lodash"

import Page from "./Page"
import * as accessionSvc from "./lib/accession"
import { Accession, AccessionFormValues } from "./lib/accession"
import { currentOrganization$ } from "./lib/user"
import * as taxonSvc from "./lib/taxon"
import { Taxon } from "./lib/taxon"
import { isNotEmpty } from "./lib/observables"

interface AccessionFormProps {
  accession: Accession
}

interface TaxonCompletion {
  label: string
  taxon: Taxon
}

const useParamsObservable = () => useObservable(pluckFirst, [useParams<Params>()])

interface Params {
  id: string
}

export const AccessionForm: React.FC<AccessionFormProps> = () => {
  const [selectedTaxa, setSelectedTaxa] = useState<TaxonCompletion[]>([])
  const params$ = useParamsObservable()
  const org$ = useObservable(() => currentOrganization$.pipe(isNotEmpty()))
  const [accession] = useObservableState(() =>
    zip(params$, org$).pipe(
      // TODO: add an iif so that we can either set the accession or look it up
      switchMap(([{ id }, org]) =>
        accessionSvc.get(org.id, id, {
          expand: ["taxon"],
        }),
      ),
      tap((acc) => updateTaxonCompletions(acc.taxon)),
    ),
  )

  const [taxonCompletions, updateTaxonCompletions] = useObservableState(($input) =>
    $input.pipe(
      mergeMap((input) =>
        iif(
          () => _.isString(input),
          // if the input is a string then search for completions
          org$.pipe(
            switchMap((org) => taxonSvc.search(org.id, input)),
            map((taxa) => taxa.map((taxon) => ({ label: taxon.name, taxon }))),
          ),
          // if the input is not a string then assume it's a taxon and set it
          // as the only completion
          of([{ label: input.name, taxon: input }]).pipe(
            tap((completions) => setSelectedTaxa(completions)),
          ),
        ),
      ),
    ),
  )

  async function handleSubmit(
    values: AccessionFormValues,
    { setSubmitting }: FormikHelpers<AccessionFormValues>,
  ) {
    values.taxonId = (selectedTaxa as TaxonCompletion[])[0].taxon.id as number
    zip(params$, org$)
      .pipe(
        mergeMap(([{ id }, org]) =>
          iif(
            () => !id,
            accessionSvc.create(org.id, values),
            accessionSvc.update(org.id, id, values),
          ),
        ),
        catchError((err) => {
          // this.notificationSvc.error("Search failed.");
          console.log(err)
          return EMPTY
        }),
        tap(() => setSubmitting(false)),
        // TODO: update accessions
      )
      .subscribe()
  }

  function handleTaxonChange(selectedOptions: any) {
    setSelectedTaxa(selectedOptions)
  }

  return (
    <Page contentTitle="Accession form">
      <Formik
        enableReinitialize={true}
        onSubmit={handleSubmit}
        initialValues={accession ?? { code: "", taxonId: -1 }}
      >
        {({ values, handleChange }) => (
          <Form>
            <EuiForm>
              <EuiFormRow label="Code">
                <EuiFieldText
                  name="code"
                  onChange={handleChange}
                  value={values.code || ""}
                />
              </EuiFormRow>
              <EuiFormRow label="Taxon">
                <EuiComboBox
                  async
                  placeholder="Search for a taxon"
                  singleSelection={{ asPlainText: true }}
                  options={taxonCompletions}
                  selectedOptions={selectedTaxa}
                  onChange={handleTaxonChange}
                  onSearchChange={updateTaxonCompletions}
                />
              </EuiFormRow>
              <EuiButton fill type="submit">
                Save
              </EuiButton>
            </EuiForm>
          </Form>
        )}
      </Formik>
    </Page>
  )
}
