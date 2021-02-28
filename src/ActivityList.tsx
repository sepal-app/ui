import { EuiCommentList, EuiCommentProps } from "@elastic/eui"
import { useObservableEagerState } from "observable-hooks"
import React from "react"
import { useQuery } from "react-query"

import { currentOrganization$ } from "./lib/organization"
import { list as listActivity } from "./lib/activity"
import { isNotEmpty } from "./lib/observables"

export const ActivityList: React.FC = () => {
  const org = useObservableEagerState(currentOrganization$.pipe(isNotEmpty()))
  const { data: activity } = useQuery(["activity", org.id], async () => {
    return await listActivity(org.id)
  })

  const comments: EuiCommentProps[] =
    activity?.map((a) => ({
      type: "update",
      username: "",
      event: a.description,
    })) ?? []

  return <EuiCommentList comments={comments} />
}
