import React, { useState } from "react"
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
import { catchError, map, switchMap, tap } from "rxjs/operators"

import { login, isLoggedIn$ } from "./lib/auth"
import { me, currentUser$, currentOrganization$ } from "./lib/user"

interface LoginValues {
  username: string
  password: string
}

export const Login: React.FC = () => {
  const isLoggedIn = useObservableState(isLoggedIn$)
  const history = useHistory()
  const [errorMessage, setErrorMessage] = useState("")

  if (isLoggedIn) {
    history.replace("/search")
  }

  function handleSubmit(values: LoginValues) {
    setErrorMessage("")
    login(values.username, values.password)
      .pipe(
        switchMap(me),
        map((user) => {
          currentUser$.next(user)
          const org = user.organizations?.find(
            (org) => org.id === user.defaultOrganizationId,
          )
          currentOrganization$.next(org ?? user.organizations[0])
        }),
        catchError((e) => {
          if (e.status === 401 || e.status === 400) {
            setErrorMessage("Invalid login")
          } else {
            setErrorMessage("Unknown error")
          }
          return EMPTY
        }),
      )
      .subscribe()
  }

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{ username: "", password: "" }}
      onSubmit={handleSubmit}
    >
      {({ values, handleChange }) => (
        <Form>
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem style={{ alignItems: "center" }}>
              <EuiForm style={{ padding: "2rem", minWidth: "400px" }} component="form">
                <EuiText>
                  <p style={{ marginBottom: "0" }}>Welcome to</p>
                  <h1 style={{ marginTop: "0" }}>Sepal</h1>
                </EuiText>
                <EuiFormRow label="User" style={{ marginTop: "1rem" }}>
                  <EuiFieldText
                    name="username"
                    value={values.username}
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
                <EuiSpacer />
                <EuiButton type="submit" fill>
                  Sign In
                </EuiButton>
                <EuiLink href="/signup" style={{ marginLeft: "20px", fontSize: "80%" }}>
                  Don't have an account?
                </EuiLink>
                {errorMessage && (
                  <div>
                    <EuiText color="danger">{errorMessage}</EuiText>
                  </div>
                )}
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
