import { EuiCommentList, EuiCommentProps } from "@elastic/eui"
import React from "react"
import { useQuery } from "react-query"

import { useCurrentOrganization } from "./lib/organization"
import { list as listActivity } from "./lib/activity"

export const ActivityList: React.FC = () => {
  const [org] = useCurrentOrganization()
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
