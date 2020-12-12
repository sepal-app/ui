import React, { useState, KeyboardEvent } from "react"
import { useQueryCache } from "react-query"
import { useHistory } from "react-router-dom"
import {
  EuiContextMenuPanel,
  EuiContextMenuItem,
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
  EuiText,
} from "@elastic/eui"
import { useObservableEagerState } from "observable-hooks"
import { isNotEmpty } from "./lib/observables"

import {
  Organization,
  currentOrganization$,
  // list as listOrganizations,
} from "./lib/organization"

interface Props {
  hideAddMenu?: boolean
  hideOrgMenu?: boolean
  hideSearch?: boolean
}

export const Navbar: React.FC<Props> = ({ hideAddMenu, hideSearch, hideOrgMenu }) => {
  const history = useHistory()
  const [query, setQuery] = useState<string | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [, setShowOrgMenu] = useState(false)
  const queryCache = useQueryCache()

  const organizations = queryCache.getQueryData<Organization[]>("organizations")

  const currentOrganization = useObservableEagerState(
    currentOrganization$.pipe(isNotEmpty()),
  )

  function renderLogo() {
    return (
      <EuiHeaderLogo
        iconType="logoKibana"
        onClick={() => history.push("/")}
        aria-label="Got to Sepal home page"
      >
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
    history.push("/logout")
  }

  function renderOrgMenu() {
    function onChange(value: number) {
      const org = organizations?.find((org) => org.id === value)
      currentOrganization$.next(org as Organization)
    }

    const options =
      organizations?.map(({ id, shortName, name }) => {
        return {
          value: id.toString(),
          inputDisplay: shortName.length ? shortName : name,
        }
      }) ?? []

    // console.log(`org id: ${currentOrganization?.id}`)

    return (
      <EuiSuperSelect
        options={options}
        valueOfSelected={currentOrganization?.id.toString() ?? ""}
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
          <EuiKeyPadMenuItem label="Settings" onClick={() => history.push("/settings")}>
            <EuiIcon type="advancedSettingsApp" size="l" />
          </EuiKeyPadMenuItem>
          <EuiKeyPadMenuItem label="Logout" onClick={() => handleLogout()}>
            <EuiIcon type="exit" size="l" />
          </EuiKeyPadMenuItem>
        </EuiKeyPadMenu>
      </EuiPopover>
    )
  }

  function renderAddMenu() {
    const button = (
      <EuiHeaderSectionItemButton
        aria-label="Add menu"
        onClick={() => setShowAddMenu(!showAddMenu)}
      >
        <EuiText>
          <span style={{ fontSize: "150%" }}>+</span>
        </EuiText>
      </EuiHeaderSectionItemButton>
    )

    const items = [
      <EuiContextMenuItem key="accession" onClick={() => history.push("/accession")}>
        Accession
      </EuiContextMenuItem>,
      <EuiContextMenuItem key="location" onClick={() => history.push("/location")}>
        Location
      </EuiContextMenuItem>,
      <EuiContextMenuItem key="taxon" onClick={() => history.push("/taxon")}>
        Taxon
      </EuiContextMenuItem>,
    ]

    return (
      <EuiPopover
        button={button}
        isOpen={showAddMenu}
        closePopover={() => setShowAddMenu(false)}
      >
        <EuiContextMenuPanel items={items} />
      </EuiPopover>
    )
  }

  return (
    <EuiHeader>
      <EuiHeaderSection>
        <EuiHeaderSectionItem border="none">{renderLogo()}</EuiHeaderSectionItem>
      </EuiHeaderSection>
      <EuiHeaderSection grow={true} style={{ justifyContent: "flex-end" }}>
        {!hideAddMenu && renderAddMenu()}
      </EuiHeaderSection>

      <EuiHeaderSection grow={true} className="Navbar--searchSection">
        {!hideSearch && renderSearch()}
      </EuiHeaderSection>

      <EuiHeaderSection side="right">
        {!hideOrgMenu && (
          <EuiHeaderSectionItem border="none">{renderOrgMenu()}</EuiHeaderSectionItem>
        )}
        <EuiHeaderSectionItem border="none">{renderUserMenu()}</EuiHeaderSectionItem>
      </EuiHeaderSection>
    </EuiHeader>
  )
}
