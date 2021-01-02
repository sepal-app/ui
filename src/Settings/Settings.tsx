import React, { useState } from "react"
import { EuiFlexGroup, EuiFlexItem, EuiTab } from "@elastic/eui"

import Page from "../Page"
import { ProfileSettings } from "./ProfileSettings"
import { OrganizationSettings } from "./OrganizationSettings"

export const Settings: React.FC = () => {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0)
  const tabs = [
    {
      id: "profile",
      name: "Profile",
      disabled: false,
      content: <ProfileSettings />,
    },
    {
      id: "organizations",
      name: "Organizations",
      disabled: false,
      content: <OrganizationSettings />,
    },
  ]

  const renderTabs = () => {
    return tabs.map((tab, index) => (
      <EuiTab
        onClick={() => setSelectedTabIndex(index)}
        isSelected={index === selectedTabIndex}
        disabled={tab.disabled}
        key={index}
      >
        {tab.name}
      </EuiTab>
    ))
  }

  return (
    <Page pageTitle="Settings">
      <EuiFlexGroup gutterSize="xl">
        <EuiFlexItem grow={false}>{renderTabs()}</EuiFlexItem>
        <EuiFlexItem>{tabs[selectedTabIndex].content}</EuiFlexItem>
      </EuiFlexGroup>
    </Page>
  )
}
