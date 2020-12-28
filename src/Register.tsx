import React from "react"
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
import { signup } from "./lib/auth"
import { accept as accept_invitation } from "./lib/invitation"
import { useInitUser, useSearchParams } from "./hooks"
import { emailRx, useFieldErrorMessages } from "./lib/validation"

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
  const initUser = useInitUser()
  const {
    errors,
    formState: { isSubmitting, isValid },
    getValues,
    handleSubmit,
    register,
    setError,
  } = useForm<FormValues>({
    defaultValues: { email: "", password: "", confirmPassword: "" },
    mode: "onChange",
  })

  const getFieldErrorMessage = useFieldErrorMessages(
    {
      email: {
        pattern: "Invalid email",
        "auth/email-already-in-use": "Email address already in use",
      },
      password: {
        minLength: "The password must be at least 8 characters long",
        required: "Required",
      },
      confirmPassword: {
        default: "Should match the password",
      },
    },
    errors,
  )

  const onSubmit = async (values: FormValues) => {
    try {
      const { user } = await signup(values.email, values.password)
      if (invitation && user) {
        await accept_invitation(invitation)
        // TODO: prefetch the organizations and set the current organization
        await initUser(user)
      }
      history.push("/")
    } catch (e) {
      // TODO: handle more firebase error codes
      console.log(e)
      if (e.code === "auth/email-already-in-use") {
        setError("email", {
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
          style={{ padding: "2rem", minWidth: "400px" }}
          component="form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <EuiText>
            <h2 style={{ marginBottom: "0" }}>Create an account</h2>
          </EuiText>

          <EuiText>{!!errors.confirmPassword?.message}</EuiText>
          <EuiFormRow
            error={getFieldErrorMessage("email")}
            isInvalid={!!errors.email}
            label="Email"
          >
            <EuiFieldText
              name="email"
              inputRef={register({
                required: true,
                pattern: emailRx,
              })}
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
              inputRef={register({
                minLength: 8,
                required: true,
              })}
              isInvalid={!!errors.password}
            />
          </EuiFormRow>
          <EuiFormRow
            error={getFieldErrorMessage("confirmPassword")}
            isInvalid={!!errors.confirmPassword}
            label="Confirm password"
          >
            <EuiFieldPassword
              name="confirmPassword"
              inputRef={register({
                validate: (value) => value === getValues("password"),
                required: true,
              })}
              isInvalid={!!errors.confirmPassword}
            />
          </EuiFormRow>
          <EuiSpacer />
          <EuiButton type="submit" fill isLoading={isSubmitting} isDisabled={!isValid}>
            Signup
          </EuiButton>
          <EuiLink href="/login" style={{ marginLeft: "20px", fontSize: "80%" }}>
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
  )
}
