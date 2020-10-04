import React from "react"
import { EuiButton, EuiFieldText, EuiForm, EuiFormRow, EuiTextColor } from "@elastic/eui"
import { Form, Formik, FormikHelpers } from "formik"
import { useObservableState } from "observable-hooks"
import { EMPTY, iif } from "rxjs"
import { catchError, filter, map, mergeMap, switchMap, tap } from "rxjs/operators"

import Page from "./Page"
import { currentOrganization$, organizations$ } from "./lib/user"
import * as OrganizationService from "./lib/organization"
import { OrganizationFormValues } from "./lib/organization"
import { useExpiringState, useParamsObservable } from "./hooks"

export const OrganizationForm: React.FC = () => {
  console.log("OrganizationForm()")
  const params$ = useParamsObservable<{ id: string }>()
  const [success, setSuccess] = useExpiringState(false, 1000)
  const title = useObservableState(
    params$.pipe(map(({ id }) => (id ? "Edit organization" : "Create an organization"))),
  )
  const organization = useObservableState(
    params$.pipe(
      filter(({ id }) => !!id),
      switchMap(({ id }) =>
        OrganizationService.get(id, {
          expand: ["users"],
        }),
      ),
    ),
  )

  function handleSubmit(
    values: OrganizationFormValues,
    { setSubmitting }: FormikHelpers<OrganizationFormValues>,
  ) {
    params$
      .pipe(
        mergeMap(({ id }) =>
          iif(
            () => !id,
            OrganizationService.create(values).pipe(
              map((org) => {
                // set as current org and update list of user's organizations
                currentOrganization$.next(org)
                const orgs = [...organizations$.value, org]
                organizations$.next(orgs)
                // TODO: if has a redirect param then follow
              }),
            ),
            OrganizationService.update(id, values),
          ),
        ),
        catchError((err) => {
          // this.notificationSvc.error("Search failed.");
          console.log(err)
          return EMPTY
        }),
        tap(() => setSubmitting(false)),
        tap(() => setSuccess(true)),
      )
      .subscribe()
  }

  return (
    <Page contentTitle={title} navbarOptions={{ hideSearch: true, hideOrgMenu: true }}>
      <Formik
        enableReinitialize={true}
        onSubmit={handleSubmit}
        initialValues={organization ?? { name: "", shortName: "", abbreviation: "" }}
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
