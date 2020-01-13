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
  EuiKeyPadMenuItemButton,
  EuiKeyPadMenuItem,
  EuiPopover
} from "@elastic/eui";

import * as api from "./lib/api";

const Navbar: React.FC = () => {
  const history = useHistory();
  const [query, setQuery] = useState();
  const [showMenu, setShowMenu] = useState(false);

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

  function logout() {
    setShowMenu(false);
    return api.logout().then(() => history.push("/"));
  }

  function renderMenu() {
    const button = (
      <EuiHeaderSectionItemButton
        aria-label="Menu"
        onClick={() => setShowMenu(!showMenu)}
      >
        <EuiIcon type="apps" />
      </EuiHeaderSectionItemButton>
    );

    const menu = (
      <>
        <EuiPopover
          button={button}
          isOpen={showMenu}
          closePopover={() => setShowMenu(false)}
        >
          <EuiKeyPadMenu>
            {
              <EuiKeyPadMenuItem label="Settings" href="/settings">
                <EuiIcon type="advancedSettingsApp" size="l" />
              </EuiKeyPadMenuItem>
            }
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
      </>
    );
    return menu;
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
          {renderMenu()}
        </EuiHeaderSectionItem>
      </EuiHeaderSection>
    </EuiHeader>
  );
};

export default Navbar;

/* export function withNavbar(component: React.FC) { */
export const withNavbar = (component: React.FC) => (props: any) => (
  <>
    {api.isLoggedIn() && <Navbar />}
    {component({ ...props })}
  </>
);
