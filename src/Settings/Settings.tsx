import React, { useState } from "react"
import { EuiFlexGroup, EuiFlexItem, EuiSideNav } from "@elastic/eui"

import Page from "../Page"
import { Profile } from "./Profile"

export const Settings: React.FC = () => {
  const [selectedId, setSelectedId] = useState(0)
  // const [activeComponent, setActiveComponent] = useState()

  const items = [
    {
      name: "Profile",
      component: <Profile />,
    },
    {
      name: "Organization",
      component: <Profile />,
    },
  ]

  const sideNav = [
    {
      name: "",
      id: -1,
      items: items.map(({ name, component }, i) => ({
        id: i,
        name,
        // onClick: () => setActiveComponent(component),
        onClick: () => setSelectedId(i),
        isSelected: selectedId === i,
      })),
    },
  ]

  return (
    <Page>
      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <EuiSideNav
            mobileTitle="Navigate within $APP_NAME"
            style={{ width: 192 }}
            items={sideNav}
          />
        </EuiFlexItem>
        <EuiFlexItem>{items[0].component}</EuiFlexItem>
      </EuiFlexGroup>
    </Page>
  )
}
