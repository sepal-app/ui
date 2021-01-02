import {
  EuiButton,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiSpacer,
  EuiTitle,
} from "@elastic/eui"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQuery } from "react-query"
import { useAuth } from "../lib/auth"
import {
  ProfileUpdateValues,
  get as getProfile,
  update as updateProfile,
} from "../lib/profile"
import { useFieldErrorMessages } from "../lib/validation"

export const ProfileSettings: React.FC = () => {
  const { sendPasswordResetEmail, user } = useAuth()
  const [resettingPassword, setResettingPassword] = useState(false)
  const { data: profile } = useQuery(["profile"], getProfile, {})
  const { mutateAsync: saveProfile } = useMutation(updateProfile)
  const {
    errors,
    formState: { isSubmitting, isValid },
    handleSubmit,
    register,
    reset,
  } = useForm<ProfileUpdateValues>({
    defaultValues: { name: "", phoneNumber: "" },
    mode: "onTouched",
  })

  const getFieldErrorMessage = useFieldErrorMessages({}, errors)
  useEffect(() => {
    reset(profile)
  }, [profile])

  const onSubmit = async (values: ProfileUpdateValues) => {
    try {
      await saveProfile(values)
    } catch (e) {
      // TODO: handle error
    }
  }

  const resetPassword = async () => {
    if (!user?.email) {
      return null
    }

    try {
      setResettingPassword(true)
      await sendPasswordResetEmail(user.email)
    } finally {
      setResettingPassword(false)
    }
  }

  if (!user?.email) {
    return null
  }

  return (
    <>
      <EuiTitle size="m">
        <h2>Profile</h2>
      </EuiTitle>

      <EuiSpacer size="xl" />

      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <EuiButton
            color="secondary"
            isLoading={resettingPassword}
            onClick={resetPassword}
            size="s"
          >
            Reset Password
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
            <EuiFormRow
              error={getFieldErrorMessage("name")}
              isInvalid={!!errors.name}
              label="Name"
              style={{ marginTop: "1rem" }}
            >
              <EuiFieldText
                name="name"
                inputRef={register({ validate: () => true })}
                isInvalid={!!errors.name}
              />
            </EuiFormRow>
            <EuiFormRow
              error={getFieldErrorMessage("phoneNumber")}
              isInvalid={!!errors.phoneNumber}
              label="Phone Number"
              style={{ marginTop: "1rem" }}
            >
              <EuiFieldText
                name="phoneNumber"
                inputRef={register({ validate: () => true })}
                isInvalid={!!errors.phoneNumber}
              />
            </EuiFormRow>
            <EuiSpacer />
            <EuiButton type="submit" fill isLoading={isSubmitting} isDisabled={!isValid}>
              Save
            </EuiButton>
          </EuiForm>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  )
}
