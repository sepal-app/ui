import React, { useState } from "react"
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
import { EMPTY, iif, of, zip } from "rxjs"
import { catchError, filter, map, mergeMap, switchMap, tap } from "rxjs/operators"
import _ from "lodash"

import Page from "./Page"
import * as UserService from "./lib/user"
import { currentUser$, currentOrganization$ } from "./lib/user"
import * as OrganizationService from "./lib/organization"
import { Organization, OrganizationFormValues } from "./lib/organization"
import { isNotEmpty } from "./lib/observables"
import { useExpiringState, useParamsObservable } from "./hooks"

export const OrganizationForm: React.FC = () => {
  console.log("OrganizationForm()")
  const params$ = useParamsObservable<{ id: string }>()
  const [success, setSuccess] = useExpiringState(false, 1000)
  const title = useObservableState(
    params$.pipe(map(({ id }) => (id ? "Edit organization" : "Create organization"))),
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
            OrganizationService.create(values),
            OrganizationService.update(id, values),
          ),
        ),
        switchMap(UserService.me),
        map((user) => {
          console.log(user)
          currentUser$.next(user)
          const org = user.organizations?.find(
            (org) => org.id === user.defaultOrganizationId,
          )
          currentOrganization$.next(org ?? user.organizations[0])
        }),
        tap(() => {
          // TODO: if we have a redirect param then go there after 1-2 seconds
          // TODO: if we're creating a new organiztion redirect to the new page with the id param
        }),
        catchError((err) => {
          // this.notificationSvc.error("Search failed.");
          console.log(err)
          return EMPTY
        }),
        tap(() => setSubmitting(false)),
        tap(() => setSuccess(true)),
        // TODO: update accession?
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
