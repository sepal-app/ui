import React from "react"

import Page from "./Page"
import { ActivityList } from "./ActivityList"

export const Home: React.FC = () => {
  return (
    <Page contentTitle="Recent Activity">
      <ActivityList />
    </Page>
  )
}
