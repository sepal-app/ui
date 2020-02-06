import React, { useEffect, useState, KeyboardEvent } from "react";
import { useHistory } from "react-router-dom";
import {
  EuiHeader,
  EuiHeaderLogo,
  EuiHeaderSection,
  EuiHeaderSectionItem,
  EuiHeaderSectionItemButton,
  EuiIcon,
  EuiKeyPadMenu,
  EuiKeyPadMenuItem,
  EuiKeyPadMenuItemButton,
  EuiPopover,
  EuiSuperSelect
} from "@elastic/eui";

import * as api from "./lib/api";
import { Organization } from "./lib/organization";
import { useCurrentOrganization, useCurrentUser } from "./lib/user";

const Navbar: React.FC = () => {
  console.log("entered Navbar()");
  const history = useHistory();
  const [query, setQuery] = useState();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showOrgMenu, setShowOrgMenu] = useState(false);
  const [currentUser, ,] = useCurrentUser();

  const [
    currentOrganization,
    setCurrentOrganization
  ] = useCurrentOrganization();

  function renderLogo() {
    return (
      <EuiHeaderLogo
        iconType="logoKibana"
        href="/"
        aria-label="Got to Sepal ome page"
      >
        Sepal
      </EuiHeaderLogo>
    );
  }

  function renderSearch() {
    function handleKeyPress(event: KeyboardEvent<HTMLInputElement>) {
      if (event.key === "Enter") {
        history.push(`/search?q=${query}`);
      }
    }
    return (
      <EuiHeaderSectionItem border="none">
        <input
          type="text"
          placeholder="Search..."
          onKeyPress={handleKeyPress}
          onChange={e => setQuery(e.target.value)}
        />
      </EuiHeaderSectionItem>
    );
  }

  async function logout() {
    setShowUserMenu(false);
    setShowOrgMenu(false);
    await api.logout();
    history.push("/");
  }

  function renderOrgMenu() {
    let selected = currentOrganization.id;
    function onChange(value: number) {
      const org = currentUser?.organizations.find(org => org.id === value);
      setCurrentOrganization(org);
      selected = org?.id;
    }

    const options =
      currentUser?.organizations?.map(org => {
        return {
          value: org.id,
          inputDisplay: org.name
        };
      }) ?? [];

    return (
      <EuiSuperSelect
        options={options}
        valueOfSelected={selected}
        onChange={value => onChange(parseInt(value))}
      />
    );
  }

  function renderUserMenu() {
    const button = (
      <EuiHeaderSectionItemButton
        aria-label="User menu"
        onClick={() => setShowUserMenu(!showUserMenu)}
      >
        <EuiIcon type="apps" />
      </EuiHeaderSectionItemButton>
    );

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
          <EuiKeyPadMenuItemButton label="Logout" onClick={() => logout()}>
            <EuiIcon type="exit" size="l" />
          </EuiKeyPadMenuItemButton>
          {/* <EuiKeyPadMenuItem label="Dashboard" href="#">
                <EuiIcon type="dashboardApp" size="l" />
                </EuiKeyPadMenuItem> */}

          {/* <EuiKeyPadMenuItem isDisabled label="Dashboard" href="#">
                <EuiIcon type="dashboardApp" size="l" />
                </EuiKeyPadMenuItem> */}
        </EuiKeyPadMenu>
      </EuiPopover>
    );
  }

  return (
    <EuiHeader>
      <EuiHeaderSection>
        <EuiHeaderSectionItem border="none">
          {renderLogo()}
        </EuiHeaderSectionItem>
      </EuiHeaderSection>

      <EuiHeaderSection grow={true} className="Navbar--searchSection">
        {renderSearch()}
      </EuiHeaderSection>

      <EuiHeaderSection side="right">
        <EuiHeaderSectionItem border="none">
          {renderOrgMenu()}
        </EuiHeaderSectionItem>
        <EuiHeaderSectionItem border="none">
          {renderUserMenu()}
        </EuiHeaderSectionItem>
      </EuiHeaderSection>
    </EuiHeader>
  );
};

function withNavbar<T>(component: React.FC<T>) {
  return (props: T) => (
    <>
      {api.isLoggedIn() && <Navbar />}
      {component({ ...props })}
    </>
  );
}

export default Navbar;
export { withNavbar };
