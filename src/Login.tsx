import { useForm } from "react-hook-form"
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
import React, { useEffect } from "react"

import { useAuth } from "./lib/auth"
import { useFieldErrorMessages } from "./lib/validation"

interface FormValues {
  email: string
  password: string
}

export const Login: React.FC = () => {
  const history = useHistory()
  const { login, user } = useAuth()

  const {
    errors,
    formState: { isSubmitting, isValid },
    handleSubmit,
    register,
    setError,
  } = useForm<FormValues>({
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  })

  useEffect(() => {
    if (user) {
      history.push("/")
    }
  }, [user])

  const getFieldErrorMessage = useFieldErrorMessages(
    {
      email: {
        "auth/invalid-email": "Invalid email",
        "auth/user-not-found": "User not found",
        required: "Required",
      },
      password: {
        "auth/wrong-password": "Wrong password",
        required: "Required",
      },
    },
    errors,
  )

  const onSubmit = async (values: FormValues) => {
    try {
      const resp = await login(values.email, values.password)
      console.log(resp)
      history.push("/")
    } catch (e) {
      // TODO: handle more firebase error codes
      console.log(e)
      if (e.code) {
        const field = e.code === "auth/wrong-password" ? "password" : "email"
        setError(field, {
          type: e.code,
          shouldFocus: true,
        })
      } else {
        setError("email", {
          type: "auth/unknown",
          shouldFocus: true,
        })
      }
    }
  }

  return (
    <EuiFlexGroup alignItems="center">
      <EuiFlexItem style={{ alignItems: "center" }}>
        <EuiForm
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          style={{ padding: "2rem", minWidth: "400px" }}
        >
          <EuiText>
            <p style={{ marginBottom: "0" }}>Welcome to</p>
            <h1 style={{ marginTop: "0" }}>Sepal</h1>
          </EuiText>
          <EuiFormRow
            error={getFieldErrorMessage("email")}
            isInvalid={!!errors.email}
            label="Email"
            style={{ marginTop: "1rem" }}
          >
            <EuiFieldText
              name="email"
              inputRef={register({ required: true, validate: () => true })}
              isInvalid={!!errors.email}
            />
          </EuiFormRow>
          <EuiFormRow
            error={getFieldErrorMessage("password")}
            isInvalid={!!errors.password}
            label="Password"
          >
            <EuiFieldPassword
              name="password"
              inputRef={register({ required: true, validate: () => true })}
              isInvalid={!!errors.password}
            />
          </EuiFormRow>
          <EuiSpacer />
          <EuiButton type="submit" fill isLoading={isSubmitting} isDisabled={!isValid}>
            Sign In
          </EuiButton>
          <EuiLink href="/register" style={{ marginLeft: "20px", fontSize: "80%" }}>
            Don't have an account?
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
  )
}
