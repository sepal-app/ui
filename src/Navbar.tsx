import React from "react";

import {
  EuiHeader,
  EuiHeaderSection,
  EuiHeaderSectionItem,
  EuiHeaderSectionItemButton,
  EuiHeaderLink,
  EuiHeaderLogo,
  EuiIcon
} from "@elastic/eui";

import * as api from "./lib/api";

const Navbar: React.FC = () => {
  function renderLogo() {
    return (
      <EuiHeaderLogo
        iconType="logoKibana"
        href="#"
        aria-label="Got to Sepal ome page"
      >
        Sepal
      </EuiHeaderLogo>
    );
  }

  function renderSearch() {
    return (
      <EuiHeaderSectionItemButton aria-label="Search">
        <EuiIcon type="search" size="m" />
      </EuiHeaderSectionItemButton>
    );
  }

  function renderMenu() {
    return <></>;
  }

  return (
    <EuiHeader>
      <EuiHeaderSection grow={true}>
        <EuiHeaderSectionItem border="none">
          {renderLogo()}
        </EuiHeaderSectionItem>
        <EuiHeaderSectionItem border="none">
          {/* <HeaderSpacesMenu /> */}
        </EuiHeaderSectionItem>
      </EuiHeaderSection>

      <EuiHeaderSection side="right">
        <EuiHeaderSectionItem border="none">
          {api.isLoggedIn() ? (
            renderMenu()
          ) : (
            <EuiHeaderLink href="/login">Login</EuiHeaderLink>
          )}
        </EuiHeaderSectionItem>
        <EuiHeaderSectionItem>{/* <HeaderUserMenu /> */}</EuiHeaderSectionItem>
      </EuiHeaderSection>
    </EuiHeader>
  );
};

export default Navbar;
