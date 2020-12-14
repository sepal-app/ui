import {
  EuiBasicTable,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
} from "@elastic/eui"
import React, { useState } from "react"
import { useMutation, useQuery } from "react-query"
import { useObservableEagerState } from "observable-hooks"
import { isNotEmpty } from "../lib/observables"
import { currentOrganization$, invite, users as getOrgUsers } from "../lib/organization"
import { InviteModal } from "../InviteModal/InviteModal"

export const Organization: React.FC = () => {
  const [inviteModalVisible, setInviteModalVisible] = useState(false)
  const org = useObservableEagerState(currentOrganization$.pipe(isNotEmpty()))

  const { data: users } = useQuery(["org", org?.id], getOrgUsers, {
    enabled: org.id,
    // initialData: {
    //   id: -1,
    //   code: "",
    //   taxonId: -1,
    // },
    // initialStale: true,
  })

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

  return (
    <>
      <EuiText>
        <h2>{org.name}</h2>
      </EuiText>
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
