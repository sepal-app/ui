import React, { useEffect } from "react"
import { EuiButton, EuiFieldText, EuiForm, EuiFormRow, EuiTextColor } from "@elastic/eui"
import { Form, Formik, FormikHelpers } from "formik"
import { useObservable, useObservableState } from "observable-hooks"
import { useHistory } from "react-router-dom"
import { EMPTY, iif, zip } from "rxjs"
import { catchError, filter, mergeMap, switchMap, tap } from "rxjs/operators"

import Page from "./Page"
import * as LocationService from "./lib/location"
import { LocationFormValues } from "./lib/location"
import { currentOrganization$ } from "./lib/user"
import { isNotEmpty } from "./lib/observables"
import { useExpiringState, useParamsObservable, useSearchParams } from "./hooks"

export const LocationForm: React.FC = () => {
  const params$ = useParamsObservable<{ id: string; success: string }>()
  const [success, setSuccess] = useExpiringState(false, 3000)
  const history = useHistory()
  const searchParams = useSearchParams()

  useEffect(() => {
    const successParam = searchParams.has("success")
    setSuccess(successParam)
  }, [searchParams, setSuccess])

  const org$ = useObservable(() => currentOrganization$.pipe(isNotEmpty()))
  const [location] = useObservableState(() =>
    zip(params$, org$).pipe(
      filter(([{ id }]) => !!id),
      switchMap(([{ id }, org]) => LocationService.get(org.id, id, {})),
    ),
  )

  function handleSubmit(
    values: LocationFormValues,
    { setSubmitting }: FormikHelpers<LocationFormValues>,
  ) {
    zip(params$, org$)
      .pipe(
        mergeMap(([{ id }, org]) =>
          iif(
            () => !id,
            LocationService.create(org.id, values),
            LocationService.update(org.id, id, values),
          ),
        ),
        catchError((err) => {
          // this.notificationSvc.error("Search failed.");
          console.log(err)
          return EMPTY
        }),
        tap(({ id }) => {
          if (id) {
            history.push(`/location/${id}?success=true`)
          } else {
            setSubmitting(false)
            setSuccess(true)
          }
        }),
      )
      .subscribe()
  }

  return (
    <Page
      contentTitle={location?.name ? `Location - ${location.name}` : "Create a location"}
    >
      <Formik
        enableReinitialize={true}
        onSubmit={handleSubmit}
        initialValues={location ?? { code: "", name: "", description: "" }}
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
