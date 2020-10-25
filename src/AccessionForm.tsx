import React, { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router-dom"
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
  useObservableState,
  useObservableEagerState,
} from "observable-hooks"
import { EMPTY, iif, of, zip } from "rxjs"
import { catchError, filter, map, mergeMap, switchMap, take, tap } from "rxjs/operators"
import _ from "lodash"

import Page from "./Page"
import * as AccessionService from "./lib/accession"
import { Accession, AccessionFormValues } from "./lib/accession"
import { currentOrganization$ } from "./lib/user"
import { isNotEmpty } from "./lib/observables"
import { useExpiringState, useParamsObservable } from "./hooks"
import { TaxonField } from "./TaxonField"

export const AccessionForm: React.FC = () => {
  const org = useObservableEagerState(currentOrganization$.pipe(isNotEmpty()))
  const params = useParams<{ id: string }>()
  const history = useHistory()
  const [success, setSuccess] = useExpiringState(false, 1000)
  const [accession, setAccession] = useState<Accession>({
    id: -1,
    code: "",
    taxonId: -1,
  })

  useEffect(() => {
    if (!params.id) {
      return
    }

    AccessionService.get(org.id, params.id).toPromise().then(setAccession)
  }, [org, params.id])

  function handleSubmit(
    values: AccessionFormValues,
    { setSubmitting }: FormikHelpers<AccessionFormValues>,
  ) {
    const save$ =
      accession.id < 0
        ? AccessionService.create(org.id, values).pipe(
            tap(({ id }) => {
              history.push(`/accession/${id}`)
              history.goForward()
            }),
          )
        : AccessionService.update(org.id, accession.id, values)

    save$
      .toPromise()
      .then((r) => {
        console.log(r)
      })
      .catch((e) => console.log(e))
  }

  return (
    <Page contentTitle="Accession form">
      <Formik<AccessionFormValues>
        enableReinitialize={true}
        onSubmit={handleSubmit}
        initialValues={
          accession ??
          ({
            // id: -1,
            code: "",
            taxonId: -1,
          } as AccessionFormValues)
        }
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
                <TaxonField
                  value={values.taxonId}
                  onChange={(taxon) => {
                    handleChange("taxonId")(taxon?.id.toString() ?? "")
                  }}
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
    </Page>
  )
}
