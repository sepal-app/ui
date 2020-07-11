import React from "react"
import { useHistory } from "react-router-dom"
import {
  EuiButton,
  EuiFieldPassword,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiLink,
  EuiSpacer,
  EuiText,
} from "@elastic/eui"
import { Form, Formik } from "formik"
import { useObservableState } from "observable-hooks"
import { EMPTY } from "rxjs"
import { catchError, map, switchMap } from "rxjs/operators"

import * as UserService from "./lib/user"
import { User, UserCreateFormValues } from "./lib/user"
import { login, isLoggedIn$ } from "./lib/auth"
import { me, currentUser$, currentOrganization$ } from "./lib/user"

export const Signup: React.FC = () => {
  const isLoggedIn = useObservableState(isLoggedIn$)
  const history = useHistory()

  if (isLoggedIn) {
    history.replace("/")
  }

  function handleSubmit(values: UserCreateFormValues) {
    UserService.create(values)
      .pipe(
        map((user) => currentUser$.next(user)),
        map(() => history.replace("/")),
        // TODO: redirect to create new organization page
        catchError((e) => {
          // TODO: handle error
          console.log(e)
          return EMPTY
        }),
      )
      .subscribe((r) => console.log(r))
  }

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        username: "",
        email: "",
        firstName: "",
        lastName: "",
        password: "",
        confirmPassword: "",
      }}
      onSubmit={handleSubmit}
    >
      {({ values, handleChange }) => (
        <Form>
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem style={{ alignItems: "center" }}>
              <EuiForm style={{ padding: "2rem", minWidth: "400px" }} component="form">
                <EuiText>
                  <h2 style={{ marginBottom: "0" }}>Create an account</h2>
                </EuiText>
                <EuiFormRow label="Username" style={{ marginTop: "1rem" }}>
                  <EuiFieldText
                    name="username"
                    value={values.username}
                    onChange={handleChange}
                  />
                </EuiFormRow>
                <EuiFormRow label="Email">
                  <EuiFieldText
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                  />
                </EuiFormRow>
                <EuiFormRow label="First name">
                  <EuiFieldText
                    name="firstName"
                    value={values.firstName}
                    onChange={handleChange}
                  />
                </EuiFormRow>
                <EuiFormRow label="Last name">
                  <EuiFieldText
                    name="lastName"
                    value={values.lastName}
                    onChange={handleChange}
                  />
                </EuiFormRow>
                <EuiFormRow label="Password">
                  <EuiFieldPassword
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                  />
                </EuiFormRow>
                <EuiFormRow label="Confirm password">
                  <EuiFieldPassword
                    name="confirmPassword"
                    value={values.confirmPassword}
                    onChange={handleChange}
                  />
                </EuiFormRow>
                <EuiSpacer />
                <EuiButton type="submit" fill>
                  Signup
                </EuiButton>
                <EuiLink href="/signup" style={{ marginLeft: "20px", fontSize: "80%" }}>
                  Already have an account?
                </EuiLink>
              </EuiForm>
            </EuiFlexItem>
            <EuiFlexItem grow={2}>
              <div className="Login--splash-img" style={{ minHeight: "100vh" }}>
                {" "}
                &nbsp;
              </div>
            </EuiFlexItem>
          </EuiFlexGroup>
        </Form>
      )}
    </Formik>
  )
}
