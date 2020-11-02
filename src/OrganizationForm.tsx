import omit from "lodash/omit"
import React from "react"
import { useMutation, useQuery } from "react-query"
import { useHistory, useParams } from "react-router-dom"
import { EuiButton, EuiFieldText, EuiForm, EuiFormRow, EuiTextColor } from "@elastic/eui"
import { Form, Formik, FormikHelpers } from "formik"

import Page from "./Page"
import {
  Organization,
  OrganizationFormValues,
  create,
  currentOrganization$,
  get as getOrganization,
  update,
} from "./lib/organization"
import { useExpiringState, useSearchParams } from "./hooks"

export const OrganizationForm: React.FC = () => {
  const params = useParams<{ id: string }>()
  const [success, setSuccess] = useExpiringState(false, 1000)
  const searchParams = useSearchParams()
  // const id = searchParams.get("id")
  const title = params.id ? "Edit organization" : "Create an organization"

  const { data: organization } = useQuery(["organization", params.id], getOrganization, {
    enabled: params.id,
    initialData: {
      id: -1,
      name: "",
      shortName: "",
      abbreviation: "",
    },
    initialStale: true,
  })
  const [createOrganization] = useMutation((values: OrganizationFormValues) =>
    create(values),
  )
  const [updateOrganization] = useMutation((values: OrganizationFormValues) =>
    update(organization?.id ?? -1, values),
  )

  const handleSubmit = async (
    values: OrganizationFormValues,
    { setSubmitting }: FormikHelpers<OrganizationFormValues>,
  ) => {
    const save = params.id
      ? updateOrganization(values)
      : createOrganization(values).then((org) => {
          currentOrganization$.next(org as Organization)
          // TODO: if has a redirect param then follow
          // if (acc?.id) {
          //   history.push(`/organization/${acc.id}`)
          //   history.goForward()
          // }
          // return acc
          return org
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
    <Page
      contentTitle={title}
      navbarOptions={{ hideAddMenu: true, hideOrgMenu: true, hideSearch: true }}
    >
      <Formik<OrganizationFormValues>
        enableReinitialize={true}
        onSubmit={handleSubmit}
        initialValues={omit(organization, ["id"]) as Organization}
      >
        {({ values, handleChange }) => (
          <Form>
            <EuiForm>
              <EuiFormRow label="Full name">
                <EuiFieldText name="name" onChange={handleChange} value={values.name} />
              </EuiFormRow>
              <EuiFormRow label="Short name">
                <EuiFieldText
                  name="shortName"
                  onChange={handleChange}
                  value={values.shortName}
                />
              </EuiFormRow>
              <EuiFormRow label="Abbreviation">
                <EuiFieldText
                  name="abbreviation"
                  onChange={handleChange}
                  value={values.abbreviation}
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
