import React, { useState } from "react"
import { EuiFlexGroup, EuiFlexItem, EuiSideNav } from "@elastic/eui"

import Page from "../Page"
import { Profile } from "./Profile"
import { Organization } from "./Organization"

export const Settings: React.FC = () => {
  const [selectedId, setSelectedId] = useState(0)
  // const [activeComponent, setActiveComponent] = useState()

  const items = [
    {
      title: "Profile",
      component: <Profile />,
    },
    {
      title: "Organization",
      component: <Organization />,
    },
  ]

  const sideNav = [
    {
      name: "",
      id: -1,
      items: items.map(({ component, title }, i) => ({
        id: i,
        name: title,
        // onClick: () => setActiveComponent(component),
        onClick: () => setSelectedId(i),
        isSelected: selectedId === i,
      })),
    },
  ]

  return (
    <Page pageTitle="Settings">
      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <EuiSideNav
            mobileTitle="Navigate within $APP_NAME"
            style={{ width: 192 }}
            items={sideNav}
          />
        </EuiFlexItem>
        <EuiFlexItem>{items[selectedId].component}</EuiFlexItem>
      </EuiFlexGroup>
    </Page>
  )
}
