import React, { useState, KeyboardEvent } from "react"
import { useHistory } from "react-router-dom"
import {
  EuiHeader,
  EuiHeaderLogo,
  EuiHeaderSection,
  EuiHeaderSectionItem,
  EuiHeaderSectionItemButton,
  EuiIcon,
  EuiKeyPadMenu,
  EuiKeyPadMenuItem,
  EuiPopover,
  EuiSuperSelect,
} from "@elastic/eui"
import { useObservableState } from "observable-hooks"

import { logout } from "./lib/auth"
import { currentOrganization$, currentUser$ } from "./lib/user"
import { Organization } from "./lib/organization"

export const Navbar: React.FC = () => {
  const history = useHistory()
  const [query, setQuery] = useState()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [, setShowOrgMenu] = useState(false)
  const currentUser = useObservableState(currentUser$)
  const currentOrganization = useObservableState(currentOrganization$)

  function renderLogo() {
    return (
      <EuiHeaderLogo iconType="logoKibana" href="/" aria-label="Got to Sepal ome page">
        Sepal
      </EuiHeaderLogo>
    )
  }

  function renderSearch() {
    function handleKeyPress(event: KeyboardEvent<HTMLInputElement>) {
      if (event.key === "Enter") {
        history.push(`/search?q=${query}`)
      }
    }

    return (
      <EuiHeaderSectionItem border="none">
        <input
          type="text"
          placeholder="Search..."
          onKeyPress={handleKeyPress}
          onChange={(e) => setQuery(e.target.value)}
        />
      </EuiHeaderSectionItem>
    )
  }

  async function handleLogout() {
    setShowUserMenu(false)
    setShowOrgMenu(false)
    logout()
    history.push("/")
  }

  function renderOrgMenu() {
    let selected = currentOrganization?.id.toString()
    function onChange(value: number) {
      const org = currentUser?.organizations.find((org) => org.id === value)
      currentOrganization$.next(org as Organization)
      // setCurrentOrganization(org as Organization)
      selected = org?.id?.toString() ?? ""
    }

    const options =
      currentUser?.organizations?.map((org) => {
        return {
          value: org.id.toString(),
          inputDisplay: org.name,
        }
      }) ?? []

    return (
      <EuiSuperSelect
        options={options}
        valueOfSelected={selected}
        onChange={(value) => onChange(parseInt(value))}
      />
    )
  }

  function renderUserMenu() {
    const button = (
      <EuiHeaderSectionItemButton
        aria-label="User menu"
        onClick={() => setShowUserMenu(!showUserMenu)}
      >
        <EuiIcon type="apps" />
      </EuiHeaderSectionItemButton>
    )

    return (
      <EuiPopover
        button={button}
        isOpen={showUserMenu}
        closePopover={() => setShowUserMenu(false)}
      >
        <EuiKeyPadMenu>
          <EuiKeyPadMenuItem label="Settings" href="/settings">
            <EuiIcon type="advancedSettingsApp" size="l" />
          </EuiKeyPadMenuItem>
          <EuiKeyPadMenuItem label="Logout" onClick={() => handleLogout()}>
            <EuiIcon type="exit" size="l" />
          </EuiKeyPadMenuItem>
          {/* <EuiKeyPadMenuItem label="Dashboard" href="#">
                <EuiIcon type="dashboardApp" size="l" />
                </EuiKeyPadMenuItem> */}

          {/* <EuiKeyPadMenuItem isDisabled label="Dashboard" href="#">
                <EuiIcon type="dashboardApp" size="l" />
                </EuiKeyPadMenuItem> */}
        </EuiKeyPadMenu>
      </EuiPopover>
    )
  }

  return (
    <EuiHeader>
      <EuiHeaderSection>
        <EuiHeaderSectionItem border="none">{renderLogo()}</EuiHeaderSectionItem>
      </EuiHeaderSection>

      <EuiHeaderSection grow={true} className="Navbar--searchSection">
        {renderSearch()}
      </EuiHeaderSection>

      <EuiHeaderSection side="right">
        <EuiHeaderSectionItem border="none">{renderOrgMenu()}</EuiHeaderSectionItem>
        <EuiHeaderSectionItem border="none">{renderUserMenu()}</EuiHeaderSectionItem>
      </EuiHeaderSection>
    </EuiHeader>
  )
}
