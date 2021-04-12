import omit from "lodash/omit"
import React from "react"
import { useMutation, useQuery } from "react-query"
import { useHistory, useParams } from "react-router-dom"
import {
  EuiButton,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiTextColor,
  EuiSpacer,
} from "@elastic/eui"
import { Form, Formik, FormikHelpers } from "formik"

import {
  Accession,
  AccessionFormValues,
  create,
  get as getAccession,
  update,
} from "../lib/accession"
import { useCurrentOrganization } from "../lib/organization"
import { useExpiringState } from "../hooks"
import { TaxonField } from "../TaxonField"

interface Props {
  accession: Accession
  onSubmit: (values: AccessionFormValues) => Promise<Accession>
}

export const GeneralTab: React.FC<Props> = ({ accession, onSubmit }) => {
  const [org] = useCurrentOrganization()
  const params = useParams<{ id: string }>()
  const history = useHistory()
  const [success, setSuccess] = useExpiringState(false, 1000)
  /* const { data: accession } = useQuery(
   *   ["accession", org?.id, params.id],
   *   () => (org ? getAccession(org?.id, params.id) : undefined),
   *   {
   *     enabled: !!(org?.id && params.id),
   *     initialData: {
   *       id: -1,
   *       code: "",
   *       taxonId: -1,
   *     },
   *   },
   * ) */
  const { mutateAsync: createAccession } = useMutation((values: AccessionFormValues) =>
    create([org?.id ?? ""], values),
  )
  const { mutateAsync: updateAccession } = useMutation((values: AccessionFormValues) =>
    update([org?.id ?? "", accession?.id ?? ""], values),
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
    <>
      <EuiSpacer size="l" />
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
    </>
  )
}
