import firebase from "firebase/app"
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
import React, { useEffect, useState } from "react"

// import { useObservableState } from "observable-hooks"
// import { EMPTY } from "rxjs"
// import { catchError, map, switchMap, tap } from "rxjs/operators"
// import { useAuth0 } from "@auth0/auth0-react"

import { useAuth } from "./lib/auth"
// import { me, currentUser$, currentOrganization$ } from "./lib/user"
//
interface LoginValues {
  email: string
  password: string
}

export const Login: React.FC = () => {
  console.log("Login()")
  // const isLoggedIn = useObservableState(isLoggedIn$)
  const history = useHistory()
  const [errorMessage, setErrorMessage] = useState("")
  const { login, user } = useAuth()
  // const { isAuthenticated, loginWithRedirect } = useAuth0()

  useEffect(() => {
    console.log("** user changed **")
    console.log(!!user)
    if (user) {
      history.push("/")
    }
  }, [user])
  // console.log(`Login.isAuthenticated: ${isAuthenticated}`)
  // if (isAuthenticated) {
  //   history.replace("/search")
  // }
  //
  // console.log("loginWithRedirect()")

  const onSubmit = async (values: LoginValues) => {
    // setErrorMessage("")
    console.log("onSubmit")
    try {
      const resp = await login(values.email, values.password)
      console.log(resp)
      history.push("/")
    } catch (e) {
      // TODO: handle error
      console.log(e)
    }
  }

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{ email: "", password: "" }}
      onSubmit={onSubmit}
    >
      {({ values, handleChange, handleSubmit }) => (
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem style={{ alignItems: "center" }}>
            <EuiForm
              style={{ padding: "2rem", minWidth: "400px" }}
              component="form"
              onSubmit={handleSubmit}
            >
              <EuiText>
                <p style={{ marginBottom: "0" }}>Welcome to</p>
                <h1 style={{ marginTop: "0" }}>Sepal</h1>
              </EuiText>
              <EuiFormRow label="Email" style={{ marginTop: "1rem" }}>
                <EuiFieldText name="email" value={values.email} onChange={handleChange} />
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
              <EuiLink href="/register" style={{ marginLeft: "20px", fontSize: "80%" }}>
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
      )}
    </Formik>
  )
}
