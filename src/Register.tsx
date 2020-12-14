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
import { Formik } from "formik"
import { signup } from "./lib/auth"
import { accept as accept_invitation } from "./lib/invitation"
import { useSearchParams } from "./hooks"

interface FormValues {
  email: string
  password: string
  confirmPassword: string
}
export const Register: React.FC = () => {
  const history = useHistory()
  const searchParams = useSearchParams()
  // TODO: if we have the email we can prefill the email field
  const invitation = searchParams.get("invitation")

  const onSubmit = async (values: FormValues) => {
    try {
      await signup(values.email, values.password)
      if (invitation) {
        await accept_invitation(invitation)
      }
      history.push("/")
    } catch (e) {
      // TODO
      console.log(e)
    }
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
                <h2 style={{ marginBottom: "0" }}>Create an account</h2>
              </EuiText>
              {false && (
                <EuiFormRow label="Username" style={{ marginTop: "1rem" }}>
                  <EuiFieldText
                    name="username"
                    value={values.username}
                    onChange={handleChange}
                  />
                </EuiFormRow>
              )}
              <EuiFormRow label="Email">
                <EuiFieldText name="email" value={values.email} onChange={handleChange} />
              </EuiFormRow>
              {false && (
                <>
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
                </>
              )}
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
      )}
    </Formik>
  )
}
