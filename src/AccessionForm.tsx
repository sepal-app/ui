import omit from "lodash/omit"
import React from "react"
import { useMutation, useQuery } from "react-query"
import { useHistory, useParams } from "react-router-dom"
import { EuiButton, EuiFieldText, EuiForm, EuiFormRow, EuiTextColor } from "@elastic/eui"
import { Form, Formik, FormikHelpers } from "formik"
import { useObservableEagerState } from "observable-hooks"
import { isNotEmpty } from "./lib/observables"

import Page from "./Page"
import {
  Accession,
  AccessionFormValues,
  create,
  get as getAccession,
  update,
} from "./lib/accession"
import { currentOrganization$ } from "./lib/organization"
import { useExpiringState } from "./hooks"
import { TaxonField } from "./TaxonField"

export const AccessionForm: React.FC = () => {
  const org = useObservableEagerState(currentOrganization$.pipe(isNotEmpty()))
  const params = useParams<{ id: string }>()
  const history = useHistory()
  const [success, setSuccess] = useExpiringState(false, 1000)
  const { data: accession } = useQuery(["accession", org?.id, params.id], getAccession, {
    enabled: org.id && params.id,
    initialData: {
      id: -1,
      code: "",
      taxonId: -1,
    },
    initialStale: true,
  })
  const [createAccession] = useMutation((values: AccessionFormValues) =>
    create(org?.id ?? "", values),
  )
  const [updateAccession] = useMutation((values: AccessionFormValues) =>
    update(org?.id ?? "", accession?.id ?? "", values),
  )

  const handleSubmit = async (
    values: AccessionFormValues,
    { setSubmitting }: FormikHelpers<AccessionFormValues>,
  ) => {
    const save = params.id
      ? updateAccession(values)
      : createAccession(values).then((acc) => {
          if (acc?.id) {
            history.push(`/accession/${acc.id}`)
            history.goForward()
          }
          return acc
        })

    try {
      await save
      setSuccess(true)
    } catch (e) {
      console.log(e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Page contentTitle="Accession form">
      <Formik<AccessionFormValues>
        enableReinitialize={true}
        onSubmit={handleSubmit}
        initialValues={omit(accession, ["id"]) as Accession}
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
