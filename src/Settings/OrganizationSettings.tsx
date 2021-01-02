import {
  EuiBasicTable,
  EuiButton,
  EuiButtonEmpty,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiSpacer,
  EuiText,
  EuiTextColor,
} from "@elastic/eui"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQuery } from "react-query"
import { useObservableEagerState } from "observable-hooks"
import { useExpiringState } from "../hooks"
import { isNotEmpty } from "../lib/observables"
import {
  Organization,
  OrganizationFormValues,
  currentOrganization$,
  invite,
  users as getOrgUsers,
  update as updateOrganization,
} from "../lib/organization"
import { InviteModal } from "../InviteModal/InviteModal"

export const OrganizationSettings: React.FC = () => {
  const [inviteModalVisible, setInviteModalVisible] = useState(false)

  const [success, setSuccess] = useExpiringState(false, 1000)
  const {
    errors,
    formState: { isSubmitting, isValid },
    handleSubmit,
    register,
    reset,
  } = useForm<OrganizationFormValues>({
    defaultValues: { name: "", shortName: "", abbreviation: "" },
    mode: "onTouched",
  })
  const org = useObservableEagerState(currentOrganization$.pipe(isNotEmpty()))

  useEffect(() => {
    reset(org)
  }, [org])

  const { data: users } = useQuery(["org", org?.id, "users"], () => getOrgUsers(org.id), {
    enabled: !!org.id,
  })

  const {
    mutateAsync: saveOrganization,
  } = useMutation((values: OrganizationFormValues) =>
    updateOrganization(org?.id ?? -1, values),
  )

  const columns = [
    {
      field: "profile.email",
      name: "Email",
      sortable: true,
    },
    {
      field: "role",
      name: "Role",
      sortable: true,
    },
  ]

  const onSubmit = async (values: OrganizationFormValues) => {
    console.log(values)
    try {
      const org = await saveOrganization(values)
      currentOrganization$.next(org as Organization)
    } catch (e) {
      // TODO: handle error
    } finally {
      setSuccess(true)
    }
  }

  return (
    <>
      <EuiText size="m">
        <h2>{org.name}</h2>
      </EuiText>

      <EuiSpacer size="xl" />

      <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
        <EuiFormRow label="Full name">
          <EuiFieldText
            name="name"
            inputRef={register({ validate: () => true })}
            isInvalid={!!errors.name}
          />
        </EuiFormRow>
        <EuiFormRow label="Short name">
          <EuiFieldText
            name="shortName"
            inputRef={register({ validate: () => true })}
            isInvalid={!!errors.shortName}
          />
        </EuiFormRow>
        <EuiFormRow label="Abbreviation">
          <EuiFieldText
            name="abbreviation"
            inputRef={register({ validate: () => true })}
            isInvalid={!!errors.abbreviation}
          />
        </EuiFormRow>
        <div style={{ marginTop: "20px" }}>
          <EuiButton type="submit" fill isLoading={isSubmitting} isDisabled={!isValid}>
            Save
          </EuiButton>
          {success && (
            <EuiTextColor color="secondary" style={{ marginLeft: "20px" }}>
              Success!
            </EuiTextColor>
          )}
        </div>
      </EuiForm>

      <EuiSpacer size="xl" />

      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <EuiText>
            <h3>Members</h3>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={true}>
          <div>
            <EuiButtonEmpty size="l" onClick={() => setInviteModalVisible(true)}>
              Invite
            </EuiButtonEmpty>
          </div>
        </EuiFlexItem>
      </EuiFlexGroup>
      {users && <EuiBasicTable items={users} columns={columns} />}
      {inviteModalVisible && (
        <InviteModal
          visible={inviteModalVisible}
          onClose={() => setInviteModalVisible(false)}
          orgId={org.id}
        />
      )}
    </>
  )
}
