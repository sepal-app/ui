import omit from "lodash/omit"
import React from "react"
import { useMutation, useQuery } from "react-query"
import { EuiButton, EuiFieldText, EuiForm, EuiFormRow, EuiTextColor } from "@elastic/eui"
import { Form, Formik, FormikHelpers } from "formik"
import { useHistory, useParams } from "react-router-dom"

import Page from "./Page"
import {
  Location,
  LocationFormValues,
  create,
  get as getLocation,
  update,
} from "./lib/location"
import { useCurrentOrganization } from "./lib/organization"
import { useExpiringState } from "./hooks"

export const LocationForm: React.FC = () => {
  const [org] = useCurrentOrganization()
  const [success, setSuccess] = useExpiringState(false, 3000)
  const history = useHistory()
  const params = useParams<{ id: string }>()
  const { data: location } = useQuery(
    ["location", org?.id, params.id],
    () => getLocation([org.id, params.id]),
    {
      enabled: !!(org.id && params.id),
      initialData: {
        id: "",
        name: "",
        code: "",
        description: "",
      },
    },
  )
  const { mutateAsync: createLocation } = useMutation((values: LocationFormValues) =>
    create([org?.id ?? ""], values),
  )
  const { mutateAsync: updateLocation } = useMutation((values: LocationFormValues) =>
    update([org?.id ?? "", location?.id ?? ""], values),
  )

  // useEffect(() => {
  //   const successParam = searchParams.has("success")
  //   setSuccess(successParam)
  // }, [searchParams, setSuccess])
  //

  const handleSubmit = async (
    values: LocationFormValues,
    { setSubmitting }: FormikHelpers<LocationFormValues>,
  ) => {
    const save = params.id
      ? updateLocation(values)
      : createLocation(values).then((loc) => {
          if (loc?.id) {
            history.push(`/location/${loc.id}`)
            history.goForward()
          }
          return loc
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
      contentTitle={location?.name ? `Location - ${location.name}` : "Create a location"}
    >
      <Formik<LocationFormValues>
        enableReinitialize={true}
        onSubmit={handleSubmit}
        initialValues={omit(location, ["id"]) as Location}
      >
        {({ values, handleChange }) => (
          <Form>
            <EuiForm>
              <EuiFormRow label="Name">
                <EuiFieldText
                  name="name"
                  onChange={handleChange}
                  value={values.name || ""}
                />
              </EuiFormRow>
              <EuiFormRow label="Code">
                <EuiFieldText
                  name="code"
                  onChange={handleChange}
                  value={values.code || ""}
                />
              </EuiFormRow>
              <EuiFormRow label="Description">
                <EuiFieldText
                  name="description"
                  onChange={handleChange}
                  value={values.description || ""}
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
