import omit from "lodash/omit"
import React, { useCallback, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { useHistory, useParams } from "react-router-dom"
import { EuiButton, EuiFieldText, EuiForm, EuiFormRow, EuiTextColor } from "@elastic/eui"
import { Formik, FormikHelpers } from "formik"

import Page from "./Page"
import {
  Organization,
  OrganizationFormValues,
  create,
  get as getOrganization,
  list as listOrganizations,
  update,
  useCurrentOrganization,
} from "./lib/organization"
import { useExpiringState, useSearchParams } from "./hooks"

export const OrganizationForm: React.FC = () => {
  const [_, setCurrentOrganization] = useCurrentOrganization()
  const params = useParams<{ id: string }>()
  const [success, setSuccess] = useExpiringState(false, 1000)
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect")
  const title = params.id ? "Edit organization" : "Create an organization"
  const history = useHistory()
  const queryClient = useQueryClient()
  const prefetchOrganizations = useCallback(async () => {
    await queryClient.prefetchQuery("organizations", listOrganizations)
  }, [queryClient])
  const [submitting, setSubmitting] = useState(false)

  const { data: organization, error: organizationError } = useQuery(
    ["organization", params.id],
    () => getOrganization(params.id),
    {
      enabled: !!params.id,
      initialData: {
        id: -1,
        name: "",
        shortName: "",
        abbreviation: "",
      },
    },
  )

  const {
    mutateAsync: createOrganization,
  } = useMutation((values: OrganizationFormValues) => create(values))
  const {
    mutateAsync: updateOrganization,
  } = useMutation((values: OrganizationFormValues) =>
    update(organization?.id ?? -1, values),
  )

  const onSubmit = async (
    values: OrganizationFormValues,
    { setSubmitting }: FormikHelpers<OrganizationFormValues>,
  ) => {
    const save = params.id ? updateOrganization(values) : createOrganization(values)

    try {
      const org = await save
      await prefetchOrganizations()
      setCurrentOrganization(org)
      setSuccess(true)
      if (redirect) {
        history.push(redirect)
      }
    } catch (e) {
      console.log(e)
    } finally {
      if (!redirect) {
        // don't try to set the state if we're redirecting since this component
        // might have been unmounted at this point
        setSubmitting(false)
      }
    }
  }

  return (
    <Page
      contentTitle={title}
      navbarOptions={{ hideAddMenu: true, hideOrgMenu: true, hideSearch: true }}
    >
      <Formik<OrganizationFormValues>
        enableReinitialize={true}
        onSubmit={onSubmit}
        initialValues={omit(organization, ["id"]) as Organization}
      >
        {({ values, handleChange, handleSubmit }) => (
          <EuiForm component="form" onSubmit={handleSubmit}>
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
        )}
      </Formik>
    </Page>
  )
}
