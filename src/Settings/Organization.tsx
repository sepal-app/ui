import { EuiBasicTable, EuiTitle } from "@elastic/eui"
import React from "react"
import { useQuery } from "react-query"
import { useObservableEagerState } from "observable-hooks"
import { isNotEmpty } from "../lib/observables"
import { users as getOrgUsers, currentOrganization$ } from "../lib/organization"

export const Organization: React.FC = () => {
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
      <EuiTitle size="m">
        <h2>Organization</h2>
      </EuiTitle>
      <EuiTitle size="m">
        <h3>Members</h3>
      </EuiTitle>
      {users && <EuiBasicTable items={users} columns={columns} />}
    </>
  )
}
